"use client"
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  useEffect(() => {
    function autoLogin() {
      const kwikPassText = document.getElementById('kwik-pass-text');
      if (kwikPassText) {
        kwikPassText.textContent = "ACCOUNT";
      }
    }

    window.addEventListener('user-loggedin', function(event: any) {
      const { token } = event?.detail;
      if (token) {
        autoLogin();
      }
    });

    const userToken = localStorage.getItem('KWIKSESSIONTOKEN');
    if (userToken) {
      autoLogin();
    }
  }, []);

  const kpHandleLogin = (route: string) => {
    // Define the kpHandleLogin function logic here
    console.log(`kpHandleLogin called with route: ${route}`);
  };

  return (
    <footer
      id="FooterMinimal"
      className="py-8 border-t border-gray-200"
      role="contentinfo"
    >
      <div className="px-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.svg"
              alt="GRYAPE"
              width="2165"

              height="450"
              loading="lazy"
            />
          </Link>
        </div>
      </div>

      <div className="pt-4 pb-4 px-8 text-center">
        <div>
          <div className="flex flex-col items-center">
            <div className="flex flex-wrap justify-center">
              <Link href="/pages/about-us" className="mx-2 text-gray-500 text-[9px] hover:text-black">
                ABOUT US
              </Link>
              <Link href="/pages/contact" className="mx-2 text-gray-500 text-[9px] hover:text-black">
                CONTACT US
              </Link>
              <Link
                href="/pages/client-services"
                className="mx-2 text-gray-500 text-[9px] hover:text-black"
              >
                CLIENT SERVICES
              </Link>
              <Link href="/pages/shipping-policy" className="mx-2 text-gray-500 text-[9px] hover:text-black">
                SHIPPING
              </Link>
              <Link href="/pages/faq" className="mx-2 text-gray-500 text-[9px] hover:text-black">
                FAQ
              </Link>
              <Link
                href="/pages/terms-and-conditions"
                className="mx-2 text-gray-500 text-[9px] hover:text-black"
              >
                TERMS
              </Link>
              <Link href="/pages/careers" className="mx-2 text-gray-500 text-[9px] hover:text-black">
                CAREERS
              </Link>
              <Link
                href="#"
                className="mx-2 text-gray-500 text-[9px] hover:text-black cursor-pointer"
                id="kwik-pass-text"
                onClick={() => kpHandleLogin('/account')}
              >
                ACCOUNT
              </Link>
              <Link
                href="https://gryape.com/apps/return_prime"
                className="mx-2 text-gray-500 text-[9px] hover:text-black"
              >
                PLACE AN EXCHANGE
              </Link>
              <Link
                href="https://gryape.com/pages/return-exchange"
                className="mx-2 text-gray-500 text-[9px] hover:text-black"
              >
                EXCHANGE POLICY
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
