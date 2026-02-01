"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ToastProvider } from "@heroui/toast";

function AuthInitializer() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  return null;
}
export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider />
      <NextThemesProvider attribute="class" defaultTheme="light">
        <AuthInitializer />
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}