import './globals.css'

export const metadata = {
  title: 'Printsmart - Smart Printing Simplified',
  description: 'Scan. Upload. Print. Done.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-white">{children}</body>
    </html>
  )
}