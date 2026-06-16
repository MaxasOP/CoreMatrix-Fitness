import { Space_Grotesk, Bebas_Neue } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata = {
  title: "CoreMatrix - Premium Fitness & Nutrition Tracker",
  description: "CoreMatrix is a premium fitness and nutrition dashboard featuring workout logging, meal planning, AI dietician, AI workout generator, video form analysis, and progress tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
