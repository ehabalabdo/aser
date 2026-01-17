"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    logout: async () => { },
    refreshProfile: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (uid: string) => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
            } else {
                setProfile(null);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        // DEMO MODE CHECK
        // DEMO MODE CHECK
        if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
            const checkDemoSession = () => {
                const sessionStr = localStorage.getItem('demo_user_session');
                if (sessionStr) {
                    const session = JSON.parse(sessionStr);
                    const demoUser: any = {
                        uid: session.uid,
                        email: session.email,
                        displayName: session.name,
                        emailVerified: true
                    };
                    const demoProfile: UserProfile = {
                        uid: session.uid,
                        email: session.email,
                        displayName: session.name,
                        phoneNumber: "0790000000",
                        role: session.role as 'admin' | 'cashier' | 'customer',
                        createdAt: Date.now()
                    };
                    setUser(demoUser);
                    setProfile(demoProfile);
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setLoading(false);
            };

            checkDemoSession();
            // Listen for storage events (though window.location.href in login handles update efficiently)
            window.addEventListener('storage', checkDemoSession);
            return () => window.removeEventListener('storage', checkDemoSession);
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await fetchProfile(currentUser.uid);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
            localStorage.removeItem('demo_user_session');
            setUser(null);
            setProfile(null);
            window.location.href = '/login';
            return;
        }
        await firebaseSignOut(auth);
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.uid);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
