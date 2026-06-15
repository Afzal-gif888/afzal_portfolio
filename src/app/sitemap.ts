import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'; // Replace with actual domain

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // We can add more specific sub-routes later if you ever have dynamic blog posts or project pages.
    // Right now, everything is on the single-page scroll layout so baseUrl covers it all for SEO.
  ];
}
