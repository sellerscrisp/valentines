// app/layout.tsx
import "./globals.css";
import { Inter, Pacifico } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"] });

export const metadata = {
  title: "Be My Valentine Quiz",
  description: "A special quiz to ask her to be my valentine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* We now use a custom utility class for the background (see globals.css and tailwind config) */}
      <body className={`${inter.className} bg-romanticPink text-foreground`}>
        {children}
      </body>
    </html>
  );
}
