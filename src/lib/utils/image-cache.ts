/**
 * نظام تخزين مؤقت للصور في المتصفح
 * 
 * توفر هذه الأداة المساعدة وظائف لتخزين الصور مؤقتًا في المتصفح
 * باستخدام مزيج من localStorage (للروابط) و IndexedDB (لبيانات الصور)
 */

// التحقق مما إذا كنا في بيئة متصفح
const isBrowser = typeof window !== 'undefined';

// بادئة مفتاح التخزين المؤقت
const CACHE_PREFIX = 'news-image-cache-';

// وقت انتهاء صلاحية التخزين المؤقت (24 ساعة)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * الحصول على رابط صورة مخزنة مؤقتًا من localStorage
 * 
 * @param originalUrl رابط الصورة الأصلي
 * @returns الرابط المخزن مؤقتًا إذا كان متاحًا وغير منتهي الصلاحية، وإلا null
 */
export function getCachedImageUrl(originalUrl: string): string | null {
  if (!isBrowser || !originalUrl) return null;
  
  try {
    const cacheKey = `${CACHE_PREFIX}${originalUrl}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) return null;
    
    const { timestamp, cachedUrl } = JSON.parse(cachedData);
    
    // التحقق مما إذا كان التخزين المؤقت منتهي الصلاحية
    if (Date.now() - timestamp > CACHE_EXPIRATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return cachedUrl;
  } catch (error) {
    console.error('خطأ في الحصول على رابط الصورة المخزنة مؤقتًا:', error);
    return null;
  }
}

/**
 * تخزين رابط صورة مؤقتًا في localStorage
 * 
 * @param originalUrl رابط الصورة الأصلي
 * @param cachedUrl رابط الصورة المخزنة مؤقتًا
 */
export function cacheImageUrl(originalUrl: string, cachedUrl: string): void {
  if (!isBrowser || !originalUrl || !cachedUrl) return;
  
  try {
    const cacheKey = `${CACHE_PREFIX}${originalUrl}`;
    const cacheData = JSON.stringify({
      timestamp: Date.now(),
      cachedUrl
    });
    
    localStorage.setItem(cacheKey, cacheData);
  } catch (error) {
    console.error('خطأ في تخزين رابط الصورة مؤقتًا:', error);
  }
}

/**
 * تحميل وتخزين صورة مسبقًا
 * 
 * @param url رابط الصورة للتحميل المسبق والتخزين المؤقت
 */
export function preloadAndCacheImage(url: string): void {
  if (!isBrowser || !url) return;
  
  // التحقق مما إذا كان مخزنًا مؤقتًا بالفعل
  const cachedUrl = getCachedImageUrl(url);
  if (cachedUrl) return;
  
  // استخدام خدمة وسيط الصور المحلية
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}&width=800&height=400`;
  
  // إنشاء عنصر صورة جديد
  const img = new Image();
  
  // عند تحميل الصورة، تخزين الرابط الخاص بها مؤقتًا
  img.onload = () => {
    cacheImageUrl(url, proxyUrl);
  };
  
  // تحميل الصورة
  img.src = proxyUrl;
}

/**
 * تحميل وتخزين صور متعددة مسبقًا
 * 
 * @param urls مصفوفة من روابط الصور للتحميل المسبق والتخزين المؤقت
 */
export function preloadAndCacheImages(urls: string[]): void {
  if (!isBrowser) return;
  
  urls.forEach(url => {
    if (url) {
      preloadAndCacheImage(url);
    }
  });
}

/**
 * مسح التخزين المؤقت للصور المنتهية الصلاحية
 */
export function clearExpiredImageCaches(): void {
  if (!isBrowser) return;
  
  try {
    // الحصول على جميع مفاتيح localStorage
    const keys = Object.keys(localStorage);
    
    // تصفية المفاتيح التي تتطابق مع بادئة التخزين المؤقت الخاصة بنا
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    // التحقق من كل إدخال تخزين مؤقت
    cacheKeys.forEach(key => {
      const cachedData = localStorage.getItem(key);
      if (!cachedData) return;
      
      const { timestamp } = JSON.parse(cachedData);
      
      // إزالة إذا كان منتهي الصلاحية
      if (Date.now() - timestamp > CACHE_EXPIRATION) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('خطأ في مسح التخزين المؤقت للصور المنتهية الصلاحية:', error);
  }
}
