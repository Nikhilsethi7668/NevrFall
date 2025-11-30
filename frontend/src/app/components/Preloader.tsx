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
            className={`fixed inset-0 z-9999 flex items-center justify-center bg-black transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"
                }`}
        >
            <img src="/logo.svg" alt="Loading..." className="w-full animate-pulse" />
        </div>
    );
}
