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
    const longCache = [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
      { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      // self-hosted fonts (see note above) + scene backdrops: both are static and
      // versioned by filename, so long-cache them — the mini-program and web then
      // don't re-download them on every visit / cold launch.
      { source: "/fonts/:path*", headers: longCache },
      { source: "/art/:path*", headers: longCache },
    ];
  },
};

export default nextConfig;
