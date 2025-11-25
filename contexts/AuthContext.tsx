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
  User as FirebaseUser,
} from 'firebase/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: ProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Map Firebase user to application user
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
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
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register: AuthContextType['register'] = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Update local state with the new user info
      const userData: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: name,
        createdAt: userCredential.user.metadata.creationTime || new Date().toISOString(),
      };
      setUser(userData);

      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout: AuthContextType['logout'] = () => {
    signOut(auth).catch((error) => {
      console.error('Logout error:', error);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
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
