import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900']
});

export const metadata: Metadata = {
  title: 'Smart Inventory & Order Management',
  description: 'Manage products, stock levels, customer orders, and fulfillment workflows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

