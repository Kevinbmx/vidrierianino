import { heroui } from "@heroui/react";

// Colores base de tu marca
const brandColors = {
  primary: "#1E3A8A",
  primaryContent: "#FFFFFF",
  secondary: "#1152d4",
  secondaryContent: "#FFFFFF",
  darkBase: "#0a0d25", // Un azul muy oscuro para fondos dark

  // primary: '#1E3A8A',
  // accent: '#EA580C',
  // secondary: '#059669',
  // // 'text-primary': '#374151',
  // // 'bg-alt': '#F3F4F6',


};

export default heroui({
  themes: {
    light: {
      colors: {
        primary: brandColors.primary,
        "primary-content": brandColors.primaryContent,
        secondary: brandColors.secondary,
        "secondary-content": brandColors.secondaryContent,
        focus: brandColors.primary,

        "base-100": "#FFFFFF", // Fondo principal
        "base-200": "#F0F0F0", // Fondo ligeramente más oscuro
        "base-300": "#E0E0E0", // Fondo aún más oscuro
        "base-content": "#333333", // Color de texto principal

        // Colores para componentes específicos basados en tu CSS
        "--navbar-bg": brandColors.secondary,
        "--navbar-text": brandColors.secondaryContent,
        "--navbar-btn-bg": brandColors.primary,
        "--navbar-btn-text": brandColors.primaryContent,
        "--footer-bg": brandColors.secondary,
        "--footer-text": brandColors.secondaryContent,
      },
    },
    dark: {
      colors: {
        primary: brandColors.primary,
        "primary-content": brandColors.primaryContent,
        secondary: brandColors.secondary,
        "secondary-content": brandColors.secondaryContent,
        focus: brandColors.primary,

        "base-100": brandColors.darkBase, // Fondo principal oscuro
        "base-200": brandColors.secondary, // Fondo secundario oscuro
        "base-300": "#1f2261", // Un poco más claro que el secundario
        "base-content": "#FFFFFF", // Color de texto principal oscuro

        // Colores para componentes específicos basados en tu CSS
        "--navbar-bg": brandColors.darkBase,
        "--navbar-text": brandColors.primary,
        "--navbar-btn-bg": brandColors.primary,
        "--navbar-btn-text": brandColors.primaryContent,
        "--footer-bg": brandColors.darkBase,
        "--footer-text": brandColors.primary,
      },
    },
  },
});