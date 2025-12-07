import { ThemeProvider } from './components/ThemeRegistry';
import "./globals.css";
import Providers from './components/Providers';
import { ToastContainer } from 'react-toastify';
import { Inter, Oswald } from 'next/font/google';
import Preloader from './components/Preloader';
import { PageLoadProvider } from './context/PageLoadContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.variable} ${oswald.variable} font-sans antialiased`}>
        <ThemeProvider attribute="data-theme" defaultTheme="light">
          <Providers>
            <PageLoadProvider>
              <Preloader />
              <ToastContainer />
              {children}
            </PageLoadProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
