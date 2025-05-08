import type {Metadata} from 'next';
import { NewsArticleProcessor } from '@/components/news-article-processor';
import { CategorizedNews } from '@/components/categorized-news';
import { TrendingNews } from '@/components/trending-news';
import { LatestNews } from '@/components/latest-news';
import { LibyaNewsHome } from '@/components/libya-news-home';
import { Newspaper, MapPin, Home as HomeIcon } from 'lucide-react';
import ClientLink from '@/components/client-link';
import Link from 'next/link';


export const metadata: Metadata = {
  title: 'محقق الأخبار', // News Detective
  description: 'تصفح الأخبار العاجلة حسب الفئة، تلخيص المقالات وكشف الأخبار الكاذبة من روابط المقالات.', // Browse breaking news by category, summarize articles and detect fake news from article URLs.
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-24 pb-12 px-4 sm:px-8 bg-gradient-to-b from-background to-secondary/30">
      <header className="w-full max-w-5xl mb-12 text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <Newspaper size={56} className="text-primary" />
          <h1 className="text-5xl font-bold text-primary tracking-tight">
            محقق الأخبار
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          تصفح الأخبار العاجلة حسب الفئة، أو أدخل رابط مقال إخباري للحصول على ملخص موجز والتحقق من المعلومات المضللة المحتملة.
        </p>
      </header>

      <div className="w-full max-w-5xl space-y-12">
        {/* News Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trending News Section */}
          <section id="trending-news" className="scroll-mt-24">
            <TrendingNews />
          </section>

          {/* Latest News Section */}
          <section id="latest-news" className="scroll-mt-24">
            <LatestNews />
          </section>
        </div>

        {/* Libya News Section */}
        <section id="libya-news" className="scroll-mt-24">
          <LibyaNewsHome />
        </section>

        {/* Categorized News Section */}
        <section id="categorized-news" className="scroll-mt-24">
          <CategorizedNews />
        </section>

        {/* News Article Processor */}
        <section id="news-processor" className="scroll-mt-24">
          <NewsArticleProcessor />
        </section>
      </div>

      <footer className="mt-16 w-full max-w-5xl text-muted-foreground">
        <div className="border-t border-border pt-8">
          <p className="text-sm text-center mx-auto">© 2025 محقق الأخبار - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </main>
  );
}
