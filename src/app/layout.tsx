import type { Metadata } from 'next'
import { Space_Grotesk, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PCSE 한국어 연습 문제',
  description: 'GCP Professional Cloud Security Engineer 시험 한국어 학습',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${spaceGrotesk.variable} ${notoSansKR.variable} bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
