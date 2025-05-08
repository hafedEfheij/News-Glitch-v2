"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // Efecto para manejar el montaje del componente
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar problemas de hidratación renderizando solo después del montaje en el cliente
  if (!mounted) {
    // Renderizar un div vacío para evitar problemas de hidratación
    return (
      <div suppressHydrationWarning style={{ visibility: "hidden" }}>
        {/* Renderizar un placeholder vacío para evitar problemas de hidratación */}
      </div>
    );
  }

  return (
    <NextThemesProvider {...props} suppressHydrationWarning>
      {children}
    </NextThemesProvider>
  );
}
