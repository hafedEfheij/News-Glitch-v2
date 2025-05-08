'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { withBasePath } from '@/lib/utils/base-path';

type ClientLinkProps = {
  href: string;
  target?: string;
  rel?: string;
  className?: string;
  children: React.ReactNode;
};

// Helper function to ensure the link is valid and points to an actual article
function ensureValidArticleLink(href: string, title?: string): string {
  // Special case: detect and fix the problematic UN news article link
  if (title && title.includes('الأمم المتحدة تدعو إلى وقف إطلاق النار في الشرق الأوسط')) {
    console.warn(`Detected problematic UN news article link: ${href}`);
    return 'https://news.google.com/search?q=%D8%A7%D9%84%D8%A3%D9%85%D9%85+%D8%A7%D9%84%D9%85%D8%AA%D8%AD%D8%AF%D8%A9+%D8%AA%D8%AF%D8%B9%D9%88+%D8%A5%D9%84%D9%89+%D9%88%D9%82%D9%81+%D8%A5%D8%B7%D9%84%D8%A7%D9%82+%D8%A7%D9%84%D9%86%D8%A7%D8%B1&hl=ar';
  }

  // Special case: fix broken BBC links
  if (href.includes('c4nq369rlgdo') ||
      (href.includes('bbc.com/arabic/articles') && !href.match(/articles\/[a-z0-9]+/)) ||
      href.includes('undefined')) {
    console.warn(`Detected broken link: ${href}`);
    return 'https://www.bbc.com/arabic';
  }

  // Special case: fix any broken links that might appear in Latest News
  if (href === '#' || href === 'undefined' || href === 'null' || href === '') {
    console.warn(`Detected empty or invalid link: ${href}`);
    if (title) {
      return `https://news.google.com/search?q=${encodeURIComponent(title)}&hl=ar`;
    } else {
      return 'https://news.google.com/?hl=ar';
    }
  }

  // If the link is empty or just a homepage, create a fallback
  if (!href || href === '#') {
    console.warn(`Empty link detected, using fallback`);
    return 'https://news.google.com/?hl=ar';
  }

  // Check if the link is just a domain without a path (homepage)
  const isJustDomain = /^https?:\/\/[^\/]+\/?$/.test(href);

  if (isJustDomain) {
    console.warn(`Homepage link detected: ${href}, using Google News fallback`);
    return 'https://news.google.com/?hl=ar';
  }

  // Ensure the link has a protocol
  if (!href.startsWith('http://') && !href.startsWith('https://')) {
    // If it starts with //, add https:
    if (href.startsWith('//')) {
      return `https:${href}`;
    }

    // If it's a relative URL, add a base URL
    if (href.startsWith('/')) {
      // Use a fixed domain to avoid hydration mismatches
      return `https://news.google.com${href}`;
    }

    // If it doesn't start with /, add https://
    return `https://${href}`;
  }

  return href;
}

// This component wraps anchor tags to prevent hydration mismatches
// caused by browser extensions that add attributes like "previewlistener"
export default function ClientLink({
  href,
  target,
  rel,
  className,
  children,
}: ClientLinkProps) {
  const router = useRouter();

  // Get the title from children if it's a string
  let title: string | undefined;
  if (typeof children === 'string') {
    title = children;
  } else if (React.isValidElement(children) && typeof children.props.children === 'string') {
    title = children.props.children;
  }

  // Ensure the href is valid, passing the title for better link fixing
  const validHref = ensureValidArticleLink(href, title);

  // Check if the link is external
  const isExternalLink = validHref.startsWith('http') || validHref.startsWith('https');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If it's an external link and target is _blank, let the browser handle it
    if (isExternalLink && target === '_blank') {
      // Don't prevent default - let the browser open in new tab
      return;
    }

    // If it's an external link but not opening in a new tab
    if (isExternalLink) {
      e.preventDefault();
      window.location.href = validHref; // Use direct browser navigation with validated URL
      return;
    }

    // For internal links, handle with base path
    if (!isExternalLink) {
      e.preventDefault();
      const internalPath = validHref.startsWith('/') ? validHref : `/${validHref}`;
      router.push(internalPath);
    }
  };

  // Apply base path for internal links
  const hrefWithBasePath = isExternalLink ? validHref : withBasePath(validHref);

  return (
    <a
      href={hrefWithBasePath} // Use the validated href with base path
      target={target}
      rel={rel}
      className={className}
      onClick={handleClick}
      // Using suppressHydrationWarning to prevent hydration mismatches
      // for attributes that might be added by browser extensions
      suppressHydrationWarning
      // Add data attribute for debugging
      data-original-href={href !== validHref ? href : undefined}
    >
      {children}
    </a>
  );
}