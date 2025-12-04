'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, ProviderProps } from '@/types';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: ProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        // Map Firebase user to application user
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || '',
          addresses: [],
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login: AuthContextType['login'] = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential:UserCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        return false;
      }
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message === "Email not verified") {
        throw error;
      }
      return false;
    }
  };

  const loginWithGoogle: AuthContextType['loginWithGoogle'] = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Update local state with the new user info
      const userData: User = {
        uid: result.user.uid,
        email: result.user.email || '',
        fullName: result.user.displayName || '',
        addresses: [],
        createdAt: result.user.metadata.creationTime || new Date().toISOString(),
      };
      setUser(userData);
      
      return true;
    } catch (error: any) {
      return false;
    }
  };

const register: AuthContextType['register'] = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // 1. Kullanıcıyı oluştur
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Profil ismini güncelle
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // 3. Doğrulama e-postasını gönder
      await sendEmailVerification(userCredential.user);

      // 4. Firestore'a kullanıcıyı kaydet
      // Bunu en sona koyuyoruz ki veritabanı hatası olsa bile mail gitmiş olsun
      try {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          email,
          role: "user",
          createdAt: new Date().toISOString(),
        });
      } catch (firestoreError: any) {
        console.error("Firestore save error:", firestoreError);
        // Firestore hatası kayıt akışını bozmasın
      }

      // 5. Local state güncelleme
      // Note: We don't set user state here because we want to force them to login after verification
      // Firebase automatically signs in after registration, so we sign them out
      await signOut(auth);
      setUser(null);

      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout: AuthContextType['logout'] = () => {
    signOut(auth).catch((error) => {
    });
  };

  const sendVerificationEmail: AuthContextType['sendVerificationEmail'] = async (): Promise<boolean> => {
    try {
      if (auth.currentUser) {
        const actionCodeSettings = {
          url: `${window.location.origin}/login`, // Redirect to login page after verification
          handleCodeInApp: true,
        };
        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        return true;
      }
      return false;
    } catch (error: any) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        sendVerificationEmail,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
