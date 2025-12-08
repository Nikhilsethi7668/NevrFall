'use client';

import { useCategoryStore } from '../store/useCategoryStore';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';

const TopCategories = () => {
    const { categories, fetchCategories } = useCategoryStore();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Take first 4 categories as "Top" (2 rows × 2 columns)
    const topCategories = categories.slice(0, 4);

    if (topCategories.length === 0) return null;

    // Helper to check for fake/placeholder images from third parties
    const isValidImage = (url: string | undefined) => {
        if (!url) return false;
        // if (url.includes('unsplash.com')) return false;
        // if (url.includes('gstatic.com')) return false;
        return true;
    };

    return (
        <section className="py-10 lg:py-12">
            <div className="container mx-auto">
                <header className="section__header mb-8">
                    <div className="text-container px-4">
                        <h3 className="heading text-xl font-bold tracking-wider uppercase text-left">
                            TOP CATEGORIES
                        </h3>
                    </div>
                </header>

                <div className="shop-by-category">
                    <div className="shop-by-category_grid grid grid-cols-2 gap-2 px-2">
                        {topCategories.map((category) => (
                            <div key={category._id} className="shop-by-category_item">
                                <Link
                                    href={`/products?categories=${category.name}`}
                                    className="shop-by-category_item-inner block relative aspect-[2/3] overflow-hidden group"
                                >
                                    <div className="shop-by-category_item-img_wrap relative w-full h-full">
                                        <Image
                                            src={isValidImage(category.image) ? (category.image as string) : '/placeholder.png'}
                                            alt={category.name}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 740px) 52vw, calc(min(100vw - 80px, 1520px) / 2)"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="absolute inset-0 flex items-end justify-center pb-4">
                                        <span className="text-white text-sm sm:text-base font-bold uppercase tracking-widest drop-shadow-lg">
                                            {category.name}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TopCategories;
