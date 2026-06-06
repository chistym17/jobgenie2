import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ClerkUserSync from "./components/ClerkUserSync";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Genie",
  description: "Job Genie - Find your dream job",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <ClerkUserSync />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
