import {ClerkProvider} from '@clerk/nextjs'
import {Outfit } from "next/font/google";
import "./globals.css";
import Provider from './provider';

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
          </Provider>
      </body>
    </html>
    </ClerkProvider>
  );
}
