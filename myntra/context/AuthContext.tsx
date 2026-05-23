import { createContext, useContext, useEffect, useState } from "react";
import { getUserData, saveUserData, clearUserData } from "@/utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import axios from "axios";

// 🔥 IMPORT MERGE FUNCTION
import { mergeRecentsOnLogin } from "@/utils/mergeRecents";

type AuthContextType = {
  isAuthenticated: boolean;
  user: { _id: string; name: string; email: string } | null;
  Signup: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [user, setUser] = useState<{
    _id: string;
    name: string;
    email: string;
  } | null>(null);

  // 🔥 LOAD USER ON APP START
  useEffect(() => {
    (async () => {
      const data = await getUserData();

      if (data._id && data.fullName && data.email) {
        setUser({
          _id: data._id,
          name: data.fullName,
          email: data.email,
        });
        setIsAuthenticated(true);
      }
    })();
  }, []);

  // ✅ LOGIN
  const login = async (email: string, password: string) => {
    const res = await axios.post(
      "https://myntra-clone-7tse.onrender.com/user/login",
      { email, password }
    );

    const data = res.data.user;

    if (data.fullName) {
      await saveUserData(data._id, data.fullName, data.email);

      setUser({
        _id: data._id,
        name: data.fullName,
        email: data.email,
      });

      setIsAuthenticated(true);

      // 🔥🔥 MERGE RECENTS AFTER LOGIN
      await mergeRecentsOnLogin(data._id);
    } else {
      throw new Error(data.message || "Login failed");
    }
  };

  // ✅ SIGNUP
  const Signup = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    const res = await axios.post(
      "https://myntra-clone-7tse.onrender.com/user/signup",
      { fullName, email, password }
    );

    const data = res.data.user;

    if (data.fullName) {
      await saveUserData(data._id, data.fullName, data.email);

      setUser({
        _id: data._id,
        name: data.fullName,
        email: data.email,
      });

      setIsAuthenticated(true);

      // 🔥 OPTIONAL: also merge after signup
      await mergeRecentsOnLogin(data._id);
    } else {
      throw new Error(data.message || "Signup failed");
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    await clearUserData();

    // reset theme
    await AsyncStorage.setItem("themeMode", "light");
    await AsyncStorage.setItem("accent", "#FF3F6C");

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, Signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;