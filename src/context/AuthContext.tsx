"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isAdminLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isAdmin: false,
  isAdminLoading: true,
});

// Admin email configured for analytics access
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "afzal.portfolio@gmail.com";
const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS || "").split(",").filter(Boolean);

function verifyAdminAccess(user: User | null): boolean {
  if (!user) return false;
  
  // Check if user email matches admin email
  const isAdminByEmail = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  // Check if user UID is in admin list
  const isAdminByUID = ADMIN_UIDS.includes(user.uid);
  
  return isAdminByEmail || isAdminByUID;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const adminStatus = verifyAdminAccess(user);
      setIsAdmin(adminStatus);
      
      if (user && adminStatus) {
        localStorage.setItem("isAdmin", "true");
      } else {
        localStorage.removeItem("isAdmin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setIsAdmin(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signOut, 
        isAdmin, 
        isAdminLoading: loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const useAuth = () => useContext(AuthContext);
