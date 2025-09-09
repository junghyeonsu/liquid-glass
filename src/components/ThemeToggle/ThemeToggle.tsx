import { useTheme } from "../../contexts/ThemeContext";
import styles from "./ThemeToggle.module.css";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      type="button"
    >
      <span className={styles.icon}>{theme === "light" ? "🌙" : "☀️"}</span>
    </button>
  );
};
