/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle (.next/standalone) so the Docker
  // runtime image only needs Node + the traced deps — no full node_modules.
  output: "standalone",
  // CORS on the self-hosted fonts. The WeChat mini-program loads them with
  // wx.loadFontFace, which fetches the font as a cross-origin webfont inside the
  // webview — that requires Access-Control-Allow-Origin or the fetch is blocked
  // ("loadFontFace:fail A network error occurred."). Long-cache them too.
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
