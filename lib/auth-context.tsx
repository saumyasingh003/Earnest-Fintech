"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/me");
            const data = await response.json();

            if (data.authenticated && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshAuth = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/refresh", {
                method: "POST",
            });

            if (response.ok) {
                await checkAuth();
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        }
    }, [checkAuth]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            refreshAuth();
        }, 14 * 60 * 1000);

        return () => clearInterval(interval);
    }, [user, refreshAuth]);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error || "Login failed" };
            }
        } catch {
            return { success: false, error: "Network error" };
        }
    };

    const register = async (email: string, password: string, name?: string) => {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error || "Registration failed" };
            }
        } catch {
            return { success: false, error: "Network error" };
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
