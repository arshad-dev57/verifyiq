import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (val: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const saved = localStorage.getItem('verifyiq_theme');
  const initialDark = saved !== null ? saved === 'dark' : true;

  if (initialDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }

  return {
    isDark: initialDark,
    toggleTheme: () => {
      set((state) => {
        const next = !state.isDark;
        if (next) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
          localStorage.setItem('verifyiq_theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          localStorage.setItem('verifyiq_theme', 'light');
        }
        return { isDark: next };
      });
    },
    setDark: (val: boolean) => {
      if (val) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('verifyiq_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('verifyiq_theme', 'light');
      }
      set({ isDark: val });
    },
  };
});
