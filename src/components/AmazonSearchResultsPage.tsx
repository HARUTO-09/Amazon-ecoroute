import React, { useState } from "react";
import { Star, ChevronDown } from "lucide-react";

export default function AmazonSearchResultsPage({ query, onProductClick }: { query: string, onProductClick?: (product?: any) => void }) {
  // We mock the new shoes sold by Amazon since user searched for shoes
  
  const mockProducts = [
    {
      id: 1,
      title: "Nike Men's Revolution 6 Running Shoe",
      price: "3,695",
      originalPrice: "4,995",
      rating: 4,
      reviews: "1,245",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      prime: true,
      soldByAmazon: true
    },
    {
      id: 2,
      title: "Puma Men's Dazzler Sneakers",
      price: "1,499",
      originalPrice: "3,499",
      rating: 4.5,
      reviews: "8,321",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80",
      prime: true,
      soldByAmazon: true
    },
    {
      id: 3,
      title: "Adidas Mens Lite Racer 2.0 Running Shoe",
      price: "2,249",
      originalPrice: "3,999",
      rating: 4,
      reviews: "5,432",
      image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400&q=80",
      prime: true,
      soldByAmazon: true
    },
    {
      id: 4,
      title: "Reebok Men's Energy Runner Lp Running Shoes",
      price: "1,199",
      originalPrice: "2,199",
      rating: 3.5,
      reviews: "982",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
      prime: true,
      soldByAmazon: true
    }
  ];

  return (
    <div className="flex flex-col font-sans w-full min-h-screen bg-white">
      {/* Search results header */}
      <div className="border-b border-gray-200 shadow-sm py-2 px-4 flex items-center justify-between text-sm bg-white">
        <div>
          <span className="font-bold">1-4 of over 20,000 results for</span>
          <span className="text-[#c45500] font-bold ml-1">"{query}"</span>
        </div>
        <div className="flex items-center gap-2 border border-gray-300 rounded shadow-sm px-2 py-1 bg-[#f0f2f2] cursor-pointer hover:bg-[#e3e6e6]">
          <span className="text-xs">Sort by:</span>
          <span className="text-xs font-semibold">Featured</span>
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </div>

      <div className="flex flex-1 max-w-[1500px] mx-auto w-full">
        {/* Left Sidebar (Filters) */}
        <div className="w-[240px] pl-4 pr-6 py-4 hidden md:block flex-shrink-0 border-r border-gray-100">
          <h3 className="font-bold mb-2">Department</h3>
          <ul className="text-sm text-[#0f1111] mb-4 space-y-1">
            <li className="hover:text-[#c45500] cursor-pointer font-bold">Shoes & Handbags</li>
            <li className="hover:text-[#c45500] cursor-pointer pl-2">Men's Shoes</li>
            <li className="hover:text-[#c45500] cursor-pointer pl-2">Women's Shoes</li>
            <li className="hover:text-[#c45500] cursor-pointer pl-2">Boys' Shoes</li>
            <li className="hover:text-[#c45500] cursor-pointer pl-2">Girls' Shoes</li>
          </ul>

          <h3 className="font-bold mb-1">Customer Review</h3>
          <div className="text-sm space-y-1 mb-4 text-[#e77600]">
            <div className="flex items-center cursor-pointer hover:text-[#c45500]">
              {'★★★★☆'.split('').map((star, i) => <span key={i}>{star}</span>)}
              <span className="text-[#0f1111] ml-1">& Up</span>
            </div>
            <div className="flex items-center cursor-pointer hover:text-[#c45500]">
              {'★★★☆☆'.split('').map((star, i) => <span key={i}>{star}</span>)}
              <span className="text-[#0f1111] ml-1">& Up</span>
            </div>
          </div>

          <h3 className="font-bold mb-1">Brand</h3>
          <ul className="text-sm text-[#0f1111] mb-4 space-y-1">
            <li className="flex items-center gap-2 cursor-pointer hover:text-[#c45500]"><input type="checkbox" className="accent-[#007185]"/> Nike</li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-[#c45500]"><input type="checkbox" className="accent-[#007185]"/> Puma</li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-[#c45500]"><input type="checkbox" className="accent-[#007185]"/> Adidas</li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-[#c45500]"><input type="checkbox" className="accent-[#007185]"/> Reebok</li>
          </ul>

          <h3 className="font-bold mb-1">Price</h3>
          <ul className="text-sm text-[#0f1111] space-y-1 mb-4">
            <li className="hover:text-[#c45500] cursor-pointer">Under ₹1,000</li>
            <li className="hover:text-[#c45500] cursor-pointer">₹1,000 - ₹5,000</li>
            <li className="hover:text-[#c45500] cursor-pointer">₹5,000 - ₹10,000</li>
            <li className="hover:text-[#c45500] cursor-pointer">Over ₹10,000</li>
          </ul>
        </div>

        {/* Main Search Results */}
        <div className="flex-1 p-4 pb-12">
          <h2 className="text-xl font-bold mb-4">Results</h2>
          
          <div className="flex flex-col gap-4">
            {mockProducts.map((product) => (
              <div key={product.id} className="flex border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                {/* Image container */}
                <div 
                  className="w-[250px] bg-[#f8f8f8] flex items-center justify-center p-4 cursor-pointer"
                  onClick={() => onProductClick && onProductClick(product)}
                >
                  <img src={product.image} alt={product.title} className="max-h-[180px] object-contain mix-blend-multiply" />
                </div>
                
                {/* Product Info */}
                <div className="flex-1 p-4">
                  <h2 
                    className="text-lg font-medium text-[#0f1111] hover:text-[#c45500] cursor-pointer"
                    onClick={() => onProductClick && onProductClick(product)}
                  >
                    {product.title}
                  </h2>
                  
                  <div className="flex items-center gap-1 mt-1 text-[#e77600] text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? "text-[#e77600]" : "text-gray-300"}>★</span>
                    ))}
                    <span className="text-[#007185] text-xs ml-1 hover:underline cursor-pointer">{product.reviews}</span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-sm">₹</span>
                    <span className="text-2xl font-medium">{product.price}</span>
                    <span className="text-sm text-gray-500 ml-1">M.R.P: <span className="line-through">₹{product.originalPrice}</span></span>
                    <span className="text-sm text-[#0f1111] ml-2">(Save {(100 - (parseFloat(product.price.replace(/,/g, '')) / parseFloat(product.originalPrice.replace(/,/g, '')) * 100)).toFixed(0)}%)</span>
                  </div>

                  {product.prime && (
                    <div className="mt-1 flex items-center">
                      <span className="text-[#00a8e1] font-bold italic mr-1 text-sm">prime</span>
                      <span className="text-xs text-[#0f1111]">Get it by <span className="font-bold">Tomorrow, June 14</span></span>
                    </div>
                  )}
                  
                  <div className="text-xs text-[#0f1111] mt-1">
                    FREE Delivery by Amazon
                  </div>

                  {product.soldByAmazon && (
                    <div className="mt-2 text-xs text-[#0f1111]">
                      Condition: <span className="font-bold">New</span> | Sold by <span className="text-[#007185]">Amazon Retail</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
