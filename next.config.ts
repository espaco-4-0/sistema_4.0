const isDev = process.env.NODE_ENV === "development";


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
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: cspHeader,
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "origin-when-cross-origin",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=31536000; includeSubDomains; preload",
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
