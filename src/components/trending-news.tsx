'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock, ExternalLink, TrendingUp, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';
import ClientLink from '@/components/client-link';
import { fetchAllNews, RssItem } from '@/lib/api/rss-feed';
import { fetchTopHeadlines } from '@/lib/api/news-api';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { useToast } from '@/hooks/use-toast';


export function TrendingNews() {
  const [trendingNews, setTrendingNews] = useState<RssItem[]>([]);
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
      // Fetch news from all Arabic RSS sources
      const rssNews = await fetchAllNews();

      // Fetch news from Arabic countries via NewsAPI
      const [aeNews, egNews, saNews] = await Promise.allSettled([
        fetchTopHeadlines('ae', 'general', 5), // UAE
        fetchTopHeadlines('eg', 'general', 5), // Egypt
        fetchTopHeadlines('sa', 'general', 5)  // Saudi Arabia
      ]);

      // Process RSS news
      let combinedNews: RssItem[] = [...rssNews];

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

      // Add all RSS news titles to the set
      for (const item of rssNews) {
        seenTitles.add(normalizeArabicText(item.title));
      }

      // Function to check if a title is similar to any we've seen
      const isSimilarToExisting = (title: string): boolean => {
        const normalizedTitle = normalizeArabicText(title);

        // If the title is too short, don't consider it for similarity check
        if (normalizedTitle.length < 10) return false;

        for (const seenTitle of seenTitles) {
          // Check for substring similarity
          if (seenTitle.includes(normalizedTitle) || normalizedTitle.includes(seenTitle)) {
            console.log(`Found similar titles: "${title}" is similar to a previously seen title`);
            return true;
          }

          // Check for keyword similarity
          const keywords = ['الأمم المتحدة', 'غزة', 'إطلاق النار', 'الشرق الأوسط', 'فلسطين', 'إسرائيل'];
          let keywordMatches = 0;

          for (const keyword of keywords) {
            if (normalizedTitle.includes(keyword) && seenTitle.includes(keyword)) {
              keywordMatches++;
            }
          }

          // If 2 or more important keywords match, consider the titles similar
          if (keywordMatches >= 2) {
            console.log(`Found similar titles by keywords: "${title}" shares ${keywordMatches} keywords with a previously seen title`);
            return true;
          }
        }
        return false;
      };

      // Process NewsAPI articles from UAE and convert them to RssItem format
      if (aeNews.status === 'fulfilled' && aeNews.value.length > 0) {
        console.log(`Processing ${aeNews.value.length} news items from UAE`);

        for (const article of aeNews.value) {
          // Skip articles with similar titles to what we've already seen
          if (isSimilarToExisting(article.title)) {
            console.log(`Skipping duplicate UAE news: ${article.title}`);
            continue;
          }

          // Add this article's title to the set of seen titles
          seenTitles.add(normalizeArabicText(article.title));

          // Convert and add the article
          const convertedArticle: RssItem = {
            title: article.title,
            link: article.url,
            description: article.description || '',
            pubDate: article.publishedAt,
            source: `${article.source.name} (الإمارات)`,
            imageUrl: article.urlToImage
          };

          combinedNews.push(convertedArticle);
        }
      }

      // Process NewsAPI articles from Egypt
      if (egNews.status === 'fulfilled' && egNews.value.length > 0) {
        console.log(`Processing ${egNews.value.length} news items from Egypt`);

        for (const article of egNews.value) {
          // Skip articles with similar titles to what we've already seen
          if (isSimilarToExisting(article.title)) {
            console.log(`Skipping duplicate Egypt news: ${article.title}`);
            continue;
          }

          // Add this article's title to the set of seen titles
          seenTitles.add(normalizeArabicText(article.title));

          // Convert and add the article
          const convertedArticle: RssItem = {
            title: article.title,
            link: article.url,
            description: article.description || '',
            pubDate: article.publishedAt,
            source: `${article.source.name} (مصر)`,
            imageUrl: article.urlToImage
          };

          combinedNews.push(convertedArticle);
        }
      }

      // Process NewsAPI articles from Saudi Arabia
      if (saNews.status === 'fulfilled' && saNews.value.length > 0) {
        console.log(`Processing ${saNews.value.length} news items from Saudi Arabia`);

        for (const article of saNews.value) {
          // Skip articles with similar titles to what we've already seen
          if (isSimilarToExisting(article.title)) {
            console.log(`Skipping duplicate Saudi news: ${article.title}`);
            continue;
          }

          // Add this article's title to the set of seen titles
          seenTitles.add(normalizeArabicText(article.title));

          // Convert and add the article
          const convertedArticle: RssItem = {
            title: article.title,
            link: article.url,
            description: article.description || '',
            pubDate: article.publishedAt,
            source: `${article.source.name} (السعودية)`,
            imageUrl: article.urlToImage
          };

          combinedNews.push(convertedArticle);
        }
      }

      // Final filter to remove any problematic news items that might have slipped through
      const filteredNews = combinedNews.filter(item => {
        // Explicitly filter out the problematic UN news by title
        if (item.title.includes('الأمم المتحدة تدعو إلى وقف إطلاق النار في الشرق الأوسط')) {
          console.log(`Final filter: Removing problematic UN news item: ${item.title}`);
          return false;
        }

        // Filter out items with broken BBC links
        if (item.source.includes('BBC News') &&
            (item.link.includes('c4nq369rlgdo') || !item.link.includes('/articles/'))) {
          console.log(`Final filter: Removing news item with broken BBC link: ${item.title}`);
          return false;
        }

        return true;
      });

      console.log(`Filtered out ${combinedNews.length - filteredNews.length} problematic news items in final filter`);

      // Sort by date (newest first) and limit to 15 items
      const sortedNews = filteredNews
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, 15); // Increased to 15 to show more Arabic news sources

      if (sortedNews.length === 0) {
        throw new Error('No news items found from any source');
      }

      setTrendingNews(sortedNews);
    } catch (err) {
      console.error('Error fetching trending news:', err);
      setError('حدث خطأ أثناء جلب الأخبار. الرجاء المحاولة مرة أخرى لاحقًا.');
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

      // Format time with 12-hour format and AM/PM
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

  // Strip HTML tags from text
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Truncate text to a certain length with RTL support
  const truncateText = (text: string, maxLength: number = 150) => {
    const strippedText = stripHtml(text);
    if (strippedText.length <= maxLength) return strippedText;
    // Add RTL mark to ensure proper text direction
    return '\u200F' + strippedText.substring(0, maxLength) + '...';
  };

  return (
    <Card className="w-full shadow-lg border border-border/50 rounded-xl overflow-hidden bg-card trending-news rtl-content">
      <CardHeader className="bg-card-foreground/5 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-lg sm:text-xl font-semibold text-right card-title" dir="rtl">الأخبار العاجلة</CardTitle> {/* Breaking News */}
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
          آخر الأخبار العاجلة من المصادر الموثوقة
        </CardDescription> {/* Latest breaking news from trusted sources */}
      </CardHeader>

      <CardContent className="p-4 sm:p-6 rtl-content" dir="rtl">
        <ScrollArea className="h-[450px] rounded-md rtl-content" dir="rtl">
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
          ) : trendingNews.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>لا توجد أخبار متاحة حاليًا</p> {/* No news available at the moment */}
              <p className="mt-2 text-sm">جاري تحميل البيانات المخزنة...</p>
              {/* Loading cached data... */}
            </div>
          ) : (
            <div className="space-y-4">
              {trendingNews.map((item, index) => (
                <div
                  key={index}
                  className={`pb-4 ${item.isBreakingNews ? 'breaking-news-item' : ''}`}
                  data-source={item.source}
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-base sm:text-lg text-right rtl-content !text-right w-full" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
                      {item.isBreakingNews && (
                        <Badge variant="destructive" className="mb-1 inline-flex items-center gap-1 animate-pulse">
                          <AlertCircle className="h-3 w-3" />
                          <span>
                            {item.source === 'الجزيرة مباشر' ? 'الجزيرة مباشر' :
                             item.source === 'الجزيرة بث مباشر' ? 'الجزيرة بث مباشر' :
                             item.source === 'العربية عاجل' ? 'العربية عاجل' :
                             item.source === 'واس عاجل' ? 'واس عاجل' :
                             item.source === 'وام عاجل' ? 'وام عاجل' :
                             item.source === 'كونا عاجل' ? 'كونا عاجل' :
                             item.source === 'قنا عاجل' ? 'قنا عاجل' :
                             item.source === 'وكالة الأنباء الليبية عاجل' ? 'وكالة الأنباء الليبية' :
                             item.source === 'بوابة الوسط عاجل' ? 'بوابة الوسط' :
                             item.source === 'المرصد الليبي عاجل' ? 'المرصد الليبي' :
                             'خبر عاجل'}
                          </span>
                        </Badge>
                      )}
                      <ClientLink
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:text-primary transition-colors flex items-start gap-1 flex-row-reverse text-right rtl-content !text-right w-full ${item.isBreakingNews ? 'text-destructive font-bold' : ''}`}
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
                  {index < trendingNews.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="bg-card-foreground/5 p-3 sm:p-4 border-t text-xs text-muted-foreground">
        <div className="w-full">
          <p className="text-right" dir="rtl">يتم تحديث الأخبار العاجلة تلقائيًا من مصادر متعددة</p>
          {/* Breaking news is automatically updated from multiple sources */}
        </div>
      </CardFooter>
    </Card>
  );
}
