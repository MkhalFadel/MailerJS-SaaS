import { useEffect, useState } from "react";
import { ThemeContext } from "./themeContext";

export function ThemeProvider({ children }) {
   const [theme, setTheme] = useState(() => {
      return localStorage.getItem("theme") || "dark";
   });

   useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
   }, [theme]);

   function toggleTheme() {
      setTheme((currentTheme) => {
         return currentTheme === "dark" ? "light" : "dark";
      });
   }

   return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
         {children}
      </ThemeContext.Provider>
   );
}
