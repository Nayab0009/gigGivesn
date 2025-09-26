import "./globals.css";
import Providers from "@/components/common/Providers";
import { Metadata } from "next";
import ProtectedRoute from "@/components/protectedRoutes/ProtectedRoute";
import Image from "next/image";
import {Montserrat} from "next/font/google";

const montserrat  = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // choose weights you need
});

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
        className={`relative font-outfit dark:bg-gray-900 min-h-screen ${montserrat.className} `}
        suppressHydrationWarning={true}
        
      >
        {/* Background Image */}
        <div className="fixed inset-0 -z-20">
          <Image
            src="/images/Image (2).jpg"
            alt="Background"
            fill
            priority
            className="object-cover"
          />
        </div>

<div className="fixed inset-0 -z-10 bg-black/30 backdrop-blur-[35px]"></div>

        <Providers>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Providers>
      </body>
    </html>
  );
}
