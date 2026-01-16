import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //Dps apagar issae quando pegar as images dos cursos via API
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },]
  },
};

export default nextConfig;
