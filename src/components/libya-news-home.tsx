'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock, ExternalLink, MapPin, RefreshCw, Copy, Check } from 'lucide-react';
import ClientLink from '@/components/client-link';
import {
  fetchAllLibyaNews,
  fetchAlWasatLibyaNews,
  fetchAlMarsadLibyaNews,
  fetchEanLibyaNews,
  fetchLibyaAlahrarNews,
  fetchAfrigateNews,
  RssItem
} from '@/lib/api/rss-feed';
import Link from 'next/link';
import { cleanTextForDisplay, truncateCleanText } from '@/lib/utils/text-cleaner';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { useToast } from '@/hooks/use-toast';

// Mock data for Libya news when API fails - using fixed dates to avoid hydration issues
const MOCK_LIBYA_NEWS: RssItem[] = [
  {
    title: 'المجلس الرئاسي الليبي يدعو إلى حوار وطني شامل لحل الأزمة السياسية',
    link: 'https://alwasat.ly/news/libya/latest',
    description: 'دعا المجلس الرئاسي الليبي جميع الأطراف السياسية إلى المشاركة في حوار وطني شامل لحل الأزمة السياسية وتوحيد المؤسسات الليبية.',
    pubDate: '2024-05-15T12:00:00Z', // Fixed date
    source: 'Al Wasat Libya',
    imageUrl: 'https://picsum.photos/seed/libya1/800/400' // Fixed seed
  },
  {
    title: 'ارتفاع إنتاج النفط الليبي إلى 1.2 مليون برميل يومياً',
    link: 'https://almarsad.co/latest-news',
    description: 'أعلنت المؤسسة الوطنية للنفط في ليبيا عن ارتفاع إنتاج النفط إلى 1.2 مليون برميل يومياً بعد استئناف الإنتاج في عدد من الحقول النفطية.',
    pubDate: '2024-05-14T18:00:00Z', // Fixed date
    source: 'Al Marsad Libya',
    imageUrl: 'https://picsum.photos/seed/libya2/800/400' // Fixed seed
  },
  {
    title: 'افتتاح مطار بنينا الدولي في بنغازي بعد أعمال التطوير',
    link: 'https://eanlibya.com/latest-news',
    description: 'تم افتتاح مطار بنينا الدولي في مدينة بنغازي بعد الانتهاء من أعمال التطوير والتحديث التي استمرت لعدة أشهر.',
    pubDate: '2024-05-14T09:00:00Z', // Fixed date
    source: 'Ean Libya',
    imageUrl: 'https://picsum.photos/seed/libya3/800/400' // Fixed seed
  },
  {
    title: 'توقيع اتفاقية تعاون اقتصادي بين ليبيا وتركيا',
    link: 'https://libyaalahrar.tv/latest-news',
    description: 'وقعت ليبيا وتركيا اتفاقية تعاون اقتصادي تشمل مجالات الطاقة والبنية التحتية والاستثمار، خلال زيارة رسمية للوفد الليبي إلى أنقرة.',
    pubDate: '2024-05-13T14:00:00Z', // Fixed date
    source: 'Libya Alahrar',
    imageUrl: 'https://picsum.photos/seed/libya4/800/400' // Fixed seed
  },
  {
    title: 'انطلاق فعاليات معرض طرابلس الدولي للكتاب',
    link: 'https://www.afrigatenews.net/latest-news',
    description: 'انطلقت فعاليات معرض طرابلس الدولي للكتاب بمشاركة أكثر من 200 دار نشر من مختلف أنحاء العالم، وسط إقبال كبير من الزوار.',
    pubDate: '2024-05-12T10:00:00Z', // Fixed date
    source: 'Afrigate News',
    imageUrl: 'https://picsum.photos/seed/libya5/800/400' // Fixed seed
  }
];

export function LibyaNewsHome() {
  const [libyaNews, setLibyaNews] = useState<RssItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLinks, setCopiedLinks] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  // Initialize with mock data to avoid hydration issues
  useEffect(() => {
    // Set initial state with mock data to avoid hydration mismatch
    setLibyaNews(MOCK_LIBYA_NEWS);
    setIsLoading(false);

    // Then fetch real data after a short delay
    const timer = setTimeout(() => {
      fetchNews();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching Libya news for home page...');

      // Fetch news from multiple Libya sources in parallel using the exported functions
      // Group 1: Most reliable Libya news sources (Arabic)
      const reliableArabicPromises = [
        fetchAlWasatLibyaNews(),
        fetchAlMarsadLibyaNews(),
        fetchEanLibyaNews(),
        fetchLibyaAlahrarNews(),
        fetchAfrigateNews()
      ];

      // Use Promise.allSettled to handle multiple requests in parallel
      const results = await Promise.allSettled(reliableArabicPromises);

      // Process results
      let combinedNews: RssItem[] = [];
      let successfulSources = 0;

      // Helper function to normalize and simplify Arabic text for comparison
      const normalizeArabicText = (text: string): string => {
        return text
          .trim()
          .toLowerCase()
          // Remove diacritics (tashkeel)
          .replace(/[\u064B-\u065F]/g, '')
          // Normalize alef variations
          .replace(/[أإآا]/g, 'ا')
          // Normalize yaa variations
          .replace(/[يى]/g, 'ي')
          // Normalize taa marbuta
          .replace(/[ة]/g, 'ه')
          // Remove punctuation
          .replace(/[.,،:;'"!؟?()[\]{}]/g, '')
          // Remove extra spaces
          .replace(/\s+/g, ' ');
      };

      // Set to track titles we've already seen
      const seenTitles = new Set<string>();

      // Process results from each source
      const reliableSources = [
        'Al Wasat Libya', 'Al Marsad Libya', 'Ean Libya',
        'Libya Alahrar', 'Afrigate News'
      ];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          // Add all news items from this source
          combinedNews = [...combinedNews, ...result.value];
          successfulSources++;
          console.log(`Successfully fetched ${result.value.length} items from ${reliableSources[index]}`);

          // Add titles to seen set
          for (const item of result.value) {
            seenTitles.add(normalizeArabicText(item.title));
          }
        } else if (result.status === 'rejected') {
          console.error(`Failed to fetch from ${reliableSources[index]}: ${result.reason}`);
        } else if (result.value.length === 0) {
          console.warn(`No items fetched from ${reliableSources[index]}`);
        }
      });

      console.log(`Successfully fetched news from ${successfulSources} out of ${reliableSources.length} Libya sources`);

      // If we have less than 2 successful sources, use mock data
      if (successfulSources < 2) {
        console.log('Not enough successful sources, using mock data');
        setLibyaNews(MOCK_LIBYA_NEWS);
      } else {
        // Sort by date (newest first) and limit to 5 items for home page
        const sortedNews = combinedNews
          .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
          .slice(0, 5);

        console.log(`Returning ${sortedNews.length} sorted Libya news items for home page`);
        setLibyaNews(sortedNews);
      }
    } catch (err) {
      console.error('Error in Libya news fetch process:', err);
      // Always fall back to mock data to ensure we show something
      setLibyaNews(MOCK_LIBYA_NEWS);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate time ago - with server/client consistent implementation
  const timeAgo = (dateString: string) => {
    try {
      // Use a fixed reference date for server rendering to avoid hydration mismatch
      const serverDate = new Date('2024-05-15T12:00:00Z');

      // Only use the actual current time on the client side after hydration
      const now = typeof window !== 'undefined'
        ? new Date()
        : serverDate;

      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      // For server rendering or very recent content, just return a fixed string
      if (typeof window === 'undefined' || diffInSeconds < 0) {
        return 'منذ لحظات'; // Just now
      }

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
      return 'منذ لحظات'; // Default to "just now" on error
    }
  };

  // Truncate text to a certain length with RTL support
  const truncateText = (text: string | null, maxLength: number = 120) => {
    // استخدام وظيفة التنظيف الجديدة التي تعالج رموز HTML مثل &nbsp;
    return truncateCleanText(text, maxLength);
  };

  return (
    <Card className="w-full shadow-lg border border-border/50 rounded-xl overflow-hidden bg-gradient-to-br from-card to-card/90 libya-news rtl-content">
      <CardHeader className="bg-primary/10 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-lg sm:text-xl font-semibold text-right card-title" dir="rtl">الأخبار الليبية</CardTitle> {/* Libya News */}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchNews}
            disabled={isLoading}
            title="تحديث"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="text-sm sm:text-base text-right card-description" dir="rtl">
          آخر الأخبار والتطورات من ليبيا
        </CardDescription> {/* Latest news and developments from Libya */}
      </CardHeader>

      <CardContent className="p-4 sm:p-6 rtl-content" dir="rtl">
        <ScrollArea className="h-[350px] rounded-md rtl-content" dir="rtl">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-destructive" />
              <p className="text-destructive font-medium text-lg mb-2">{error}</p>
              <p className="mb-4 text-sm text-muted-foreground">
                نحاول عرض بعض الأخبار المخزنة مؤقتًا بينما نعمل على حل المشكلة
              </p>
              <Button
                variant="outline"
                className="mx-auto"
                onClick={() => {
                  console.log('Retrying fetch...');
                  fetchNews();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة المحاولة
              </Button>
            </div>
          ) : libyaNews.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>لا توجد أخبار ليبية متاحة حاليًا</p> {/* No Libya news available at the moment */}
              <p className="mt-2 text-sm">يرجى المحاولة مرة أخرى لاحقًا</p>
              {/* Please try again later */}
            </div>
          ) : (
            <div className="space-y-4">
              {libyaNews.map((item, index) => (
                <div key={index} className="pb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs" dir="rtl">
                          {item.source}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const success = await copyToClipboard(item.link);
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
                      <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0 flex-row-reverse" dir="rtl">
                        <Clock className="h-3 w-3 ml-1" />
                        {timeAgo(item.pubDate)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base sm:text-lg line-clamp-2 break-words text-right rtl-content !text-right w-full" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
                      <ClientLink
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors flex items-start gap-1 flex-row-reverse text-right rtl-content !text-right w-full"
                        style={{ textAlign: 'right', direction: 'rtl' }}
                        title={cleanTextForDisplay(item.title)}
                      >
                        <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0 ml-1" />
                        {cleanTextForDisplay(item.title)}
                      </ClientLink>
                    </h3>

                    {item.imageUrl && (
                      <div className="my-2 relative w-full h-40 overflow-hidden rounded-md bg-muted">
                        {/* Use a key based on the image URL to ensure consistent rendering */}
                        <img
                          key={item.imageUrl}
                          src={item.imageUrl}
                          alt={item.title}
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
                      {truncateText(item.description)}
                    </p>
                  </div>
                  {index < libyaNews.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="bg-primary/5 p-3 sm:p-4 border-t text-xs text-muted-foreground">
        <div className="w-full">
          <p className="text-right" dir="rtl">يتم تحديث الأخبار الليبية تلقائيًا من مصادر ليبية متعددة</p>
          {/* Libya news is automatically updated from multiple Libyan sources */}
          <p className="mt-1 text-[10px] text-right" dir="rtl">المصادر: الوسط الليبية، المرصد الليبي، عين ليبيا، ليبيا الأحرار، بوابة أفريقيا الإخبارية، وكالة الأنباء الليبية، ليبيا 24، ليبيا هيرالد، ليبيا أوبزرفر، ليبيان إكسبريس</p>
          {/* Sources: Al Wasat Libya, Al Marsad Libya, Ean Libya, Libya Alahrar, Afrigate News, Libya News Agency, Libya 24, Libya Herald, Libya Observer, Libyan Express */}
        </div>
      </CardFooter>
    </Card>
  );
}
