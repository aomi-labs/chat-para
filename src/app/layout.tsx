import type { Metadata } from "next";
import { DM_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { WalletProviders } from "@/components/wallet-providers";
import { SettingsProvider } from "@/components/settings-provider";
import { GoogleAnalytics } from "@/components/google-analytics";
import { CookieConsent } from "@/components/cookie-consent";

const inter = Inter({
  variable: "--font-para-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-para-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Para Chat",
  description:
    "Para-branded consumer and developer chat frontend for wallet movement, wallet creation, and raw data signing.",
  icons: {
    icon: [
      { url: "/para-brand/logo-mark-orange.svg", type: "image/svg+xml" },
      { url: "/para-brand/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/para-brand/logo-mark-orange.svg",
    apple: "/para-brand/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieString = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmMono.variable} font-sans antialiased`}>
        <GoogleAnalytics />
        <WalletProviders cookies={cookieString || null}>
          <SettingsProvider>
            <div className="relative h-screen w-full overflow-hidden">{children}</div>
          </SettingsProvider>
        </WalletProviders>
        <CookieConsent />
      </body>
    </html>
  );
}
