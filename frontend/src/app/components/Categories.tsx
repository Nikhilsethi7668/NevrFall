
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoryStore } from '@/app/store/useCategoryStore';

export default function Categories() {
  const router = useRouter();
  const { categories, loading, error, fetchCategories } = useCategoryStore();
  console.log(categories);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/products?categories=${categoryName}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <h1 className='text-center font-bold text-[12px] md:text-4xl tracking-tight my-6 uppercase'>Categories</h1>
      <div className="grid my-4 mx-2 grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="group flex flex-col cursor-pointer overflow-hidden rounded-md border border-base-300 hover:border-base-400 transition"
            onClick={() => handleCategoryClick(category.name)}
          >
            <img
              src={category.image}
              alt={category.name}
              className="h-[22vh] w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            <h3 className='py-1 px-2 text-left text-[10px]'>
              {category.name}
            </h3>
          </div>
        ))}
      </div>
    </>
  );
}
