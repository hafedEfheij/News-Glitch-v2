'use client';

import { useEffect } from 'react';
import { preloadAndCacheImages } from '@/lib/utils/image-cache';

/**
 * AggressivePreload - مكون يقوم بتحميل الموارد الحرجة بشكل استباقي
 * 
 * هذا المكون يستخدم تقنيات متقدمة لضمان تحميل الموارد بأسرع وقت ممكن.
 */
export function AggressivePreload() {
  useEffect(() => {
    // تنفيذ فقط في المتصفح
    if (typeof window === 'undefined') return;
    
    // تحميل صور الفئات المؤقتة مسبقًا
    const placeholderImages = [
      '/images/placeholders/general.svg',
      '/images/placeholders/business.svg',
      '/images/placeholders/technology.svg',
      '/images/placeholders/entertainment.svg',
      '/images/placeholders/sports.svg',
      '/images/placeholders/science.svg',
      '/images/placeholders/health.svg',
      '/images/placeholders/trending.svg',
      '/images/placeholders/latest.svg'
    ];
    
    // تحميل الصور المؤقتة مسبقًا
    placeholderImages.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
      
      // إنشاء عنصر صورة جديد لفرض التحميل
      const img = new Image();
      img.src = url;
    });
    
    // تحميل بعض الصور الإخبارية الشائعة مسبقًا
    const commonNewsImages = [
      'https://ichef.bbci.co.uk/news/1024/branded_news/83B3/production/_115651733_breaking-large-promo-nc.png',
      'https://static01.nyt.com/images/2021/01/30/multimedia/30xp-bkgd/30xp-bkgd-superJumbo.jpg',
      'https://cdn.cnn.com/cnnnext/dam/assets/200512150500-05-wuhan-0407-super-169.jpg'
    ];
    
    // تحميل وتخزين الصور الإخبارية الشائعة مسبقًا
    preloadAndCacheImages(commonNewsImages);
    
    // تحميل الخطوط الحرجة مسبقًا
    const criticalFonts = [
      '/fonts/your-critical-font.woff2', // استبدل بمسارات الخطوط الفعلية
    ];
    
    criticalFonts.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
    
    // تحميل API الصور مسبقًا
    fetch('/api/image-proxy?url=' + encodeURIComponent(commonNewsImages[0]) + '&width=10&height=10')
      .then(() => console.log('تم تحميل API الصور مسبقًا'))
      .catch(() => {});
    
  }, []);
  
  // هذا المكون لا يعرض أي شيء
  return null;
}
