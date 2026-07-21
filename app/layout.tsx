import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'DealVault — Deals Worth Paying For',
  description: 'Curated shopping deals from major retailers. Real discounts, verified prices, zero clutter. Members save $200+/month.',
  keywords: ['deals', 'shopping deals', 'discount', 'coupons', 'retail deals', 'membership deals'],
  openGraph: {
    title: 'DealVault — Deals Worth Paying For',
    description: 'Curated shopping deals from major retailers. Zero clutter. Members save $200+/month.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  );
}
