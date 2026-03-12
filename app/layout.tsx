import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || BACKEND_URL;

function resolveUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${PUBLIC_BACKEND_URL}/${url}`;
}

async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/site-settings`, {
      cache: "no-store",
    });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data ?? {};
  } catch (e) {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();

  const siteName = s["seo_site_name"] || "Tenhal";
  const titleDefault = s["seo_title_default"] || siteName;
  const separator = s["seo_title_separator"] || " | ";
  const description = s["seo_description"] || "";
  const keywords = s["seo_keywords"] || "";
  const ogImageRaw = s["seo_og_image"] || "";
  const ogImage = resolveUrl(ogImageRaw);
  const canonicalBase = s["seo_canonical_base_url"] || "";
  const robots = s["seo_robots"] || "index, follow";
  const twitterCard = s["seo_twitter_card"] || "summary_large_image";
  const twitterSite = s["seo_twitter_site"] || "";
  const googleVerification = s["seo_google_site_verification"] || "";
  const gaId = s["seo_google_analytics_id"] || "";

  const metadata: Metadata = {
    title: {
      default: titleDefault,
      template: `%s${separator}${siteName}`,
    },
    description: description || undefined,
    keywords: keywords ? keywords.split(",").map((k) => k.trim()) : undefined,
    robots: robots || undefined,
    openGraph: {
      type: "website",
      siteName,
      title: titleDefault,
      description: description || undefined,
      url: canonicalBase || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: (twitterCard as "summary" | "summary_large_image" | "app" | "player") || "summary_large_image",
      site: twitterSite || undefined,
      title: titleDefault,
      description: description || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
    verification: googleVerification
      ? { google: googleVerification }
      : undefined,
    ...(canonicalBase && { metadataBase: new URL(canonicalBase) }),
    other: gaId ? { "ga-id": gaId } : undefined,
  };

  return metadata;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const s = await getSiteSettings();

  const faviconRaw = s["favicon_url"] || "";
  const favicon = resolveUrl(faviconRaw);

  const gaId = s["seo_google_analytics_id"] || "";

  return (
    <html lang="id">
      <head>
        {favicon && (
          <>
            <link rel="icon" href={favicon} />
            <link rel="shortcut icon" href={favicon} />
            <link rel="apple-touch-icon" href={favicon} />
          </>
        )}
        {gaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}