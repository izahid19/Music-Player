import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://playyly.vercel.app'
  
  // Static routes that should be indexed
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/music`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Note: Admin routes (/admin/*) are excluded as they should not be indexed
  // API routes (/api/*) are excluded as they are not pages
  
  return staticRoutes
}
