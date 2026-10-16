import "~/styles/globals.css";

import { Barlow, Barlow_Condensed, DotGothic16 } from "next/font/google";
import { type Metadata } from "next";

import { Toaster } from "~/components/ui/sonner";

import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "./ConvexClientProvider";

const barlow = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
});

const dotGothic = DotGothic16({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-dotgothic",
});

export const metadata: Metadata = {
  title: "MyAlarm Manager",
  description: "Manage your alarms, Webhook Support from Alamos",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang="de"
        className={`${barlow.variable} ${barlowCondensed.variable} ${dotGothic.variable} dark`}
      >
        <head>
          <meta name="apple-mobile-web-app-title" content="MyAlarm" />
        </head>
        <body>
          <ConvexClientProvider>
            {children}
            <Toaster />
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
