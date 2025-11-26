"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
    const [loading, setLoading] = useState(true);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const handleLoad = () => {
            setFading(true);
            setTimeout(() => {
                setLoading(false);
            }, 500); // Wait for fade out animation
        };

        // Check if document is already loaded
        if (document.readyState === "complete") {
            // Add a small delay to ensure the preloader is seen if the page loads instantly
            setTimeout(handleLoad, 800);
        } else {
            window.addEventListener("load", handleLoad);
            // Fallback timeout in case load event doesn't fire or takes too long
            const timeout = setTimeout(handleLoad, 3000);
            return () => {
                window.removeEventListener("load", handleLoad);
                clearTimeout(timeout);
            };
        }
    }, []);

    if (!loading) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-base-100 transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"
                }`}
        >
            <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-r-4 border-secondary rounded-full animate-spin reverse-spin"></div>
                    <div className="absolute inset-4 border-b-4 border-accent rounded-full animate-spin"></div>
                </div>
                <h1 className="mt-8 text-2xl font-bold tracking-widest animate-pulse">
                    NEVRFALL
                </h1>
            </div>
            <style jsx>{`
        .reverse-spin {
          animation-direction: reverse;
          animation-duration: 1.5s;
        }
      `}</style>
        </div>
    );
}
