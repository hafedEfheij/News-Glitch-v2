'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Newspaper,
  TrendingUp,
  Clock,
  MapPin,
  LayoutGrid,
  Menu,
  X,
  Moon,
  Sun,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { SafeLink } from '@/components/safe-link';

export function NavigationBar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Efecto para detectar el desplazamiento
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efecto para manejar el montaje del componente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para cerrar el menú móvil al hacer clic en un enlace
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Función para verificar si un enlace está activo
  const isLinkActive = (href: string) => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      return hash === href || (hash === '' && href === '#trending-news');
    }
    return false;
  };

  // Función para alternar el tema
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Enlaces de navegación
  const navLinks = [
    {
      name: 'الأخبار العاجلة',
      href: '#trending-news',
      icon: <TrendingUp className="h-4 w-4 ml-2" />
    },
    {
      name: 'آخر الأخبار',
      href: '#latest-news',
      icon: <Clock className="h-4 w-4 ml-2" />
    },
    {
      name: 'أخبار ليبيا',
      href: '#libya-news',
      icon: <MapPin className="h-4 w-4 ml-2" />
    },
    {
      name: 'الأخبار حسب التصنيف',
      href: '#categorized-news',
      icon: <LayoutGrid className="h-4 w-4 ml-2" />
    },
    {
      name: 'تحليل الأخبار والتحقق',
      href: '#news-processor',
      icon: <AlertTriangle className="h-4 w-4 ml-2" />
    }
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3 px-4 md:px-8",
        isScrolled
          ? "bg-background/95 backdrop-blur-sm shadow-md"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo y nombre del sitio */}
        <SafeLink
          href="/"
          className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors"
        >
          <Newspaper className="h-6 w-6" />
          <span className="font-bold text-xl hidden sm:inline-block">محقق الأخبار</span>
        </SafeLink>

        {/* Enlaces de navegación para escritorio */}
        <div className="hidden md:flex items-center space-x-3 space-x-reverse">
          {navLinks.map((link) => (
            <SafeLink
              key={link.name}
              href={link.href}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors border ${
                isLinkActive(link.href)
                  ? 'bg-accent text-accent-foreground border-border/50'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground border-transparent hover:border-border/50'
              }`}
              onClick={handleLinkClick}
            >
              {link.icon}
              <span className="mx-2">{link.name}</span>
            </SafeLink>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          {/* Botón de tema */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label={theme === 'dark' ? 'تبديل إلى الوضع الفاتح' : 'تبديل إلى الوضع الداكن'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Botón de menú móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-sm mt-3 p-4 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <SafeLink
                key={link.name}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-md text-sm font-semibold transition-colors text-right w-full border ${
                  isLinkActive(link.href)
                    ? 'bg-accent text-accent-foreground border-border/50'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground border-transparent hover:border-border/50'
                }`}
                onClick={handleLinkClick}
              >
                {link.icon}
                <span className="mx-2">{link.name}</span>
              </SafeLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
