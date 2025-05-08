'use client';

import React, { useState, useEffect } from 'react';
import { getCachedImageUrl, cacheImageUrl } from '@/lib/utils/image-cache';

interface InstantImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  category?: string;
  priority?: boolean;
}

/**
 * InstantImage - مكون يعرض صورة مؤقتة محلية فورًا أثناء تحميل الصورة الفعلية
 * 
 * هذا المكون:
 * 1. يعرض صورة مؤقتة محلية فورًا (بدون تأخير في التحميل)
 * 2. يقوم بتحميل الصورة الفعلية في الخلفية
 * 3. يستبدل الصورة المؤقتة بالصورة الفعلية عند اكتمال التحميل
 * 4. يستخدم خدمة وسيط الصور المحلية لتسريع التحميل
 */
export function InstantImage({
  src,
  alt,
  className = '',
  width = 800,
  height = 400,
  category = 'general',
  priority = false
}: InstantImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // الحصول على صورة مؤقتة بناءً على الفئة
  const getPlaceholderImage = (cat: string): string => {
    // ربط الفئة بصورة مؤقتة
    const placeholderMap: Record<string, string> = {
      general: '/images/placeholders/general.svg',
      business: '/images/placeholders/business.svg',
      technology: '/images/placeholders/technology.svg',
      entertainment: '/images/placeholders/entertainment.svg',
      sports: '/images/placeholders/sports.svg',
      science: '/images/placeholders/science.svg',
      health: '/images/placeholders/health.svg',
      trending: '/images/placeholders/trending.svg',
      latest: '/images/placeholders/latest.svg'
    };
    
    return placeholderMap[cat] || placeholderMap.general;
  };
  
  const placeholderSrc = getPlaceholderImage(category);
  
  // التحقق من وجود URL مخزن مؤقتًا واستخدام خدمة الوسيط
  const [actualSrc, setActualSrc] = useState<string | null>(null);
  
  useEffect(() => {
    if (src) {
      // محاولة الحصول على URL المخزن مؤقتًا
      const cachedUrl = getCachedImageUrl(src);
      if (cachedUrl) {
        setActualSrc(cachedUrl);
      } else {
        // استخدام خدمة وسيط الصور المحلية للتحميل الأسرع
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&width=${width}&height=${height}`;
        setActualSrc(proxyUrl);
      }
    }
  }, [src, width, height]);
  
  // تخزين URL الصورة مؤقتًا عند تحميلها بنجاح
  useEffect(() => {
    if (loaded && src && actualSrc) {
      cacheImageUrl(src, actualSrc);
    }
  }, [loaded, src, actualSrc]);
  
  // معالجة تحميل الصورة
  const handleLoad = () => {
    setLoaded(true);
  };
  
  // معالجة خطأ الصورة
  const handleError = () => {
    setError(true);
    // في حالة الخطأ، حاول استخدام URL الأصلي
    if (src && actualSrc !== src) {
      setActualSrc(src);
    }
  };
  
  // إذا لم يتم توفير src أو حدث خطأ في التحميل، عرض الصورة المؤقتة
  if (!src || error) {
    return (
      <img
        src={placeholderSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
      />
    );
  }
  
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${width}/${height}` }}>
      {/* الصورة المؤقتة - مرئية دائمًا في البداية */}
      <img
        src={placeholderSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'}`}
        width={width}
        height={height}
      />
      
      {/* الصورة الفعلية - مخفية حتى يتم تحميلها */}
      {actualSrc && (
        <img
          src={actualSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          width={width}
          height={height}
        />
      )}
    </div>
  );
}
