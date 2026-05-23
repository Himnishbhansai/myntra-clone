import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext<any>(null);

// 🔥 CENTRALIZED THEMES (SCALABLE)
const themes = {
  light: {
    background: "#ffffff",
    text: "#111",
    card: "#f5f5f5",
    border: "#ddd",
    primary: "#ff3f6c",
    secondaryText: "#666",
  },
  dark: {
    background: "#121212",
    text: "#fff",
    card: "#1e1e1e",
    border: "#333",
    primary: "#ff3f6c",
    secondaryText: "#aaa",
  },
};

export const ThemeProvider = ({ children }: any) => {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [accent, setAccent] = useState("#ff3f6c");
  const [isReady, setIsReady] = useState(false);

  // 🔥 FIRST LAUNCH + SYSTEM DETECTION
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem("themeMode");
        const savedAccent = await AsyncStorage.getItem("accentColor");

        if (savedMode) {
          setMode(savedMode as "light" | "dark");
        } else {
          // ✅ auto-detect system theme ONLY if no saved preference
          const systemTheme = Appearance.getColorScheme();
          setMode(systemTheme === "dark" ? "dark" : "light");
        }

        if (savedAccent) setAccent(savedAccent);
      } catch (e) {
        console.log("Theme load error", e);
      } finally {
        setIsReady(true);
      }
    };

    loadTheme();
  }, []);

  // 🔥 SAVE MODE
  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem("themeMode", mode);
    }
  }, [mode, isReady]);

  // 🔥 SAVE ACCENT
  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem("accentColor", accent);
    }
  }, [accent, isReady]);

  // 🔥 ACTIVE THEME
  const baseTheme = themes[mode];

  // 🔥 APPLY ACCENT (DYNAMIC PRIMARY COLOR)
  const finalTheme = {
    ...baseTheme,
    primary: accent,
  };

  if (!isReady) return null; // prevent flicker

  return (
    <ThemeContext.Provider
      value={{
        theme: finalTheme,
        mode,
        setMode,
        accent,
        setAccent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);