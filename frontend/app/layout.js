import './globals.css'
import I18nProvider from './I18nProvider'
import { SocketProvider } from '../contexts/SocketProvider'

export const metadata = {
  title: 'Printsmart - Smart Printing Simplified',
  description: 'Scan. Upload. Print. Done.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-white">
        <SocketProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </SocketProvider>
      </body>
    </html>
  )
}