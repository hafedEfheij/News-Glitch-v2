/**
 * Utility functions for handling base path in GitHub Pages deployment
 */

/**
 * Get the base path for the application
 * This is needed for GitHub Pages deployment where the app is served from a subdirectory
 */
export function getBasePath(): string {
  // Use the environment variable if available (during build time)
  if (process.env.NEXT_PUBLIC_BASE_PATH) {
    return `/${process.env.NEXT_PUBLIC_BASE_PATH}`;
  }
  
  // For client-side, try to detect from the URL
  if (typeof window !== 'undefined') {
    const pathSegments = window.location.pathname.split('/');
    // If deployed to GitHub Pages, the first segment after the domain will be the repo name
    if (pathSegments.length > 1 && pathSegments[1] !== '') {
      return `/${pathSegments[1]}`;
    }
  }
  
  // Default to empty string (no base path)
  return '';
}

/**
 * Prepend the base path to a URL
 * @param url The URL to prepend the base path to
 */
export function withBasePath(url: string): string {
  const basePath = getBasePath();
  
  // If the URL already starts with the base path, return it as is
  if (url.startsWith(basePath)) {
    return url;
  }
  
  // If the URL starts with a slash, append it to the base path
  if (url.startsWith('/')) {
    return `${basePath}${url}`;
  }
  
  // Otherwise, append the URL to the base path with a slash
  return `${basePath}/${url}`;
}
