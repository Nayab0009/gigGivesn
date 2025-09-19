import "./globals.css";
import Providers from "@/components/common/Providers";
import { Metadata } from "next";
import ProtectedRoute from "@/components/protectedRoutes/ProtectedRoute";
import Image from "next/image";

export const metadata: Metadata = {
  title: "GiGgives",
  description: "Project Management App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="relative font-outfit dark:bg-gray-900 min-h-screen"
        suppressHydrationWarning={true}
      >
        {/* Background Image */}
        <div className="fixed inset-0 -z-20">
          <Image
            src="/images/Rectangle 105.png"
            alt="Background"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Blur Overlay (Glass Effect Layer) */}
        <div className="fixed inset-0 bg-black/30 backdrop-blur-3xl -z-10" />

        <Providers>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Providers>
      </body>
    </html>
  );
}
