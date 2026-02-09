"use client";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems = [
    { name: "Nosotros", href: "#nosotros" },
    { name: "Servicios", href: "#services" },
    { name: "Galería", href: "#gallery" },
    // { name: "Simulador", href: "#simulador" },
  ];
  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      className="bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 shadow-sm"
    >
      {/* Left side – logo + subtitle */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand className="flex items-center gap-2">
          {/* Red‑coral diamond icon (simple SVG) */}
          <svg
            className="w-8 h-8 text-coral"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 4C25.78 14.22 33.78 22.22 44 24C33.78 25.78 25.78 33.78 24 44C22.22 33.78 14.22 25.78 4 24C14.22 22.22 22.22 14.22 24 4Z"
              fill="currentColor"
            />
          </svg>
          <div className="flex flex-col">
            <p className="text-black font-black text-xl">VIDRIERÍA MONTERO</p>
            <span className="text-xs text-gray-600">
              ALTA GAMA &amp; ALUMINIO
            </span>
          </div>
        </NavbarBrand>
      </NavbarContent>
      {/* Center‑right navigation links */}
      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item, i) => (
          <NavbarItem key={i}>
            <Link
              href={item.href}
              className="text-gray-800 hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      {/* Right side – theme switcher & CTA button */}
      <NavbarContent justify="end" className="gap-4">
        <NavbarItem className="hidden lg:flex">
          {/* <ThemeSwitcher /> */}
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/admin"
            className=" bg-primary text-white py-2 px-4 hover:bg-primary/90 rounded"
          >
            Iniciar Sesion
          </Link>
        </NavbarItem>
      </NavbarContent>
      {/* Mobile menu */}
      <NavbarMenu>
        {menuItems.map((item, i) => (
          <NavbarMenuItem key={i}>
            <Link href={item.href} className="w-full">
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}