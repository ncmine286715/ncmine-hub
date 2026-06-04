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
  runTransaction
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
    // Note: deleteDoc(favoriteRef) could be used but setDoc/updateDoc is safer for existence
  } else {
    await updateDoc(userRef, { favorites: arrayUnion(addonId) });
    // Initialize addon doc if it doesn't exist
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

    // Also add to comments collection
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

