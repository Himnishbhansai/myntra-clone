import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext<any>(null);

const lightTheme = {
  background: "#ffffff",
  text: "#111",
  card: "#f5f5f5",
  border: "#ddd",
  primary: "#ff3f6c",
  secondaryText: "#666",
};

const darkTheme = {
  background: "#121212",
  text: "#fff",
  card: "#1e1e1e",
  border: "#333",
  primary: "#ff3f6c",
  secondaryText: "#aaa",
};

export const ThemeProvider = ({ children }: any) => {
  const [mode, setMode] = useState<"light" | "dark" | "system">("system");
  const [accent, setAccent] = useState("#ff3f6c");
  const [isReady, setIsReady] = useState(false);

  // 🔥 LOAD SAVED THEME (FIRST LAUNCH LOGIC)
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem("themeMode");
        const savedAccent = await AsyncStorage.getItem("accentColor");

        if (savedMode) setMode(savedMode as any);
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
    AsyncStorage.setItem("themeMode", mode);
  }, [mode]);

  // 🔥 SAVE ACCENT
  useEffect(() => {
    AsyncStorage.setItem("accentColor", accent);
  }, [accent]);

  // 🔥 SYSTEM THEME DETECTION
  const systemTheme = Appearance.getColorScheme();

  const activeMode =
    mode === "system" ? systemTheme : mode;

  const theme =
    activeMode === "dark" ? darkTheme : lightTheme;

  // 🔥 APPLY ACCENT
  const finalTheme = {
    ...theme,
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