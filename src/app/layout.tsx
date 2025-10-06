import "./globals.css";
import Providers from "@/components/common/Providers";
import { Metadata } from "next";
import ProtectedRoute from "@/components/protectedRoutes/ProtectedRoute";
import Image from "next/image";
import { Inter, Montserrat, Roboto } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // choose weights you need
});

export const interFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"], // choose weights you need
});
export const robotoFont = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600"], // choose weights you need
});
const metadata: Metadata = {
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
        className={`relative font-outfit dark:bg-gray-900 min-h-screen  ${montserrat.className} `}
        suppressHydrationWarning={true}
      >
        {/* Background Wrapper */}
        <div className="fixed inset-0 -z-20">
          {/* Blurred full background */}
          <Image
            src="/images/final7.jpg"
            alt="Blurred Background"
            fill
            priority
            className="object-cover blur-2xl scale-110"
          />

          {/* Centered main image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/images/final7.jpg"
              alt="Main Background"
              width={1920}   // replace with your image's actual width
              height={1080}  // replace with your image's actual height
              priority
              className="object-contain relative z-10"
            />
          </div>
        </div>

        {/* Dark overlay */}
        <div className="fixed inset-0 -z-10 bg-black/30 backdrop-blur-[15px] " />

        <Providers>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Providers>
      </body>
    </html>
  );
}
