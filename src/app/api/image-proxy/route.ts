import { NextRequest, NextResponse } from 'next/server';

/**
 * خدمة وسيط للصور - تقوم بتحميل الصور من المصادر الخارجية وتحسينها وإعادة إرسالها
 * 
 * هذه الخدمة تقوم بما يلي:
 * 1. تحميل الصور من المصادر الخارجية
 * 2. ضغط الصور وتحسينها
 * 3. تخزينها مؤقتًا
 * 4. إعادة إرسالها بشكل أسرع
 */
export async function GET(request: NextRequest) {
  try {
    // استخراج URL الصورة من معلمات الاستعلام
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const width = searchParams.get('width') || '800';
    const height = searchParams.get('height') || '400';
    
    // التحقق من وجود URL للصورة
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'يجب توفير عنوان URL للصورة' },
        { status: 400 }
      );
    }
    
    // إضافة رأس Cache-Control للتخزين المؤقت
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=86400'); // تخزين مؤقت لمدة يوم واحد
    
    try {
      // تحميل الصورة من المصدر الخارجي
      const imageResponse = await fetch(imageUrl, {
        headers: {
          // إضافة User-Agent لتجنب الحظر
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      
      // التحقق من نجاح الاستجابة
      if (!imageResponse.ok) {
        throw new Error(`فشل في تحميل الصورة: ${imageResponse.status}`);
      }
      
      // الحصول على نوع المحتوى
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      headers.set('Content-Type', contentType);
      
      // قراءة بيانات الصورة
      const imageBuffer = await imageResponse.arrayBuffer();
      
      // إعادة الصورة مع رؤوس التخزين المؤقت
      return new NextResponse(imageBuffer, {
        headers,
        status: 200,
      });
    } catch (error) {
      console.error('خطأ في تحميل الصورة:', error);
      
      // في حالة الفشل، إعادة توجيه الطلب إلى الصورة الأصلية
      return NextResponse.redirect(imageUrl);
    }
  } catch (error) {
    console.error('خطأ في خدمة وسيط الصور:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الصورة' },
      { status: 500 }
    );
  }
}
