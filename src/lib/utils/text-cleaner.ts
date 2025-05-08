/**
 * وظائف مساعدة لتنظيف النصوص من رموز HTML وتنسيقها بشكل صحيح
 */

/**
 * تنظيف النص من رموز HTML وتحويلها إلى المكافئ المناسب
 * 
 * @param text النص المراد تنظيفه
 * @returns النص بعد التنظيف
 */
export function cleanHtmlEntities(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    // تحويل رموز المسافات غير المنقسمة إلى مسافات عادية
    .replace(/&nbsp;/g, ' ')
    // تحويل رموز الأقل من وأكبر من
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // تحويل رموز الاقتباس
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    // تحويل رمز العطف
    .replace(/&amp;/g, '&')
    // إزالة المسافات المتكررة
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * تنظيف النص من رموز HTML وتنسيقه للعرض
 * يستخدم هذا للنصوص التي تظهر في واجهة المستخدم
 * 
 * @param text النص المراد تنظيفه
 * @returns النص بعد التنظيف والتنسيق
 */
export function cleanTextForDisplay(text: string | null | undefined): string {
  if (!text) return '';
  
  // أولاً، نقوم بتنظيف رموز HTML
  let cleanedText = cleanHtmlEntities(text);
  
  // إزالة علامات HTML
  cleanedText = cleanedText.replace(/<\/?[^>]+(>|$)/g, '');
  
  // إضافة علامة RTL للتأكد من عرض النص العربي بشكل صحيح
  return '\u200F' + cleanedText;
}

/**
 * اقتطاع النص إلى طول معين مع الحفاظ على سلامة الكلمات
 * 
 * @param text النص المراد اقتطاعه
 * @param maxLength الطول الأقصى للنص
 * @returns النص بعد الاقتطاع
 */
export function truncateCleanText(text: string | null | undefined, maxLength: number = 150): string {
  // تنظيف النص أولاً
  const cleanedText = cleanTextForDisplay(text);
  
  if (cleanedText.length <= maxLength) return cleanedText;
  
  // البحث عن آخر مسافة قبل الطول الأقصى لتجنب قطع الكلمات
  const lastSpace = cleanedText.lastIndexOf(' ', maxLength);
  const breakPoint = lastSpace > maxLength / 2 ? lastSpace : maxLength;
  
  // إضافة علامة RTL للتأكد من عرض النص العربي بشكل صحيح
  return '\u200F' + cleanedText.substring(0, breakPoint) + '...';
}
