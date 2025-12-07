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
                    <div className="text-container">
                        <h3 className="heading text-xl lg:text-2xl font-bold tracking-wider uppercase text-left">
                            TOP CATEGORIES
                        </h3>
                    </div>
                </header>

                <div className="shop-by-category">
                    {/* Desktop: 4 columns, Mobile: 2 columns with better spacing */}
                    <div className="shop-by-category_grid grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {topCategories.map((category) => (
                            <div key={category._id} className="shop-by-category_item">
                                <Link
                                    href={`/products?categories=${category.name}`}
                                    className="shop-by-category_item-inner block relative aspect-[2/3] overflow-hidden group rounded-lg"
                                >
                                    <div className="shop-by-category_item-img_wrap relative w-full h-full">
                                        <Image
                                            src={isValidImage(category.image) ? (category.image as string) : '/placeholder.png'}
                                            alt={category.name}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 1024px) 50vw, 25vw"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="absolute inset-0 flex items-end justify-center pb-4 lg:pb-6 bg-gradient-to-t from-black/60 to-transparent">
                                        <span className="text-white text-sm lg:text-base font-bold uppercase tracking-widest drop-shadow-lg">
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
