import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "./globals.css";
import { Providers } from '@/components/shared/Providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Umudugudu Connect',
  description: 'Village Governance Platform — Rwanda',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col bg-[#f8fafc]`}>
        <Providers>
          <div className="flex-1">{children}</div>
          <footer className="border-t border-gray-100 bg-[#f8fafc] px-4 py-2 text-center text-sm font-semibold text-gray-300">
            © 2026 Umudugudu Connect System. All rights reserved.
          </footer>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
