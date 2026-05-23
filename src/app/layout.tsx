import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import '@/app/globals.css';
import { ToastContainer } from '@/components/ui/Toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Askly - Elegant Anonymous Social Messaging for Creators',
  description: 'Askly is an aesthetic anonymous messaging platform. Create a unique public link, gather secret feedback, and export gorgeous gradient question cards ready for Instagram Stories!',
  keywords: ['anonymous messaging', 'ngl alternative', 'instagram secrets', 'askly', 'anonymous feedback', 'creator social app'],
  authors: [{ name: 'Askly Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Askly - Elegant Anonymous Social Messaging',
    description: 'Create a unique link, gather secret feedback, and export gorgeous gradient question cards ready for Instagram Stories!',
    url: '/',
    siteName: 'Askly',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Askly Social Messaging',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Askly - Elegant Anonymous Social Messaging',
    description: 'Aesthetic anonymous messaging. Share your unique link and export gorgeous gradient cards for Instagram!',
    images: ['/og-image.png'],
  },
};

// Inline theme script injected before React hydration to prevent FOUC and hydration mismatch.
// Reads localStorage and system preference, then sets the `dark` class on <html> immediately.
const themeScript = `
  try {
    var t = localStorage.getItem('theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is required here because the theme script
    // modifies className before React hydrates, causing a mismatch by design.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Run theme script synchronously before any paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Google Font: Outfit */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-purple-500/20 selection:text-purple-900 dark:selection:text-purple-200`}
      >
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
