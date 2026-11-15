import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // En la configuración y no en una página: así "/" no se prerenderiza solo para redirigir.
  redirects() {
    return [{ source: "/", destination: "/cobrar-hoy", permanent: false }]
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
