import { ThemeProvider } from './components/ThemeRegistry';
import "./globals.css";
import Providers from './components/Providers';
import { ToastContainer } from 'react-toastify';
import Preloader from './components/Preloader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="gryape">
          <Providers>
            <Preloader />
            <ToastContainer />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
