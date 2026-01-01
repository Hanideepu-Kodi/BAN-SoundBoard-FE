import type { Metadata } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import { AudioProvider } from "@/components/AudioProvider";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Kodi-board | Soundboard for creators",
  description: "A premium soundboard experience for gamers and streamers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} bg-bg-base text-fg-primary antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 bg-noise opacity-70 mix-blend-soft-light" />
        <div className="bg-ribbon pointer-events-none fixed inset-0" />
        <AuthProvider>
          <AudioProvider>
            <main className="relative z-10">{children}</main>
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
