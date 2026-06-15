import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'; // Replace with actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Don't let search engines crawl the admin dashboard
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
