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
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "afzal97016458@gmail.com").toLowerCase();
const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS || "").split(",").filter(Boolean);

function verifyAdminAccess(user: User | null): boolean {
  if (!user) {
    console.debug("[Admin Auth] No user authenticated");
    return false;
  }
  
  const userEmail = user.email?.toLowerCase() || "";
  console.debug("[Admin Auth] Checking access:", {
    userEmail,
    expectedAdminEmail: ADMIN_EMAIL,
    emailMatch: userEmail === ADMIN_EMAIL,
    userUID: user.uid,
    adminUIDs: ADMIN_UIDS,
  });
  
  // Check if user email matches admin email
  const isAdminByEmail = userEmail === ADMIN_EMAIL;
  
  // Check if user UID is in admin list (if any)
  const isAdminByUID = ADMIN_UIDS.length > 0 && ADMIN_UIDS.includes(user.uid);
  
  const hasAccess = isAdminByEmail || isAdminByUID;
  console.debug("[Admin Auth] Access result:", { isAdminByEmail, isAdminByUID, hasAccess });
  
  return hasAccess;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.debug("[Auth] Initializing auth listener with ADMIN_EMAIL:", ADMIN_EMAIL);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.debug("[Auth] Auth state changed:", { user: user?.email, uid: user?.uid });
      setUser(user);
      const adminStatus = verifyAdminAccess(user);
      console.debug("[Auth] Admin status set to:", adminStatus);
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
