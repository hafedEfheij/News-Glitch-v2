'use server';

/**
 * Utility for extracting content from news articles
 */

/**
 * Extract content from a news article URL
 * 
 * @param url The URL of the article to extract content from
 * @returns The extracted article content or null if extraction failed
 */
export async function extractArticleContent(url: string): Promise<string | null> {
  try {
    // Validate URL
    new URL(url);
    
    // Fetch the article content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch article: ${response.status} ${response.statusText}`);
      return null;
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Extract the main content using a simple heuristic
    // This is a basic implementation - a more robust solution would use a library like 'readability'
    let content = '';
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';
    
    // Extract meta description
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*>/i);
    const description = descriptionMatch ? descriptionMatch[1] : '';
    
    // Extract article body - look for common article containers
    const bodyMatches = [
      // Match content within article tags
      html.match(/<article[^>]*>([\s\S]*?)<\/article>/i),
      // Match content within main tags
      html.match(/<main[^>]*>([\s\S]*?)<\/main>/i),
      // Match content within div with common article class names
      html.match(/<div[^>]*class=["'].*?(article|content|post|entry).*?["'][^>]*>([\s\S]*?)<\/div>/i),
    ];
    
    // Use the first successful match
    let bodyContent = '';
    for (const match of bodyMatches) {
      if (match) {
        bodyContent = match[1] || match[2] || '';
        break;
      }
    }
    
    // Strip HTML tags and normalize whitespace
    bodyContent = bodyContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Combine the extracted parts
    content = `${title}\n\n${description}\n\n${bodyContent}`;
    
    // Limit content length to avoid token limits
    const maxLength = 8000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }
    
    return content || null;
  } catch (error) {
    console.error('Error extracting article content:', error);
    return null;
  }
}
