'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ExternalLink, MapPin, RefreshCw, Clock, Copy, Check } from 'lucide-react';
import ClientLink from '@/components/client-link';
import { fetchAllLibyaNews, RssItem } from '@/lib/api/rss-feed';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { useToast } from '@/hooks/use-toast';

export function LibyaNewsSection() {
  const [libyaNews, setLibyaNews] = useState<RssItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLinks, setCopiedLinks] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch news from all Libya sources
      const news = await fetchAllLibyaNews();

      if (news.length === 0) {
        throw new Error('لم يتم العثور على أخبار من أي مصدر ليبي');
      }

      setLibyaNews(news);
    } catch (err) {
      console.error('Error fetching Libya news:', err);
      setError('حدث خطأ أثناء جلب الأخبار الليبية. الرجاء المحاولة مرة أخرى لاحقًا.');
    } finally {
      setIsLoading(false);
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

  // Calculate time ago
  const timeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) {
        return 'منذ لحظات';
      } else if (diffMin < 60) {
        return `منذ ${diffMin} ${diffMin === 1 ? 'دقيقة' : 'دقائق'}`;
      } else if (diffHour < 24) {
        return `منذ ${diffHour} ${diffHour === 1 ? 'ساعة' : 'ساعات'}`;
      } else if (diffDay < 30) {
        return `منذ ${diffDay} ${diffDay === 1 ? 'يوم' : 'أيام'}`;
      } else {
        return formatDate(dateString);
      }
    } catch (e) {
      return dateString;
    }
  };

  // Strip HTML tags from text
  const stripHtml = (html: string) => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
      } catch (e) {
        // Fallback for server-side or if DOMParser fails
        return html.replace(/<[^>]*>?/gm, '');
      }
    } else {
      // Server-side fallback
      return html.replace(/<[^>]*>?/gm, '');
    }
  };

  // Truncate text to a certain length with RTL support
  const truncateText = (text: string, maxLength: number = 150) => {
    const strippedText = stripHtml(text);
    if (strippedText.length <= maxLength) return strippedText;
    // Add RTL mark to ensure proper text direction
    return '\u200F' + strippedText.substring(0, maxLength) + '...';
  };

  return (
    <Card className="w-full shadow-lg border border-border/50 rounded-xl overflow-hidden bg-card libya-news rtl-content">
      <CardHeader className="bg-card-foreground/5 p-4 sm:p-6">
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
          آخر الأخبار والتطورات من ليبيا من مصادر موثوقة
        </CardDescription> {/* Latest news and developments from Libya from reliable sources */}
      </CardHeader>

      <CardContent className="p-4 sm:p-6 rtl-content" dir="rtl">
        <ScrollArea className="h-[600px] rounded-md rtl-content" dir="rtl">
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
          ) : libyaNews.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>لا توجد أخبار ليبية متاحة حاليًا</p> {/* No Libya news available at the moment */}
              <p className="mt-2 text-sm">جاري تحميل البيانات المخزنة...</p>
              {/* Loading cached data... */}
            </div>
          ) : (
            <div className="space-y-4">
              {libyaNews.map((item, index) => (
                <div key={index} className="pb-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-base sm:text-lg text-right rtl-content !text-right w-full" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
                      <ClientLink
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors flex items-start gap-1 flex-row-reverse text-right rtl-content !text-right w-full"
                        style={{ textAlign: 'right', direction: 'rtl' }}
                      >
                        <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0 ml-1" />
                        {item.title}
                      </ClientLink>
                    </h3>

                    {item.imageUrl && (
                      <div className="my-2 relative w-full h-40 overflow-hidden rounded-md bg-muted">
                        <img
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

                    <p className="text-sm text-muted-foreground text-right" dir="rtl">
                      {truncateText(item.description)}
                    </p>

                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs" dir="rtl">
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
                      <div className="flex flex-col items-end gap-1">
                        <span className="flex items-center gap-1 flex-row-reverse" dir="rtl">
                          <Clock className="h-3 w-3 ml-1" />
                          {timeAgo(item.pubDate)}
                        </span>
                        <span dir="rtl" className="text-[10px] opacity-70">{formatDate(item.pubDate)}</span>
                      </div>
                    </div>
                  </div>
                  {index < libyaNews.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="bg-card-foreground/5 p-3 sm:p-4 border-t text-xs text-muted-foreground">
        <div className="w-full">
          <p className="text-right" dir="rtl">يتم تحديث الأخبار الليبية تلقائيًا من مصادر ليبية متعددة</p>
          {/* Libya news is automatically updated from multiple Libyan sources */}
          <p className="mt-1 text-[10px] text-right" dir="rtl">المصادر: بوابة الوسط، المرصد الليبي، عين ليبيا، ليبيا الأحرار، بوابة أفريقيا الإخبارية، وكالة الأنباء الليبية، ليبيا 24، صحيفة فبراير، بوابة برنيق، ليبيا بانوراما، ليبيا السلام، نيو ليبيا، التناصح، ليبيا أخبار، العنوان الليبية، ليبيا هيرالد، ليبيا أوبزرفر، ليبيان إكسبرس</p>
          {/* Sources: Al Wasat, Al Marsad, Ean Libya, Libya Alahrar, Afrigate News, Libya News Agency, Libya 24, Febrair, Barniq, Libya Panorama, Libya Al Salam, New Libya, Tanasuh, Libya Akhbar, Address Libya, Libya Herald, Libya Observer, Libyan Express */}
          <p className="mt-1 text-[10px] text-muted-foreground text-right" dir="rtl">انقر على زر "بحث عن الخبر في جوجل" للبحث عن الخبر، أو انقر على اسم المصدر لزيارة موقعه</p>
          {/* Instructions: Click on the "Search for news on Google" button to search for the news, or click on the source name to visit its website */}
        </div>
      </CardFooter>
    </Card>
  );
}
