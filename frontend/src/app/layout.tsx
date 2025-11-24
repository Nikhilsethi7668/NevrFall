import { ThemeProvider } from './components/ThemeRegistry';
import "./globals.css";
import Providers from './components/Providers';
import { ToastContainer } from 'react-toastify';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400','600','700'] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={poppins.className}>
        <ThemeProvider attribute="data-theme" defaultTheme="gryape">
          <Providers>
            <ToastContainer />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
