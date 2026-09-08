import type { Metadata, Viewport } from 'next';
import { Nunito, Press_Start_2P, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { GameProvider } from '@/components/GameProvider';
import { auth } from '@/lib/auth';

/* Pixel type for chrome only -- lesson prose stays in a rounded, highly
   readable face, because a nine-year-old should never have to decode a
   paragraph set in 8-bit capitals. */
const pixel = Press_Start_2P({
  variable: '--font-pixel',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const body = Nunito({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Petualangan Git — Git Adventure',
  description:
    'Belajar Git lewat permainan petualangan. Learn Git through an adventure game.',
};

export const viewport: Viewport = {
  themeColor: '#0b1120',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const session = await auth();

  return (
    <html
      lang="id"
      className={`${pixel.variable} ${body.variable} ${mono.variable} h-full`}
    >
      <body>
        <GameProvider signedIn={Boolean(session?.user)}>{children}</GameProvider>
      </body>
    </html>
  );
}
