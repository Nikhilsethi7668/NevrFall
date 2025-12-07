"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";

interface HeroSectionProps {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    imageSrc?: string;
    videoSrc?: string;
    className?: string;
    overlayOpacity?: number;
    height?: 'full' | 'tall' | 'medium';
}

export default function HeroSection({
    title,
    subtitle,
    ctaText = "Get In",
    ctaLink = "/products",
    imageSrc,
    videoSrc,
    className = "",
    overlayOpacity = 0,
    height = 'tall',
}: HeroSectionProps) {
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const heightClasses = {
        full: 'h-screen',
        tall: 'h-[650px]',
        medium: 'h-[500px]',
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <section className={`relative w-full ${heightClasses[height]} overflow-hidden ${className}`}>
            {/* Background Media */}
            <div className="absolute inset-0">
                {videoSrc ? (
                    <div className="relative w-full h-full">
                        <video
                            ref={videoRef}
                            className="absolute inset-0 w-full h-full object-cover"
                            src={videoSrc}
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    </div>
                ) : imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={title || "Hero"}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gryape-dark to-black" />
                )}
            </div>

            {/* Overlay */}
            {overlayOpacity > 0 && (
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: overlayOpacity }}
                />
            )}

            {/* Content - Bottom Left Aligned */}
            <div className="absolute inset-0 flex items-end justify-start p-8 md:p-12 lg:p-16">
                <div className="flex flex-col gap-6 max-w-md">
                    {/* CTA Button */}
                    {ctaText && ctaLink && (
                        <div className="flex">
                            <Link
                                href={ctaLink}
                                className="inline-block bg-white text-black px-10 py-3.5 md:px-12 md:py-4 uppercase tracking-[0.2em] text-[11px] md:text-xs font-semibold hover:bg-gryape-yellow transition-all duration-300 shadow-sm"
                            >
                                {ctaText}
                            </Link>
                        </div>
                    )}

                    {/* Optional Title/Subtitle */}
                    {(title || subtitle) && (
                        <div className="text-white mt-2">
                            {title && (
                                <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold uppercase tracking-wider mb-2">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-sm md:text-base text-white/90">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
