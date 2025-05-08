'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  TrendingUp,
  Newspaper,
  BarChart3,
  Briefcase,
  Cpu,
  Film,
  Dumbbell,
  FlaskConical,
  Heart,
  Clock,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import ClientLink from '@/components/client-link';
import {
  fetchNewsByCategories,
  fetchTopHeadlines,
  NewsArticle,
  NewsCategory,
  NEWS_CATEGORIES
} from '@/lib/api/news-api';
import { fetchAllNews, fetchNewsByCategoryFromRSS, RssItem } from '@/lib/api/rss-feed';
import { cleanTextForDisplay, truncateCleanText } from '@/lib/utils/text-cleaner';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { useToast } from '@/hooks/use-toast';

// Convertir elementos RSS a formato NewsArticle para consistencia
const convertRssToNewsArticle = (rssItem: RssItem): NewsArticle => {
  // Determinar la categoría basada en el título, la descripción y la fuente
  const category = determineNewsCategory(rssItem.title, rssItem.description, rssItem.source);

  return {
    source: {
      id: rssItem.source.toLowerCase().replace(/\s+/g, '-'),
      name: rssItem.source
    },
    author: rssItem.source,
    title: rssItem.title,
    description: rssItem.description,
    url: rssItem.link,
    urlToImage: rssItem.imageUrl || `https://picsum.photos/800/400?seed=${encodeURIComponent(rssItem.title)}`,
    publishedAt: rssItem.pubDate,
    content: rssItem.description,
    category: category
  };
};

// تصنيف مصادر الأخبار حسب الفئات - تحديث شامل مع مصادر متخصصة لكل فئة
const RSS_SOURCE_CATEGORIES: Record<string, NewsCategory[]> = {
  // ===== مصادر الأعمال والاقتصاد =====
  // مصادر متخصصة في الأعمال والاقتصاد فقط
  'الاقتصادية': ['business'],
  'CNBC Arabia': ['business'],
  'Bloomberg': ['business'],
  'Al Eqtisadiah': ['business'],
  'Al Mal News': ['business'],
  'Amwal Al Ghad': ['business'],
  'Argaam': ['business'],
  'Mubasher': ['business'],
  'الاقتصادي': ['business'],
  'مال وأعمال': ['business'],
  'اقتصاد الشرق': ['business'],
  'الأسواق العربية': ['business'],
  'صحيفة الاقتصادية': ['business'],
  'العربية CNBC': ['business'],
  'الاستثمار': ['business'],
  'المال': ['business'],
  'البورصة': ['business'],
  'الاقتصاد اليوم': ['business'],
  'الاقتصاد نيوز': ['business'],
  'الاقتصاد العربي': ['business'],
  'الشرق الاقتصادي': ['business'],
  'الخليج الاقتصادي': ['business'],
  'الاقتصاد السعودي': ['business'],
  'الاقتصاد المصري': ['business'],
  'الاقتصاد الإماراتي': ['business'],
  'مباشر': ['business'],
  'معلومات مباشر': ['business'],
  'أرقام': ['business'],
  'زاوية': ['business'],
  'الأسهم': ['business'],
  'تداول': ['business'],
  'فوركس': ['business'],
  'العملات': ['business'],
  'الذهب': ['business'],
  'النفط': ['business'],
  'الطاقة': ['business'],
  'الاستثمار العقاري': ['business'],
  'العقارات': ['business'],
  'الشركات': ['business'],
  'البنوك': ['business'],
  'المصارف': ['business'],
  'التمويل': ['business'],
  'الضرائب': ['business'],
  'الميزانية': ['business'],
  'الإنفاق': ['business'],
  'الدخل': ['business'],
  'الأرباح': ['business'],
  'الخسائر': ['business'],
  'الإفلاس': ['business'],
  'التضخم': ['business'],
  'الركود': ['business'],
  'النمو': ['business'],
  'التنمية': ['business'],
  'الصناعة': ['business'],
  'التصنيع': ['business'],
  'الإنتاج': ['business'],
  'التصدير': ['business'],
  'الاستيراد': ['business'],
  'التجارة': ['business'],

  // ===== مصادر التكنولوجيا =====
  // مصادر متخصصة في التكنولوجيا فقط
  'AIT News': ['technology'],
  'Tech World': ['technology'],
  'Tech Arabic': ['technology'],
  'عالم التقنية': ['technology'],
  'تكنولوجيا نيوز': ['technology'],
  'البوابة العربية للأخبار التقنية': ['technology'],
  'أخبار التقنية': ['technology'],
  'تقنية نت': ['technology'],
  'التقنية بلا حدود': ['technology'],
  'آي تي بي': ['technology'],
  'آفاق تقنية': ['technology'],
  'تكنولوجيا المستقبل': ['technology'],
  'تك عربي': ['technology'],
  'تقنيات': ['technology'],
  'الذكاء الاصطناعي': ['technology'],
  'الروبوتات': ['technology'],
  'الإنترنت': ['technology'],
  'الشبكات': ['technology'],
  'الويب': ['technology'],
  'الهواتف': ['technology'],
  'الجوالات': ['technology'],
  'المحمول': ['technology'],
  'الذكي': ['technology'],
  'البيانات': ['technology'],
  'المعلومات': ['technology'],
  'البرامج': ['technology'],
  'الأنظمة': ['technology'],
  'التشغيل': ['technology'],
  'أندرويد': ['technology'],
  'آيفون': ['technology'],
  'آبل': ['technology'],
  'جوجل': ['technology'],
  'مايكروسوفت': ['technology'],
  'فيسبوك': ['technology'],
  'تويتر': ['technology'],
  'إنستغرام': ['technology'],
  'سناب': ['technology'],
  'يوتيوب': ['technology'],
  'تيك توك': ['technology'],
  'واتساب': ['technology'],
  'تلغرام': ['technology'],
  'سيبراني': ['technology'],
  'إلكتروني': ['technology'],
  'رقمي': ['technology'],
  'التحول الرقمي': ['technology'],
  'الابتكار': ['technology'],
  'الاختراع': ['technology'],
  'البراءة': ['technology'],
  'الناشئة': ['technology'],
  'ستارت أب': ['technology'],

  // ===== مصادر الرياضة =====
  // مصادر متخصصة في الرياضة فقط
  'Kooora': ['sports'],
  'FilGoal': ['sports'],
  'Yalla Kora': ['sports'],
  'beIN Sports': ['sports'],
  'كووورة': ['sports'],
  'في الجول': ['sports'],
  'يلا كورة': ['sports'],
  'بي إن سبورتس': ['sports'],
  'الرياضية': ['sports'],
  'الرياضة اليوم': ['sports'],
  'الرياضة نيوز': ['sports'],
  'الرياضة العربية': ['sports'],
  'الرياضة السعودية': ['sports'],
  'الرياضة المصرية': ['sports'],
  'الرياضة الإماراتية': ['sports'],
  'كرة القدم': ['sports'],
  'كرة السلة': ['sports'],
  'كرة الطائرة': ['sports'],
  'كرة اليد': ['sports'],
  'التنس': ['sports'],
  'الجولف': ['sports'],
  'السباحة': ['sports'],
  'السباق': ['sports'],
  'الماراثون': ['sports'],
  'الدراجات': ['sports'],
  'الفروسية': ['sports'],
  'المصارعة': ['sports'],
  'الملاكمة': ['sports'],
  'الجودو': ['sports'],
  'الكاراتيه': ['sports'],
  'التايكوندو': ['sports'],
  'الجمباز': ['sports'],
  'الأولمبياد': ['sports'],
  'البطولة': ['sports'],
  'الكأس': ['sports'],
  'الدوري': ['sports'],
  'الليغ': ['sports'],
  'المنتخب': ['sports'],
  'الفريق': ['sports'],
  'النادي': ['sports'],
  'اللاعب': ['sports'],
  'المدرب': ['sports'],
  'المباراة': ['sports'],
  'الهدف': ['sports'],
  'التسجيل': ['sports'],
  'الفوز': ['sports'],
  'الخسارة': ['sports'],
  'التعادل': ['sports'],
  'النقطة': ['sports'],
  'الترتيب': ['sports'],
  'التصنيف': ['sports'],
  'الميدالية': ['sports'],

  // ===== مصادر الترفيه =====
  // مصادر متخصصة في الترفيه فقط
  'El Cinema': ['entertainment'],
  'Fann': ['entertainment'],
  'ET Arabic': ['entertainment'],
  'السينما': ['entertainment'],
  'الفن': ['entertainment'],
  'الترفيه': ['entertainment'],
  'نجوم الفن': ['entertainment'],
  'مشاهير': ['entertainment'],
  'نواعم': ['entertainment'],
  'ليالينا': ['entertainment'],
  'سيدتي': ['entertainment'],
  'زهرة الخليج': ['entertainment'],
  'الفن اليوم': ['entertainment'],
  'الفن نيوز': ['entertainment'],
  'الفن العربي': ['entertainment'],
  'الفن السعودي': ['entertainment'],
  'الفن المصري': ['entertainment'],
  'الفن الإماراتي': ['entertainment'],
  'الفيلم': ['entertainment'],
  'المسلسل': ['entertainment'],
  'الأغنية': ['entertainment'],
  'الفنان': ['entertainment'],
  'الفنانة': ['entertainment'],
  'الممثل': ['entertainment'],
  'الممثلة': ['entertainment'],
  'المطرب': ['entertainment'],
  'المطربة': ['entertainment'],
  'الحفل': ['entertainment'],
  'المهرجان': ['entertainment'],
  'الجائزة': ['entertainment'],
  'السينما': ['entertainment'],
  'المسرح': ['entertainment'],
  'الموسيقى': ['entertainment'],
  'الدراما': ['entertainment'],
  'الكوميديا': ['entertainment'],
  'المسرحية': ['entertainment'],
  'النجم': ['entertainment'],
  'النجمة': ['entertainment'],
  'المشاهير': ['entertainment'],
  'الشهرة': ['entertainment'],
  'العرض': ['entertainment'],
  'الإخراج': ['entertainment'],
  'المخرج': ['entertainment'],
  'الإنتاج': ['entertainment'],
  'المنتج': ['entertainment'],
  'التصوير': ['entertainment'],
  'التلفزيون': ['entertainment'],
  'القناة': ['entertainment'],
  'البرنامج': ['entertainment'],
  'المقابلة': ['entertainment'],
  'الحوار': ['entertainment'],
  'المذيع': ['entertainment'],
  'المذيعة': ['entertainment'],
  'الإعلامي': ['entertainment'],
  'الإعلامية': ['entertainment'],

  // ===== مصادر العلوم =====
  // مصادر متخصصة في العلوم فقط
  'Scientific American Arabic': ['science'],
  'Nature Arabic': ['science'],
  'Science News Arabic': ['science'],
  'للعلم': ['science'],
  'ناشيونال جيوغرافيك': ['science'],
  'العلوم': ['science'],
  'العلم': ['science'],
  'العلمي': ['science'],
  'العلمية': ['science'],
  'البحث': ['science'],
  'الأبحاث': ['science'],
  'الدراسة': ['science'],
  'الدراسات': ['science'],
  'الاكتشاف': ['science'],
  'الاكتشافات': ['science'],
  'الفضاء': ['science'],
  'الكون': ['science'],
  'الكوني': ['science'],
  'النجم': ['science'],
  'النجوم': ['science'],
  'الكوكب': ['science'],
  'الكواكب': ['science'],
  'المجرة': ['science'],
  'المجرات': ['science'],
  'الفلك': ['science'],
  'الفلكي': ['science'],
  'الفلكية': ['science'],
  'ناسا': ['science'],
  'المركبة': ['science'],
  'المسبار': ['science'],
  'القمر': ['science'],
  'الأقمار': ['science'],
  'الصناعي': ['science'],
  'الصناعية': ['science'],
  'التلسكوب': ['science'],
  'المجهر': ['science'],
  'المختبر': ['science'],
  'المختبرات': ['science'],
  'التجربة': ['science'],
  'التجارب': ['science'],
  'النظرية': ['science'],
  'النظريات': ['science'],
  'الفرضية': ['science'],
  'الفرضيات': ['science'],
  'القانون': ['science'],
  'القوانين': ['science'],
  'الفيزياء': ['science'],
  'الكيمياء': ['science'],
  'الأحياء': ['science'],
  'البيولوجيا': ['science'],
  'الجيولوجيا': ['science'],

  // ===== مصادر الصحة =====
  // مصادر متخصصة في الصحة فقط
  'Health Arabic': ['health'],
  'Al Tibbi': ['health'],
  'Sehati': ['health'],
  'الطبي': ['health'],
  'صحتي': ['health'],
  'ويب طب': ['health'],
  'الصحة': ['health'],
  'الصحي': ['health'],
  'الصحية': ['health'],
  'الطب': ['health'],
  'الطبي': ['health'],
  'الطبية': ['health'],
  'المرض': ['health'],
  'الأمراض': ['health'],
  'العلاج': ['health'],
  'العلاجات': ['health'],
  'الدواء': ['health'],
  'الأدوية': ['health'],
  'الصيدلة': ['health'],
  'الصيدلي': ['health'],
  'الصيدلية': ['health'],
  'المستشفى': ['health'],
  'المستشفيات': ['health'],
  'العيادة': ['health'],
  'العيادات': ['health'],
  'الطبيب': ['health'],
  'الأطباء': ['health'],
  'الطبيبة': ['health'],
  'الطبيبات': ['health'],
  'الممرض': ['health'],
  'الممرضة': ['health'],
  'التمريض': ['health'],
  'الجراحة': ['health'],
  'الجراح': ['health'],
  'العملية': ['health'],
  'العمليات': ['health'],
  'الفحص': ['health'],
  'الفحوصات': ['health'],
  'التشخيص': ['health'],
  'التشخيصات': ['health'],
  'الأشعة': ['health'],
  'التحليل': ['health'],
  'التحاليل': ['health'],
  'الوقاية': ['health'],
  'الوقائي': ['health'],
  'الوقائية': ['health'],
  'التغذية': ['health'],
  'الغذاء': ['health'],
  'الغذائي': ['health'],
  'الغذائية': ['health'],
  'السمنة': ['health'],
  'النحافة': ['health'],
  'الوزن': ['health'],
  'الرياضة': ['health'],
  'التمارين': ['health'],
  'اللياقة': ['health'],
  'البدنية': ['health'],
  'النفسية': ['health'],
  'النفسي': ['health'],
  'العقلية': ['health'],
  'العقلي': ['health'],
  'الاكتئاب': ['health'],
  'القلق': ['health'],
  'التوتر': ['health'],
  'الضغط': ['health'],
  'السكري': ['health'],
  'ضغط الدم': ['health'],
  'القلب': ['health'],
  'القلبية': ['health'],
  'السرطان': ['health'],
  'الأورام': ['health'],
  'الفيروس': ['health'],
  'الفيروسات': ['health'],
  'البكتيريا': ['health'],
  'الجرثومة': ['health'],
  'الجراثيم': ['health'],
  'المناعة': ['health'],
  'اللقاح': ['health'],
  'اللقاحات': ['health'],
  'التطعيم': ['health'],
  'التطعيمات': ['health'],
  'الوباء': ['health'],
  'الأوبئة': ['health'],

  // ===== المصادر العامة =====
  // المصادر الرئيسية التي تغطي مجموعة متنوعة من الفئات
  'Al Jazeera': ['general', 'business', 'technology', 'sports', 'health'],
  'BBC Arabic': ['general', 'technology', 'health', 'science', 'business'],
  'CNN Arabic': ['general', 'business', 'technology', 'entertainment'],
  'RT Arabic': ['general', 'science', 'technology', 'business'],
  'France 24': ['general', 'entertainment', 'business', 'sports'],
  'DW Arabic': ['general', 'science', 'health', 'technology'],
  'Sky News Arabia': ['general', 'business', 'sports', 'technology'],
  'Al Arabiya': ['general', 'business', 'sports', 'entertainment'],
  'Google News': ['general', 'business', 'technology', 'entertainment', 'sports', 'science', 'health'],
  'Asharq Al-Awsat': ['general', 'business', 'entertainment'],
  'Al Khaleej': ['general', 'business', 'sports'],
  'Al Bayan': ['general', 'business', 'sports', 'health'],
  'Al Ittihad': ['general', 'sports', 'business'],
  'Al Riyadh': ['general', 'business', 'entertainment'],
  'Al Watan': ['general', 'business', 'sports'],
  'Al Ahram': ['general', 'business', 'sports', 'entertainment'],
  'SPA Arabic': ['general', 'business'],
  'WAM Arabic': ['general', 'business'],
  'KUNA Arabic': ['general', 'business'],
  'PETRA Arabic': ['general'],
  'MAP Arabic': ['general'],
  'QNA Arabic': ['general', 'business', 'sports'],
};

// Palabras clave para categorizar noticias por su contenido
const CATEGORY_KEYWORDS: Record<NewsCategory, string[]> = {
  general: [
    'أخبار', 'عاجل', 'حدث', 'تقرير', 'تصريح', 'بيان', 'مؤتمر', 'قمة', 'اجتماع', 'زيارة', 'لقاء',
    'رئيس', 'وزير', 'حكومة', 'برلمان', 'انتخابات', 'سياسة', 'دبلوماسية', 'أزمة', 'حرب', 'سلام',
    'مفاوضات', 'اتفاق', 'معاهدة', 'قرار', 'قانون', 'محكمة', 'قضاء', 'عدالة', 'حقوق', 'إنسان'
  ],
  business: [
    'اقتصاد', 'مال', 'أعمال', 'تجارة', 'شركة', 'شركات', 'استثمار', 'بورصة', 'سوق', 'أسواق',
    'أسهم', 'سندات', 'عملة', 'عملات', 'دولار', 'يورو', 'ريال', 'دينار', 'جنيه', 'درهم',
    'بنك', 'بنوك', 'مصرف', 'مصارف', 'ائتمان', 'قرض', 'قروض', 'تمويل', 'ضرائب', 'ضريبة',
    'ميزانية', 'إنفاق', 'دخل', 'أرباح', 'خسائر', 'إفلاس', 'تضخم', 'ركود', 'نمو', 'تنمية',
    'صناعة', 'تصنيع', 'إنتاج', 'تصدير', 'استيراد', 'تجارة', 'عقارات', 'عقار', 'بترول', 'نفط',
    'غاز', 'طاقة', 'كهرباء', 'تعدين', 'زراعة', 'سياحة', 'فنادق', 'طيران', 'نقل', 'مواصلات'
  ],
  technology: [
    'تكنولوجيا', 'تقنية', 'تقنيات', 'إلكترونيات', 'حاسوب', 'كمبيوتر', 'حاسب', 'برمجة', 'برمجيات',
    'تطبيق', 'تطبيقات', 'موقع', 'مواقع', 'إنترنت', 'شبكة', 'ويب', 'هاتف', 'جوال', 'محمول',
    'ذكي', 'ذكاء', 'اصطناعي', 'روبوت', 'آلي', 'أتمتة', 'بيانات', 'معلومات', 'خوارزمية', 'خوارزميات',
    'برنامج', 'برامج', 'نظام', 'أنظمة', 'تشغيل', 'أندرويد', 'آيفون', 'آبل', 'جوجل', 'مايكروسوفت',
    'فيسبوك', 'تويتر', 'إنستغرام', 'سناب', 'يوتيوب', 'تيك توك', 'واتساب', 'تلغرام', 'سيبراني', 'إلكتروني',
    'رقمي', 'رقمية', 'تحول', 'ابتكار', 'اختراع', 'براءة', 'ناشئة', 'ستارت أب', 'شركة ناشئة'
  ],
  entertainment: [
    'ترفيه', 'فن', 'فنون', 'سينما', 'فيلم', 'أفلام', 'مسلسل', 'مسلسلات', 'دراما', 'كوميديا',
    'مسرح', 'مسرحية', 'موسيقى', 'أغنية', 'أغاني', 'مطرب', 'مطربة', 'فنان', 'فنانة', 'ممثل',
    'ممثلة', 'نجم', 'نجمة', 'مشاهير', 'شهرة', 'جائزة', 'جوائز', 'مهرجان', 'حفل', 'حفلة',
    'عرض', 'عروض', 'إخراج', 'مخرج', 'إنتاج', 'منتج', 'تصوير', 'تلفزيون', 'تلفاز', 'قناة',
    'برنامج', 'برامج', 'مقابلة', 'لقاء', 'حوار', 'مذيع', 'مذيعة', 'إعلامي', 'إعلامية', 'إعلام',
    'صحافة', 'صحفي', 'صحفية', 'مجلة', 'مجلات', 'كتاب', 'كتب', 'رواية', 'روايات', 'أدب'
  ],
  sports: [
    'رياضة', 'رياضات', 'كرة', 'قدم', 'سلة', 'طائرة', 'يد', 'تنس', 'جولف', 'سباحة',
    'سباق', 'سباقات', 'ماراثون', 'دراجات', 'فروسية', 'خيل', 'خيول', 'مصارعة', 'ملاكمة', 'جودو',
    'كاراتيه', 'تايكوندو', 'جمباز', 'أولمبياد', 'أولمبي', 'بطولة', 'بطولات', 'كأس', 'دوري', 'ليغ',
    'منتخب', 'منتخبات', 'فريق', 'فرق', 'نادي', 'أندية', 'لاعب', 'لاعبين', 'لاعبون', 'مدرب',
    'مدربين', 'مدربون', 'تدريب', 'مباراة', 'مباريات', 'هدف', 'أهداف', 'تسجيل', 'فوز', 'خسارة',
    'تعادل', 'نقطة', 'نقاط', 'ترتيب', 'تصنيف', 'ميدالية', 'ميداليات', 'ذهبية', 'فضية', 'برونزية'
  ],
  science: [
    'علم', 'علوم', 'علمي', 'علمية', 'بحث', 'أبحاث', 'دراسة', 'دراسات', 'اكتشاف', 'اكتشافات',
    'فضاء', 'كون', 'كوني', 'نجم', 'نجوم', 'كوكب', 'كواكب', 'مجرة', 'مجرات', 'فلك',
    'فلكي', 'فلكية', 'ناسا', 'مركبة', 'مسبار', 'قمر', 'أقمار', 'صناعي', 'صناعية', 'تلسكوب',
    'مجهر', 'مختبر', 'مختبرات', 'تجربة', 'تجارب', 'نظرية', 'نظريات', 'فرضية', 'فرضيات', 'قانون',
    'قوانين', 'فيزياء', 'كيمياء', 'أحياء', 'بيولوجيا', 'جيولوجيا', 'طب', 'طبي', 'طبية', 'جراحة',
    'جراحي', 'جراحية', 'دواء', 'أدوية', 'علاج', 'علاجات', 'مرض', 'أمراض', 'وباء', 'أوبئة',
    'فيروس', 'فيروسات', 'بكتيريا', 'جرثومة', 'جراثيم', 'مناعة', 'لقاح', 'لقاحات', 'تطعيم', 'تطعيمات'
  ],
  health: [
    'صحة', 'صحي', 'صحية', 'طب', 'طبي', 'طبية', 'مرض', 'أمراض', 'علاج', 'علاجات',
    'دواء', 'أدوية', 'صيدلة', 'صيدلي', 'صيدلية', 'مستشفى', 'مستشفيات', 'عيادة', 'عيادات', 'طبيب',
    'أطباء', 'طبيبة', 'طبيبات', 'ممرض', 'ممرضة', 'تمريض', 'جراحة', 'جراح', 'عملية', 'عمليات',
    'فحص', 'فحوصات', 'تشخيص', 'تشخيصات', 'أشعة', 'تصوير', 'مختبر', 'مختبرات', 'تحليل', 'تحاليل',
    'وقاية', 'وقائي', 'وقائية', 'تغذية', 'غذاء', 'غذائي', 'غذائية', 'سمنة', 'نحافة', 'وزن',
    'رياضة', 'تمارين', 'لياقة', 'بدنية', 'نفسية', 'نفسي', 'عقلية', 'عقلي', 'اكتئاب', 'قلق',
    'توتر', 'ضغط', 'سكري', 'ضغط الدم', 'قلب', 'قلبية', 'سرطان', 'أورام', 'فيروس', 'فيروسات',
    'بكتيريا', 'جرثومة', 'جراثيم', 'مناعة', 'لقاح', 'لقاحات', 'تطعيم', 'تطعيمات', 'وباء', 'أوبئة'
  ]
};

// دالة لتحديد فئة الخبر بناءً على العنوان والوصف والمصدر
const determineNewsCategory = (title: string, description: string = '', sourceName: string = ''): NewsCategory => {
  // تطبيع النص للمقارنة
  const normalizedTitle = title.toLowerCase();
  const normalizedDescription = description ? description.toLowerCase() : '';

  // تطبيع النص العربي
  const normalizeArabicText = (text: string): string => {
    return text
      .trim()
      .toLowerCase()
      // إزالة التشكيل
      .replace(/[\u064B-\u065F]/g, '')
      // توحيد أشكال الألف
      .replace(/[أإآا]/g, 'ا')
      // توحيد أشكال الياء
      .replace(/[يى]/g, 'ي')
      // توحيد التاء المربوطة
      .replace(/[ة]/g, 'ه')
      // إزالة علامات الترقيم
      .replace(/[.,،:;'"!؟?()[\]{}]/g, '')
      // إزالة المسافات الزائدة
      .replace(/\s+/g, ' ');
  };

  const normalizedArabicTitle = normalizeArabicText(normalizedTitle);
  const normalizedArabicDescription = normalizeArabicText(normalizedDescription);
  const combinedText = normalizedArabicTitle + ' ' + normalizedArabicDescription;

  // حساب النقاط لكل فئة
  const scores: Record<NewsCategory, number> = {
    general: 0,
    business: 0,
    technology: 0,
    entertainment: 0,
    sports: 0,
    science: 0,
    health: 0
  };

  // إعطاء وزن أكبر للكلمات المفتاحية في العنوان
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      const normalizedKeyword = normalizeArabicText(keyword);

      // إذا كانت الكلمة المفتاحية موجودة في العنوان، إعطاء نقاط أكثر
      if (normalizedArabicTitle.includes(normalizedKeyword)) {
        scores[category as NewsCategory] += 3;
      }
      // إذا كانت الكلمة المفتاحية موجودة في الوصف، إعطاء نقاط أقل
      else if (normalizedArabicDescription && normalizedArabicDescription.includes(normalizedKeyword)) {
        scores[category as NewsCategory] += 1;
      }
    });
  });

  // تعديل النقاط بناءً على المصدر
  if (sourceName) {
    const normalizedSource = sourceName.toLowerCase();

    // تحديد فئة المصدر من RSS_SOURCE_CATEGORIES
    const sourceCategories = RSS_SOURCE_CATEGORIES[sourceName] || [];

    // إذا كان المصدر متخصصًا في فئة واحدة فقط، نعطي وزنًا أكبر لهذه الفئة
    if (sourceCategories.length === 1) {
      scores[sourceCategories[0]] += 10; // وزن كبير للمصادر المتخصصة في فئة واحدة
      console.log(`مصدر متخصص: ${sourceName} => ${sourceCategories[0]} (+10)`);
    } else {
      // إعطاء نقاط إضافية للفئات المرتبطة بالمصدر
      sourceCategories.forEach(category => {
        scores[category] += 3;
      });
    }

    // مصادر الأعمال
    if (normalizedSource.includes('cnbc') ||
        normalizedSource.includes('bloomberg') ||
        normalizedSource.includes('اقتصاد') ||
        normalizedSource.includes('business') ||
        normalizedSource.includes('مال') ||
        normalizedSource.includes('eqtisad') ||
        normalizedSource.includes('argaam') ||
        normalizedSource.includes('mubasher')) {
      scores.business += 4;
    }

    // مصادر التكنولوجيا
    if (normalizedSource.includes('tech') ||
        normalizedSource.includes('تكنولوجيا') ||
        normalizedSource.includes('تقنية') ||
        normalizedSource.includes('ait') ||
        normalizedSource.includes('digital')) {
      scores.technology += 4;
    }

    // مصادر الرياضة
    if (normalizedSource.includes('sport') ||
        normalizedSource.includes('رياضة') ||
        normalizedSource.includes('كرة') ||
        normalizedSource.includes('kooora') ||
        normalizedSource.includes('goal') ||
        normalizedSource.includes('yalla') ||
        normalizedSource.includes('bein')) {
      scores.sports += 4;
    }

    // مصادر الترفيه
    if (normalizedSource.includes('entertainment') ||
        normalizedSource.includes('ترفيه') ||
        normalizedSource.includes('فن') ||
        normalizedSource.includes('cinema') ||
        normalizedSource.includes('fann') ||
        normalizedSource.includes('مسرح') ||
        normalizedSource.includes('موسيقى')) {
      scores.entertainment += 4;
    }

    // مصادر العلوم
    if (normalizedSource.includes('science') ||
        normalizedSource.includes('علوم') ||
        normalizedSource.includes('علمي') ||
        normalizedSource.includes('nature') ||
        normalizedSource.includes('scientific')) {
      scores.science += 4;
    }

    // مصادر الصحة
    if (normalizedSource.includes('health') ||
        normalizedSource.includes('صحة') ||
        normalizedSource.includes('طب') ||
        normalizedSource.includes('tibbi') ||
        normalizedSource.includes('webteb') ||
        normalizedSource.includes('sehati')) {
      scores.health += 4;
    }
  }

  // تحليل أنماط محددة في العنوان

  // أنماط الأعمال والاقتصاد
  const businessPatterns = [
    'سعر', 'أسعار', 'دولار', 'يورو', 'بورصة', 'سوق المال', 'البنك المركزي', 'الاقتصاد', 'شركة', 'شركات',
    'استثمار', 'تمويل', 'ميزانية', 'أرباح', 'خسائر', 'تضخم', 'ركود', 'نمو', 'تنمية', 'صناعة', 'تصنيع',
    'إنتاج', 'تصدير', 'استيراد', 'تجارة', 'عقارات', 'عقار', 'بترول', 'نفط', 'غاز', 'طاقة', 'كهرباء',
    'تعدين', 'زراعة', 'سياحة', 'فنادق', 'طيران', 'نقل', 'مواصلات', 'بنك', 'بنوك', 'مصرف', 'مصارف',
    'ائتمان', 'قرض', 'قروض', 'ضرائب', 'ضريبة', 'عملة', 'عملات', 'أسهم', 'سندات'
  ];

  if (businessPatterns.some(pattern => normalizedArabicTitle.includes(normalizeArabicText(pattern)))) {
    scores.business += 5;
  }

  // أنماط التكنولوجيا
  const techPatterns = [
    'هاتف', 'جوال', 'تطبيق', 'برنامج', 'ذكاء اصطناعي', 'روبوت', 'إنترنت', 'تقنية', 'تكنولوجيا', 'آبل',
    'جوجل', 'مايكروسوفت', 'فيسبوك', 'تويتر', 'إلكترونيات', 'حاسوب', 'كمبيوتر', 'حاسب', 'برمجة', 'برمجيات',
    'موقع', 'مواقع', 'شبكة', 'ويب', 'محمول', 'ذكي', 'أتمتة', 'بيانات', 'معلومات', 'خوارزمية', 'خوارزميات',
    'نظام', 'أنظمة', 'تشغيل', 'أندرويد', 'آيفون', 'إنستغرام', 'سناب', 'يوتيوب', 'تيك توك', 'واتساب',
    'تلغرام', 'سيبراني', 'إلكتروني', 'رقمي', 'رقمية', 'تحول', 'ابتكار', 'اختراع', 'براءة', 'ناشئة',
    'ستارت أب', 'شركة ناشئة', 'تطوير', 'مطور', 'مبرمج', 'مهندس', 'هندسة', 'برمجة', 'كود', 'شيفرة'
  ];

  if (techPatterns.some(pattern => normalizedArabicTitle.includes(normalizeArabicText(pattern)))) {
    scores.technology += 5;
  }

  // أنماط الرياضة
  const sportsPatterns = [
    'مباراة', 'كرة القدم', 'كرة السلة', 'دوري', 'بطولة', 'منتخب', 'لاعب', 'مدرب', 'نادي', 'فوز',
    'هزيمة', 'تعادل', 'هدف', 'أهداف', 'ميدالية', 'رياضة', 'رياضات', 'كرة', 'قدم', 'سلة', 'طائرة',
    'يد', 'تنس', 'جولف', 'سباحة', 'سباق', 'سباقات', 'ماراثون', 'دراجات', 'فروسية', 'خيل', 'خيول',
    'مصارعة', 'ملاكمة', 'جودو', 'كاراتيه', 'تايكوندو', 'جمباز', 'أولمبياد', 'أولمبي', 'بطولات', 'كأس',
    'ليغ', 'منتخبات', 'فريق', 'فرق', 'أندية', 'لاعبين', 'لاعبون', 'مدربين', 'مدربون', 'تدريب',
    'مباريات', 'تسجيل', 'نقطة', 'نقاط', 'ترتيب', 'تصنيف', 'ميداليات', 'ذهبية', 'فضية', 'برونزية'
  ];

  if (sportsPatterns.some(pattern => normalizedArabicTitle.includes(normalizeArabicText(pattern)))) {
    scores.sports += 5;
  }

  // أنماط الترفيه
  const entertainmentPatterns = [
    'فيلم', 'مسلسل', 'أغنية', 'فنان', 'فنانة', 'ممثل', 'ممثلة', 'مطرب', 'مطربة', 'حفل', 'مهرجان',
    'جائزة', 'سينما', 'مسرح', 'موسيقى', 'ترفيه', 'فن', 'فنون', 'أفلام', 'مسلسلات', 'دراما', 'كوميديا',
    'مسرحية', 'أغاني', 'نجم', 'نجمة', 'مشاهير', 'شهرة', 'جوائز', 'حفلة', 'عرض', 'عروض', 'إخراج',
    'مخرج', 'إنتاج', 'منتج', 'تصوير', 'تلفزيون', 'تلفاز', 'قناة', 'برامج', 'مقابلة', 'لقاء', 'حوار',
    'مذيع', 'مذيعة', 'إعلامي', 'إعلامية', 'إعلام', 'صحافة', 'صحفي', 'صحفية', 'مجلة', 'مجلات', 'كتاب',
    'كتب', 'رواية', 'روايات', 'أدب', 'شعر', 'شاعر', 'شاعرة', 'غناء', 'غنائي', 'غنائية', 'طرب'
  ];

  if (entertainmentPatterns.some(pattern => normalizedArabicTitle.includes(normalizeArabicText(pattern)))) {
    scores.entertainment += 5;
  }

  // أنماط العلوم
  const sciencePatterns = [
    'دراسة', 'بحث', 'اكتشاف', 'علماء', 'فضاء', 'كوكب', 'ناسا', 'ظاهرة', 'تجربة', 'نظرية', 'علمي',
    'علمية', 'علم', 'علوم', 'أبحاث', 'دراسات', 'اكتشافات', 'كون', 'كوني', 'نجم', 'نجوم', 'كواكب',
    'مجرة', 'مجرات', 'فلك', 'فلكي', 'فلكية', 'مركبة', 'مسبار', 'قمر', 'أقمار', 'صناعي', 'صناعية',
    'تلسكوب', 'مجهر', 'مختبر', 'مختبرات', 'تجارب', 'نظريات', 'فرضية', 'فرضيات', 'قانون', 'قوانين',
    'فيزياء', 'كيمياء', 'أحياء', 'بيولوجيا', 'جيولوجيا', 'جراثيم', 'مناعة', 'تطعيمات', 'بيئة', 'بيئي',
    'بيئية', 'مناخ', 'مناخي', 'مناخية', 'احتباس', 'حراري', 'تلوث', 'طاقة', 'متجددة', 'شمسية'
  ];

  if (sciencePatterns.some(pattern => normalizedArabicTitle.includes(normalizeArabicText(pattern)))) {
    scores.science += 5;
  }

  // أنماط الصحة
  const healthPatterns = [
    'صحة', 'مرض', 'علاج', 'دواء', 'لقاح', 'فيروس', 'وباء', 'طبيب', 'مستشفى', 'جراحة', 'تطعيم',
    'سرطان', 'قلب', 'سكري', 'ضغط الدم', 'صحي', 'صحية', 'طب', 'طبي', 'طبية', 'أمراض', 'علاجات',
    'أدوية', 'صيدلة', 'صيدلي', 'صيدلية', 'مستشفيات', 'عيادة', 'عيادات', 'أطباء', 'طبيبة', 'طبيبات',
    'ممرض', 'ممرضة', 'تمريض', 'جراح', 'عملية', 'عمليات', 'فحص', 'فحوصات', 'تشخيص', 'تشخيصات',
    'أشعة', 'تحليل', 'تحاليل', 'وقاية', 'وقائي', 'وقائية', 'تغذية', 'غذاء', 'غذائي', 'غذائية',
    'سمنة', 'نحافة', 'وزن', 'تمارين', 'لياقة', 'بدنية', 'نفسية', 'نفسي', 'عقلية', 'عقلي', 'اكتئاب',
    'قلق', 'توتر', 'ضغط', 'قلبية', 'أورام', 'فيروسات', 'بكتيريا', 'جرثومة', 'لقاحات', 'أوبئة'
  ];

  if (healthPatterns.some(pattern => normalizedArabicTitle.includes(normalizeArabicText(pattern)))) {
    scores.health += 5;
  }

  // العثور على الفئة ذات النقاط الأعلى
  let bestCategory: NewsCategory = 'general';
  let highestScore = 0;
  let secondBestCategory: NewsCategory | null = null;
  let secondHighestScore = 0;

  // تحديد الفئة الأولى والثانية من حيث النقاط
  Object.entries(scores).forEach(([category, score]) => {
    if (score > highestScore) {
      // تحديث الفئة الثانية بالفئة الأولى السابقة
      secondBestCategory = bestCategory;
      secondHighestScore = highestScore;

      // تحديث الفئة الأولى
      highestScore = score;
      bestCategory = category as NewsCategory;
    } else if (score > secondHighestScore) {
      // تحديث الفئة الثانية فقط
      secondHighestScore = score;
      secondBestCategory = category as NewsCategory;
    }
  });

  // تحقق من المصدر إذا كان متخصصًا
  if (sourceName) {
    const sourceCategories = RSS_SOURCE_CATEGORIES[sourceName] || [];

    // إذا كان المصدر متخصصًا في فئة واحدة، نستخدم هذه الفئة إذا كانت ضمن أعلى فئتين
    if (sourceCategories.length === 1) {
      const specializedCategory = sourceCategories[0];

      // إذا كانت الفئة المتخصصة هي الفئة الثانية وكانت قريبة من الفئة الأولى، نستخدمها
      if (specializedCategory === secondBestCategory && secondHighestScore >= highestScore * 0.7) {
        bestCategory = specializedCategory;
        console.log(`تعديل التصنيف بناءً على تخصص المصدر: ${sourceName} => ${bestCategory}`);
      }

      // إذا كانت الفئة المتخصصة لها نقاط معقولة، نستخدمها
      if (scores[specializedCategory] >= 3) {
        bestCategory = specializedCategory;
        console.log(`تعديل التصنيف بناءً على تخصص المصدر: ${sourceName} => ${bestCategory}`);
      }
    }
  }

  // تسجيل النقاط للتصحيح
  console.log(`تصنيف "${title.substring(0, 30)}...": ${JSON.stringify(scores)} => ${bestCategory}`);

  // إذا كانت النقاط الأعلى منخفضة جدًا، استخدام 'general'
  // زيادة العتبة من 3 إلى 4 لتحسين دقة التصنيف
  return highestScore > 4 ? bestCategory : 'general';
};

export function CategorizedNews() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('business');
  const [newsByCategory, setNewsByCategory] = useState<Record<NewsCategory, NewsArticle[]>>({} as Record<NewsCategory, NewsArticle[]>);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLinks, setCopiedLinks] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  // Category icons mapping
  const categoryIcons = {
    general: <Newspaper className="h-4 w-4" />,
    business: <Briefcase className="h-4 w-4" />,
    technology: <Cpu className="h-4 w-4" />,
    entertainment: <Film className="h-4 w-4" />,
    sports: <Dumbbell className="h-4 w-4" />,
    science: <FlaskConical className="h-4 w-4" />,
    health: <Heart className="h-4 w-4" />
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Función principal para obtener noticias
  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Inicializar categorías vacías
      const combinedNews: Record<NewsCategory, NewsArticle[]> = {} as Record<NewsCategory, NewsArticle[]>;
      Object.keys(NEWS_CATEGORIES).forEach(category => {
        combinedNews[category as NewsCategory] = [];
      });

      // Función para normalizar texto árabe para comparación
      const normalizeArabicText = (text: string): string => {
        return text
          .trim()
          .toLowerCase()
          // Eliminar diacríticos (tashkeel)
          .replace(/[\u064B-\u065F]/g, '')
          // Normalizar variaciones de alef
          .replace(/[أإآا]/g, 'ا')
          // Normalizar variaciones de yaa
          .replace(/[يى]/g, 'ي')
          // Normalizar taa marbuta
          .replace(/[ة]/g, 'ه')
          // Eliminar puntuación
          .replace(/[.,،:;'"!؟?()[\]{}]/g, '')
          // Eliminar espacios extra
          .replace(/\s+/g, ' ');
      };

      // Función para verificar si un artículo es duplicado
      const isDuplicate = (article: NewsArticle, existingArticles: NewsArticle[]): boolean => {
        const normalizedTitle = normalizeArabicText(article.title);
        return existingArticles.some(existing =>
          normalizeArabicText(existing.title) === normalizedTitle ||
          (existing.url === article.url && article.url !== '')
        );
      };

      // 1. Obtener noticias de fuentes RSS árabes por categoría
      console.log('Obteniendo noticias de fuentes RSS árabes por categoría...');

      // Obtener noticias generales
      console.log('Obteniendo noticias generales de fuentes RSS...');
      const generalRssNews = await fetchAllNews();
      console.log(`Obtenidas ${generalRssNews.length} noticias generales de fuentes RSS`);

      // Procesar noticias generales
      generalRssNews.forEach(rssItem => {
        try {
          // Convertir a formato NewsArticle
          const newsArticle = convertRssToNewsArticle(rssItem);

          // Añadir a la categoría general
          if (!isDuplicate(newsArticle, combinedNews['general'])) {
            combinedNews['general'].push({...newsArticle, category: 'general'});
          }

          // También añadir a su categoría específica si no es 'general'
          const contentCategory = newsArticle.category;
          if (contentCategory !== 'general' && !isDuplicate(newsArticle, combinedNews[contentCategory])) {
            combinedNews[contentCategory].push({...newsArticle});
          }
        } catch (error) {
          console.error('Error al procesar noticia RSS general:', error);
        }
      });

      // Obtener noticias específicas por categoría
      const categories: NewsCategory[] = ['business', 'technology', 'sports', 'entertainment', 'health', 'science'];

      // Procesar cada categoría en paralelo
      const categoryPromises = categories.map(async (category) => {
        try {
          console.log(`Obteniendo noticias de categoría ${category} de fuentes RSS específicas...`);

          // Añadir un timeout para evitar que una categoría bloquee todo el proceso
          const categoryNews = await Promise.race([
            fetchNewsByCategoryFromRSS(category),
            new Promise<RssItem[]>(resolve => {
              setTimeout(() => {
                console.warn(`Timeout al obtener noticias de categoría ${category}`);
                resolve([]);
              }, 15000); // 15 second timeout
            })
          ]);

          console.log(`Obtenidas ${categoryNews.length} noticias de categoría ${category}`);

          // Procesar noticias de esta categoría
          categoryNews.forEach(rssItem => {
            try {
              // Verificar que el item es válido
              if (!rssItem || !rssItem.title) {
                console.warn(`Item RSS inválido en categoría ${category}`);
                return;
              }

              // تحويل إلى تنسيق NewsArticle
              // نحصل على التصنيف من دالة التصنيف
              const baseArticle = convertRssToNewsArticle(rssItem);

              // نستخدم التصنيف الذي تم تحديده من المصدر المتخصص إذا كان متاحًا
              // وإلا نستخدم التصنيف الذي تم تحديده من خلال تحليل المحتوى
              const newsArticle = {
                ...baseArticle,
                // نحتفظ بالتصنيف الأصلي إذا كان المصدر متخصصًا في هذه الفئة
                category: RSS_SOURCE_CATEGORIES[rssItem.source]?.includes(category) ?
                  category : baseArticle.category
              };

              // Añadir a la categoría específica
              if (!isDuplicate(newsArticle, combinedNews[category])) {
                combinedNews[category].push(newsArticle);
              }

              // Añadir noticias importantes a la categoría general
              const isImportant =
                // Noticias de negocios importantes
                (category === 'business' &&
                  (normalizeArabicText(newsArticle.title).includes('اقتصاد') ||
                   normalizeArabicText(newsArticle.title).includes('مال') ||
                   normalizeArabicText(newsArticle.title).includes('سوق') ||
                   normalizeArabicText(newsArticle.title).includes('بورصة'))) ||
                // Noticias de deportes importantes
                (category === 'sports' &&
                  (normalizeArabicText(newsArticle.title).includes('كأس العالم') ||
                   normalizeArabicText(newsArticle.title).includes('أولمبياد') ||
                   normalizeArabicText(newsArticle.title).includes('بطولة') ||
                   normalizeArabicText(newsArticle.title).includes('دوري'))) ||
                // Noticias de tecnología importantes
                (category === 'technology' &&
                  (normalizeArabicText(newsArticle.title).includes('ذكاء اصطناعي') ||
                   normalizeArabicText(newsArticle.title).includes('تقنية جديدة') ||
                   normalizeArabicText(newsArticle.title).includes('ابتكار'))) ||
                // Noticias de salud importantes
                (category === 'health' &&
                  (normalizeArabicText(newsArticle.title).includes('وباء') ||
                   normalizeArabicText(newsArticle.title).includes('فيروس') ||
                   normalizeArabicText(newsArticle.title).includes('لقاح')));

              if (isImportant && !isDuplicate(newsArticle, combinedNews['general'])) {
                combinedNews['general'].push({...newsArticle, category: 'general'});
              }
            } catch (error) {
              console.error(`Error al procesar noticia RSS de categoría ${category}:`, error);
            }
          });

          return { category, success: true, count: categoryNews.length };
        } catch (error) {
          console.error(`Error al obtener noticias de categoría ${category}:`, error);
          return { category, success: false, error };
        }
      });

      // Esperar a que todas las categorías se procesen, pero no fallar si alguna falla
      const results = await Promise.allSettled(categoryPromises);

      // Registrar resultados
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const { category, success, count, error } = result.value;
          if (success) {
            console.log(`Categoría ${category}: ${count} noticias procesadas correctamente`);
          } else {
            console.error(`Categoría ${category}: Error al procesar - ${error}`);
          }
        } else {
          console.error(`Error inesperado al procesar categorías:`, result.reason);
        }
      });

      // 2. Obtener noticias de NewsAPI de múltiples países árabes
      console.log('Obteniendo noticias de NewsAPI de múltiples países árabes...');
      const [aeNews, egNews, saNews, maNews, joNews] = await Promise.allSettled([
        fetchNewsByCategories('ae', 12), // Emiratos Árabes Unidos
        fetchNewsByCategories('eg', 12), // Egipto
        fetchNewsByCategories('sa', 12), // Arabia Saudita
        fetchNewsByCategories('ma', 12), // Marruecos
        fetchNewsByCategories('jo', 12)  // Jordania
      ]);

      // Añadir noticias de UAE
      if (aeNews.status === 'fulfilled') {
        Object.entries(aeNews.value).forEach(([category, articles]) => {
          // Filtrar duplicados antes de añadir
          const uniqueArticles = articles.filter(article =>
            !isDuplicate(article, combinedNews[category as NewsCategory])
          );

          combinedNews[category as NewsCategory] = [
            ...combinedNews[category as NewsCategory],
            ...uniqueArticles
          ];
        });
      }

      // Añadir noticias de Egipto
      if (egNews.status === 'fulfilled') {
        Object.entries(egNews.value).forEach(([category, articles]) => {
          // Filtrar duplicados antes de añadir
          const uniqueArticles = articles.filter(article =>
            !isDuplicate(article, combinedNews[category as NewsCategory])
          );

          combinedNews[category as NewsCategory] = [
            ...combinedNews[category as NewsCategory],
            ...uniqueArticles
          ];
        });
      }

      // Añadir noticias de Arabia Saudita
      if (saNews.status === 'fulfilled') {
        Object.entries(saNews.value).forEach(([category, articles]) => {
          // Filtrar duplicados antes de añadir
          const uniqueArticles = articles.filter(article =>
            !isDuplicate(article, combinedNews[category as NewsCategory])
          );

          combinedNews[category as NewsCategory] = [
            ...combinedNews[category as NewsCategory],
            ...uniqueArticles
          ];
        });
      }

      // Añadir noticias de Marruecos
      if (maNews.status === 'fulfilled') {
        Object.entries(maNews.value).forEach(([category, articles]) => {
          // Filtrar duplicados antes de añadir
          const uniqueArticles = articles.filter(article =>
            !isDuplicate(article, combinedNews[category as NewsCategory])
          );

          combinedNews[category as NewsCategory] = [
            ...combinedNews[category as NewsCategory],
            ...uniqueArticles
          ];
        });
      }

      // Añadir noticias de Jordania
      if (joNews.status === 'fulfilled') {
        Object.entries(joNews.value).forEach(([category, articles]) => {
          // Filtrar duplicados antes de añadir
          const uniqueArticles = articles.filter(article =>
            !isDuplicate(article, combinedNews[category as NewsCategory])
          );

          combinedNews[category as NewsCategory] = [
            ...combinedNews[category as NewsCategory],
            ...uniqueArticles
          ];
        });
      }

      // Filtrar artículos problemáticos
      Object.keys(combinedNews).forEach(category => {
        combinedNews[category as NewsCategory] = combinedNews[category as NewsCategory].filter(article => {
          // Filtrar noticias problemáticas de la ONU por título
          if (article.title.includes('الأمم المتحدة تدعو إلى وقف إطلاق النار في الشرق الأوسط')) {
            console.log(`Eliminando noticia problemática de la ONU: ${article.title}`);
            return false;
          }

          // Filtrar elementos con enlaces BBC rotos
          if (article.source.name.includes('BBC') &&
              (article.url.includes('c4nq369rlgdo') ||
               (article.url.includes('bbc.com/arabic/articles') && !article.url.match(/articles\/[a-z0-9]+/)))) {
            console.log(`Eliminando noticia con enlace BBC roto: ${article.title}`);
            return false;
          }

          // Filtrar elementos con URLs inválidas
          if (!article.url || article.url === '#' || article.url === 'undefined' || article.url === 'null') {
            console.log(`Eliminando noticia con URL inválida: ${article.title}`);
            return false;
          }

          // Verificar palabras clave problemáticas en el título
          const problematicKeywords = ['undefined', 'null', 'error', '404', 'not found'];
          for (const keyword of problematicKeywords) {
            if (article.title.toLowerCase().includes(keyword)) {
              console.log(`Eliminando noticia con palabra clave problemática en el título: ${article.title}`);
              return false;
            }
          }

          return true;
        });
      });

      // ترتيب كل فئة حسب التاريخ وتصفية المقالات القديمة
      Object.keys(combinedNews).forEach(category => {
        combinedNews[category as NewsCategory].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        // تصفية المقالات القديمة جدًا (أكثر من 14 يومًا) - زيادة المدة من 7 إلى 14 يومًا
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        combinedNews[category as NewsCategory] = combinedNews[category as NewsCategory]
          .filter(article => {
            try {
              const articleDate = new Date(article.publishedAt);
              return articleDate >= twoWeeksAgo;
            } catch (e) {
              // في حالة وجود خطأ في تحليل التاريخ، الاحتفاظ بالمقالة
              return true;
            }
          });

        // تحديد إلى 20 مقالة لكل فئة
        combinedNews[category as NewsCategory] = combinedNews[category as NewsCategory].slice(0, 20);

        console.log(`الفئة ${category}: ${combinedNews[category as NewsCategory].length} مقالة بعد التصفية والتحديد`);
      });

      // إضافة آلية احتياطية للفئات التي تحتوي على عدد قليل من الأخبار
      const MIN_ARTICLES_PER_CATEGORY = 5; // الحد الأدنى المطلوب من المقالات لكل فئة

      Object.keys(combinedNews).forEach(category => {
        if (combinedNews[category as NewsCategory].length < MIN_ARTICLES_PER_CATEGORY) {
          console.log(`الفئة ${category} تحتوي على عدد قليل من الأخبار (${combinedNews[category as NewsCategory].length}). إضافة أخبار من فئات أخرى...`);

          // جمع جميع الأخبار من الفئات الأخرى
          const otherCategoriesNews: NewsArticle[] = [];
          Object.keys(combinedNews).forEach(otherCategory => {
            if (otherCategory !== category) {
              otherCategoriesNews.push(...combinedNews[otherCategory as NewsCategory]);
            }
          });

          // ترتيب الأخبار من الفئات الأخرى حسب التاريخ
          otherCategoriesNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

          // البحث عن أخبار قد تكون مناسبة للفئة الحالية
          const potentialNews = otherCategoriesNews.filter(article => {
            // تحقق مما إذا كانت المقالة تحتوي على كلمات مفتاحية متعلقة بالفئة الحالية
            const normalizedTitle = normalizeArabicText(article.title);
            const normalizedDescription = article.description ? normalizeArabicText(article.description) : '';

            // البحث عن الكلمات المفتاحية المتعلقة بالفئة
            const categoryKeywords = CATEGORY_KEYWORDS[category as NewsCategory] || [];
            return categoryKeywords.some(keyword =>
              normalizedTitle.includes(normalizeArabicText(keyword)) ||
              normalizedDescription.includes(normalizeArabicText(keyword))
            );
          });

          // إضافة الأخبار المحتملة إلى الفئة الحالية (مع تجنب التكرار)
          const neededArticles = MIN_ARTICLES_PER_CATEGORY - combinedNews[category as NewsCategory].length;
          const articlesToAdd = potentialNews
            .filter(article => !isDuplicate(article, combinedNews[category as NewsCategory]))
            .slice(0, neededArticles);

          // تعديل تصنيف الأخبار المضافة
          articlesToAdd.forEach(article => {
            combinedNews[category as NewsCategory].push({
              ...article,
              category: category as NewsCategory
            });
          });

          console.log(`تمت إضافة ${articlesToAdd.length} مقالة إلى الفئة ${category}`);

          // إذا لم نجد ما يكفي من الأخبار المحتملة، نضيف أخبار عامة
          if (combinedNews[category as NewsCategory].length < MIN_ARTICLES_PER_CATEGORY) {
            const stillNeededArticles = MIN_ARTICLES_PER_CATEGORY - combinedNews[category as NewsCategory].length;
            const generalArticlesToAdd = otherCategoriesNews
              .filter(article => !isDuplicate(article, combinedNews[category as NewsCategory]))
              .slice(0, stillNeededArticles);

            generalArticlesToAdd.forEach(article => {
              combinedNews[category as NewsCategory].push({
                ...article,
                category: category as NewsCategory
              });
            });

            console.log(`تمت إضافة ${generalArticlesToAdd.length} مقالة عامة إضافية إلى الفئة ${category}`);
          }

          // إعادة ترتيب الفئة بعد إضافة المقالات الجديدة
          combinedNews[category as NewsCategory].sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
        }
      });

      console.log('Noticias por categoría procesadas correctamente');
      setNewsByCategory(combinedNews);
    } catch (err) {
      console.error('Error al obtener noticias por categoría:', err);
      setError('حدث خطأ أثناء جلب الأخبار. الرجاء المحاولة مرة أخرى لاحقًا.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular tiempo transcurrido
  const timeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'منذ لحظات'; // Just now
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`; // X minutes ago
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`; // X hours ago
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`; // X days ago
      }
    } catch (e) {
      return dateString;
    }
  };

  // Format date to be more readable with English numerals
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      // Use a simple, consistent date format with English numerals
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      // Format time with 12-hour format and Arabic AM/PM
      let hours = date.getHours();
      const ampm = hours >= 12 ? 'م' : 'ص';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutes = date.getMinutes().toString().padStart(2, '0');

      // Format: "DD/MM/YYYY HH:MM AM/PM"
      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return dateString;
    }
  };

  // Truncate text to a certain length with RTL support
  const truncateText = (text: string | null, maxLength: number = 150) => {
    // استخدام وظيفة التنظيف الجديدة التي تعالج رموز HTML مثل &nbsp;
    return truncateCleanText(text, maxLength);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category as NewsCategory);
  };

  // Refresh news for the current category
  const refreshCategory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Inicializar categoría vacía
      const combinedNews: NewsArticle[] = [];

      // Función para normalizar texto árabe para comparación
      const normalizeArabicText = (text: string): string => {
        return text
          .trim()
          .toLowerCase()
          // Eliminar diacríticos (tashkeel)
          .replace(/[\u064B-\u065F]/g, '')
          // Normalizar variaciones de alef
          .replace(/[أإآا]/g, 'ا')
          // Normalizar variaciones de yaa
          .replace(/[يى]/g, 'ي')
          // Normalizar taa marbuta
          .replace(/[ة]/g, 'ه')
          // Eliminar puntuación
          .replace(/[.,،:;'"!؟?()[\]{}]/g, '')
          // Eliminar espacios extra
          .replace(/\s+/g, ' ');
      };

      // Función para verificar si un artículo es duplicado
      const isDuplicate = (article: NewsArticle, existingArticles: NewsArticle[]): boolean => {
        const normalizedTitle = normalizeArabicText(article.title);
        return existingArticles.some(existing =>
          normalizeArabicText(existing.title) === normalizedTitle ||
          (existing.url === article.url && article.url !== '')
        );
      };

      // 1. Obtener noticias de fuentes RSS árabes específicas para la categoría
      console.log(`Obteniendo noticias de fuentes RSS árabes para la categoría ${activeCategory}...`);

      try {
        // Si es categoría general, obtener noticias generales
        if (activeCategory === 'general') {
          const generalRssNews = await fetchAllNews();
          console.log(`Obtenidas ${generalRssNews.length} noticias generales de fuentes RSS`);

          // Procesar noticias generales
          generalRssNews.forEach(rssItem => {
            try {
              // Convertir a formato NewsArticle
              const newsArticle = convertRssToNewsArticle(rssItem);

              // Añadir a la lista combinada si no es duplicado
              if (!isDuplicate(newsArticle, combinedNews)) {
                combinedNews.push({...newsArticle, category: 'general'});
              }
            } catch (error) {
              console.error('Error al procesar noticia RSS general:', error);
            }
          });
        } else {
          // Para categorías específicas, usar la función especializada con timeout
          const categoryRssNews = await Promise.race([
            fetchNewsByCategoryFromRSS(activeCategory),
            new Promise<RssItem[]>(resolve => {
              setTimeout(() => {
                console.warn(`Timeout al obtener noticias de categoría ${activeCategory}`);
                resolve([]);
              }, 15000); // 15 second timeout
            })
          ]);
          console.log(`Obtenidas ${categoryRssNews.length} noticias específicas para la categoría ${activeCategory}`);

          // Procesar noticias de esta categoría
          categoryRssNews.forEach(rssItem => {
            try {
              // Verificar que el item es válido
              if (!rssItem || !rssItem.title) {
                console.warn(`Item RSS inválido en categoría ${activeCategory}`);
                return;
              }

              // تحويل إلى تنسيق NewsArticle
              // نحصل على التصنيف من دالة التصنيف
              const baseArticle = convertRssToNewsArticle(rssItem);

              // نستخدم التصنيف الذي تم تحديده من المصدر المتخصص إذا كان متاحًا
              // وإلا نستخدم التصنيف الذي تم تحديده من خلال تحليل المحتوى
              const newsArticle = {
                ...baseArticle,
                // نحتفظ بالتصنيف الأصلي إذا كان المصدر متخصصًا في هذه الفئة
                category: RSS_SOURCE_CATEGORIES[rssItem.source]?.includes(activeCategory) ?
                  activeCategory : baseArticle.category
              };

              // Añadir a la lista combinada si no es duplicado
              if (!isDuplicate(newsArticle, combinedNews)) {
                combinedNews.push(newsArticle);
              }
            } catch (error) {
              console.error(`Error al procesar noticia RSS de categoría ${activeCategory}:`, error);
            }
          });
        }
      } catch (error) {
        console.error(`Error al obtener noticias RSS para la categoría ${activeCategory}:`, error);

        // Como respaldo, usar el método anterior
        console.log(`Usando método de respaldo para obtener noticias de la categoría ${activeCategory}...`);
        const rssNews = await fetchAllNews();

        // Filtrar por la categoría activa
        const filteredRssNews = rssNews
          .map(item => convertRssToNewsArticle(item))
          .filter(article => {
            if (activeCategory === 'general') return true;
            return article.category === activeCategory;
          });

        console.log(`Obtenidas ${filteredRssNews.length} noticias de respaldo para la categoría ${activeCategory}`);

        // Añadir noticias filtradas
        filteredRssNews.forEach(newsArticle => {
          if (!isDuplicate(newsArticle, combinedNews)) {
            combinedNews.push({...newsArticle, category: activeCategory});
          }
        });
      }

      // 2. Como respaldo, obtener también de NewsAPI
      console.log(`Obteniendo noticias de NewsAPI como respaldo para la categoría ${activeCategory}...`);
      const [aeNews, egNews] = await Promise.allSettled([
        fetchTopHeadlines('ae', activeCategory, 10),
        fetchTopHeadlines('eg', activeCategory, 10)
      ]);

      // Añadir noticias de UAE
      if (aeNews.status === 'fulfilled' && aeNews.value.length > 0) {
        // Filtrar duplicados antes de añadir
        const uniqueAeNews = aeNews.value.filter(article =>
          !isDuplicate(article, combinedNews)
        );

        combinedNews.push(...uniqueAeNews);
      }

      // Añadir noticias de Egipto
      if (egNews.status === 'fulfilled' && egNews.value.length > 0) {
        // Filtrar duplicados antes de añadir
        const uniqueEgNews = egNews.value.filter(article =>
          !isDuplicate(article, combinedNews)
        );

        combinedNews.push(...uniqueEgNews);
      }

      // Si ambos fallaron, intentar con otra fuente
      if (combinedNews.length === 0) {
        console.log(`Intentando con fuente alternativa para la categoría ${activeCategory}...`);
        const fallbackNews = await fetchTopHeadlines('sa', activeCategory, 10);
        combinedNews.push(...fallbackNews);
      }

      // Filtrar artículos problemáticos
      const filteredNews = combinedNews.filter(article => {
        // Filtrar noticias problemáticas de la ONU por título
        if (article.title.includes('الأمم المتحدة تدعو إلى وقف إطلاق النار في الشرق الأوسط')) {
          console.log(`Eliminando noticia problemática de la ONU: ${article.title}`);
          return false;
        }

        // Filtrar elementos con enlaces BBC rotos
        if (article.source.name.includes('BBC') &&
            (article.url.includes('c4nq369rlgdo') ||
             (article.url.includes('bbc.com/arabic/articles') && !article.url.match(/articles\/[a-z0-9]+/)))) {
          console.log(`Eliminando noticia con enlace BBC roto: ${article.title}`);
          return false;
        }

        // Filtrar elementos con URLs inválidas
        if (!article.url || article.url === '#' || article.url === 'undefined' || article.url === 'null') {
          console.log(`Eliminando noticia con URL inválida: ${article.title}`);
          return false;
        }

        // Verificar palabras clave problemáticas en el título
        const problematicKeywords = ['undefined', 'null', 'error', '404', 'not found'];
        for (const keyword of problematicKeywords) {
          if (article.title.toLowerCase().includes(keyword)) {
            console.log(`Eliminando noticia con palabra clave problemática en el título: ${article.title}`);
            return false;
          }
        }

        return true;
      });

      // ترتيب حسب التاريخ وتصفية المقالات القديمة
      // تصفية المقالات القديمة جدًا (أكثر من 14 يومًا)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const recentNews = filteredNews.filter(article => {
        try {
          const articleDate = new Date(article.publishedAt);
          return articleDate >= twoWeeksAgo;
        } catch (e) {
          // في حالة وجود خطأ في تحليل التاريخ، الاحتفاظ بالمقالة
          return true;
        }
      });

      // ترتيب حسب التاريخ وتحديد إلى 20 مقالة
      const sortedNews = recentNews
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 20);

      console.log(`تمت معالجة ${sortedNews.length} مقالة للفئة ${activeCategory}`);

      // إذا كان عدد الأخبار قليلًا، نحاول إضافة أخبار من فئات أخرى
      const MIN_ARTICLES_PER_CATEGORY = 5; // الحد الأدنى المطلوب من المقالات

      if (sortedNews.length < MIN_ARTICLES_PER_CATEGORY) {
        console.log(`الفئة ${activeCategory} تحتوي على عدد قليل من الأخبار (${sortedNews.length}). محاولة إضافة أخبار من فئات أخرى...`);

        // الحصول على الأخبار من الفئات الأخرى
        const otherCategoriesNews: NewsArticle[] = [];

        // استخدام الأخبار المخزنة في الفئات الأخرى
        Object.entries(newsByCategory).forEach(([otherCategory, articles]) => {
          if (otherCategory !== activeCategory) {
            otherCategoriesNews.push(...articles);
          }
        });

        // ترتيب الأخبار من الفئات الأخرى حسب التاريخ
        otherCategoriesNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        // البحث عن أخبار قد تكون مناسبة للفئة الحالية
        const potentialNews = otherCategoriesNews.filter(article => {
          // تحقق مما إذا كانت المقالة تحتوي على كلمات مفتاحية متعلقة بالفئة الحالية
          const normalizedTitle = normalizeArabicText(article.title);
          const normalizedDescription = article.description ? normalizeArabicText(article.description) : '';

          // البحث عن الكلمات المفتاحية المتعلقة بالفئة
          const categoryKeywords = CATEGORY_KEYWORDS[activeCategory as NewsCategory] || [];
          return categoryKeywords.some(keyword =>
            normalizedTitle.includes(normalizeArabicText(keyword)) ||
            normalizedDescription.includes(normalizeArabicText(keyword))
          );
        });

        // إضافة الأخبار المحتملة إلى الفئة الحالية (مع تجنب التكرار)
        const neededArticles = MIN_ARTICLES_PER_CATEGORY - sortedNews.length;
        const articlesToAdd = potentialNews
          .filter(article => !isDuplicate(article, sortedNews))
          .slice(0, neededArticles);

        // إضافة الأخبار المحتملة إلى القائمة المرتبة
        const finalNews = [...sortedNews];

        // تعديل تصنيف الأخبار المضافة
        articlesToAdd.forEach(article => {
          finalNews.push({
            ...article,
            category: activeCategory as NewsCategory
          });
        });

        console.log(`تمت إضافة ${articlesToAdd.length} مقالة إلى الفئة ${activeCategory}`);

        // إذا لم نجد ما يكفي من الأخبار المحتملة، نضيف أخبار عامة
        if (finalNews.length < MIN_ARTICLES_PER_CATEGORY) {
          const stillNeededArticles = MIN_ARTICLES_PER_CATEGORY - finalNews.length;
          const generalArticlesToAdd = otherCategoriesNews
            .filter(article => !isDuplicate(article, finalNews))
            .slice(0, stillNeededArticles);

          generalArticlesToAdd.forEach(article => {
            finalNews.push({
              ...article,
              category: activeCategory as NewsCategory
            });
          });

          console.log(`تمت إضافة ${generalArticlesToAdd.length} مقالة عامة إضافية إلى الفئة ${activeCategory}`);
        }

        // إعادة ترتيب القائمة النهائية
        finalNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        // استخدام القائمة النهائية بدلاً من sortedNews
        return finalNews;
      }

      // Actualizar solo la categoría activa
      const finalSortedNews = sortedNews;
      setNewsByCategory(prev => ({
        ...prev,
        [activeCategory]: finalSortedNews
      }));
    } catch (err) {
      console.error(`Error al obtener noticias para la categoría ${activeCategory}:`, err);
      setError('تعذر تحديث الأخبار. الرجاء المحاولة مرة أخرى لاحقًا.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border border-border/50 rounded-xl overflow-hidden bg-card categorized-news rtl-content">
      <CardHeader className="bg-card-foreground/5 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-lg sm:text-xl font-semibold text-right card-title" dir="rtl">الأخبار حسب الفئة</CardTitle> {/* News by Category */}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchNews}
            disabled={isLoading}
            title="تحديث كل الفئات"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="text-sm sm:text-base text-right card-description" dir="rtl">
          تصفح أحدث الأخبار مصنفة حسب الفئات المختلفة
        </CardDescription> {/* Browse the latest news categorized by different topics */}
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4 rtl-content" dir="rtl">
        <Tabs
          defaultValue="business"
          value={activeCategory}
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full tabs-list rtl-content">
              {Object.entries(NEWS_CATEGORIES)
                .filter(([key]) => key !== 'general') // Filter out the general category
                .map(([key, label]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex items-center gap-1 min-w-[100px] flex-row-reverse rtl-content"
                    dir="rtl"
                  >
                    {categoryIcons[key as NewsCategory]}
                    <span>{label}</span>
                  </TabsTrigger>
                ))}
            </TabsList>
          </div>

          {Object.keys(NEWS_CATEGORIES)
            .filter(category => category !== 'general') // Filter out the general category
            .map((category) => (
              <TabsContent key={category} value={category} className="mt-4 rtl-content" dir="rtl">
                <ScrollArea className="h-[500px] rounded-md rtl-content" dir="rtl">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-destructive">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>{error}</p>
                    <p className="mt-2 text-sm text-muted-foreground">سيتم عرض بيانات مخزنة مؤقتًا</p>
                    {/* Cached data will be displayed */}
                  </div>
                ) : !newsByCategory[category as NewsCategory] || newsByCategory[category as NewsCategory].length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>لا توجد أخبار متاحة حاليًا في هذه الفئة</p> {/* No news available in this category at the moment */}
                    <p className="mt-2 text-sm">جاري تحميل البيانات المخزنة...</p>
                    {/* Loading cached data... */}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newsByCategory[category as NewsCategory].map((article, index) => (
                      <div key={index} className="pb-4">
                        <div className="flex flex-col gap-2">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-2 break-words text-right rtl-content !text-right w-full" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
                            <ClientLink
                              href={article.url || `https://news.google.com/search?q=${encodeURIComponent(article.title)}&hl=ar`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary transition-colors flex items-start gap-1 flex-row-reverse text-right rtl-content !text-right w-full"
                              style={{ textAlign: 'right', direction: 'rtl' }}
                              title={cleanTextForDisplay(article.title)} // Add title for hover tooltip
                            >
                              <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0 ml-1" />
                              {cleanTextForDisplay(article.title)}
                            </ClientLink>
                          </h3>

                          {article.urlToImage && (
                            <div className="my-2 relative w-full h-40 overflow-hidden rounded-md bg-muted">
                              <img
                                src={article.urlToImage}
                                alt={article.title}
                                className="w-full h-full object-cover"
                                loading={index < 2 ? "eager" : "lazy"}
                                onError={(e) => {
                                  // إخفاء الصورة عند حدوث خطأ
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          <p className="text-sm text-muted-foreground line-clamp-3 break-words text-right" dir="rtl">
                            {truncateText(article.description, 120)}
                          </p>

                          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs max-w-[60%] truncate" dir="rtl">
                                {article.source.name}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const url = article.url || `https://news.google.com/search?q=${encodeURIComponent(article.title)}&hl=ar`;
                                  const success = await copyToClipboard(url);
                                  if (success) {
                                    setCopiedLinks({...copiedLinks, [index]: true});
                                    toast({
                                      title: "تم نسخ الرابط",
                                      description: "تم نسخ رابط الخبر إلى الحافظة",
                                      variant: "default",
                                    });
                                    setTimeout(() => {
                                      setCopiedLinks({...copiedLinks, [index]: false});
                                    }, 2000);
                                  }
                                }}
                                title="نسخ الرابط"
                              >
                                {copiedLinks[index] ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                                <span>نسخ الرابط</span>
                              </Button>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="flex items-center gap-1 flex-row-reverse" dir="rtl">
                                <Clock className="h-3 w-3 ml-1" />
                                {timeAgo(article.publishedAt)}
                              </span>
                              <span dir="rtl" className="text-[10px] opacity-70">{formatDate(article.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                        {index < newsByCategory[category as NewsCategory].length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <CardFooter className="bg-card-foreground/5 p-3 sm:p-4 border-t text-xs text-muted-foreground">
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-right" dir="rtl">يتم تحديث الأخبار تلقائيًا من مصادر عربية متعددة</p>
          {/* News is automatically updated from multiple Arabic sources */}

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {NEWS_CATEGORIES[activeCategory]}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={refreshCategory}
              title="تحديث هذه الفئة"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
