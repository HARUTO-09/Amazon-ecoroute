import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  currentUser: User | null;
  ecoTokens: number;
  login: (name: string) => void;
  logout: () => void;
  addEcoTokens: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("amazonAuth");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [ecoTokens, setEcoTokens] = useState<number>(0);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("amazonAuth", JSON.stringify(currentUser));
      const userKey = `amazonEcoTokens_${currentUser.id}`;
      const savedTokens = localStorage.getItem(userKey);
      if (savedTokens !== null) {
        setEcoTokens(parseInt(savedTokens, 10));
      } else {
        const randomTokens = Math.floor(Math.random() * 300);
        setEcoTokens(randomTokens);
        localStorage.setItem(userKey, randomTokens.toString());
      }
    } else {
      localStorage.removeItem("amazonAuth");
      setEcoTokens(0);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`amazonEcoTokens_${currentUser.id}`, ecoTokens.toString());
    }
  }, [ecoTokens, currentUser]);

  const login = React.useCallback((name: string) => setCurrentUser({ id: `user-${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`, name }), []);
  const logout = React.useCallback(() => setCurrentUser(null), []);
  const addEcoTokens = React.useCallback((amount: number) => setEcoTokens(prev => prev + amount), []);

  return (
    <AuthContext.Provider value={{ currentUser, ecoTokens, login, logout, addEcoTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
