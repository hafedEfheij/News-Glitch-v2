'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface SafeLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Un componente seguro para manejar la navegación sin problemas de hidratación
 * Usa un botón en lugar de un enlace para evitar el atributo previewlistener
 */
export function SafeLink({ href, className, children, onClick }: SafeLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Si hay un manejador de clics personalizado, ejecutarlo primero
    if (onClick) {
      onClick(e);
    }
    
    // Usar setTimeout para evitar problemas de hidratación
    setTimeout(() => {
      // Si es un enlace de anclaje, desplazarse a la sección
      if (href.startsWith('#')) {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Si es una URL completa, navegar a ella
        router.push(href);
      }
    }, 0);
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={{ 
        background: 'transparent', 
        border: 'none', 
        padding: 0, 
        cursor: 'pointer',
        textAlign: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        color: 'inherit',
        display: 'inline-flex',
        alignItems: 'center'
      }}
    >
      {children}
    </button>
  );
}
