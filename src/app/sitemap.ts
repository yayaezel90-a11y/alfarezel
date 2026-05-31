import type { MetadataRoute } from "next";
import { games, products, sellers } from "@/lib/demo-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://alfarez.com";
  const staticRoutes = ["", "/marketplace", "/top-up", "/join-seller", "/bantuan", "/rules", "/login", "/register"];
  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...games.map((game) => ({
      url: `${base}/game/${game.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${base}/produk/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
    ...sellers.map((seller) => ({
      url: `${base}/seller/${seller.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
