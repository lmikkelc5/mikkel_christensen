import type { MetadataRoute } from "next";

import { getCollection } from "@/lib/content";
import { getGalleries, getPhotos } from "@/lib/photos";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const photos = getPhotos();
  const staticRoutes = [
    "",
    "/about",
    "/articles",
    "/photography",
    "/photography/portfolio",
    "/photography/favorites",
    "/recipes",
    "/projects",
    "/contact"
  ];

  const galleryRoutes = [
    ...getGalleries("film").map((gallery) => `/photography/film/${gallery.slug}`),
    ...getGalleries("trip").map((gallery) => `/photography/trip/${gallery.slug}`),
    ...getGalleries("camera").map((gallery) => `/photography/camera/${gallery.slug}`),
    ...getGalleries("year").map((gallery) => `/photography/year/${gallery.slug}`)
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: new Date()
    })),
    ...getCollection("articles").map((article) => ({
      url: `${siteConfig.url}${article.href}`,
      lastModified: new Date(article.frontmatter.date)
    })),
    ...getCollection("recipes").map((recipe) => ({
      url: `${siteConfig.url}${recipe.href}`,
      lastModified: new Date(recipe.frontmatter.date)
    })),
    ...getCollection("projects").map((project) => ({
      url: `${siteConfig.url}${project.href}`,
      lastModified: new Date(project.frontmatter.date)
    })),
    ...galleryRoutes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: new Date()
    })),
    ...photos.map((photo) => ({
      url: `${siteConfig.url}${photo.href}`,
      lastModified: new Date(photo.dateTaken || photo.addedAt)
    }))
  ];
}
