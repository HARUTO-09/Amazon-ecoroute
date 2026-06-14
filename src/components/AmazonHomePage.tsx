import { useState, useEffect } from "react";
import AmazonNav from "./AmazonNav";
import { useAuth } from "../AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const heroBanners = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=3000&q=80",
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=3000&q=80",
  "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=3000&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=3000&q=80",
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=3000&q=80"
];

export default function AmazonHomePage({ onProductClick, onReturnsClick, onP2PClick, onSearch, onLoginClick }: { onProductClick?: (product?: any) => void, onReturnsClick?: () => void, onP2PClick?: () => void, onSearch?: (query: string) => void, onLoginClick?: () => void }) {
  const { currentUser } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [p2pListings, setP2pListings] = useState<any[]>([]);

  useEffect(() => {
    const fetchListings = () => {
      fetch("/api/p2p/listings")
        .then(async res => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          }
          throw new Error("Received non-JSON response");
        })
        .then(data => {
          if (data.success) {
            setP2pListings(data.data);
          }
        })
        .catch(err => {
          // silently ignore to prevent annoying popups locally
        });
    };

    fetchListings(); // initial fetch
    const p2pInterval = setInterval(fetchListings, 3000); // Poll every 3 seconds

    const carouselInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroBanners.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => {
      clearInterval(p2pInterval);
      clearInterval(carouselInterval);
    };
  }, []);

  const otherUsersListings = p2pListings; // Remove filter so user's own items appear here too
  const mainListing = otherUsersListings[0];
  const otherListings = otherUsersListings.slice(1, 3);

  return (
    <div className="bg-[#e3e6e6]">
      <AmazonNav onLogoClick={() => window.location.reload()} onReturnsClick={onReturnsClick} onP2PClick={onP2PClick} onSearch={onSearch} onLoginClick={onLoginClick} />
      
      <main className="max-w-[1500px] mx-auto relative px-4">
        {/* Hero Carousel */}
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[600px] overflow-hidden -mx-4 px-4 box-content group">
          {/* Gradient overlay for fade into content */}
          <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-[#e3e6e6] to-transparent z-10 pointer-events-none"></div>
          
          <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
             {heroBanners.map((banner, index) => (
                <div key={index} className="min-w-full h-full relative">
                  <img src={banner} alt={`Hero Banner ${index + 1}`} className="w-full h-full object-cover object-top" />
                </div>
             ))}
          </div>

          <button 
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1))}
            className="absolute top-20 md:top-32 lg:top-40 left-4 z-20 hover:border hover:border-black p-2 md:p-3 rounded-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f90] focus:bg-white"
            aria-label="Previous slide"
          >
            <ChevronLeft size={48} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter opacity-[0.9] text-black stroke-[1.5]" />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === heroBanners.length - 1 ? 0 : prev + 1))}
            className="absolute top-20 md:top-32 lg:top-40 right-4 z-20 hover:border hover:border-black p-2 md:p-3 rounded-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f90] focus:bg-white"
            aria-label="Next slide"
          >
            <ChevronRight size={48} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter opacity-[0.9] text-black stroke-[1.5]" />
          </button>
        </div>

        {/* Home Content Cards (Grid) */}
        <div className="relative z-20 -mt-[100px] md:-mt-[250px] lg:-mt-[300px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
          
          {/* Card 1: 4 Grid */}
          <div className="bg-white p-4 pt-4 z-20 shadow-sm flex flex-col h-[420px]">
             <h2 className="text-[21px] leading-tight font-bold mb-3 text-[#0F1111]">Appliances for your home | Up to 55% off</h2>
             <div className="grid grid-cols-2 gap-x-4 gap-y-4 flex-1">
               <div className="flex flex-col cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80" alt="AC" className="object-cover h-[100px] mb-1" />
                 <span className="text-xs text-[#0f1111]">Air conditioners</span>
               </div>
               <div className="flex flex-col cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?w=400&q=80" alt="Fridge" className="object-cover h-[100px] mb-1" />
                 <span className="text-xs text-[#0f1111]">Refrigerators</span>
               </div>
               <div className="flex flex-col cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80" alt="Microwave" className="object-cover h-[100px] mb-1" />
                 <span className="text-xs text-[#0f1111]">Microwaves</span>
               </div>
               <div className="flex flex-col cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80" alt="Washing" className="object-cover h-[100px] mb-1" />
                 <span className="text-xs text-[#0f1111]">Washing machines</span>
               </div>
             </div>
             <a href="#" className="text-[#007185] hover:text-[#c45500] hover:underline text-sm font-medium mt-3">See all offers</a>
          </div>

          {/* Card 2: 4 Grid */}
          <div className="bg-white p-4 pt-4 z-20 shadow-sm flex flex-col h-[420px]">
             <h2 className="text-[21px] leading-tight font-bold mb-3 text-[#0F1111]">Revamp your home in style</h2>
             <div className="grid grid-cols-2 gap-x-4 gap-y-4 flex-1">
               <div className="flex flex-col cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" alt="Bedsheets" className="object-cover h-[100px] mb-1" />
                 <span className="text-xs text-[#0f1111]">Bedsheets</span>
               </div>
               <div className="flex flex-col cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80" alt="Home decoration" className="object-cover h-[100px] mb-1" />
                 <span className="text-xs text-[#0f1111]">Home decoration</span>
               </div>
               <div className="flex flex-col cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80" alt="Home storage" className="object-cover h-[100px] mb-1" />
                 <span className="text-xs text-[#0f1111]">Home storage</span>
               </div>
               <div className="flex flex-col cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&q=80" alt="Lighting solutions" className="object-cover h-[100px] mb-1" />
                 <span className="text-xs text-[#0f1111]">Lighting solutions</span>
               </div>
             </div>
             <a href="#" className="text-[#007185] hover:text-[#c45500] hover:underline text-sm font-medium mt-3">Explore all</a>
          </div>

          {/* Card 3: Amazon Resale Application Card (The requested new feature integrated organically like an Amazon promo box) */}
          <div className="bg-white p-4 pt-4 z-20 shadow-sm flex flex-col h-[420px] relative overflow-hidden">
             
             {/* Tag at top right */}
             <div className="absolute top-2 right-2 bg-[#27ae60] text-white text-[11px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm shadow-sm pointer-events-none">
                Resale New
             </div>

             <h2 className="text-[21px] leading-tight font-bold mb-2 text-[#0F1111] pr-20">
               Buy Used. Build Trust.
             </h2>
             <p className="text-sm text-gray-700 mb-2 leading-tight">Amazon Resale: condition graded resale marketplace with Smart Bidding.</p>
             
             <div className="flex-1 flex flex-col gap-3">
                {/* Main Product Promo */}
                {mainListing ? (
                  <div 
                     onClick={() => onProductClick && onProductClick(mainListing)} 
                     className="w-full h-[150px] bg-[#f7f7f7] hover:bg-[#f0f0f0] flex relative cursor-pointer group transition-colors"
                  >
                     <div className="w-[140px] h-full p-2 flex items-center justify-center bg-white">
                        <img src={mainListing.img} alt={mainListing.title} className="object-contain h-[90%] mix-blend-multiply group-hover:scale-105 transition-transform" />
                     </div>
                     <div className="flex-1 p-3 flex flex-col justify-center">
                       <div className="inline-flex items-center bg-[#e8f5e9] border border-[#a5d6a7] px-1.5 py-0.5 rounded-sm mb-1 self-start">
                          <span className="text-[#1b5e20] text-[10px] font-bold">Grade {mainListing.grade} Verified</span>
                       </div>
                       <span className="font-medium text-sm text-[#0f1111] line-clamp-2 leading-snug">{mainListing.title}</span>
                       <div className="text-xs text-gray-500 mt-1">Listed by {mainListing.seller}</div>
                       <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-sm">₹</span>
                          <span className="text-lg text-[#B12704] font-medium leading-none">{mainListing.price.toLocaleString()}</span>
                       </div>
                       {mainListing.health && (
                         <div className="mt-1 flex items-center gap-2">
                           <span className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-medium border border-blue-200">Health: {mainListing.health.conditionScore}/100</span>
                           <span className="text-[10px] bg-green-100 text-green-800 px-1 py-0.5 rounded font-medium border border-green-200">Eco: {mainListing.health.ecoScore}</span>
                         </div>
                       )}
                     </div>
                  </div>
                ) : (
                  <div className="w-full h-[150px] bg-gray-100 flex items-center justify-center text-sm text-gray-500">No listings yet</div>
                )}

                {/* Additional Items grid */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {otherListings.map((item, idx) => (
                    <div key={idx} onClick={() => onProductClick && onProductClick(item)} className="bg-white h-20 relative flex items-center p-1 cursor-pointer hover:underline border border-gray-100 hover:border-gray-200">
                      <img src={item.img} alt={item.title} className="w-[40%] object-contain h-full mix-blend-multiply" />
                      <div className="flex-1 pl-1">
                         <span className={`block text-[10px] font-bold ${item.grade === 'A' ? 'text-green-700' : 'text-yellow-600'}`}>Grade {item.grade}</span>
                         <span className="block text-[#B12704] text-xs">₹{item.price.toLocaleString()}</span>
                         <span className="block text-gray-500 text-[9px] truncate">by {item.seller}</span>
                      </div>
                    </div>
                  ))}
                  {[...Array(Math.max(0, 2 - otherListings.length))].map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-50 h-20 border border-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-400">Empty slot</span>
                    </div>
                  ))}
                </div>
             </div>
             
             <a href="#" onClick={(e) => { e.preventDefault(); onP2PClick?.(); }} className="text-[#007185] hover:text-[#c45500] hover:underline text-sm font-medium mt-3">Shop Quality-Verified Resale items</a>
          </div>

          {/* Card 4: Single Item */}
          <div className="bg-white p-4 pt-4 z-20 shadow-sm flex flex-col h-[420px]">
             <h2 className="text-[21px] leading-tight font-bold mb-3 text-[#0F1111]">Up to 75% off | Electronics & accessories</h2>
             <div className="flex-1 cursor-pointer flex flex-col">
               <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80" alt="Electronics" className="w-full h-[280px] object-cover mb-2" />
             </div>
             <a href="#" className="text-[#007185] hover:text-[#c45500] hover:underline text-sm font-medium mt-auto">See all offers</a>
          </div>

          {/* Card 5: Wide Slider */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 bg-white p-5 pt-4 z-20 shadow-sm overflow-hidden h-[300px]">
             <div className="flex items-center gap-4 mb-3">
               <h2 className="text-[21px] leading-tight font-bold text-[#0F1111]">Customers who viewed items in your browsing history also viewed</h2>
               <a href="#" className="text-[#007185] hover:text-[#c45500] hover:underline text-sm font-medium hidden md:block">Page 1 of 5</a>
             </div>
             
             <div className="flex gap-6 overflow-x-auto hide-scroll px-1 pb-4">
               {/* Product horizontal scroller items */}
               {[
                 {img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", title: "Nike Men's Revolution 6 Running Shoe", price: "3,695.00"},
                 {img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", title: "Sony WH-1000XM4 Noise Cancelling", price: "24,990.00"},
                 {img: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/refurb-45-stainless-graphite-sport-band-midnight-s9?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=eUNRakR3dGYxaW9BQzAzdzRPUlFUVjBoTUc3NjFlV1QzbHd4SVVUcFZVWDE4QUxxTWFsRmJQTXB3MEp1T2pHd0FtWVJCbTFqbVlJVmw3ZkRFUGZoZ0YzaTQrYy82TUg0cFZQeUN1eC9DMlZNQkJEMXc0aklkVno5c3lHT1ZQU0FzcnlGampyTlhrVGsvR1hoblVqQkpn", title: "Apple Watch Series 9 (GPS 45mm)", price: "44,900.00"},
                 {img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80", title: "boAt Rockerz 450 Bluetooth On Ear", price: "1,499.00"},
                 {img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&q=80", title: "Echo Dot (4th Gen) Smart speaker", price: "3,499.00"},
                 {img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80", title: "Fujifilm Instax Mini 11 Camera", price: "5,999.00"},
                 {img: "https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=400&q=80", title: "Amazon Basics 50-Inch Lightweight Tripod", price: "899.00"}
               ].map((item, idx) => (
                 <div key={idx} className="flex-none w-[180px] cursor-pointer group">
                   <div className="h-[200px] mb-2 flex items-center justify-center p-2">
                     <img src={item.img} alt={item.title} className="max-h-[180px] object-contain mix-blend-multiply" />
                   </div>
                   <h3 className="text-[#007185] group-hover:text-[#c45500] text-sm line-clamp-2">{item.title}</h3>
                   <div className="flex text-yellow-500 mt-1">
                     {"★★★★☆".split("").map((star, i) => <span key={i} className="text-xs">{star}</span>)}
                     <span className="text-[#007185] text-xs ml-1 font-sans">{(Math.random() * 10000).toFixed(0)}</span>
                   </div>
                   <div className="text-[#B12704] mt-1 font-medium"><span className="text-xs">₹</span>{item.price}</div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
