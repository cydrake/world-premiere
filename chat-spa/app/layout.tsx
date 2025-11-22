import type { Metadata } from 'next'
import { Varela_Round } from 'next/font/google'
import Image from 'next/image'
import './globals.css'

const varelaRound = Varela_Round({ subsets: ['latin'], weight: ['400'] })

export const metadata: Metadata = {
  title: 'Teu Tale Chat',
  description: 'A magical chat experience',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={varelaRound.className}>
        <div className="fixed inset-0 -z-10">
          <Image
            src="/bg.png"
            alt="Magical Background"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: 'cover',
            }}
          />
        </div>
        {children}
      </body>
    </html>
  )
}
