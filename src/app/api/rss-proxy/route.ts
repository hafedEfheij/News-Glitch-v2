import { NextRequest, NextResponse } from 'next/server';

/**
 * Alternative RSS feed URLs for sources that block direct access
 */
const ALTERNATIVE_FEEDS: Record<string, string> = {
  // Al Jazeera alternatives
  'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b0-2fd0-49cf-bd1e-af3901414abe': 'https://news.google.com/rss/search?q=site:aljazeera.net+%D8%B9%D8%A7%D8%AC%D9%84&hl=ar&gl=EG&ceid=EG:ar',

  // Al Arabiya alternatives
  'https://www.alarabiya.net/feed/rss2/ar/arab-and-world': 'https://www.alarabiya.net/tools/rss/ar.xml',
  'https://www.alarabiya.net/tools/rss/ar.xml': 'https://news.google.com/rss/search?q=site:alarabiya.net&hl=ar&gl=EG&ceid=EG:ar',

  // Sky News Arabia alternatives
  'https://www.skynewsarabia.com/web/rss/1': 'https://news.google.com/rss/search?q=site:skynewsarabia.com&hl=ar&gl=EG&ceid=EG:ar',
  'https://www.skynewsarabia.com/web/rss/95.xml': 'https://news.google.com/rss/search?q=site:skynewsarabia.com&hl=ar&gl=EG&ceid=EG:ar',

  // Al-Masry Al-Youm alternatives
  'https://www.almasryalyoum.com/rss/rss': 'https://news.google.com/rss/search?q=site:almasryalyoum.com&hl=ar&gl=EG&ceid=EG:ar',

  // CNN Arabic Breaking News alternatives
  'https://arabic.cnn.com/api/v1/rss/breaking-news/rss.xml': 'https://arabic.cnn.com/api/v1/rss/rss.xml',

  // Kooora alternatives
  'https://www.kooora.com/rss': 'https://news.google.com/rss/search?q=site:kooora.com&hl=ar&gl=EG&ceid=EG:ar',

  // Al Riyadh alternatives
  'https://www.alriyadh.com/rss': 'https://news.google.com/rss/search?q=site:alriyadh.com&hl=ar&gl=EG&ceid=EG:ar',

  // Al Khaleej alternatives
  'https://www.alkhaleej.ae/rss': 'https://news.google.com/rss/search?q=site:alkhaleej.ae&hl=ar&gl=EG&ceid=EG:ar',

  // Al Ahram alternatives
  'https://gate.ahram.org.eg/rss.aspx': 'https://news.google.com/rss/search?q=site:ahram.org.eg&hl=ar&gl=EG&ceid=EG:ar',

  // Other problematic sources can be added here
};

/**
 * RSS Proxy API - Fetches RSS feeds and returns the content
 *
 * This API route acts as a proxy for RSS feeds to avoid CORS issues.
 * It fetches the RSS feed from the provided URL and returns the content.
 * It also handles cases where the original feed is blocked and provides alternatives.
 */
export async function GET(request: NextRequest) {
  try {
    // Extract the RSS feed URL from the query parameters
    const { searchParams } = new URL(request.url);
    const originalUrl = searchParams.get('url');

    // Check if URL is provided
    if (!originalUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Check if we have an alternative URL for this feed
    const url = ALTERNATIVE_FEEDS[originalUrl] || originalUrl;

    // If we're using an alternative, log it
    if (url !== originalUrl) {
      console.log(`RSS Proxy: Using alternative feed ${url} instead of ${originalUrl}`);
    } else {
      console.log(`RSS Proxy: Fetching from ${url}`);
    }

    // Enhanced headers to avoid blocking
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': new URL(url).origin,
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    };

    // Fetch the RSS feed with enhanced headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    try {
      response = await fetch(url, {
        headers,
        signal: controller.signal,
        // Set a longer timeout for the server-side fetch
        next: { revalidate: 300 } // Cache for 5 minutes
      });

      clearTimeout(timeoutId); // Clear the timeout if fetch completes
    } catch (fetchError) {
      clearTimeout(timeoutId); // Clear the timeout

      // Check if it's a timeout error
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`RSS Proxy: Fetch timeout for ${url}`);
        throw new Error(`Fetch timeout for ${url}`);
      }

      // Re-throw other errors
      throw fetchError;
    }

    // Check if the request was successful
    if (!response.ok) {
      console.error(`RSS Proxy: Failed to fetch from ${url} with status ${response.status}`);

      // If we already tried an alternative, or there's no alternative, try Google News
      if (url !== originalUrl || !ALTERNATIVE_FEEDS[originalUrl]) {
        // Try the Google News search as a last resort
        try {
          let hostname = '';
          try {
            hostname = new URL(originalUrl).hostname;
          } catch (e) {
            // If URL parsing fails, extract domain from the URL string
            const domainMatch = originalUrl.match(/https?:\/\/([^\/]+)/);
            hostname = domainMatch ? domainMatch[1] : '';
          }

          if (hostname) {
            const googleNewsUrl = `https://news.google.com/rss/search?q=site:${hostname}&hl=ar&gl=EG&ceid=EG:ar`;
            console.log(`RSS Proxy: Trying Google News search as fallback: ${googleNewsUrl}`);

            const fallbackResponse = await fetch(googleNewsUrl, { headers });

            if (fallbackResponse.ok) {
              // Get the content type and text from the fallback
              const fallbackContentType = fallbackResponse.headers.get('content-type') || 'text/xml';
              const fallbackText = await fallbackResponse.text();
              console.log(`RSS Proxy: Successfully fetched fallback ${fallbackText.length} bytes from ${googleNewsUrl}`);

              // Return the fallback content
              return new NextResponse(fallbackText, {
                headers: {
                  'Content-Type': fallbackContentType,
                  'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
                }
              });
            } else {
              console.error(`RSS Proxy: Failed to fetch fallback from ${googleNewsUrl} with status ${fallbackResponse.status}`);
            }
          }
        } catch (fallbackError) {
          console.error('Error trying fallback:', fallbackError);
        }

        // If all fallbacks fail, return a mock RSS feed
        const mockRssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Arabic News</title>
    <link>https://news.google.com/?hl=ar</link>
    <description>Arabic News Feed</description>
    <language>ar</language>
    <item>
      <title>لا توجد أخبار متاحة حاليًا</title>
      <link>https://news.google.com/?hl=ar</link>
      <description>لا توجد أخبار متاحة حاليًا. يرجى المحاولة مرة أخرى لاحقًا.</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

        console.log(`RSS Proxy: Returning mock RSS feed for ${originalUrl}`);

        return new NextResponse(mockRssFeed, {
          headers: {
            'Content-Type': 'text/xml',
            'Cache-Control': 'public, max-age=60' // Cache for 1 minute only
          }
        });
      }

      // Try the Google News search as a last resort
      const googleNewsUrl = `https://news.google.com/rss/search?q=site:${new URL(originalUrl).hostname}&hl=ar&gl=EG&ceid=EG:ar`;
      console.log(`RSS Proxy: Trying Google News search as fallback: ${googleNewsUrl}`);

      try {
        const fallbackResponse = await fetch(googleNewsUrl, { headers });

        if (fallbackResponse.ok) {
          // Get the content type and text from the fallback
          const fallbackContentType = fallbackResponse.headers.get('content-type') || 'text/xml';
          const fallbackText = await fallbackResponse.text();
          console.log(`RSS Proxy: Successfully fetched fallback ${fallbackText.length} bytes from ${googleNewsUrl}`);

          // Return the fallback content
          return new NextResponse(fallbackText, {
            headers: {
              'Content-Type': fallbackContentType,
              'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
            }
          });
        } else {
          console.error(`RSS Proxy: Failed to fetch fallback from ${googleNewsUrl} with status ${fallbackResponse.status}`);
        }
      } catch (fallbackError) {
        console.error('Error trying fallback:', fallbackError);
      }

      // If all fallbacks fail, return a mock RSS feed
      const mockRssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Arabic News</title>
    <link>https://news.google.com/?hl=ar</link>
    <description>Arabic News Feed</description>
    <language>ar</language>
    <item>
      <title>لا توجد أخبار متاحة حاليًا</title>
      <link>https://news.google.com/?hl=ar</link>
      <description>لا توجد أخبار متاحة حاليًا. يرجى المحاولة مرة أخرى لاحقًا.</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

      console.log(`RSS Proxy: Returning mock RSS feed for ${originalUrl}`);

      return new NextResponse(mockRssFeed, {
        headers: {
          'Content-Type': 'text/xml',
          'Cache-Control': 'public, max-age=60' // Cache for 1 minute only
        }
      });
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || 'text/xml';

    // Get the response text
    const text = await response.text();
    console.log(`RSS Proxy: Successfully fetched ${text.length} bytes from ${url}`);

    // Return the RSS feed content
    return new NextResponse(text, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Error in RSS proxy:', error);

    // Determine if it's an abort error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const status = errorMessage.includes('abort') ? 499 : 500; // 499 is a common status for client closed request

    return NextResponse.json(
      { error: `Failed to fetch RSS feed: ${errorMessage}` },
      { status }
    );
  }
}
