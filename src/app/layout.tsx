import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Music Collaborator",
  description: "Enjoy the music together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600">
        <div>
          <Toaster />
        </div>
        <Header />
        {children}
      </body>
    </html>
  );
}
