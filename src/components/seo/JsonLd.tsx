import React from 'react';

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Generic JSON-LD component for structured data
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * WebSite schema for homepage - helps with site search in Google
 */
export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Playyly",
    "alternateName": "Playyly Music Player",
    "url": "https://playyly.vercel.app",
    "description": "A modern, beautiful music player with dark mode, library management, and smooth playback controls. Stream music free online.",
    "publisher": {
      "@type": "Organization",
      "name": "Playyly",
      "logo": {
        "@type": "ImageObject",
        "url": "https://playyly.vercel.app/og-image.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://playyly.vercel.app/music?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * SoftwareApplication schema - for app-like experiences
 */
export function SoftwareApplicationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Playyly Music Player",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "A beautiful, interactive music player built with React and Next.js. Features dark mode, real-time search, library management, and smooth playback controls.",
    "screenshot": "https://playyly.vercel.app/og-image.png",
    "featureList": [
      "Dark mode support",
      "Real-time music search",
      "Library management",
      "Shuffle and repeat modes",
      "Favorites collection",
      "Volume controls",
      "Keyboard shortcuts"
    ],
    "author": {
      "@type": "Person",
      "name": "Zahid",
      "url": "https://devzahid.vercel.app/"
    }
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * Organization schema - establishes brand presence
 */
export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Playyly",
    "url": "https://playyly.vercel.app",
    "logo": "https://playyly.vercel.app/og-image.png",
    "sameAs": [
      "https://devzahid.vercel.app/"
    ]
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * BreadcrumbList schema - for navigation structure
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return <JsonLd data={jsonLd} />;
}
