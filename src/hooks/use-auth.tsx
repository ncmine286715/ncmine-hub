import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  socialLinks?: {
    discord?: string;
    youtube?: string;
    instagram?: string;
  };
  rank: 'Iniciante' | 'Explorador' | 'Veterano' | 'Lenda';
  points: number;
  createdAt: any;
  favorites: string[];
  downloadedAddons: string[];
  downloadsCount: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch or create user profile
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        } else {
          // Fallback if profile doesn't exist yet (should be created on sign up)
          const newProfile = {
            id: user.uid,
            username: user.displayName || user.email?.split('@')[0] || 'User',
            bio: 'Novo minerador no NCMINE!',
            rank: 'Iniciante',
            points: 10,
            createdAt: serverTimestamp(),
            favorites: [],
            downloadedAddons: [],
            downloadsCount: 0,
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile as UserProfile);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
