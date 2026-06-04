import { 
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove,
  collection, addDoc, query, where, orderBy, getDocs, limit,
  serverTimestamp, increment, runTransaction, Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== VERIFICAÇÃO DE NOME DISPONÍVEL ====================
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

// ==================== LIMITE DE CRIAÇÃO (ANTI-SPAM) ====================
// Usa um documento fixo 'global_counter' com limite de 1 conta a cada 60 segundos
export const checkCreationLimit = async (): Promise<boolean> => {
  const limitRef = doc(db, 'rate_limits', 'global_counter');
  try {
    const limitSnap = await getDoc(limitRef);
    if (!limitSnap.exists()) {
      await setDoc(limitRef, { lastCreation: serverTimestamp() });
      return true;
    }
    const data = limitSnap.data();
    const lastCreation = data.lastCreation as Timestamp;
    const now = Timestamp.now();
    const diffSeconds = now.seconds - lastCreation.seconds;
    if (diffSeconds < 60) {
      return false;
    }
    await updateDoc(limitRef, { lastCreation: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('Erro no rate limit:', error);
    return true; // Em caso de erro, permite (melhor que travar)
  }
};

// ==================== CRIAÇÃO DE PERFIL APÓS LOGIN ====================
export const createUserProfile = async (user: any, username: string) => {
  const userRef = doc(db, 'users', user.uid);
  const profile = {
    id: user.uid,
    username,
    email: user.email,
    bio: 'Novo minerador no NCMINE!',
    points: 10,
    rank: 'Iniciante',
    createdAt: serverTimestamp(),
    favorites: [],
    downloadsCount: 0,
    downloadedAddons: [],
  };
  await setDoc(userRef, profile);
  return profile;
};

// ==================== BUSCAR PERFIL ====================
export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
};

// ==================== FAVORITOS ====================
export const toggleFavorite = async (userId: string, addonId: string, isFavorite: boolean) => {
  const userRef = doc(db, 'users', userId);
  const addonRef = doc(db, 'addons', addonId);
  const favoriteRef = doc(db, 'favorites', `${userId}_${addonId}`);

  if (isFavorite) {
    await updateDoc(userRef, { favorites: arrayRemove(addonId) });
    await updateDoc(addonRef, { favoritesCount: increment(-1) });
    await setDoc(favoriteRef, { userId, addonId, createdAt: serverTimestamp() });
  } else {
    await updateDoc(userRef, { favorites: arrayUnion(addonId) });
    const addonDoc = await getDoc(addonRef);
    if (!addonDoc.exists()) {
      await setDoc(addonRef, { favoritesCount: 1, ratingsCount: 0, averageRating: 0, commentsCount: 0 });
    } else {
      await updateDoc(addonRef, { favoritesCount: increment(1) });
    }
    await setDoc(favoriteRef, { userId, addonId, createdAt: serverTimestamp() });
  }
};

// ==================== AVALIAÇÕES ====================
export const addRating = async (userId: string, username: string, addonId: string, rating: number, commentText: string) => {
  const ratingRef = doc(db, 'ratings', `${userId}_${addonId}`);
  const addonRef = doc(db, 'addons', addonId);

  await runTransaction(db, async (transaction) => {
    const addonDoc = await transaction.get(addonRef);
    const ratingDoc = await transaction.get(ratingRef);
    if (ratingDoc.exists()) throw new Error('Você já avaliou este addon.');

    let newRatingsCount = 1;
    let newAverageRating = rating;
    if (addonDoc.exists()) {
      const data = addonDoc.data();
      newRatingsCount = (data.ratingsCount || 0) + 1;
      const totalRating = (data.averageRating || 0) * (data.ratingsCount || 0) + rating;
      newAverageRating = totalRating / newRatingsCount;
      transaction.update(addonRef, {
        ratingsCount: newRatingsCount,
        averageRating: newAverageRating,
        commentsCount: increment(1)
      });
    } else {
      transaction.set(addonRef, {
        ratingsCount: 1,
        averageRating: rating,
        favoritesCount: 0,
        commentsCount: 1
      });
    }
    transaction.set(ratingRef, { userId, username, addonId, rating, comment: commentText, createdAt: serverTimestamp() });
    const commentRef = doc(collection(db, 'comments'));
    transaction.set(commentRef, {
      addonId, userId, username, text: commentText, rating, createdAt: serverTimestamp(), likes: 0
    });
  });
};

// ==================== COMENTÁRIOS ====================
export const addComment = async (userId: string, username: string, addonId: string, text: string) => {
  const commentRef = collection(db, 'comments');
  const addonRef = doc(db, 'addons', addonId);
  await addDoc(commentRef, { addonId, userId, username, text, createdAt: serverTimestamp(), likes: 0 });
  await updateDoc(addonRef, { commentsCount: increment(1) });
};

export const getComments = async (addonId: string) => {
  const q = query(collection(db, 'comments'), where('addonId', '==', addonId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== PERFIL ====================
export interface ExtendedProfile {
  id: string;
  username: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  socialLinks?: { discord?: string; youtube?: string; instagram?: string; };
  rank: 'Iniciante' | 'Explorador' | 'Veterano' | 'Lenda';
  points: number;
  createdAt: Timestamp;
  favorites: string[];
  downloadedAddons: string[];
  downloadsCount: number;
}

export const updateProfile = async (userId: string, data: Partial<ExtendedProfile>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
};

// ==================== LIKES EM COMENTÁRIOS ====================
export const toggleLikeComment = async (commentId: string, userId: string) => {
  const likeRef = doc(db, 'likes', `${userId}_${commentId}`);
  const commentRef = doc(db, 'comments', commentId);
  const likeDoc = await getDoc(likeRef);
  if (likeDoc.exists()) {
    await runTransaction(db, async (t) => {
      t.delete(likeRef);
      t.update(commentRef, { likes: increment(-1) });
    });
    return false;
  } else {
    await runTransaction(db, async (t) => {
      t.set(likeRef, { userId, commentId, createdAt: serverTimestamp() });
      t.update(commentRef, { likes: increment(1) });
    });
    return true;
  }
};

// ==================== RESPOSTAS ====================
export const addReply = async (commentId: string, userId: string, username: string, text: string) => {
  const replyRef = collection(db, `comments/${commentId}/replies`);
  await addDoc(replyRef, {
    userId,
    username,
    text,
    createdAt: serverTimestamp(),
    likes: 0
  });
  
  const commentRef = doc(db, 'comments', commentId);
  await updateDoc(commentRef, { repliesCount: increment(1) });
};

// ==================== ATIVIDADE GLOBAL ====================
export const getGlobalActivity = async (limitNum = 10) => {
  const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'comment' }));
};

// ==================== RANKINGS ====================
export const getPopularAddons = async (limitNum = 5) => {
  const q = query(collection(db, 'addons'), orderBy('favoritesCount', 'desc'), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTopRatedAddons = async (limitNum = 5) => {
  const q = query(collection(db, 'addons'), orderBy('averageRating', 'desc'), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getNewUsers = async (limitNum = 5) => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== NOTIFICAÇÕES (Broadcast) ====================
export interface GlobalNotification {
  id: string;
  title: string;
  message: string;
  addonId?: string;
  createdAt: Timestamp;
}

export const broadcastNotification = async (title: string, message: string, addonId?: string) => {
  const globalNotifRef = collection(db, 'global_notifications');
  await addDoc(globalNotifRef, {
    title,
    message,
    addonId,
    createdAt: serverTimestamp()
  });
};

export const getLatestGlobalNotif = async () => {
  const q = query(collection(db, 'global_notifications'), orderBy('createdAt', 'desc'), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as GlobalNotification;
};

// ==================== NOTIFICAÇÕES (Usuário) ====================
export interface Notification {
  id: string;
  type: 'new_addon' | 'update' | 'system';
  title: string;
  message: string;
  addonId?: string;
  createdAt: Timestamp;
  read: boolean;
}

export const getNotifications = async (userId: string) => {
  const q = query(
    collection(db, `users/${userId}/notifications`),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const notifRef = doc(db, `users/${userId}/notifications`, notificationId);
  await updateDoc(notifRef, { read: true });
};

// ==================== PONTOS (XP) ====================
export const awardPoints = async (userId: string, points: number) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { points: increment(points) });
};

// ==================== DOWNLOADS ====================
export const recordDownload = async (userId: string, addonId: string) => {
  const userRef = doc(db, 'users', userId);
  const addonRef = doc(db, 'addons', addonId);
  const downloadRef = doc(db, 'downloads', `${userId}_${addonId}`);
  await updateDoc(userRef, { downloadsCount: increment(1), downloadedAddons: arrayUnion(addonId) });
  const addonDoc = await getDoc(addonRef);
  if (!addonDoc.exists()) {
    await setDoc(addonRef, { favoritesCount: 0, ratingsCount: 0, averageRating: 0, commentsCount: 0, downloadsCount: 1 });
  } else {
    await updateDoc(addonRef, { downloadsCount: increment(1) });
  }
  await setDoc(downloadRef, { userId, addonId, createdAt: serverTimestamp() });
};