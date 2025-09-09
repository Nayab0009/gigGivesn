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
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/Rectangle 105.png" 
            alt="Background"
            fill
            priority
            className="object-cover"
          />
        </div>
        <Providers>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Providers>
      </body>
    </html>
  );
}
