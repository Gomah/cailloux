import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: 'https://acme.com',
      lastModified: new Date(),
    },
  ];
}
