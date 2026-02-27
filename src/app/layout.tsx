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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}


