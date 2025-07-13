import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Theme } from "@shared/schema";

type ThemeContextType = {
  currentTheme: string;
  isDarkMode: boolean;
  availableThemes: Theme[];
  setTheme: (theme: string) => void;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("colorTheme") || "default";
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const { data: themes = [] } = useQuery<Theme[]>({
    queryKey: ["/api/themes"],
  });

  useEffect(() => {
    localStorage.setItem("colorTheme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    // Apply theme colors
    const theme = themes.find(t => t.name === currentTheme);
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });
      
      // Apply theme class
      document.body.className = document.body.className.replace(/theme-\w+/g, "");
      if (currentTheme !== "default") {
        document.body.classList.add(`theme-${currentTheme}`);
      }
    }
  }, [currentTheme, themes]);

  const setTheme = (theme: string) => {
    setCurrentTheme(theme);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        isDarkMode,
        availableThemes: themes,
        setTheme,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
