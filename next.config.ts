import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    //futuro teste pra ci/cd
    output: "standalone",
    //Dps apagar issae quando pegar as images dos cursos via API
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "rllnjjtrzwizgrndgfep.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};

module.exports = nextConfig;
