import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResearchArena | GenLayer",
  description:
    "Competitive research bounties settled by live web evidence and GenLayer validator consensus.",
  icons: {
    icon: "/researcharena-logo.webp",
    shortcut: "/researcharena-logo.webp",
    apple: "/researcharena-logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
