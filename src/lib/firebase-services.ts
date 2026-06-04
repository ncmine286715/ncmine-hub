import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  limit,
  serverTimestamp,
  increment,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Favorites
export const toggleFavorite = async (userId: string, addonId: string, isFavorite: boolean) => {
  const userRef = doc(db, 'users', userId);
  const addonRef = doc(db, 'addons', addonId);
  const favoriteRef = doc(db, 'favorites', `${userId}_${addonId}`);

  if (isFavorite) {
    await updateDoc(userRef, { favorites: arrayRemove(addonId) });
    await updateDoc(addonRef, { favoritesCount: increment(-1) });
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

// Ratings
export const addRating = async (userId: string, username: string, addonId: string, rating: number, commentText: string) => {
  const ratingRef = doc(db, 'ratings', `${userId}_${addonId}`);
  const addonRef = doc(db, 'addons', addonId);

  await runTransaction(db, async (transaction) => {
    const addonDoc = await transaction.get(addonRef);
    const ratingDoc = await transaction.get(ratingRef);

    if (ratingDoc.exists()) {
      throw new Error('Você já avaliou este addon.');
    }

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

    transaction.set(ratingRef, {
      userId,
      username,
      addonId,
      rating,
      comment: commentText,
      createdAt: serverTimestamp()
    });

    const commentRef = doc(collection(db, 'comments'));
    transaction.set(commentRef, {
      addonId,
      userId,
      username,
      text: commentText,
      rating,
      createdAt: serverTimestamp(),
      likes: 0
    });
  });
};

// Comments
export const addComment = async (userId: string, username: string, addonId: string, text: string) => {
  const commentRef = collection(db, 'comments');
  const addonRef = doc(db, 'addons', addonId);

  await addDoc(commentRef, {
    addonId,
    userId,
    username,
    text,
    createdAt: serverTimestamp(),
    likes: 0
  });

  await updateDoc(addonRef, { commentsCount: increment(1) });
};

export const getComments = async (addonId: string) => {
  const q = query(
    collection(db, 'comments'),
    where('addonId', '==', addonId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Rate Limiting & Bot Protection (Basic implementation via Firestore tracking)
export const checkCreationLimit = async (ipHash: string) => {
  const limitRef = doc(db, 'system_limits', ipHash);
  const limitDoc = await getDoc(limitRef);
  
  if (limitDoc.exists()) {
    const data = limitDoc.data();
    const lastCreation = data.lastCreation as Timestamp;
    const now = Timestamp.now();
    // Prevent more than 1 account per 24 hours per IP (simulated via ipHash)
    if (now.seconds - lastCreation.seconds < 86400) {
      return false;
    }
  }
  return true;
};

// Advanced Profiles
export interface ExtendedProfile {
  id: string;
  username: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  socialLinks?: {
    discord?: string;
    youtube?: string;
    instagram?: string;
  };
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

// Enhanced Comments (Threaded & Likes)
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

// Global Community Feed
export const getGlobalActivity = async (limitNum = 10) => {
  const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'comment' }));
};

// Rankings
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

// Points System
export const awardPoints = async (userId: string, points: number) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { 
    points: increment(points)
  });
};

// Downloads
export const recordDownload = async (userId: string, addonId: string) => {
  const userRef = doc(db, 'users', userId);
  const addonRef = doc(db, 'addons', addonId);
  const downloadRef = doc(db, 'downloads', `${userId}_${addonId}`);

  await updateDoc(userRef, { 
    downloadsCount: increment(1),
    downloadedAddons: arrayUnion(addonId)
  });

  const addonDoc = await getDoc(addonRef);
  if (!addonDoc.exists()) {
    await setDoc(addonRef, { favoritesCount: 0, ratingsCount: 0, averageRating: 0, commentsCount: 0, downloadsCount: 1 });
  } else {
    await updateDoc(addonRef, { downloadsCount: increment(1) });
  }

  await setDoc(downloadRef, { userId, addonId, createdAt: serverTimestamp() });
};
