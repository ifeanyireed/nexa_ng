import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/blog', '/blog/*'],
      disallow: ['/api/'],
    },
    sitemap: 'https://ofia.ng/sitemap.xml',
  };
}
