import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: ["/order/"],
      disallow: ["/api/", "/kitchen", "/login", "/owner/", "/pos", "/print/"],
    }],
  };
}
