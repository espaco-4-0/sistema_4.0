const isDev = process.env.NODE_ENV === "development";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: images.unsplash.com rllnjjtrzwizgrndgfep.supabase.co;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' ${isDev ? "ws://localhost:3000 ws://0.0.0.0:3000" : ""};
    upgrade-insecure-requests;
`
    .replace(/\s{2,}/g, " ")
    .trim(); // Limpa espaços extras e quebras de linha

/** @type {import('next').NextConfig} */
const nextConfig = {
    // futuro teste pra ci/cd
    output: "standalone",

    // Dps apagar issae quando pegar as images dos cursos via API
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
