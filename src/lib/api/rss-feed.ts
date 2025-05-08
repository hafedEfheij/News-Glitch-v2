/**
 * Utilities for fetching and parsing RSS feeds
 */

export type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
};

// RSS feed URLs
const RSS_FEEDS = {
  // Major Arabic News Networks - Most reliable sources first
  bbcArabic: 'https://feeds.bbci.co.uk/arabic/rss.xml', // Very reliable
  bbcArabicMiddleEast: 'https://feeds.bbci.co.uk/arabic/middleeast/rss.xml', // Very reliable
  bbcArabicBusiness: 'https://feeds.bbci.co.uk/arabic/business/rss.xml', // Business category
  bbcArabicScience: 'https://feeds.bbci.co.uk/arabic/scienceandtech/rss.xml', // Science & Tech category
  bbcArabicSports: 'https://feeds.bbci.co.uk/arabic/sports/rss.xml', // Sports category
  bbcArabicArts: 'https://feeds.bbci.co.uk/arabic/artandculture/rss.xml', // Entertainment category
  bbcArabicHealth: 'https://feeds.bbci.co.uk/arabic/topics/health/rss.xml', // Health category

  // Breaking News specific feeds - High priority for trending news
  alJazeeraMubasher: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b0-2fd0-49cf-bd1e-af3901414abe', // الجزيرة مباشر - أخبار عاجلة
  alJazeeraLive: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b0-2fd0-49cf-bd1e-af3901414abe', // الجزيرة بث مباشر
  alArabiyaBreaking: 'https://news.google.com/rss/search?q=site:alarabiya.net+%D8%B9%D8%A7%D8%AC%D9%84&hl=ar&gl=EG&ceid=EG:ar', // العربية أخبار عاجلة (Google News fallback)

  // Official News Agencies Breaking News - High priority for trending news
  spaBreaking: 'https://news.google.com/rss/search?q=site:spa.gov.sa+%D8%B9%D8%A7%D8%AC%D9%84&hl=ar&gl=EG&ceid=EG:ar', // وكالة الأنباء السعودية - عاجل
  wamBreaking: 'https://news.google.com/rss/search?q=site:wam.ae+%D8%B9%D8%A7%D8%AC%D9%84&hl=ar&gl=EG&ceid=EG:ar', // وكالة أنباء الإمارات - عاجل
  kunaBreaking: 'https://news.google.com/rss/search?q=site:kuna.net.kw+%D8%B9%D8%A7%D8%AC%D9%84&hl=ar&gl=EG&ceid=EG:ar', // وكالة الأنباء الكويتية - عاجل
  qnaBreaking: 'https://news.google.com/rss/search?q=site:qna.org.qa+%D8%B9%D8%A7%D8%AC%D9%84&hl=ar&gl=EG&ceid=EG:ar', // وكالة الأنباء القطرية - عاجل

  // Libya News Agencies Breaking News - High priority for trending news
  lanaBreaking: 'https://news.google.com/rss/search?q=site:lana.gov.ly+%D8%B9%D8%A7%D8%AC%D9%84&hl=ar&gl=EG&ceid=EG:ar', // وكالة الأنباء الليبية - عاجل
  alwasatBreaking: 'https://news.google.com/rss/search?q=site:alwasat.ly+%D8%B9%D8%A7%D8%AC%D9%84&hl=ar&gl=EG&ceid=EG:ar', // بوابة الوسط - عاجل
  almarsadBreaking: 'https://news.google.com/rss/search?q=site:almarsad.co+%D8%B9%D8%A7%D8%AC%D9%84&hl=ar&gl=EG&ceid=EG:ar', // المرصد الليبي - عاجل

  cnnArabic: 'https://arabic.cnn.com/api/v1/rss/rss.xml', // Reliable
  cnnArabicBusiness: 'https://arabic.cnn.com/api/v1/rss/business/rss.xml', // Business category
  cnnArabicTech: 'https://arabic.cnn.com/api/v1/rss/tech/rss.xml', // Technology category
  cnnArabicSports: 'https://arabic.cnn.com/api/v1/rss/sport/rss.xml', // Sports category
  cnnArabicHealth: 'https://arabic.cnn.com/api/v1/rss/health/rss.xml', // Health category
  cnnArabicEntertainment: 'https://arabic.cnn.com/api/v1/rss/entertainment/rss.xml', // Entertainment category

  rtArabic: 'https://arabic.rt.com/rss/', // Reliable
  rtArabicBusiness: 'https://arabic.rt.com/business/rss/', // Business category
  rtArabicSports: 'https://arabic.rt.com/sport/rss/', // Sports category
  rtArabicTech: 'https://arabic.rt.com/technology/rss/', // Technology category
  rtArabicScience: 'https://arabic.rt.com/science/rss/', // Science category
  rtArabicHealth: 'https://arabic.rt.com/health/rss/', // Health category

  dwArabic: 'https://rss.dw.com/xml/rss-ar-all', // Reliable
  dwArabicBusiness: 'https://rss.dw.com/xml/rss-ar-eco', // Business category
  dwArabicScience: 'https://rss.dw.com/xml/rss-ar-sci', // Science category
  dwArabicCulture: 'https://rss.dw.com/xml/rss-ar-cul', // Entertainment/Culture category
  dwArabicSports: 'https://rss.dw.com/xml/rss-ar-sports', // Sports category

  france24Arabic: 'https://www.france24.com/ar/rss', // Reliable
  france24ArabicMiddleEast: 'https://www.france24.com/ar/الشرق-الأوسط/rss', // Middle East news
  france24ArabicBusiness: 'https://www.france24.com/ar/اقتصاد/rss', // Business category
  france24ArabicSports: 'https://www.france24.com/ar/رياضة/rss', // Sports category
  france24ArabicCulture: 'https://www.france24.com/ar/ثقافة/rss', // Entertainment/Culture category
  france24ArabicScience: 'https://www.france24.com/ar/علوم-تكنولوجيا/rss', // Science & Tech category

  // These sources sometimes have CORS/403 issues, but we have fallbacks in the proxy
  alJazeera: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b0-2fd0-49cf-bd1e-af3901414abe',
  alJazeeraBusiness: 'https://www.aljazeera.net/aljazeerarss/b5e3e445-e6a6-4e26-a30e-95d45aa62d94/73d0e1b0-2fd0-49cf-bd1e-af3901414abe', // Business
  alJazeeraSports: 'https://www.aljazeera.net/aljazeerarss/8e1fe5bb-5bc4-4827-a925-40ad4f2f8de9/73d0e1b0-2fd0-49cf-bd1e-af3901414abe', // Sports
  alJazeeraScience: 'https://www.aljazeera.net/aljazeerarss/e5571d9a-e065-446f-a3ec-52108b8ff686/73d0e1b0-2fd0-49cf-bd1e-af3901414abe', // Science

  alarabiya: 'https://www.alarabiya.net/tools/rss/ar.xml', // Updated to a more reliable URL
  alarabiyaBusiness: 'https://www.alarabiya.net/tools/rss/ar/aswaq.xml', // Business
  alarabiyaSports: 'https://www.alarabiya.net/tools/rss/ar/sport.xml', // Sports
  alarabiyaHealth: 'https://www.alarabiya.net/tools/rss/ar/medicine-and-health.xml', // Health
  alarabiyaTech: 'https://www.alarabiya.net/tools/rss/ar/technology.xml', // Technology

  skynewsArabia: 'https://www.skynewsarabia.com/web/rss/95.xml', // Updated to a more reliable URL
  skynewsArabiaBusiness: 'https://www.skynewsarabia.com/web/rss/114.xml', // Business
  skynewsArabiaSports: 'https://www.skynewsarabia.com/web/rss/110.xml', // Sports
  skynewsArabiaScience: 'https://www.skynewsarabia.com/web/rss/115.xml', // Science & Tech
  skynewsArabiaHealth: 'https://www.skynewsarabia.com/web/rss/116.xml', // Health
  skynewsArabiaEntertainment: 'https://www.skynewsarabia.com/web/rss/112.xml', // Entertainment

  // Google News Aggregators - Very reliable
  googleNewsArabic: 'https://news.google.com/rss?hl=ar&gl=EG&ceid=EG:ar',
  googleNewsArabicWorld: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtRnlHZ0pGVXlnQVAB?hl=ar&gl=EG&ceid=EG%3Aar',
  googleNewsArabicBusiness: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtRnlHZ0pGVXlnQVAB?hl=ar&gl=EG&ceid=EG%3Aar',
  googleNewsArabicTech: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1Y3pZU0FtRnlHZ0pGVXlnQVAB?hl=ar&gl=EG&ceid=EG%3Aar',
  googleNewsArabicSports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtRnlHZ0pGVXlnQVAB?hl=ar&gl=EG&ceid=EG%3Aar',
  googleNewsArabicEntertainment: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp5Y1RBU0FtRnlHZ0pGVXlnQVAB?hl=ar&gl=EG&ceid=EG%3Aar',
  googleNewsArabicHealth: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtRnlLQUFQAQ?hl=ar&gl=EG&ceid=EG%3Aar',
  googleNewsArabicScience: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtRnlHZ0pGVXlnQVAB?hl=ar&gl=EG&ceid=EG%3Aar',

  // Arabic Newspapers - May have CORS/403 issues
  asharqAlawsat: 'https://aawsat.com/feed',
  asharqAlawsatBusiness: 'https://aawsat.com/economy/feed',
  asharqAlawsatSports: 'https://aawsat.com/sport/feed',
  asharqAlawsatCulture: 'https://aawsat.com/culture/feed',

  alKhaleej: 'https://www.alkhaleej.ae/rss',
  alKhaleejBusiness: 'https://www.alkhaleej.ae/business/rss',
  alKhaleejSports: 'https://www.alkhaleej.ae/sports/rss',
  alKhaleejHealth: 'https://www.alkhaleej.ae/health/rss',
  alKhaleejTech: 'https://www.alkhaleej.ae/technology/rss',

  alBayan: 'https://www.albayan.ae/rss',
  alBayanBusiness: 'https://www.albayan.ae/economy/rss-1.3238435',
  alBayanSports: 'https://www.albayan.ae/sports/rss-1.3238436',
  alBayanHealth: 'https://www.albayan.ae/health/rss-1.3238437',
  alBayanTech: 'https://www.albayan.ae/technology/rss-1.3238438',

  alIttihad: 'https://www.alittihad.ae/rss',
  alRiyadh: 'https://www.alriyadh.com/rss',
  alWatan: 'https://www.alwatan.com.sa/rss',
  alAhram: 'https://gate.ahram.org.eg/rss.aspx',
  alAhramSports: 'https://gate.ahram.org.eg/RSS.aspx?PortalID=5&amp;PortalName=Sport',
  alAhramBusiness: 'https://gate.ahram.org.eg/RSS.aspx?PortalID=3&amp;PortalName=Economy',
  alAhramEntertainment: 'https://gate.ahram.org.eg/RSS.aspx?PortalID=11&amp;PortalName=Arts%20%26%20Culture',

  // Official News Agencies - May have CORS/403 issues
  spaArabic: 'https://www.spa.gov.sa/rss.php',
  wamArabic: 'https://wam.ae/ar/feeds/rss',
  kunaArabic: 'https://www.kuna.net.kw/rss.aspx?language=ar',
  petraArabic: 'https://petra.gov.jo/RSS.aspx?lang=ar',
  mapArabic: 'https://www.mapnews.ma/ar/rss.xml',
  qnaArabic: 'https://www.qna.org.qa/RSS?language=ar',

  // Specialized Arabic News - May have CORS/403 issues
  // Business & Economy
  cnbcArabic: 'https://www.cnbcarabia.com/rss',
  cnbcArabicMarkets: 'https://www.cnbcarabia.com/rss/markets',
  cnbcArabicCompanies: 'https://www.cnbcarabia.com/rss/companies',
  cnbcArabicEconomy: 'https://www.cnbcarabia.com/rss/economy',
  alEqtisadiah: 'https://www.aleqt.com/rss',
  mubasher: 'https://www.mubasher.info/api/1/rss/news',
  argaamBusiness: 'https://www.argaam.com/ar/rss/latest-articles',

  // Sports
  kooora: 'https://news.google.com/rss/search?q=site:kooora.com&hl=ar&gl=EG&ceid=EG:ar', // Using Google News search as Kooora RSS is not available
  filGoal: 'https://www.filgoal.com/rss',
  yallaKora: 'https://www.yallakora.com/rss',
  beINSports: 'https://news.google.com/rss/search?q=site:beinsports.com/ar&hl=ar&gl=EG&ceid=EG:ar',
  goalArabic: 'https://news.google.com/rss/search?q=site:goal.com/ar&hl=ar&gl=EG&ceid=EG:ar',

  // Technology
  aitNews: 'https://aitnews.com/feed/',
  techWorldArabic: 'https://news.google.com/rss/search?q=site:tech-wd.com&hl=ar&gl=EG&ceid=EG:ar',
  techArabic: 'https://www.tech-arabic.com/feed/',

  // Health
  alTibbi: 'https://news.google.com/rss/search?q=site:altibbi.com&hl=ar&gl=EG&ceid=EG:ar',
  webteb: 'https://www.webteb.com/rss',
  dailyMedicalInfo: 'https://www.dailymedicalinfo.com/feed/',

  // Science
  scientificAmericanArabic: 'https://news.google.com/rss/search?q=site:scientificamerican.com/arabic&hl=ar&gl=EG&ceid=EG:ar',
  nasaArabic: 'https://news.google.com/rss/search?q=site:nasa.gov+arabic&hl=ar&gl=EG&ceid=EG:ar',

  // Entertainment
  fann: 'https://news.google.com/rss/search?q=site:fann.com&hl=ar&gl=EG&ceid=EG:ar',
  etArabic: 'https://news.google.com/rss/search?q=site:elarabygroup.com&hl=ar&gl=EG&ceid=EG:ar',
  elCinema: 'https://news.google.com/rss/search?q=site:elcinema.com&hl=ar&gl=EG&ceid=EG:ar',

  // Additional reliable Arabic sources
  alArabNewspaper: 'https://www.alarab.co.uk/feed',
  alQudsAlArabi: 'https://www.alquds.co.uk/feed/',
  alMasryAlYoum: 'https://news.google.com/rss/search?q=site:almasryalyoum.com&hl=ar&gl=EG&ceid=EG:ar',
  alHayat: 'https://news.google.com/rss/search?q=site:alhayat.com&hl=ar&gl=EG&ceid=EG:ar',

  // Libya News Sources - Arabic
  alWasatLibya: 'https://alwasat.ly/feed',
  alMarsadLibya: 'https://almarsad.co/feed',
  eanLibya: 'https://eanlibya.com/feed',
  libyaAlahrar: 'https://libyaalahrar.tv/feed',
  afrigateNews: 'https://www.afrigatenews.net/feed',
  febrairNews: 'https://febp.ly/feed',
  barniqNews: 'https://brnieq.ly/?feed=rss2',
  libyaPanorama: 'https://lpc.ly/feed',
  libyaAlSalam: 'https://libyaalsalam.net/?feed=rss2',
  newLibya: 'https://newlibya.net/?feed=rss2',
  tanasuhTV: 'https://tanasuh.tv/feed',

  // Additional Libya News Sources - Arabic
  libyaNewsAgency: 'https://lana.gov.ly/feed',
  libya24: 'https://libya24.tv/feed',
  libyaAkhbar: 'https://libyaakhbar.com/feed',
  addressLibya: 'https://www.addresslibya.com/feed',

  // Libya News Sources - English
  libyaHerald: 'https://libyaherald.com/feed',
  libyaObserver: 'https://libyaobserver.ly/rss.xml',
  libyanExpress: 'https://libyanexpress.com/feed',

  // Fact-checking sources (English)
  snopes: 'https://www.snopes.com/feed/',
  factCheckOrg: 'https://www.factcheck.org/feed/'
};

// Mock RSS items for when feeds are unavailable
const MOCK_RSS_ITEMS: Record<string, RssItem[]> = {
  'BBC Arabic': [
    {
      title: 'تطورات جديدة في مباحثات السلام بين أوكرانيا وروسيا',
      link: 'https://www.bbc.com/arabic/articles/c8g5yzz3pgvo',
      description: 'أفادت مصادر دبلوماسية بحدوث تطورات جديدة في مباحثات السلام بين أوكرانيا وروسيا، مع إمكانية عقد جولة جديدة من المفاوضات قريباً.',
      pubDate: new Date().toISOString(),
      source: 'BBC Arabic',
      imageUrl: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/13B2/production/_132899876_mediaitem132899875.jpg'
    },
    {
      title: 'ارتفاع أسعار النفط عالمياً مع تصاعد التوترات في الشرق الأوسط',
      link: 'https://www.bbc.com/arabic/business-68590331',
      description: 'شهدت أسعار النفط ارتفاعاً ملحوظاً في الأسواق العالمية مع تزايد المخاوف من تأثر الإمدادات بسبب التوترات المتصاعدة في منطقة الشرق الأوسط.',
      pubDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      source: 'BBC Arabic',
      imageUrl: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/11D88/production/_132896543_gettyimages-1258163435.jpg'
    },
    {
      title: 'انطلاق مؤتمر التكنولوجيا العربي في دبي بمشاركة دولية واسعة',
      link: 'https://www.bbc.com/arabic/business-68589123',
      description: 'انطلقت فعاليات مؤتمر التكنولوجيا العربي في دبي بمشاركة أكثر من 200 شركة تكنولوجية من مختلف أنحاء العالم لعرض أحدث الابتكارات.',
      pubDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      source: 'BBC Arabic',
      imageUrl: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/15E4/production/_132896123_gettyimages-1258163111.jpg'
    },
    {
      title: 'اكتشاف أثري جديد في مصر يكشف أسرار الحضارة الفرعونية',
      link: 'https://www.bbc.com/arabic/articles/cd1er1xk7y7o',
      description: 'اكتشف علماء الآثار مقبرة فرعونية جديدة في منطقة سقارة تعود إلى عصر الدولة القديمة، تحتوي على كنوز ونقوش نادرة تكشف جوانب جديدة من الحضارة المصرية القديمة.',
      pubDate: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
      source: 'BBC Arabic',
      imageUrl: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/15E4/production/_132896123_gettyimages-1258163111.jpg'
    },
    {
      title: 'دراسة: تغير المناخ يهدد الأمن الغذائي في المنطقة العربية',
      link: 'https://www.bbc.com/arabic/articles/cg9vzlz3pgvo',
      description: 'حذرت دراسة حديثة من أن تغير المناخ يشكل تهديداً متزايداً للأمن الغذائي في المنطقة العربية، مع توقعات بانخفاض إنتاج المحاصيل الزراعية بنسبة تصل إلى 30% بحلول عام 2050.',
      pubDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      source: 'BBC Arabic',
      imageUrl: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/13B2/production/_132899876_mediaitem132899875.jpg'
    }
  ],
  'Google News': [
    {
      title: 'إطلاق مبادرة جديدة لدعم الشركات الناشئة في مجال التكنولوجيا',
      link: 'https://news.google.com/articles/CBMiRWh0dHBzOi8vd3d3LnNreW5ld3NhcmFiaWEuY29tL3RlY2hub2xvZ3kvMTY4MzU5Mi3Yp9mE2LTYsdmD2KfYqi3Yp9mE2YbYp9i02KbYqS3ZgdmKLdmF2KzYp9mELdiq2YPZhtmI2YTZiNis2YrYpy3Yp9mE2YXYudmE2YjZhdin2KrigJ0?hl=ar&gl=EG&ceid=EG%3Aar',
      description: 'أعلنت وزارة الاتصالات وتكنولوجيا المعلومات عن إطلاق مبادرة جديدة لدعم الشركات الناشئة في مجال التكنولوجيا بتمويل يصل إلى 100 مليون دولار.',
      pubDate: new Date().toISOString(),
      source: 'Google News',
      imageUrl: 'https://picsum.photos/800/400?random=1'
    },
    {
      title: 'افتتاح معرض الكتاب الدولي بمشاركة أكثر من 500 دار نشر',
      link: 'https://news.google.com/articles/CBMiTGh0dHBzOi8vd3d3LmFsYXJhYml5YS5uZXQvY3VsdHVyZS8yMDI0LzA0LzE1L9mF2LnYsdi2LdmD2KrYp9ioLdmE2YTZhti02LEt2KfZhNiz2LnZiNiv2YrYqS3Yp9mE2K_ZiNmE2Yo?hl=ar&gl=EG&ceid=EG%3Aar',
      description: 'افتتح معرض الكتاب الدولي أبوابه أمس بمشاركة أكثر من 500 دار نشر من مختلف أنحاء العالم، ويستمر المعرض لمدة أسبوعين.',
      pubDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      source: 'Google News',
      imageUrl: 'https://picsum.photos/800/400?random=2'
    },
    {
      title: 'فوز المنتخب المصري بكأس البطولة العربية لكرة القدم',
      link: 'https://news.google.com/articles/CBMiVGh0dHBzOi8vd3d3LmZpbGdvYWwuY29tL2FydGljbGVzLzI0NTgxNy_Yp9mE2YXZhtiq2K7YqC3Yp9mE2YXYtdix2Yog2YrYqtmI2Kwt2KjZg9ij2LMt2KfZhNio2LfZiNmE2Kkt2KfZhNi52LHYqNmK2Kk?hl=ar&gl=EG&ceid=EG%3Aar',
      description: 'حقق المنتخب المصري فوزاً مستحقاً في نهائي البطولة العربية لكرة القدم بعد تغلبه على نظيره السعودي بهدفين مقابل هدف.',
      pubDate: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
      source: 'Google News',
      imageUrl: 'https://picsum.photos/800/400?random=3'
    },
    {
      title: 'اكتشاف أثري جديد في منطقة الأهرامات بمصر',
      link: 'https://news.google.com/articles/CBMiUmh0dHBzOi8vd3d3LnNreW5ld3NhcmFiaWEuY29tL2N1bHR1cmUvMTY4MzU5MS3Yp9mD2KrYtNin2YEt2KPYq9ix2Yog2KzYr9mK2K8t2YHZii3Yp9mE2KPZh9ix2KfZhdin2Ko?hl=ar&gl=EG&ceid=EG%3Aar',
      description: 'أعلنت وزارة الآثار المصرية عن اكتشاف مقبرة أثرية جديدة تعود للأسرة الخامسة في منطقة الأهرامات بالجيزة تحتوي على كنوز ذهبية نادرة.',
      pubDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      source: 'Google News',
      imageUrl: 'https://picsum.photos/800/400?random=4'
    }
  ],
  'CNN Arabic': [
    {
      title: 'تطورات جديدة في المفاوضات بشأن وقف إطلاق النار في غزة',
      link: 'https://arabic.cnn.com/middle-east/article/2024/04/15/gaza-ceasefire-negotiations-developments',
      description: 'كشفت مصادر مطلعة عن تطورات جديدة في المفاوضات الجارية بشأن وقف إطلاق النار في قطاع غزة وتبادل الأسرى.',
      pubDate: new Date().toISOString(),
      source: 'CNN Arabic',
      imageUrl: 'https://picsum.photos/800/400?random=5'
    },
    {
      title: 'قمة عربية طارئة لبحث التطورات في المنطقة',
      link: 'https://arabic.cnn.com/middle-east/article/2024/04/14/arab-league-emergency-summit',
      description: 'دعت جامعة الدول العربية إلى عقد قمة طارئة لبحث التطورات المتسارعة في المنطقة وسبل التعامل مع التحديات الراهنة.',
      pubDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      source: 'CNN Arabic',
      imageUrl: 'https://picsum.photos/800/400?random=6'
    },
    {
      title: 'تقرير: الذكاء الاصطناعي سيغير مستقبل الرعاية الصحية في العالم العربي',
      link: 'https://arabic.cnn.com/tech/article/2024/04/14/ai-healthcare-arab-world-future',
      description: 'كشف تقرير حديث أن تقنيات الذكاء الاصطناعي ستحدث ثورة في مجال الرعاية الصحية في العالم العربي خلال السنوات الخمس القادمة.',
      pubDate: new Date(Date.now() - 64800000).toISOString(), // 18 hours ago
      source: 'CNN Arabic',
      imageUrl: 'https://picsum.photos/800/400?random=9'
    }
  ],
  'RT Arabic': [
    {
      title: 'اتفاقية تعاون اقتصادي جديدة بين دول مجلس التعاون الخليجي',
      link: 'https://arabic.rt.com/business/1581234-اتفاقية-تعاون-اقتصادي-جديدة-بين-دول-مجلس-التعاون-الخليجي/',
      description: 'وقعت دول مجلس التعاون الخليجي اتفاقية تعاون اقتصادي جديدة تهدف إلى تعزيز التكامل الاقتصادي وزيادة حجم التبادل التجاري بين الدول الأعضاء.',
      pubDate: new Date().toISOString(),
      source: 'RT Arabic',
      imageUrl: 'https://picsum.photos/800/400?random=7'
    },
    {
      title: 'روسيا والصين توقعان اتفاقية للتعاون في مجال الطاقة النووية',
      link: 'https://arabic.rt.com/russia/1581123-روسيا-والصين-توقعان-اتفاقية-للتعاون-في-مجال-الطاقة-النووية/',
      description: 'وقعت روسيا والصين اتفاقية استراتيجية للتعاون في مجال الطاقة النووية السلمية تشمل بناء مفاعلات نووية جديدة وتبادل الخبرات التقنية.',
      pubDate: new Date(Date.now() - 108000000).toISOString(), // 30 hours ago
      source: 'RT Arabic',
      imageUrl: 'https://picsum.photos/800/400?random=10'
    },
    {
      title: 'انطلاق فعاليات معرض موسكو الدولي للكتاب بمشاركة عربية واسعة',
      link: 'https://arabic.rt.com/russia/1580987-انطلاق-فعاليات-معرض-موسكو-الدولي-للكتاب-بمشاركة-عربية-واسعة/',
      description: 'انطلقت فعاليات معرض موسكو الدولي للكتاب بمشاركة أكثر من 30 دار نشر عربية من مختلف الدول العربية، وسط إقبال كبير من الجالية العربية في روسيا.',
      pubDate: new Date(Date.now() - 151200000).toISOString(), // 42 hours ago
      source: 'RT Arabic',
      imageUrl: 'https://picsum.photos/800/400?random=11'
    }
  ],
  'Google News Topics': [
    {
      title: 'إطلاق مشروع ضخم للطاقة المتجددة في المنطقة العربية',
      link: 'https://news.google.com/articles/CBMiWGh0dHBzOi8vd3d3LnNreW5ld3NhcmFiaWEuY29tL2J1c2luZXNzLzE2ODM1OTMt2YXYtNix2YjYuS3Yt9in2YLYqS3Yp9mE2YXYqtis2K_Yr9ipLdmB2Yot2KfZhNmF2YbYt9mC2Kkt2KfZhNi52LHYqNmK2Kk?hl=ar&gl=EG&ceid=EG%3Aar',
      description: 'أعلنت مجموعة من الدول العربية عن إطلاق مشروع ضخم للطاقة المتجددة يهدف إلى توليد 50 جيجاوات من الطاقة النظيفة بحلول عام 2030.',
      pubDate: new Date().toISOString(),
      source: 'Google News Topics',
      imageUrl: 'https://picsum.photos/800/400?random=8'
    },
    {
      title: 'الإعلان عن تنظيم بطولة كأس العالم للأندية في السعودية 2025',
      link: 'https://news.google.com/articles/CBMiVmh0dHBzOi8vd3d3LmFsYXJhYml5YS5uZXQvc3BvcnQvMjAyNC8wNC8xNS_Yp9mE2LPYudmI2K_ZitipLdiq2LPYqti22YrZgS3Zg9ij2LMt2KfZhNi52KfZhNmFLdmE2YTYo9mG2K_ZitipLTIwMjU?hl=ar&gl=EG&ceid=EG%3Aar',
      description: 'أعلن الاتحاد الدولي لكرة القدم (فيفا) عن اختيار المملكة العربية السعودية لاستضافة بطولة كأس العالم للأندية في نسختها الموسعة عام 2025.',
      pubDate: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
      source: 'Google News Topics',
      imageUrl: 'https://picsum.photos/800/400?random=12'
    },
    {
      title: 'إطلاق أول قمر صناعي عربي مشترك للاتصالات والإنترنت',
      link: 'https://news.google.com/articles/CBMiUWh0dHBzOi8vd3d3LnNreW5ld3NhcmFiaWEuY29tL3RlY2hub2xvZ3kvMTY4MzU5NC3Yp9mE2YLZhdixLdmE2YTYp9iq2LXYp9mE2KfYqi3Yp9mE2LnYsdio2Yo?hl=ar&gl=EG&ceid=EG%3Aar',
      description: 'أطلقت مجموعة من الدول العربية أول قمر صناعي مشترك للاتصالات والإنترنت بهدف تحسين خدمات الاتصالات وتغطية الإنترنت في المناطق النائية.',
      pubDate: new Date(Date.now() - 194400000).toISOString(), // 54 hours ago
      source: 'Google News Topics',
      imageUrl: 'https://picsum.photos/800/400?random=13'
    },
    {
      title: 'افتتاح أكبر متحف للفن العربي المعاصر في الدوحة',
      link: 'https://news.google.com/articles/CBMiTGh0dHBzOi8vd3d3LmFsYXJhYml5YS5uZXQvY3VsdHVyZS8yMDI0LzA0LzEzL9mF2KrYrdmBLdmE2YTZgdmGLdmB2Yot2KfZhNiv2YjYrdip?hl=ar&gl=EG&ceid=EG%3Aar',
      description: 'افتتحت دولة قطر أكبر متحف للفن العربي المعاصر في العاصمة الدوحة، ويضم المتحف أكثر من 8000 قطعة فنية لفنانين من مختلف أنحاء العالم العربي.',
      pubDate: new Date(Date.now() - 302400000).toISOString(), // 3.5 days ago
      source: 'Google News Topics',
      imageUrl: 'https://picsum.photos/800/400?random=14'
    }
  ],

  // Mock data for Libya news
  'Libya News': [
    {
      title: 'المجلس الرئاسي الليبي يدعو إلى حوار وطني شامل لحل الأزمة السياسية',
      link: 'https://alwasat.ly/news/libya/latest',
      description: 'دعا المجلس الرئاسي الليبي جميع الأطراف السياسية إلى المشاركة في حوار وطني شامل لحل الأزمة السياسية وتوحيد المؤسسات الليبية.',
      pubDate: new Date().toISOString(),
      source: 'Al Wasat Libya',
      imageUrl: 'https://picsum.photos/800/400?random=20'
    },
    {
      title: 'ارتفاع إنتاج النفط الليبي إلى 1.2 مليون برميل يومياً',
      link: 'https://almarsad.co/latest-news',
      description: 'أعلنت المؤسسة الوطنية للنفط في ليبيا عن ارتفاع إنتاج النفط إلى 1.2 مليون برميل يومياً بعد استئناف الإنتاج في عدد من الحقول النفطية.',
      pubDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      source: 'Al Marsad Libya',
      imageUrl: 'https://picsum.photos/800/400?random=21'
    },
    {
      title: 'افتتاح مطار بنينا الدولي في بنغازي بعد أعمال التطوير',
      link: 'https://eanlibya.com/latest-news',
      description: 'تم افتتاح مطار بنينا الدولي في مدينة بنغازي بعد الانتهاء من أعمال التطوير والتحديث التي استمرت لعدة أشهر.',
      pubDate: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
      source: 'Ean Libya',
      imageUrl: 'https://picsum.photos/800/400?random=22'
    },
    {
      title: 'توقيع اتفاقية تعاون اقتصادي بين ليبيا وتركيا',
      link: 'https://libyaalahrar.tv/latest-news',
      description: 'وقعت ليبيا وتركيا اتفاقية تعاون اقتصادي تشمل مجالات الطاقة والبنية التحتية والاستثمار، خلال زيارة رسمية للوفد الليبي إلى أنقرة.',
      pubDate: new Date(Date.now() - 129600000).toISOString(), // 36 hours ago
      source: 'Libya Alahrar',
      imageUrl: 'https://picsum.photos/800/400?random=23'
    },
    {
      title: 'انطلاق فعاليات معرض طرابلس الدولي للكتاب',
      link: 'https://www.afrigatenews.net/latest-news',
      description: 'انطلقت فعاليات معرض طرابلس الدولي للكتاب بمشاركة أكثر من 200 دار نشر من مختلف أنحاء العالم، وسط إقبال كبير من الزوار.',
      pubDate: new Date(Date.now() - 172800000).toISOString(), // 48 hours ago
      source: 'Afrigate News',
      imageUrl: 'https://picsum.photos/800/400?random=24'
    },
    {
      title: 'الأمم المتحدة تدعو إلى إجراء الانتخابات الليبية في موعدها',
      link: 'https://libyaherald.com/latest-news',
      description: 'دعت بعثة الأمم المتحدة للدعم في ليبيا جميع الأطراف الليبية إلى الالتزام بإجراء الانتخابات الرئاسية والبرلمانية في موعدها المقرر.',
      pubDate: new Date(Date.now() - 216000000).toISOString(), // 60 hours ago
      source: 'Libya Herald',
      imageUrl: 'https://picsum.photos/800/400?random=25'
    },
    {
      title: 'افتتاح خط بحري جديد بين ميناء مصراتة وميناء اسطنبول',
      link: 'https://libyaobserver.ly/latest-news',
      description: 'تم افتتاح خط بحري جديد بين ميناء مصراتة الليبي وميناء اسطنبول التركي، مما سيسهم في تعزيز التبادل التجاري بين البلدين.',
      pubDate: new Date(Date.now() - 259200000).toISOString(), // 72 hours ago
      source: 'Libya Observer',
      imageUrl: 'https://picsum.photos/800/400?random=26'
    },
    {
      title: 'إطلاق مشروع لتطوير البنية التحتية في مدينة سرت',
      link: 'https://libyanexpress.com/latest-news',
      description: 'أعلنت الحكومة الليبية عن إطلاق مشروع ضخم لتطوير البنية التحتية في مدينة سرت، يشمل إعادة تأهيل شبكات الكهرباء والمياه والطرق.',
      pubDate: new Date(Date.now() - 302400000).toISOString(), // 84 hours ago
      source: 'Libyan Express',
      imageUrl: 'https://picsum.photos/800/400?random=27'
    }
  ],
  'Snopes': [
    {
      title: 'تحقق: هل صحيح أن تناول الثوم يقي من الإصابة بفيروس كورونا؟',
      link: 'https://www.snopes.com',
      description: 'انتشرت ادعاءات على وسائل التواصل الاجتماعي تفيد بأن تناول الثوم يمكن أن يقي من الإصابة بفيروس كورونا. تحققنا من صحة هذه المعلومات.',
      pubDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      source: 'Snopes',
      imageUrl: 'https://picsum.photos/800/400?random=3'
    }
  ],
  'FactCheck.org': [
    {
      title: 'تحليل: الادعاءات حول تأثير اللقاحات على الخصوبة غير مدعومة علمياً',
      link: 'https://www.factcheck.org',
      description: 'قمنا بتحليل الادعاءات المنتشرة حول تأثير لقاحات كوفيد-19 على الخصوبة ووجدنا أنها غير مدعومة بأدلة علمية موثوقة.',
      pubDate: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      source: 'FactCheck.org',
      imageUrl: 'https://picsum.photos/800/400?random=4'
    }
  ]
};

/**
 * Ensure the link is a valid article URL and not just a homepage
 */
function ensureValidArticleLink(link: string, title: string, sourceName: string): string {
  // If link is empty or just '#', return a fallback
  if (!link || link === '#') {
    console.warn(`Empty link for article "${title}" from ${sourceName}`);

    // Return source-specific fallback
    switch (sourceName) {
      case 'BBC Arabic':
        return 'https://www.bbc.com/arabic';
      case 'CNN Arabic':
        return 'https://arabic.cnn.com';
      case 'RT Arabic':
        return 'https://arabic.rt.com';
      case 'Google News':
      case 'Google News - World':
      case 'Google News - Business':
      case 'Google News - Technology':
      case 'Google News - Sports':
      case 'Google News Topics':
        return 'https://news.google.com/?hl=ar';
      default:
        return 'https://news.google.com/?hl=ar';
    }
  }

  // Handle Google News links which need special processing
  if (link.includes('news.google.com/articles/')) {
    // Google News links need to be properly formatted
    // They come in format like: ./articles/CBMid...
    // We need to convert them to: https://news.google.com/articles/CBMid...
    if (link.startsWith('./')) {
      return `https://news.google.com${link.substring(1)}`;
    }

    // If it's already a full URL but missing https:
    if (link.startsWith('//')) {
      return `https:${link}`;
    }

    // If it's a relative URL without ./
    if (link.startsWith('articles/')) {
      return `https://news.google.com/${link}`;
    }
  }

  // Handle BBC Arabic links
  if (sourceName === 'BBC Arabic' && !link.includes('/arabic/')) {
    // If it's a BBC link but missing the Arabic path
    if (link.includes('bbc.com') || link.includes('bbc.co.uk')) {
      return `https://www.bbc.com/arabic/articles/${title.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}`;
    }
  }

  // Handle CNN Arabic links
  if (sourceName === 'CNN Arabic' && !link.includes('arabic.cnn.com')) {
    return `https://arabic.cnn.com/article/${title.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}`;
  }

  // Handle RT Arabic links
  if (sourceName === 'RT Arabic' && !link.includes('arabic.rt.com')) {
    return `https://arabic.rt.com/middle_east/${title.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}`;
  }

  // Ensure the link has a protocol
  if (!link.startsWith('http://') && !link.startsWith('https://')) {
    // If it starts with //, add https:
    if (link.startsWith('//')) {
      return `https:${link}`;
    }

    // If it's a relative URL, add the base URL based on the source
    if (link.startsWith('/')) {
      switch (sourceName) {
        case 'BBC Arabic':
          return `https://www.bbc.com${link}`;
        case 'CNN Arabic':
          return `https://arabic.cnn.com${link}`;
        case 'RT Arabic':
          return `https://arabic.rt.com${link}`;
        case 'Google News':
        case 'Google News - World':
        case 'Google News - Business':
        case 'Google News - Technology':
        case 'Google News - Sports':
        case 'Google News Topics':
          return `https://news.google.com${link}`;
        default:
          return `https://news.google.com${link}`;
      }
    }

    // If it doesn't start with /, add https:// and the appropriate domain
    switch (sourceName) {
      case 'BBC Arabic':
        return `https://www.bbc.com/arabic/${link}`;
      case 'CNN Arabic':
        return `https://arabic.cnn.com/${link}`;
      case 'RT Arabic':
        return `https://arabic.rt.com/${link}`;
      case 'Google News':
      case 'Google News - World':
      case 'Google News - Business':
      case 'Google News - Technology':
      case 'Google News - Sports':
      case 'Google News Topics':
        return `https://news.google.com/${link}`;
      default:
        return `https://${link}`;
    }
  }

  return link;
}

/**
 * Parse XML RSS feed to JSON
 */
function parseRssFeed(xmlText: string, sourceName: string): RssItem[] {
  try {
    // Validate that we have XML content
    if (!xmlText || typeof xmlText !== 'string' || xmlText.trim() === '') {
      console.warn(`Empty XML content from ${sourceName}`);
      return MOCK_RSS_ITEMS[sourceName] || [];
    }

    // Check if the response is actually JSON (some feeds might return JSON)
    if (xmlText.trim().startsWith('{') || xmlText.trim().startsWith('[')) {
      console.warn(`Received JSON instead of XML from ${sourceName}, attempting to parse`);
      try {
        const jsonData = JSON.parse(xmlText);
        // Try to extract items from common JSON feed formats
        if (jsonData.items || jsonData.entries || jsonData.articles) {
          const items = jsonData.items || jsonData.entries || jsonData.articles || [];
          return items.map((item: any) => ({
            title: item.title || 'No title',
            link: item.link || item.url || '#',
            description: item.description || item.summary || item.content || 'No description',
            pubDate: item.pubDate || item.published || item.date || new Date().toISOString(),
            source: sourceName,
            imageUrl: item.imageUrl || item.image || undefined
          }));
        }
      } catch (jsonError) {
        console.error(`Failed to parse JSON response from ${sourceName}:`, jsonError);
      }
    }

    // Parse as XML
    let xmlDoc;
    try {
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.warn(`XML parsing error from ${sourceName}:`, parserError.textContent);
        return MOCK_RSS_ITEMS[sourceName] || [];
      }
    } catch (parseError) {
      console.error(`Failed to parse XML from ${sourceName}:`, parseError);
      return MOCK_RSS_ITEMS[sourceName] || [];
    }

    // Try to find items in different formats (RSS, Atom, etc.)
    let items = xmlDoc.querySelectorAll('item'); // RSS format

    // If no items found, try Atom format
    if (items.length === 0) {
      items = xmlDoc.querySelectorAll('entry'); // Atom format
    }

    // If still no items, check for channel > item structure
    if (items.length === 0) {
      const channel = xmlDoc.querySelector('channel');
      if (channel) {
        items = channel.querySelectorAll('item');
      }
    }

    if (items.length === 0) {
      console.warn(`No items found in RSS feed from ${sourceName}`);
      return MOCK_RSS_ITEMS[sourceName] || [];
    }

    return Array.from(items).map(item => {
      // Extract image URL if available
      let imageUrl: string | undefined;

      // Try media:content
      const mediaContent = item.querySelector('media\\:content, content');
      if (mediaContent) {
        imageUrl = mediaContent.getAttribute('url') || undefined;
      }

      // If no media:content, try enclosure
      if (!imageUrl) {
        const enclosure = item.querySelector('enclosure');
        if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
          imageUrl = enclosure.getAttribute('url') || undefined;
        }
      }

      // If still no image, try to find an image in the description
      if (!imageUrl) {
        const description = item.querySelector('description')?.textContent || '';
        const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }

      // Try different element names for each property (RSS vs Atom)
      const title =
        item.querySelector('title')?.textContent ||
        'No title';

      const link =
        item.querySelector('link')?.textContent ||
        item.querySelector('link')?.getAttribute('href') ||
        '#';

      const description =
        item.querySelector('description')?.textContent ||
        item.querySelector('summary')?.textContent ||
        item.querySelector('content')?.textContent ||
        'No description';

      const pubDate =
        item.querySelector('pubDate')?.textContent ||
        item.querySelector('published')?.textContent ||
        item.querySelector('updated')?.textContent ||
        new Date().toISOString();

      // Ensure the link is valid and points to the actual article
      const validLink = ensureValidArticleLink(link, title, sourceName);

      return {
        title,
        link: validLink,
        description,
        pubDate,
        source: sourceName,
        imageUrl
      };
    });
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return MOCK_RSS_ITEMS[sourceName] || [];
  }
}

/**
 * Fetch and parse an RSS feed with fallback to mock data
 */
async function fetchRssFeed(url: string, sourceName: string): Promise<RssItem[]> {
  // Use our own API route as a proxy for RSS feeds
  const rssProxyUrl = `/api/rss-proxy?url=${encodeURIComponent(url)}`;

  // We'll use a simple fetch without AbortController to avoid signal issues
  try {
    console.log(`Fetching RSS feed from ${sourceName} via proxy...`);

    // Add a random query parameter to avoid caching issues
    const cacheBuster = `&_=${Date.now()}`;

    // Simple fetch with cache control
    const response = await fetch(`${rssProxyUrl}${cacheBuster}`, {
      // Use no-cache to avoid getting stale data
      cache: 'no-cache',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      console.warn(`Failed to fetch RSS feed from ${sourceName}: ${response.status}`);

      // If we get a 403, 429, or 500 error, try an alternative approach
      if (response.status === 403 || response.status === 429 || response.status === 500) {
        console.log(`Trying alternative approach for ${sourceName}...`);

        // For certain sources, we can try direct Google News search as a fallback
        try {
          // Make sure we can extract a hostname from the URL
          let hostname = '';
          try {
            hostname = new URL(url).hostname;
          } catch (urlError) {
            // If URL parsing fails, try to extract domain from the URL string
            const domainMatch = url.match(/https?:\/\/([^\/]+)/);
            if (domainMatch && domainMatch[1]) {
              hostname = domainMatch[1];
            } else {
              // If we can't extract a domain, use a fallback
              console.warn(`Could not extract hostname from URL: ${url}`);
              hostname = url.replace(/https?:\/\//, '').split('/')[0];
            }
          }

          if (hostname) {
            const googleNewsUrl = `/api/rss-proxy?url=${encodeURIComponent(`https://news.google.com/rss/search?q=site:${hostname}&hl=ar&gl=EG&ceid=EG:ar`)}`;

            const googleResponse = await fetch(googleNewsUrl, {
              cache: 'no-cache',
              headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
              }
            });

            if (googleResponse.ok) {
              const googleXmlText = await googleResponse.text();
              if (googleXmlText && googleXmlText.trim() !== '') {
                const googleParsedItems = parseRssFeed(googleXmlText, sourceName);
                if (googleParsedItems.length > 0) {
                  console.log(`Successfully fetched and parsed ${googleParsedItems.length} items from Google News for ${sourceName}`);
                  return googleParsedItems;
                }
              }
            }
          }
        } catch (googleError) {
          console.error(`Error fetching Google News for ${sourceName}:`, googleError);
        }

        // If Google News fallback fails, try using mock data
        console.log(`Fallback to Google News failed for ${sourceName}, using mock data`);
        return MOCK_RSS_ITEMS[sourceName] || [];
      }

      // For other error codes, throw an error
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    const xmlText = await response.text();

    // Check if we got a valid XML response
    if (!xmlText || xmlText.trim() === '') {
      console.warn(`Empty response from ${sourceName}`);
      // Instead of throwing an error, return mock data
      console.log(`Using mock data for ${sourceName} due to empty response`);
      return MOCK_RSS_ITEMS[sourceName] || [];
    }

    const parsedItems = parseRssFeed(xmlText, sourceName);

    // If parsing returned no items, use mock data
    if (parsedItems.length === 0) {
      console.log(`No items parsed from ${sourceName}, using mock data`);
      return MOCK_RSS_ITEMS[sourceName] || [];
    }

    console.log(`Successfully fetched and parsed ${parsedItems.length} items from ${sourceName}`);
    return parsedItems;
  } catch (error) {
    // Log the error but don't let it crash the app
    console.error(`Error fetching RSS feed from ${sourceName}:`, error);
    console.log(`Using mock data for ${sourceName}`);

    // Return mock data as fallback
    return MOCK_RSS_ITEMS[sourceName] || [];
  }
}

/**
 * Major Arabic News Networks
 */
export async function fetchBBCArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.bbcArabic, 'BBC Arabic');
}

export async function fetchBBCArabicMiddleEastNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.bbcArabicMiddleEast, 'BBC Arabic Middle East');
}

export async function fetchCNNArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.cnnArabic, 'CNN Arabic');
}

export async function fetchAlJazeeraNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alJazeera, 'Al Jazeera');
}

/**
 * Fetch breaking news from Al Jazeera Mubasher
 * This is a high priority source for trending news
 */
export async function fetchAlJazeeraMubasherNews(): Promise<RssItem[]> {
  const items = await fetchRssFeed(RSS_FEEDS.alJazeeraMubasher, 'Al Jazeera Mubasher');

  // Filter for breaking news keywords and mark these items as breaking news
  const breakingNewsKeywords = ['عاجل', 'مباشر', 'الآن', 'تطورات', 'خبر عاجل', 'آخر الأخبار', 'تحديث'];

  return items
    .filter(item => {
      // Check if title contains any breaking news keywords
      return breakingNewsKeywords.some(keyword =>
        item.title.includes(keyword) ||
        (item.description && item.description.includes(keyword))
      );
    })
    .map(item => ({
      ...item,
      isBreakingNews: true,
      source: 'الجزيرة مباشر'
    }));
}

/**
 * Fetch breaking news from Al Jazeera Live
 * This is a high priority source for trending news
 */
export async function fetchAlJazeeraLiveNews(): Promise<RssItem[]> {
  const items = await fetchRssFeed(RSS_FEEDS.alJazeeraLive, 'Al Jazeera Live');

  // Filter for breaking news keywords and mark these items as breaking news
  const breakingNewsKeywords = ['عاجل', 'مباشر', 'الآن', 'تطورات', 'خبر عاجل', 'آخر الأخبار', 'تحديث', 'بث مباشر'];

  return items
    .filter(item => {
      // Check if title contains any breaking news keywords
      return breakingNewsKeywords.some(keyword =>
        item.title.includes(keyword) ||
        (item.description && item.description.includes(keyword))
      );
    })
    .map(item => ({
      ...item,
      isBreakingNews: true,
      source: 'الجزيرة بث مباشر'
    }));
}

/**
 * Fetch breaking news from Saudi Press Agency
 */
export async function fetchSPABreakingNews(): Promise<RssItem[]> {
  const items = await fetchRssFeed(RSS_FEEDS.spaBreaking, 'SPA Breaking');

  // Filter for breaking news keywords and mark these items as breaking news
  const breakingNewsKeywords = ['عاجل', 'مباشر', 'الآن', 'تطورات', 'خبر عاجل', 'آخر الأخبار', 'تحديث'];

  return items
    .filter(item => {
      // Check if title contains any breaking news keywords
      return breakingNewsKeywords.some(keyword =>
        item.title.includes(keyword) ||
        (item.description && item.description.includes(keyword))
      );
    })
    .map(item => ({
      ...item,
      isBreakingNews: true,
      source: 'واس عاجل'
    }));
}

/**
 * Fetch breaking news from Emirates News Agency
 */
export async function fetchWAMBreakingNews(): Promise<RssItem[]> {
  const items = await fetchRssFeed(RSS_FEEDS.wamBreaking, 'WAM Breaking');

  // Filter for breaking news keywords and mark these items as breaking news
  const breakingNewsKeywords = ['عاجل', 'مباشر', 'الآن', 'تطورات', 'خبر عاجل', 'آخر الأخبار', 'تحديث'];

  return items
    .filter(item => {
      // Check if title contains any breaking news keywords
      return breakingNewsKeywords.some(keyword =>
        item.title.includes(keyword) ||
        (item.description && item.description.includes(keyword))
      );
    })
    .map(item => ({
      ...item,
      isBreakingNews: true,
      source: 'وام عاجل'
    }));
}

/**
 * Fetch breaking news from Kuwait News Agency
 */
export async function fetchKUNABreakingNews(): Promise<RssItem[]> {
  const items = await fetchRssFeed(RSS_FEEDS.kunaBreaking, 'KUNA Breaking');

  // Filter for breaking news keywords and mark these items as breaking news
  const breakingNewsKeywords = ['عاجل', 'مباشر', 'الآن', 'تطورات', 'خبر عاجل', 'آخر الأخبار', 'تحديث'];

  return items
    .filter(item => {
      // Check if title contains any breaking news keywords
      return breakingNewsKeywords.some(keyword =>
        item.title.includes(keyword) ||
        (item.description && item.description.includes(keyword))
      );
    })
    .map(item => ({
      ...item,
      isBreakingNews: true,
      source: 'كونا عاجل'
    }));
}

/**
 * Fetch breaking news from Qatar News Agency
 */
export async function fetchQNABreakingNews(): Promise<RssItem[]> {
  const items = await fetchRssFeed(RSS_FEEDS.qnaBreaking, 'QNA Breaking');

  // Filter for breaking news keywords and mark these items as breaking news
  const breakingNewsKeywords = ['عاجل', 'مباشر', 'الآن', 'تطورات', 'خبر عاجل', 'آخر الأخبار', 'تحديث'];

  return items
    .filter(item => {
      // Check if title contains any breaking news keywords
      return breakingNewsKeywords.some(keyword =>
        item.title.includes(keyword) ||
        (item.description && item.description.includes(keyword))
      );
    })
    .map(item => ({
      ...item,
      isBreakingNews: true,
      source: 'قنا عاجل'
    }));
}

/**
 * Fetch breaking news from Libya News Agency
 */
export async function fetchLANABreakingNews(): Promise<RssItem[]> {
  const items = await fetchRssFeed(RSS_FEEDS.lanaBreaking, 'LANA Breaking');

  // Filter for breaking news keywords and mark these items as breaking news
  const breakingNewsKeywords = ['عاجل', 'مباشر', 'الآن', 'تطورات', 'خبر عاجل', 'آخر الأخبار', 'تحديث'];

  return items
    .filter(item => {
      // Check if title contains any breaking news keywords
      return breakingNewsKeywords.some(keyword =>
        item.title.includes(keyword) ||
        (item.description && item.description.includes(keyword))
      );
    })
    .map(item => ({
      ...item,
      isBreakingNews: true,
      source: 'وكالة الأنباء الليبية عاجل'
    }));
}

/**
 * Fetch breaking news from Al Wasat Libya
 */
export async function fetchAlWasatBreakingNews(): Promise<RssItem[]> {
  const items = await fetchRssFeed(RSS_FEEDS.alwasatBreaking, 'Al Wasat Breaking');

  // Filter for breaking news keywords and mark these items as breaking news
  const breakingNewsKeywords = ['عاجل', 'مباشر', 'الآن', 'تطورات', 'خبر عاجل', 'آخر الأخبار', 'تحديث'];

  return items
    .filter(item => {
      // Check if title contains any breaking news keywords
      return breakingNewsKeywords.some(keyword =>
        item.title.includes(keyword) ||
        (item.description && item.description.includes(keyword))
      );
    })
    .map(item => ({
      ...item,
      isBreakingNews: true,
      source: 'بوابة الوسط عاجل'
    }));
}

/**
 * Fetch breaking news from Al Marsad Libya
 */
export async function fetchAlMarsadBreakingNews(): Promise<RssItem[]> {
  const items = await fetchRssFeed(RSS_FEEDS.almarsadBreaking, 'Al Marsad Breaking');

  // Filter for breaking news keywords and mark these items as breaking news
  const breakingNewsKeywords = ['عاجل', 'مباشر', 'الآن', 'تطورات', 'خبر عاجل', 'آخر الأخبار', 'تحديث'];

  return items
    .filter(item => {
      // Check if title contains any breaking news keywords
      return breakingNewsKeywords.some(keyword =>
        item.title.includes(keyword) ||
        (item.description && item.description.includes(keyword))
      );
    })
    .map(item => ({
      ...item,
      isBreakingNews: true,
      source: 'المرصد الليبي عاجل'
    }));
}

export async function fetchAlarabiyaNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alarabiya, 'Al Arabiya');
}

/**
 * Fetch breaking news from Al Arabiya
 * Using Google News as a fallback since direct RSS feed is not available
 */
export async function fetchAlArabiyaBreakingNews(): Promise<RssItem[]> {
  const items = await fetchRssFeed(RSS_FEEDS.alArabiyaBreaking, 'Al Arabiya Breaking');

  // Filter for breaking news keywords and mark these items as breaking news
  const breakingNewsKeywords = ['عاجل', 'مباشر', 'الآن', 'تطورات', 'خبر عاجل', 'آخر الأخبار', 'تحديث'];

  return items
    .filter(item => {
      // Check if title contains any breaking news keywords
      return breakingNewsKeywords.some(keyword =>
        item.title.includes(keyword) ||
        (item.description && item.description.includes(keyword))
      );
    })
    .map(item => ({
      ...item,
      isBreakingNews: true,
      source: 'العربية عاجل'
    }));
}

export async function fetchRTArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.rtArabic, 'RT Arabic');
}

export async function fetchFrance24ArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.france24Arabic, 'France 24 Arabic');
}

export async function fetchDWArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.dwArabic, 'DW Arabic');
}

export async function fetchSkyNewsArabiaNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.skynewsArabia, 'Sky News Arabia');
}

/**
 * Arabic Newspapers
 */
export async function fetchAsharqAlawsatNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.asharqAlawsat, 'Asharq Al-Awsat');
}

export async function fetchAlKhaleejNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alKhaleej, 'Al Khaleej');
}

export async function fetchAlBayanNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alBayan, 'Al Bayan');
}

export async function fetchAlIttihadNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alIttihad, 'Al Ittihad');
}

export async function fetchAlRiyadhNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alRiyadh, 'Al Riyadh');
}

export async function fetchAlWatanNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alWatan, 'Al Watan');
}

export async function fetchAlAhramNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alAhram, 'Al Ahram');
}

/**
 * Official News Agencies
 */
export async function fetchSPAArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.spaArabic, 'Saudi Press Agency');
}

export async function fetchWAMArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.wamArabic, 'Emirates News Agency');
}

export async function fetchKUNAArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.kunaArabic, 'Kuwait News Agency');
}

export async function fetchPETRAArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.petraArabic, 'Jordan News Agency');
}

export async function fetchMAPArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.mapArabic, 'Maghreb Arab Press');
}

export async function fetchQNAArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.qnaArabic, 'Qatar News Agency');
}

/**
 * Google News Aggregators
 */
export async function fetchGoogleNewsArabic(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.googleNewsArabic, 'Google News');
}

export async function fetchGoogleNewsArabicWorld(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.googleNewsArabicWorld, 'Google News - World');
}

export async function fetchGoogleNewsArabicBusiness(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.googleNewsArabicBusiness, 'Google News - Business');
}

export async function fetchGoogleNewsArabicTech(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.googleNewsArabicTech, 'Google News - Technology');
}

export async function fetchGoogleNewsArabicSports(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.googleNewsArabicSports, 'Google News - Sports');
}

/**
 * Specialized Arabic News
 */
export async function fetchCNBCArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.cnbcArabic, 'CNBC Arabic');
}

export async function fetchKoooraNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.kooora, 'Kooora');
}

export async function fetchFilGoalNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.filGoal, 'FilGoal');
}

export async function fetchYallaKoraNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.yallaKora, 'Yalla Kora');
}

export async function fetchAITNewsNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.aitNews, 'AIT News');
}

/**
 * Additional reliable Arabic sources
 */
export async function fetchAlArabNewspaperNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alArabNewspaper, 'Al Arab Newspaper');
}

export async function fetchAlQudsAlArabiNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alQudsAlArabi, 'Al Quds Al Arabi');
}

export async function fetchAlMasryAlYoumNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alMasryAlYoum, 'Al Masry Al Youm');
}

export async function fetchAlHayatNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alHayat, 'Al Hayat');
}

/**
 * Libya News Sources - Arabic
 */
export async function fetchAlWasatLibyaNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alWasatLibya, 'Al Wasat Libya');
}

export async function fetchAlMarsadLibyaNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.alMarsadLibya, 'Al Marsad Libya');
}

export async function fetchEanLibyaNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.eanLibya, 'Ean Libya');
}

export async function fetchLibyaAlahrarNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.libyaAlahrar, 'Libya Alahrar');
}

export async function fetchAfrigateNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.afrigateNews, 'Afrigate News');
}

export async function fetchFebrairNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.febrairNews, 'Febrair News');
}

export async function fetchBarniqNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.barniqNews, 'Barniq News');
}

export async function fetchLibyaPanoramaNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.libyaPanorama, 'Libya Panorama');
}

export async function fetchLibyaAlSalamNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.libyaAlSalam, 'Libya Al Salam');
}

export async function fetchNewLibyaNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.newLibya, 'New Libya');
}

export async function fetchTanasuhTVNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.tanasuhTV, 'Tanasuh TV');
}

/**
 * Additional Libya News Sources - Arabic
 */
export async function fetchLibyaNewsAgencyNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.libyaNewsAgency, 'Libya News Agency');
}

export async function fetchLibya24News(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.libya24, 'Libya 24');
}

export async function fetchLibyaAkhbarNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.libyaAkhbar, 'Libya Akhbar');
}

export async function fetchAddressLibyaNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.addressLibya, 'Address Libya');
}

/**
 * Libya News Sources - English
 */
export async function fetchLibyaHeraldNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.libyaHerald, 'Libya Herald');
}

export async function fetchLibyaObserverNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.libyaObserver, 'Libya Observer');
}

export async function fetchLibyanExpressNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.libyanExpress, 'Libyan Express');
}

/**
 * Fetch all Libya news sources and combine them
 */
export async function fetchAllLibyaNews(): Promise<RssItem[]> {
  try {
    console.log('Fetching news from all Libya sources...');

    // Group 1: Most reliable Libya news sources (Arabic)
    const reliableArabicResults = await Promise.allSettled([
      fetchAlWasatLibyaNews(),
      fetchAlMarsadLibyaNews(),
      fetchEanLibyaNews(),
      fetchLibyaAlahrarNews(),
      fetchAfrigateNews(),
      fetchLibyaNewsAgencyNews(),
      fetchLibya24News()
    ]);

    // Group 2: Most reliable Libya news sources (English)
    const reliableEnglishResults = await Promise.allSettled([
      fetchLibyaHeraldNews(),
      fetchLibyaObserverNews(),
      fetchLibyanExpressNews()
    ]);

    // Group 3: Additional Libya news sources
    const additionalResults = await Promise.allSettled([
      fetchFebrairNews(),
      fetchBarniqNews(),
      fetchLibyaPanoramaNews(),
      fetchLibyaAlSalamNews(),
      fetchNewLibyaNews(),
      fetchTanasuhTVNews(),
      fetchLibyaAkhbarNews(),
      fetchAddressLibyaNews()
    ]);

    // Combine all successful results
    let allNews: RssItem[] = [];
    let successfulSources = 0;

    // Process reliable Arabic results
    const reliableArabicSources = [
      'Al Wasat Libya', 'Al Marsad Libya', 'Ean Libya',
      'Libya Alahrar', 'Afrigate News', 'Libya News Agency', 'Libya 24'
    ];

    reliableArabicResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allNews = [...allNews, ...result.value];
        successfulSources++;
        console.log(`Successfully fetched ${result.value.length} items from ${reliableArabicSources[index]}`);
      } else if (result.status === 'rejected') {
        console.error(`Failed to fetch from ${reliableArabicSources[index]}: ${result.reason}`);
      } else if (result.value.length === 0) {
        console.warn(`No items fetched from ${reliableArabicSources[index]}`);
      }
    });

    // Process reliable English results
    const reliableEnglishSources = [
      'Libya Herald', 'Libya Observer', 'Libyan Express'
    ];

    reliableEnglishResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allNews = [...allNews, ...result.value];
        successfulSources++;
        console.log(`Successfully fetched ${result.value.length} items from ${reliableEnglishSources[index]}`);
      } else if (result.status === 'rejected') {
        console.error(`Failed to fetch from ${reliableEnglishSources[index]}: ${result.reason}`);
      } else if (result.value.length === 0) {
        console.warn(`No items fetched from ${reliableEnglishSources[index]}`);
      }
    });

    // Process additional results
    const additionalSources = [
      'Febrair News', 'Barniq News', 'Libya Panorama',
      'Libya Al Salam', 'New Libya', 'Tanasuh TV',
      'Libya Akhbar', 'Address Libya'
    ];

    additionalResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allNews = [...allNews, ...result.value];
        successfulSources++;
        console.log(`Successfully fetched ${result.value.length} items from ${additionalSources[index]}`);
      } else if (result.status === 'rejected') {
        console.error(`Failed to fetch from ${additionalSources[index]}: ${result.reason}`);
      } else if (result.value.length === 0) {
        console.warn(`No items fetched from ${additionalSources[index]}`);
      }
    });

    console.log(`Successfully fetched news from ${successfulSources} out of 18 Libya sources`);

    // Remove duplicate news items based on title similarity
    const uniqueNews: RssItem[] = [];
    const seenTitles = new Set<string>();

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

    // Helper function to check if a title is similar to any seen title
    const isSimilarToExisting = (title: string): boolean => {
      const normalizedTitle = normalizeArabicText(title);

      // If the title is too short, don't consider it for similarity check
      if (normalizedTitle.length < 10) return false;

      for (const seenTitle of seenTitles) {
        // Calculate similarity using substring check
        if (seenTitle.includes(normalizedTitle) || normalizedTitle.includes(seenTitle)) {
          console.log(`Found similar titles: "${title}" is similar to a previously seen title`);
          return true;
        }

        // Check for keyword similarity - if both titles contain the same important keywords
        const keywords = ['ليبيا', 'طرابلس', 'بنغازي', 'مصراتة', 'الدبيبة', 'حفتر', 'النفط'];
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

    // Filter out duplicates
    for (const item of allNews) {
      const normalizedTitle = normalizeArabicText(item.title);

      if (!isSimilarToExisting(item.title)) {
        uniqueNews.push(item);
        seenTitles.add(normalizedTitle);
      } else {
        console.log(`Filtered out duplicate news item: ${item.title}`);
      }
    }

    console.log(`Removed ${allNews.length - uniqueNews.length} duplicate news items`);

    // Sort by date (newest first) and limit to 15 items
    const sortedNews = uniqueNews
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 15);

    console.log(`Returning ${sortedNews.length} sorted unique Libya news items`);
    return sortedNews;
  } catch (error) {
    console.error('Error fetching combined Libya news:', error);

    // Return Libya mock data as fallback
    const mockNews = MOCK_RSS_ITEMS['Libya News'] || [];
    return mockNews;
  }
}

/**
 * Fact-checking sources
 */
export async function fetchSnopesFactChecks(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.snopes, 'Snopes');
}

export async function fetchFactCheckOrgChecks(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.factCheckOrg, 'FactCheck.org');
}

/**
 * Fetch all news sources and combine them
 */
export async function fetchAllNews(): Promise<RssItem[]> {
  try {
    console.log('Fetching news from all Arabic sources...');

    // Group 0: Breaking News sources - prioritize these for trending news
    const breakingNewsResults = await Promise.allSettled([
      // Major Arabic News Networks Breaking News
      fetchAlJazeeraMubasherNews(),
      fetchAlJazeeraLiveNews(),
      fetchAlArabiyaBreakingNews(),

      // Official News Agencies Breaking News
      fetchSPABreakingNews(),
      fetchWAMBreakingNews(),
      fetchKUNABreakingNews(),
      fetchQNABreakingNews(),

      // Libya News Agencies Breaking News
      fetchLANABreakingNews(),
      fetchAlWasatBreakingNews(),
      fetchAlMarsadBreakingNews()
    ]);

    // Group 1: Most reliable sources first (BBC, CNN, RT, DW, France24, Google News)
    // These sources rarely have CORS/403 issues
    const mostReliableResults = await Promise.allSettled([
      fetchBBCArabicNews(),
      fetchBBCArabicMiddleEastNews(),
      fetchCNNArabicNews(),
      fetchRTArabicNews(),
      fetchDWArabicNews(),
      fetchFrance24ArabicNews(),
      fetchGoogleNewsArabic(),
      fetchGoogleNewsArabicWorld()
    ]);

    // Group 2: Sources that might have CORS/403 issues but are important
    // We have fallbacks for these in the proxy
    const importantSourcesResults = await Promise.allSettled([
      fetchAlJazeeraNews(),
      fetchAlarabiyaNews(),
      fetchSkyNewsArabiaNews(),
      fetchAsharqAlawsatNews(),
      // Added new reliable sources
      fetchAlArabNewspaperNews(),
      fetchAlQudsAlArabiNews()
    ]);

    // Group 3: Additional sources for more diversity
    const additionalSourcesResults = await Promise.allSettled([
      fetchGoogleNewsArabicBusiness(),
      fetchGoogleNewsArabicTech(),
      fetchGoogleNewsArabicSports(),
      fetchCNBCArabicNews(),
      fetchKoooraNews(),
      fetchAlMasryAlYoumNews(),
      fetchAlHayatNews()
    ]);

    // Combine all successful results
    let allNews: RssItem[] = [];
    let successfulSources = 0;

    // Process Breaking News results first
    const breakingNewsSources = [
      // Major Arabic News Networks Breaking News
      'Al Jazeera Mubasher', 'Al Jazeera Live', 'Al Arabiya Breaking',

      // Official News Agencies Breaking News
      'SPA Breaking', 'WAM Breaking', 'KUNA Breaking', 'QNA Breaking',

      // Libya News Agencies Breaking News
      'LANA Breaking', 'Al Wasat Breaking', 'Al Marsad Breaking'
    ];

    breakingNewsResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        // Add breaking news with higher priority (add a flag to identify them)
        const breakingNews = result.value.map(item => ({
          ...item,
          isBreakingNews: true // Add a flag to identify breaking news
        }));
        allNews = [...allNews, ...breakingNews];
        successfulSources++;
        console.log(`Successfully fetched ${result.value.length} BREAKING NEWS items from ${breakingNewsSources[index]}`);
      } else if (result.status === 'rejected') {
        console.error(`Failed to fetch BREAKING NEWS from ${breakingNewsSources[index]}: ${result.reason}`);
      } else if (result.value.length === 0) {
        console.warn(`No BREAKING NEWS items fetched from ${breakingNewsSources[index]}`);
      }
    });

    // Process Most Reliable results
    const mostReliableSources = [
      'BBC Arabic', 'BBC Arabic Middle East', 'CNN Arabic', 'RT Arabic',
      'DW Arabic', 'France 24 Arabic', 'Google News', 'Google News - World'
    ];

    mostReliableResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allNews = [...allNews, ...result.value];
        successfulSources++;
        console.log(`Successfully fetched ${result.value.length} items from ${mostReliableSources[index]}`);
      } else if (result.status === 'rejected') {
        console.error(`Failed to fetch from ${mostReliableSources[index]}: ${result.reason}`);
      } else if (result.value.length === 0) {
        console.warn(`No items fetched from ${mostReliableSources[index]}`);
      }
    });

    // Process Important Sources results
    const importantSources = [
      'Al Jazeera', 'Al Arabiya', 'Sky News Arabia',
      'Asharq Al-Awsat', 'Al Arab Newspaper', 'Al Quds Al Arabi'
    ];

    importantSourcesResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allNews = [...allNews, ...result.value];
        successfulSources++;
        console.log(`Successfully fetched ${result.value.length} items from ${importantSources[index]}`);
      } else if (result.status === 'rejected') {
        console.error(`Failed to fetch from ${importantSources[index]}: ${result.reason}`);
      } else if (result.value.length === 0) {
        console.warn(`No items fetched from ${importantSources[index]}`);
      }
    });

    // Process Additional Sources results
    const additionalSources = [
      'Google News - Business', 'Google News - Technology',
      'Google News - Sports', 'CNBC Arabic', 'Kooora',
      'Al Masry Al Youm', 'Al Hayat'
    ];

    additionalSourcesResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allNews = [...allNews, ...result.value];
        successfulSources++;
        console.log(`Successfully fetched ${result.value.length} items from ${additionalSources[index]}`);
      } else if (result.status === 'rejected') {
        console.error(`Failed to fetch from ${additionalSources[index]}: ${result.reason}`);
      } else if (result.value.length === 0) {
        console.warn(`No items fetched from ${additionalSources[index]}`);
      }
    });

    console.log(`Successfully fetched news from ${successfulSources} out of 20 sources`);

    // If we have less than 3 successful sources, try fetching from additional sources
    if (successfulSources < 3) {
      console.log('Trying backup sources...');

      const backupResults = await Promise.allSettled([
        // Official News Agencies
        fetchSPAArabicNews(),
        fetchWAMArabicNews(),
        fetchQNAArabicNews(),
        fetchKUNAArabicNews(),
        fetchPETRAArabicNews(),

        // Additional Newspapers
        fetchAlKhaleejNews(),
        fetchAlBayanNews(),
        fetchAlIttihadNews(),
        fetchAlRiyadhNews(),
        fetchAlWatanNews(),

        // Specialized Sources
        fetchFilGoalNews(),
        fetchYallaKoraNews(),
        fetchAITNewsNews()
      ]);

      const backupSources = [
        'Saudi Press Agency', 'Emirates News Agency', 'Qatar News Agency',
        'Kuwait News Agency', 'Jordan News Agency',
        'Al Khaleej', 'Al Bayan', 'Al Ittihad', 'Al Riyadh', 'Al Watan',
        'FilGoal', 'Yalla Kora', 'AIT News'
      ];

      backupResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          allNews = [...allNews, ...result.value];
          successfulSources++;
          console.log(`Successfully fetched ${result.value.length} items from backup source ${backupSources[index]}`);
        } else if (result.status === 'rejected') {
          console.error(`Failed to fetch from backup source ${backupSources[index]}: ${result.reason}`);
        } else if (result.value.length === 0) {
          console.warn(`No items fetched from backup source ${backupSources[index]}`);
        }
      });
    }

    // Remove duplicate news items based on title similarity
    const uniqueNews: RssItem[] = [];
    const seenTitles = new Set<string>();

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

    // Helper function to check if a title is similar to any seen title
    const isSimilarToExisting = (title: string): boolean => {
      const normalizedTitle = normalizeArabicText(title);

      // If the title is too short, don't consider it for similarity check
      if (normalizedTitle.length < 10) return false;

      for (const seenTitle of seenTitles) {
        // Calculate similarity using substring check
        if (seenTitle.includes(normalizedTitle) || normalizedTitle.includes(seenTitle)) {
          console.log(`Found similar titles: "${title}" is similar to a previously seen title`);
          return true;
        }

        // Check for keyword similarity - if both titles contain the same important keywords
        const keywords = ['الأمم المتحدة', 'غزة', 'إطلاق النار', 'الشرق الأوسط', 'فلسطين', 'إسرائيل'];
        let keywordMatches = 0;

        for (const keyword of keywords) {
          if (normalizedTitle.includes(keyword) && seenTitle.includes(keyword)) {
            keywordMatches++;
          }
        }

        // If 3 or more important keywords match, consider the titles similar
        if (keywordMatches >= 2) {
          console.log(`Found similar titles by keywords: "${title}" shares ${keywordMatches} keywords with a previously seen title`);
          return true;
        }
      }
      return false;
    };

    // Filter out duplicates
    for (const item of allNews) {
      const normalizedTitle = normalizeArabicText(item.title);

      if (!isSimilarToExisting(item.title)) {
        uniqueNews.push(item);
        seenTitles.add(normalizedTitle);
      } else {
        console.log(`Filtered out duplicate news item: ${item.title}`);
      }
    }

    console.log(`Removed ${allNews.length - uniqueNews.length} duplicate news items`);

    // Sort by date (newest first) and limit to 15 items
    const sortedNews = uniqueNews
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 15); // Increased limit to accommodate more sources

    console.log(`Returning ${sortedNews.length} sorted unique news items`);
    return sortedNews;
  } catch (error) {
    console.error('Error fetching combined news:', error);

    // Return mock data as fallback
    const mockNews = [
      ...MOCK_RSS_ITEMS['BBC Arabic'] || [],
      ...MOCK_RSS_ITEMS['Google News'] || [],
      ...MOCK_RSS_ITEMS['CNN Arabic'] || [],
      ...MOCK_RSS_ITEMS['RT Arabic'] || [],
      ...MOCK_RSS_ITEMS['Google News Topics'] || []
    ];
    return mockNews.slice(0, 15);
  }
}

/**
 * Fetch all fact checks and combine them
 */
export async function fetchAllFactChecks(): Promise<RssItem[]> {
  try {
    const [snopesChecks, factCheckOrgChecks] = await Promise.all([
      fetchSnopesFactChecks(),
      fetchFactCheckOrgChecks()
    ]);

    // Combine and sort by date (newest first)
    return [...snopesChecks, ...factCheckOrgChecks]
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 10); // Limit to 10 items
  } catch (error) {
    console.error('Error fetching combined fact checks:', error);

    // Return mock data as fallback
    const mockFactChecks = [
      ...MOCK_RSS_ITEMS['Snopes'] || [],
      ...MOCK_RSS_ITEMS['FactCheck.org'] || []
    ];
    return mockFactChecks;
  }
}

/**
 * Fetch news by category from RSS feeds
 */
export async function fetchNewsByCategoryFromRSS(category: string): Promise<RssItem[]> {
  try {
    console.log(`Fetching ${category} news from RSS feeds...`);

    // Define category-specific RSS feeds - only include feeds that are defined
    const allCategoryFeeds: Record<string, string[]> = {
      business: [
        RSS_FEEDS.bbcArabicBusiness,
        RSS_FEEDS.cnnArabicBusiness,
        RSS_FEEDS.rtArabicBusiness,
        RSS_FEEDS.dwArabicBusiness,
        RSS_FEEDS.france24ArabicBusiness,
        RSS_FEEDS.alJazeeraBusiness,
        RSS_FEEDS.alarabiyaBusiness,
        RSS_FEEDS.skynewsArabiaBusiness,
        RSS_FEEDS.googleNewsArabicBusiness,
        RSS_FEEDS.asharqAlawsatBusiness,
        RSS_FEEDS.alKhaleejBusiness,
        RSS_FEEDS.alBayanBusiness,
        RSS_FEEDS.alAhramBusiness,
        RSS_FEEDS.cnbcArabic,
        RSS_FEEDS.cnbcArabicMarkets,
        RSS_FEEDS.cnbcArabicEconomy,
        RSS_FEEDS.alEqtisadiah,
        RSS_FEEDS.mubasher,
        RSS_FEEDS.argaamBusiness
      ],
      technology: [
        RSS_FEEDS.bbcArabicScience,
        RSS_FEEDS.cnnArabicTech,
        RSS_FEEDS.rtArabicTech,
        RSS_FEEDS.france24ArabicScience,
        RSS_FEEDS.alJazeeraScience,
        RSS_FEEDS.alarabiyaTech,
        RSS_FEEDS.skynewsArabiaScience,
        RSS_FEEDS.googleNewsArabicTech,
        RSS_FEEDS.alKhaleejTech,
        RSS_FEEDS.alBayanTech,
        RSS_FEEDS.aitNews,
        RSS_FEEDS.techWorldArabic,
        RSS_FEEDS.techArabic
      ],
      sports: [
        RSS_FEEDS.bbcArabicSports,
        RSS_FEEDS.cnnArabicSports,
        RSS_FEEDS.rtArabicSports,
        RSS_FEEDS.dwArabicSports,
        RSS_FEEDS.france24ArabicSports,
        RSS_FEEDS.alJazeeraSports,
        RSS_FEEDS.alarabiyaSports,
        RSS_FEEDS.skynewsArabiaSports,
        RSS_FEEDS.googleNewsArabicSports,
        RSS_FEEDS.asharqAlawsatSports,
        RSS_FEEDS.alKhaleejSports,
        RSS_FEEDS.alBayanSports,
        RSS_FEEDS.alAhramSports,
        RSS_FEEDS.kooora,
        RSS_FEEDS.filGoal,
        RSS_FEEDS.yallaKora,
        RSS_FEEDS.beINSports,
        RSS_FEEDS.goalArabic
      ],
      entertainment: [
        RSS_FEEDS.bbcArabicArts,
        RSS_FEEDS.cnnArabicEntertainment,
        RSS_FEEDS.dwArabicCulture,
        RSS_FEEDS.france24ArabicCulture,
        RSS_FEEDS.skynewsArabiaEntertainment,
        RSS_FEEDS.googleNewsArabicEntertainment,
        RSS_FEEDS.asharqAlawsatCulture,
        RSS_FEEDS.alAhramEntertainment,
        RSS_FEEDS.fann,
        RSS_FEEDS.etArabic,
        RSS_FEEDS.elCinema
      ],
      health: [
        RSS_FEEDS.bbcArabicHealth,
        RSS_FEEDS.cnnArabicHealth,
        RSS_FEEDS.rtArabicHealth,
        RSS_FEEDS.alarabiyaHealth,
        RSS_FEEDS.skynewsArabiaHealth,
        RSS_FEEDS.googleNewsArabicHealth,
        RSS_FEEDS.alKhaleejHealth,
        RSS_FEEDS.alBayanHealth,
        RSS_FEEDS.alTibbi,
        RSS_FEEDS.webteb,
        RSS_FEEDS.dailyMedicalInfo
      ],
      science: [
        RSS_FEEDS.bbcArabicScience,
        RSS_FEEDS.rtArabicScience,
        RSS_FEEDS.dwArabicScience,
        RSS_FEEDS.france24ArabicScience,
        RSS_FEEDS.alJazeeraScience,
        RSS_FEEDS.skynewsArabiaScience,
        RSS_FEEDS.googleNewsArabicScience,
        RSS_FEEDS.scientificAmericanArabic,
        RSS_FEEDS.nasaArabic
      ],
      general: [
        RSS_FEEDS.bbcArabic,
        RSS_FEEDS.bbcArabicMiddleEast,
        RSS_FEEDS.cnnArabic,
        RSS_FEEDS.rtArabic,
        RSS_FEEDS.dwArabic,
        RSS_FEEDS.france24Arabic,
        RSS_FEEDS.france24ArabicMiddleEast,
        RSS_FEEDS.alJazeera,
        RSS_FEEDS.alarabiya,
        RSS_FEEDS.skynewsArabia,
        RSS_FEEDS.googleNewsArabic,
        RSS_FEEDS.googleNewsArabicWorld,
        RSS_FEEDS.asharqAlawsat,
        RSS_FEEDS.alKhaleej,
        RSS_FEEDS.alBayan,
        RSS_FEEDS.alIttihad,
        RSS_FEEDS.alRiyadh,
        RSS_FEEDS.alWatan,
        RSS_FEEDS.alAhram,
        RSS_FEEDS.spaArabic,
        RSS_FEEDS.wamArabic,
        RSS_FEEDS.kunaArabic,
        RSS_FEEDS.petraArabic,
        RSS_FEEDS.mapArabic,
        RSS_FEEDS.qnaArabic,
        RSS_FEEDS.alArabNewspaper,
        RSS_FEEDS.alQudsAlArabi,
        RSS_FEEDS.alMasryAlYoum,
        RSS_FEEDS.alHayat
      ]
    };

    // Filter out undefined feeds
    const categoryFeeds: Record<string, string[]> = {};
    Object.entries(allCategoryFeeds).forEach(([cat, feeds]) => {
      categoryFeeds[cat] = feeds.filter(feed => feed !== undefined);
    });

    // Get feeds for the requested category
    const feeds = categoryFeeds[category] || categoryFeeds.general;

    // If no feeds are available for this category, return empty array
    if (!feeds || feeds.length === 0) {
      console.warn(`No feeds available for category: ${category}`);
      return [];
    }

    console.log(`Found ${feeds.length} feeds for category: ${category}`);

    // Fetch from all feeds in parallel with a timeout
    const feedPromises = feeds.map(feed => {
      if (!feed) {
        console.warn(`Undefined feed found in category: ${category}`);
        return Promise.resolve([] as RssItem[]);
      }

      // Extract source name from feed URL
      const sourceName = Object.entries(RSS_FEEDS).find(([_, url]) => url === feed)?.[0] || 'Unknown';

      // Add timeout to each fetch
      return Promise.race([
        fetchRssFeed(feed, sourceName).catch(error => {
          console.error(`Error fetching from ${sourceName} (${feed}):`, error);
          return [] as RssItem[];
        }),
        new Promise<RssItem[]>(resolve => {
          setTimeout(() => {
            console.warn(`Timeout fetching from ${sourceName} (${feed})`);
            resolve([]);
          }, 10000); // 10 second timeout
        })
      ]);
    });

    // Wait for all fetches to complete
    const results = await Promise.allSettled(feedPromises);

    // Combine all successful results
    let allNews: RssItem[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allNews = [...allNews, ...result.value];
      }
    });

    console.log(`Fetched ${allNews.length} ${category} news items from RSS feeds`);

    // If no news items were fetched, return empty array
    if (allNews.length === 0) {
      console.warn(`No news items fetched for category: ${category}`);
      return [];
    }

    // Remove duplicate news items based on title similarity
    const uniqueNews: RssItem[] = [];
    const seenTitles = new Set<string>();

    // Helper function to normalize and simplify Arabic text for comparison
    const normalizeArabicText = (text: string): string => {
      if (!text) return '';

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

    // Helper function to check if a title is similar to any seen title
    const isSimilarToExisting = (title: string): boolean => {
      if (!title) return false;

      const normalizedTitle = normalizeArabicText(title);

      // If the title is too short, don't consider it for similarity check
      if (normalizedTitle.length < 10) return false;

      for (const seenTitle of seenTitles) {
        // Calculate similarity using substring check
        if (seenTitle.includes(normalizedTitle) || normalizedTitle.includes(seenTitle)) {
          return true;
        }
      }
      return false;
    };

    // Filter out duplicates and invalid items
    for (const item of allNews) {
      // Skip items with empty or invalid titles
      if (!item.title || item.title === 'undefined' || item.title === 'null') {
        continue;
      }

      const normalizedTitle = normalizeArabicText(item.title);

      if (!isSimilarToExisting(item.title)) {
        uniqueNews.push(item);
        seenTitles.add(normalizedTitle);
      }
    }

    console.log(`Removed ${allNews.length - uniqueNews.length} duplicate ${category} news items`);

    // Filter out old news (older than 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentNews = uniqueNews.filter(item => {
      try {
        if (!item.pubDate) return true; // Keep items without dates

        const pubDate = new Date(item.pubDate);
        return !isNaN(pubDate.getTime()) && pubDate >= oneWeekAgo;
      } catch (e) {
        // If date parsing fails, keep the item
        return true;
      }
    });

    console.log(`Filtered out ${uniqueNews.length - recentNews.length} old ${category} news items`);

    // Sort by date (newest first) and limit to 20 items
    const sortedNews = recentNews
      .sort((a, b) => {
        try {
          const dateA = new Date(a.pubDate || 0);
          const dateB = new Date(b.pubDate || 0);

          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;

          return dateB.getTime() - dateA.getTime();
        } catch (e) {
          return 0;
        }
      })
      .slice(0, 20);

    console.log(`Returning ${sortedNews.length} sorted unique ${category} news items`);

    // If we still have no news items after all filtering, return mock data
    if (sortedNews.length === 0) {
      console.warn(`No news items left after filtering for category: ${category}, using mock data`);
      return MOCK_RSS_ITEMS['Google News'] || [];
    }

    return sortedNews;
  } catch (error) {
    console.error(`Error fetching ${category} news from RSS:`, error);

    // Return mock data as fallback
    return MOCK_RSS_ITEMS['Google News'] || [];
  }
}
