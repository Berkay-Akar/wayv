import type { ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "./providers";

export const metadata = {
  title: "Wayv Campaign Matching",
  description: "AI-powered campaign to creator matching and briefs",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
            <a href="/" className="text-lg font-semibold text-white hover:text-gray-200 hover:no-underline">
              Wayv Campaign Matching
            </a>
          </div>
        </header>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}


