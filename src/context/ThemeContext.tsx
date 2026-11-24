import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ManagementTheme = "dark" | "light";
export type ThemeScope = "public" | "management";

interface ThemeContextValue {
  managementTheme: ManagementTheme;
  setManagementTheme: (theme: ManagementTheme) => void;
  toggleManagementTheme: () => void;
  activeScope: ThemeScope;
  setActiveScope: (scope: ThemeScope) => void;
}

const STORAGE_KEY = "oji_mgmt_theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialManagementTheme(): ManagementTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Ignore storage errors in restricted environments
  }
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [managementTheme, setManagementThemeState] = useState<ManagementTheme>(
    getInitialManagementTheme
  );
  const [activeScope, setActiveScope] = useState<ThemeScope>("public");

  const setManagementTheme = (theme: ManagementTheme) => {
    setManagementThemeState(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleManagementTheme = () => {
    setManagementTheme(managementTheme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const dataTheme =
      activeScope === "public"
        ? "public"
        : managementTheme === "dark"
          ? "mgmt-dark"
          : "mgmt-light";
    document.documentElement.setAttribute("data-theme", dataTheme);
  }, [activeScope, managementTheme]);

  return (
    <ThemeContext.Provider
      value={{
        managementTheme,
        setManagementTheme,
        toggleManagementTheme,
        activeScope,
        setActiveScope,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return ctx;
}
