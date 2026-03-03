import type { Metadata } from 'next';
import { Inter, Montserrat, Cormorant_Garamond, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant'
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: 'Travel Asset Engine',
  description: 'Digital Magazine Itineraries by LuxeTravel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${cormorant.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
