import './globals.css'
import I18nProvider from './I18nProvider'
import { SocketProvider } from '../contexts/SocketProvider'
import Script from 'next/script'

export const metadata = {
  title: 'Printsmart - Smart Printing Simplified',
  description: 'Scan. Upload. Print. Done.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-white">
        {/* Google Analytics Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YQMZX7S9W8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YQMZX7S9W8');
          `}
        </Script>

        <SocketProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </SocketProvider>
      </body>
    </html>
  )
}