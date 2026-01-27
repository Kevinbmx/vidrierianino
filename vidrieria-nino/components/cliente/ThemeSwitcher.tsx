"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";
import { Button } from "@heroui/react";

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // if (!mounted) {
  //   return null;
  // }
  if (!mounted) {
    // Render a placeholder or nothing to avoid hydration mismatch
    return <div className="w-8 h-8" />;
  }
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    //   <Button
    //     className={`w-fit p-2 rounded-md hover:scale-110 active:scale-100 duration-200 bg-slate-200 dark:bg-[#212933]`}
    //     onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    //   >
    //     {theme === "light" ? <FaMoon /> : <FaSun />}
    //   </Button>
    // );
    <Button
      isIconOnly
      onClick={toggleTheme}
      variant="flat"
      className="bg-transparent"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </Button>
  );
};
