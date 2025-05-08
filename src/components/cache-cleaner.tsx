'use client';

import { useEffect } from 'react';
import { clearExpiredImageCaches } from '@/lib/utils/image-cache';

/**
 * CacheCleaner - مكون ينظف ذاكرة التخزين المؤقت للصور المنتهية الصلاحية
 * 
 * هذا المكون لا يعرض أي شيء، فقط ينظف ذاكرة التخزين المؤقت المنتهية الصلاحية
 * عند تحميل التطبيق.
 */
export function CacheCleaner() {
  useEffect(() => {
    // تنظيف ذاكرة التخزين المؤقت المنتهية الصلاحية عند تحميل المكون
    clearExpiredImageCaches();
    
    // إعداد تنظيف دوري
    const intervalId = setInterval(() => {
      clearExpiredImageCaches();
    }, 30 * 60 * 1000); // تنظيف كل 30 دقيقة
    
    // تنظيف الفاصل الزمني عند إلغاء تحميل المكون
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // هذا المكون لا يعرض أي شيء
  return null;
}
