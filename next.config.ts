import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    //futuro teste pra ci/cd
    output: "standalone",
	serverExternalPackages: [
    "@opentelemetry/sdk-node",
    "@opentelemetry/exporter-trace-otlp-http",
    "@opentelemetry/instrumentation-http",
    "@opentelemetry/api",
  ],

    //Dps apagar issae quando pegar as images dos cursos via API
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
        ],
    },
};

module.exports = nextConfig;
