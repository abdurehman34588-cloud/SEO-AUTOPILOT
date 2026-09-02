import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'SEO AUTOPILOT — Turn Your Website Into an SEO Action Plan',
  description:
    'Scan your website, uncover SEO problems, understand what they mean, and get practical recommendations to improve your search visibility.',
  keywords: ['SEO audit', 'technical SEO', 'on-page SEO', 'AI recommendations', 'SEO health score', 'SEO crawler'],
  authors: [{ name: 'SEO Autopilot Team' }],
  openGraph: {
    title: 'SEO AUTOPILOT — Turn Your Website Into an SEO Action Plan',
    description:
      'Scan your website, uncover SEO problems, understand what they mean, and get practical recommendations to improve your search visibility.',
    type: 'website',
    locale: 'en_US',
    siteName: 'SEO AUTOPILOT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO AUTOPILOT — Turn Your Website Into an SEO Action Plan',
    description: 'Scan your website, uncover SEO problems, and get a prioritized AI action plan.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
