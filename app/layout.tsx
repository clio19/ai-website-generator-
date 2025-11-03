import {ClerkProvider} from '@clerk/nextjs'
import {Outfit } from "next/font/google";
import "./globals.css";
import Provider from './provider';
import { Toaster } from '@/components/ui/sonner';

const outfit = Outfit({
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${outfit.className}`}
        >
          <Provider>
            {children}
            <Toaster/>
          </Provider>
      </body>
    </html>
    </ClerkProvider>
  );
}
