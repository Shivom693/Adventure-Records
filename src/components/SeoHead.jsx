import { useEffect } from 'react';

/**
 * Adventure Records — Dynamic SEO & Structured Data Head Manager
 */
const SeoHead = ({ 
  title = 'Adventure Records | Music Distribution for Artists',
  description = 'Music distribution and release management for independent artists. Release singles, EPs, and albums with transparent pricing and 0% royalty commission.',
  canonicalUrl = 'https://music-b2696.web.app/',
  ogType = 'website',
  structuredData = null,
  breadcrumbs = []
}) => {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper to set meta tag
    const setMeta = (name, content, attr = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMeta('description', description);
    setMeta('robots', 'index, follow');

    // 3. Open Graph
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:type', ogType, 'property');
    setMeta('og:site_name', 'Adventure Records', 'property');

    // 4. Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    // 5. Canonical Link Tag
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl);

    // 6. Organization & Website Default Structured Data
    const defaultOrgSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Adventure Records',
      'alternateName': 'Adventure Records Music Distribution',
      'url': 'https://music-b2696.web.app/',
      'logo': 'https://music-b2696.web.app/logo.png',
      'description': 'Independent music distribution platform helping artists release, manage, and monetize their music globally.'
    };

    const defaultSiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Adventure Records',
      'url': 'https://music-b2696.web.app/',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://music-b2696.web.app/resources?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    };

    // 7. Breadcrumbs Schema
    let breadcrumbSchema = null;
    if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
      breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((item, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': item.name,
          'item': item.url
        }))
      };
    }

    // Combine schemas
    const schemasToInject = [
      defaultOrgSchema,
      defaultSiteSchema,
      ...(breadcrumbSchema ? [breadcrumbSchema] : []),
      ...(structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [])
    ];

    // Remove old injected script
    const existingScript = document.getElementById('seo-json-ld');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = 'seo-json-ld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemasToInject);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('seo-json-ld');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [title, description, canonicalUrl, ogType, structuredData, breadcrumbs]);

  return null;
};

export default SeoHead;
