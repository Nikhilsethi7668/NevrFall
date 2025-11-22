"use client";
import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-base-100 text-base-content border-t border-base-300">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h2 className="text-2xl font-bold mb-4">NevrFall</h2>
            <p className="text-gray-400">
              Discover the latest trends in fashion and accessories.
            </p>
          </div>
          <div className="col-span-1">
            <h6 className="font-semibold mb-4">Services</h6>
            <nav className="flex flex-col space-y-2">
              <Link href="/branding" className="link link-hover">
                Branding
              </Link>
              <Link href="/design" className="link link-hover">
                Design
              </Link>
              <Link href="/marketing" className="link link-hover">
                Marketing
              </Link>
              <Link href="/advertisement" className="link link-hover">
                Advertisement
              </Link>
            </nav>
          </div>
          <div className="col-span-1">
            <h6 className="font-semibold mb-4">Company</h6>
            <nav className="flex flex-col space-y-2">
              <Link href="/about" className="link link-hover">
                About us
              </Link>
              <Link href="/contact" className="link link-hover">
                Contact
              </Link>
              <Link href="/jobs" className="link link-hover">
                Jobs
              </Link>
              <Link href="/press-kit" className="link link-hover">
                Press kit
              </Link>
            </nav>
          </div>
          <div className="col-span-1">
            <h6 className="font-semibold mb-4">Legal</h6>
            <nav className="flex flex-col space-y-2">
              <Link href="/terms-of-use" className="link link-hover">
                Terms of use
              </Link>
              <Link href="/privacy-policy" className="link link-hover">
                Privacy policy
              </Link>
              <Link href="/cookie-policy" className="link link-hover">
                Cookie policy
              </Link>
            </nav>
          </div>
        </div>
        {/* <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h6 className="font-semibold mb-2">Join our newsletter</h6>
            <p className="text-gray-400">
              Stay up to date with our latest news and promotions.
            </p>
          </div>
          <form>
            <fieldset className="form-control w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  placeholder="username@site.com"
                  className="input input-bordered w-full pr-16"
                />
                <button className="btn btn-primary absolute top-0 right-0 rounded-l-none">
                  Subscribe
                </button>
              </div>
            </fieldset>
          </form>
        </div> */}
        <div className="mt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} NevrFall. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;