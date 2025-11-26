"use client";
import { Suspense, useState, useEffect } from "react";
import { productAPI } from "@/services/api";
import { useRouter, useSearchParams } from "next/navigation";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";


const SearchPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const storedSearches = localStorage.getItem("recentSearches");
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      fetchResults(initialQuery);
      addRecentSearch(initialQuery);
    }
  }, [initialQuery]);

  const addRecentSearch = (searchQuery: string) => {
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      const updatedSearches = [searchQuery, ...recentSearches.slice(0, 4)];
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }
  };

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await productAPI.search({ q: searchQuery });
      setResults(response.data.items);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/search?q=${query}`);
    }
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    router.push(`/search?q=${searchQuery}`);
  };

  return (
    <div className="container mx-auto p-4">
        <div className="flex items-center rounded-full shadow-md p-2">
            <span
              className="text-gray-500 mx-2 cursor-pointer"
              onClick={() => router.back()}
            ><MdOutlineKeyboardArrowLeft /></span>
            <form onSubmit={handleSearch} className="flex-grow">
              <input
                type="search"
                id="search"
                placeholder="Search for Products?"
                autoComplete="off"
                autoFocus
                className="w-full bg-transparent focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
            <div className="bg-primary rounded-full p-2 cursor-pointer" onClick={handleSearch}>
                <span className="text-base-100"><IoMdSearch /></span>
              </div>
          </div>

          {recentSearches.length > 0 && results.length === 0 && !loading && (
            <div className="mt-4">
              <ul className="menu bg-base-200 rounded-box">
                <li className="menu-title">Recent Searches</li>
                {recentSearches.map((search) => (
                  <li
                    key={search}
                    onClick={() => handleRecentSearchClick(search)}
                  >
                    <a>{search}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {loading && <div className="text-center p-4"><span className="loading loading-spinner loading-lg"></span></div>}
          <div className="mt-4">
            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((product: any) => (
                  <div
                    key={product._id}
                    className="card card-compact bg-base-100 shadow-xl cursor-pointer"
                    onClick={() => router.push(`/product/${product.slug}`)}
                  >
                    <figure>
                      <img
                        src={product.cardVariant.image}
                        alt={product.title}
                      />
                    </figure>
                    <div className="card-body">
                      <h2 className="card-title text-[10px]">{product.title}</h2>
                      <p className="text-[10px]">₹{product.cardVariant.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loading &&
              initialQuery && <div className="text-center p-4"><p>No products found for "{initialQuery}"</p></div>
            )}
          </div>
        </div>
  );
};

const Search = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SearchPage />
  </Suspense>
);

export default Search;