import { useState, useEffect } from "react";
import { Star, ShieldCheck, Leaf, Info, Zap, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AmazonProductPage({ onReturnClick, product, onCheckoutClick }: { onReturnClick?: () => void, product?: any, onCheckoutClick?: (product: any, price: number, tokensEarned: number) => void }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [purchaseType, setPurchaseType] = useState<"new" | "used">(product ? "used" : "new");
  const [showHealthCard, setShowHealthCard] = useState(false);

  useEffect(() => {
    if (purchaseType === "used" && product?.size) {
      setSelectedSize(product.size);
    }
  }, [purchaseType, product]);

  // Negotiation State
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(1200);
  const [negotiating, setNegotiating] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState<any>(null);

  const getProductSpecs = () => {
    if (!product) return [
      "Sole: Rubber", "Closure: Lace-Up", "Fit Type: Regular", "Shoe Width: Medium", "Material Type: Mesh"
    ];
    
    const title = product.title.toLowerCase();
    if (title.includes("apple watch")) {
      return [
        "Brand: Apple",
        "Operating System: watchOS",
        "Memory Storage Capacity: 64 GB",
        "Connectivity Technology: Bluetooth, Wi-Fi",
        "Battery Life: 18 hours"
      ];
    } else if (title.includes("headphone") || title.includes("wh-1000")) {
      return [
        "Brand: Sony",
        "Form Factor: Over Ear",
        "Connectivity Technology: Wireless",
        "Noise Control: Active Noise Cancellation",
        "Model Name: WH-1000"
      ];
    } else if (title.includes("shoe") || title.includes("sneaker")) {
      return [
        "Sole: Rubber", "Closure: Lace-Up", "Fit Type: Regular", "Shoe Width: Medium", "Material Type: Mesh"
      ];
    }
    
    return [
      "Brand: Generic",
      "Style: Modern",
      "Condition: " + (product.grade === 'A' ? "Like New" : "Good"),
      "Original Packaging: Yes"
    ];
  };

  const isShoes = !product || product?.title?.toLowerCase().includes("shoe") || product?.title?.toLowerCase().includes("sneaker");

  // Pricing logic
  let mrpText = "3,695.00";
  let newPriceText = "3,695.00";
  let usedPriceText = "1,500.00";
  let discountText = "-59%";

  if (product) {
    if (product.soldByAmazon) {
      mrpText = `${product.originalPrice}`;
      newPriceText = `${product.price}`;
      const priceVal = parseFloat(product.price.replace(/,/g, ''));
      usedPriceText = Math.floor(priceVal * 0.6).toLocaleString('en-IN');
      const mrpVal = parseFloat(product.originalPrice.replace(/,/g, ''));
      discountText = `-${Math.round((1 - priceVal/mrpVal)*100)}%`;
    } else {
      usedPriceText = typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : product.price;
      if (product.title.toLowerCase().includes("apple")) {
        mrpText = "44,900";
        newPriceText = "42,500";
      } else if (product.title.toLowerCase().includes("sony")) {
        mrpText = "29,990";
        newPriceText = "24,990";
      } else {
        mrpText = "4,995";
        newPriceText = "3,695";
      }
      const usedVal = typeof product.price === 'number' ? product.price : parseFloat(product.price.replace(/,/g, ''));
      const mrpVal = parseFloat(mrpText.replace(/,/g, ''));
      discountText = `-${Math.round((1 - usedVal/mrpVal)*100)}%`;
    }
  }

  const currentDisplayPrice = purchaseType === "new" ? newPriceText : usedPriceText;
  const showDiscount = purchaseType === "used" || (product?.soldByAmazon);
  
  const recommendedSize = "10";
  const [isWarningAccepted, setIsWarningAccepted] = useState(false);

  const getReturnPreventionInfo = () => {
    if (!selectedSize) {
      return {
        type: 'info',
        title: 'Amazon Fit Advisor',
        message: `Based on your return history and foot profile, size ${recommendedSize} has a 98% keep rate.`,
        subMessage: 'Best return = no return. Help us reduce shipping emissions.',
        icon: 'zap'
      };
    }
    
    if (selectedSize === recommendedSize) {
      return {
        type: 'success',
        title: 'High Confidence Fit',
        message: `Customers with your footprint keep size ${recommendedSize} 98% of the time.`,
        subMessage: 'Thank you for buying your true size! You saved 12kg of CO₂.',
        icon: 'leaf'
      };
    }

    return {
      type: 'warning',
      title: 'High Return Risk Detected',
      message: `Customers with your foot profile heavily prefer size ${recommendedSize} in this brand over size ${selectedSize}.`,
      subMessage: 'Returns create 12kg of CO₂. Are you sure about this size?',
      icon: 'alert'
    };
  };

  const preventionInfo = getReturnPreventionInfo();

  const handleSmartBid = async () => {
    setNegotiating(true);
    try {
      const res = await fetch("/api/negotiations/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerMaxPrice: bidAmount })
      });
      const data = await res.json();
      setTimeout(() => {
         setNegotiationResult(data.data);
         setNegotiating(false);
      }, 2500); // Radar animation delay
    } catch (e) {
      setTimeout(() => {
         setNegotiationResult({
           status: "closed",
           dealPrice: bidAmount > 1400 ? 1400 + (bidAmount - 1400) * 0.35 : 1350,
           systemNarrative: `Our system closed the deal at ₹1,350, saving both parties time!`,
           tokensEarned: 50
         });
         setNegotiating(false);
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col bg-white text-[#0f1111] font-sans relative">
      <div className="max-w-[1500px] mx-auto w-full px-4 pt-4 pb-12">
        {/* Breadcrumbs */}
        <div className="text-sm text-[#565959] mb-4">
          {isShoes 
            ? "Shoes & Handbags › Shoes › Men's Shoes › Sports & Outdoor Shoes › Running Shoes"
            : product?.title?.toLowerCase().includes("apple watch") 
              ? "Electronics › Wearable Technology › Smartwatches"
              : "Electronics › Headphones, Earbuds & Accessories › Over-Ear Headphones"
          }
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Images */}
          <div className="flex-none lg:w-[450px]">
             {/* Main Image View */}
             <div className="w-full aspect-square bg-gray-50 flex items-center justify-center p-4">
               {/* Simulating product image */}
               <img 
                 src={product?.img || product?.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} 
                 alt={product?.title || "Nike Shoe"} 
                 className="mix-blend-multiply w-[90%] object-contain"
               />
             </div>
             {/* Thumbnail gallery mocked */}
             <div className="flex gap-2 mt-4 overflow-x-auto">
                <div className="w-12 h-12 border-2 border-blue-400 rounded-sm overflow-hidden flex items-center justify-center bg-gray-50 p-1">
                   <img src={product?.img || product?.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} alt="Thumb" className="mix-blend-multiply opacity-80" />
                </div>
                <div className="w-12 h-12 border border-gray-300 rounded-sm overflow-hidden flex items-center justify-center bg-gray-50 p-1">
                   <img src={product?.img || product?.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} alt="Thumb" className="mix-blend-multiply opacity-50 grayscale" />
                </div>
             </div>
          </div>

          {/* Center Column: Details */}
          <div className="flex-1">
            <h1 className="text-2xl font-medium leading-tight mb-2">
              {product?.title || "Nike Men's Revolution 6 Running Shoe"}
            </h1>
            <a href="#" className="text-[#007185] hover:text-[#c45500] hover:underline text-sm font-medium">
              Visit the {product?.title?.toLowerCase().includes("apple") ? "Apple" : product?.title?.toLowerCase().includes("sony") ? "Sony" : "Nike"} Store
            </a>

            {/* Ratings */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center text-[#ffa41c]">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} className={product?.rating && product.rating >= 4.5 ? "fill-currentColor" : "text-gray-300"} />
                <span className="text-[#007185] ml-2 text-sm">{product?.reviews || "42,109"} ratings</span>
              </div>
              <span className="text-sm font-medium">| Search this page</span>
            </div>
            
            <hr className="my-4 border-gray-200" />

            {/* Price block generic */}
            <div className="mb-4">
               <span className="text-gray-500 line-through text-sm font-medium leading-none">M.R.P.: ₹{mrpText}</span>
               <div className="flex items-start gap-1">
                {showDiscount && <span className="text-sm mt-1">{discountText}</span>}
                <span className="text-[28px] text-[#B12704] leading-none">
                  <span className="text-sm align-super">₹</span>
                  {currentDisplayPrice}
                </span>
               </div>
               <p className="text-sm text-[#007185] font-medium leading-loose">Inclusive of all taxes</p>
               {purchaseType === "used" && (
                 <div className="inline-flex items-center mt-2 px-2 py-1 rounded-sm bg-[#e8f5e9] border border-[#a5d6a7]">
                    <Leaf size={14} className="text-[#2e7d32] mr-1" />
                    <span className="text-[#1b5e20] text-xs font-bold uppercase mapping-widest">
                       Amazon P2P Resale Listing
                    </span>
                 </div>
               )}
            </div>

            {isShoes && (
              <div className="mb-4">
                {/* Size Selector */}
                <div className="flex items-baseline justify-between w-full max-w-xs mb-2">
                  <p className="text-sm font-bold">Size: <span className="font-normal">{selectedSize || "Select"}</span></p>
                  <a href="#" className="text-xs text-[#007185]">Size Chart</a>
                </div>
                
                <div className="flex flex-wrap gap-2 max-w-sm">
                  {purchaseType === "used" && product?.size ? (
                    <button 
                      onClick={() => setSelectedSize(product.size)}
                      className={`border border-orange-400 bg-orange-50 rounded-sm px-3 py-1.5 text-sm min-w-[3rem] transition-colors`}
                    >
                      {product.size}
                    </button>
                  ) : (
                    ["9", "9.5", "10", "10.5", "11"].map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`border ${selectedSize === size ? 'border-orange-400 bg-orange-50' : 'border-gray-300 bg-white hover:bg-gray-50'} rounded-sm px-3 py-1.5 text-sm min-w-[3rem] transition-colors`}
                      >
                        {size}
                      </button>
                    ))
                  )}
                </div>

                {/* HACKATHON FEATURE: RETURN PREVENTION */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={preventionInfo.type}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`mt-4 p-3 border rounded-lg max-w-md flex items-start gap-3 transition-colors duration-300 ${
                      preventionInfo.type === 'warning' ? 'bg-red-50 border-red-300' :
                      preventionInfo.type === 'success' ? 'bg-green-50 border-green-300' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                     <div className={`p-1.5 rounded-full mt-0.5 ${
                        preventionInfo.type === 'warning' ? 'bg-red-100' :
                        preventionInfo.type === 'success' ? 'bg-green-100' :
                        'bg-blue-100'
                     }`}>
                       {preventionInfo.icon === 'zap' && <Zap size={18} className="text-blue-600" />}
                       {preventionInfo.icon === 'leaf' && <Leaf size={18} className="text-green-600" />}
                       {preventionInfo.icon === 'alert' && <Info size={18} className="text-red-600" />}
                     </div>
                     <div className="flex-1">
                       <p className={`text-sm font-bold flex items-center gap-1 ${
                          preventionInfo.type === 'warning' ? 'text-red-900' :
                          preventionInfo.type === 'success' ? 'text-green-900' :
                          'text-gray-900'
                       }`}>
                          {preventionInfo.title}
                       </p>
                       <p className="text-xs text-gray-800 leading-snug mt-1">
                         {preventionInfo.message}
                       </p>
                       <p className={`text-xs font-medium leading-snug mt-1.5 flex items-center gap-1 ${
                         preventionInfo.type === 'warning' ? 'text-red-700' :
                         preventionInfo.type === 'success' ? 'text-green-700' :
                         'text-blue-700'
                       }`}>
                         {preventionInfo.subMessage}
                       </p>
                       {preventionInfo.type === 'warning' && !isWarningAccepted && (
                         <div className="mt-3 flex gap-2">
                           <button onClick={() => setSelectedSize(recommendedSize)} className="text-xs font-bold bg-white text-gray-800 border border-gray-300 shadow-sm px-3 py-1.5 rounded hover:bg-gray-50 flex-1">
                             Switch to size {recommendedSize}
                           </button>
                           <button onClick={() => setIsWarningAccepted(true)} className="text-xs font-medium text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded">
                             I accept the risk
                           </button>
                         </div>
                       )}
                     </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            <hr className="my-4 border-gray-200" />
            
            <ul className="list-disc pl-5 text-sm text-[#0f1111] space-y-2 mb-6">
              {getProductSpecs().map((spec, idx) => (
                <li key={idx}>
                  <span className="font-bold">{spec.split(": ")[0]}:</span> {spec.split(": ")[1]}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Buy Box */}
          <div className="w-full lg:w-[300px] flex-none">
            
            {/* Purchase Options Toggle Box */}
            <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col mb-4 bg-white">
               
               {/* Buy New Toggle */}
               <button 
                  onClick={() => setPurchaseType("new")}
                  className={`flex flex-col text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${purchaseType === "new" ? 'bg-orange-50 bg-opacity-30' : ''}`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center ${purchaseType === "new" ? 'border-[#e77600]' : ''}`}>
                         {purchaseType === "new" && <div className="w-2 h-2 rounded-full bg-[#e77600]" />}
                      </div>
                      <span className="font-bold text-sm">Buy New</span>
                    </div>
                    <span className="text-[#B12704] font-medium">₹{newPriceText}</span>
                  </div>
               </button>

               {/* Buy Used Toggle (Resale Highlight) */}
               <button 
                  onClick={() => setPurchaseType("used")}
                  className={`flex flex-col text-left px-4 py-3 hover:bg-gray-50 transition-colors ${purchaseType === "used" ? 'bg-orange-50 bg-opacity-30' : ''}`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center ${purchaseType === "used" ? 'border-[#e77600]' : ''}`}>
                         {purchaseType === "used" && <div className="w-2 h-2 rounded-full bg-[#e77600]" />}
                      </div>
                      <span className="font-bold text-sm flex items-center gap-1">
                        Buy Used 
                        <Leaf size={12} className="text-[#27ae60]" />
                      </span>
                    </div>
                    <span className="text-[#B12704] font-medium">₹{usedPriceText}</span>
                  </div>
                  <div className="pl-6 pt-1 text-xs text-gray-600">
                    <div>Quality Certified • Ships from Pune</div>
                    <div className="text-green-700 font-medium">+50 Eco-Tokens with purchase</div>
                  </div>
               </button>
            </div>

            {/* Live Buy Box logic */}
            {purchaseType === "used" ? (
              <div className="border border-green-500 rounded-lg p-4 bg-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-50 to-transparent pointer-events-none" />
                <h3 className="text-[#B12704] text-xl mb-1">₹{usedPriceText}</h3>
                <p className="text-sm text-gray-600 mb-2">Sold by <strong>{product?.seller || "Maya"} (Eco-Seller)</strong></p>
                <div className="mb-4">
                  <span className="text-xs text-gray-500 font-medium mb-1 block">Analysis Output:</span>
                  <div 
                    onClick={() => setShowHealthCard(!showHealthCard)}
                    className="flex justify-between items-center bg-[#f8fbf9] border border-[#a5d6a7] p-2 rounded-md cursor-pointer hover:bg-green-50 transition-colors"
                  >
                     <div className="flex items-center gap-2">
                       <ShieldCheck size={20} className="text-[#1a6b3c]" />
                       <div>
                         <div className="text-[#0D3D22] font-bold text-sm leading-tight">Grade {product?.grade || "B"}: Minor Wear</div>
                         <div className="text-xs text-green-700">Verified by Rekognition</div>
                       </div>
                     </div>
                     <span className="text-xl text-[#1a6b3c]">›</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    disabled={preventionInfo.type === 'warning' && !isWarningAccepted}
                    className={`w-full rounded-full py-1.5 text-sm font-medium border shadow-[0_1px_0_rgba(255,255,255,.4)_inset] transition-all ${
                      preventionInfo.type === 'warning' && !isWarningAccepted 
                        ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-70' 
                        : 'bg-[#ffd814] hover:bg-[#f3cc18] text-black border-[#fcd200]'
                    }`}
                  >
                    Add to Cart
                  </button>
                  <button 
                    disabled={preventionInfo.type === 'warning' && !isWarningAccepted}
                    className={`w-full rounded-full py-1.5 text-sm font-medium border shadow-[0_1px_0_rgba(255,255,255,.4)_inset] transition-all ${
                      preventionInfo.type === 'warning' && !isWarningAccepted 
                        ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-70' 
                        : 'bg-[#ffa41c] hover:bg-[#fa9c11] text-black border-[#ff8f00]'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
                
                <div 
                  onClick={() => setShowNegotiation(true)}
                  className="flex items-center justify-center gap-1 mt-4 text-[#007185] hover:text-[#c45500] cursor-pointer hover:underline"
                >
                  <Zap size={14} />
                  <span className="text-sm font-medium text-center">Smart Bid: Auto-Haggle</span>
                </div>
              </div>
            ) : (
               <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <h3 className="text-[#B12704] text-xl mb-1">₹{newPriceText}</h3>
                <p className="text-sm text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer">FREE Delivery</p>
                <p className="text-sm text-green-700 font-medium my-2">In stock.</p>
                
                <div className="space-y-2 mb-4">
                  <button 
                    disabled={preventionInfo.type === 'warning' && !isWarningAccepted}
                    className={`w-full rounded-full py-1.5 text-sm font-medium border shadow-[0_1px_0_rgba(255,255,255,.4)_inset] transition-all ${
                      preventionInfo.type === 'warning' && !isWarningAccepted 
                        ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-70' 
                        : 'bg-[#ffd814] hover:bg-[#f3cc18] text-black border-[#fcd200]'
                    }`}
                  >
                    Add to Cart
                  </button>
                  <button 
                    disabled={preventionInfo.type === 'warning' && !isWarningAccepted}
                    className={`w-full rounded-full py-1.5 text-sm font-medium border shadow-[0_1px_0_rgba(255,255,255,.4)_inset] transition-all ${
                      preventionInfo.type === 'warning' && !isWarningAccepted 
                        ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-70' 
                        : 'bg-[#ffa41c] hover:bg-[#fa9c11] text-black border-[#ff8f00]'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>

                <p className="text-xs text-gray-500 flex justify-between">
                  <span>Ships from</span>
                  <span>Amazon</span>
                </p>
                <p className="text-xs text-gray-500 flex justify-between mt-1">
                  <span>Sold by</span>
                  <span>NikeIndia</span>
                </p>
               </div>
            )}
          </div>
        </div>

        {/* Product Health Card Overlay Modal */}
        <AnimatePresence>
          {showHealthCard && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute lg:right-[320px] right-4 lg:w-[350px] bg-white border border-[#27ae60] rounded-xl shadow-2xl p-5 z-50 mt-[-200px]"
            >
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                     <ShieldCheck size={18} className="text-[#27ae60]" /> Product Health Card
                   </h4>
                   <p className="text-xs text-[#565959] font-mono mt-1">ID: HC-9941X-AMZ</p>
                 </div>
                 <button onClick={() => setShowHealthCard(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="flex items-center justify-center p-4 bg-gradient-to-b from-[#e8f5e9] to-white rounded-lg mb-4 border border-[#c8e6c9]">
                 <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-[3px] border-[#F39C12] flex items-center justify-center bg-white shadow-sm mb-2">
                      <span className="text-2xl font-bold text-[#F39C12]">{product?.grade || "B"}</span>
                    </div>
                    <span className="font-bold text-[#D68910]">Minor Wear</span>
                    <span className="text-xs text-gray-500 mt-1">Match Confidence: 94%</span>
                 </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 p-2.5 rounded text-sm text-gray-800 border-l-2 border-[#F39C12]">
                  <strong>Wear Analysis:</strong> Minor scuffing detected on the right heel. Outsole treads remain 85% intact. No structural rips or color fading.
                </div>
                
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-100">
                   <span className="text-gray-500 flex items-center gap-1"><ShieldCheck size={14} /> Authenticity</span>
                   <span className="font-medium text-green-700">Verified Original</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-100">
                   <span className="text-gray-500 flex items-center gap-1"><Leaf size={14} /> Carbon Footprint</span>
                   <span className="font-medium text-green-700">-6.4 kg CO₂ vs New</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-100">
                   <span className="text-gray-500 flex items-center gap-1"><Info size={14} /> Eco Warranty</span>
                   <span className="font-medium text-gray-800">30 days returnable</span>
                </div>
              </div>

              <button 
                onClick={() => setShowHealthCard(false)}
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg py-2 text-sm font-medium transition-colors"
               >
                Close Audit
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Negotiation Modal */}
        <AnimatePresence>
          {showNegotiation && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-[400px] w-full"
              >
                {/* Header */}
                <div className="bg-[#131921] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#ff9900]" />
                    <span className="text-white font-bold text-lg">AI Smart Bid</span>
                  </div>
                  <button onClick={() => { setShowNegotiation(false); setNegotiationResult(null); }} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {negotiating ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      {/* Radar Animation */}
                      <div className="relative w-32 h-32 rounded-full border border-blue-200 overflow-hidden bg-blue-50/50 flex items-center justify-center mb-6 shadow-inner">
                         <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.4)_360deg)] animate-[spin_2s_linear_infinite]" />
                         <div className="absolute w-full h-[1px] bg-blue-400/30 rotate-45" />
                         <div className="absolute w-full h-[1px] bg-blue-400/30 -rotate-45" />
                         <div className="absolute w-[1px] h-full bg-blue-400/30" />
                         <div className="absolute w-full h-[1px] bg-blue-400/30" />
                         <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff" alt="Shoe" className="w-16 h-16 object-contain z-10 mix-blend-multiply opacity-50" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">AI Broker Negotiating</h3>
                      <p className="text-sm text-gray-500 text-center">Finding the optimal price overlap<br/>with the seller's minimum...</p>
                    </div>
                  ) : negotiationResult ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-6">
                      {negotiationResult.status === "closed" ? (
                        <>
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">Deal Closed!</h3>
                          <div className="text-3xl font-bold text-[#B12704] mb-4">₹{negotiationResult.dealPrice}</div>
                          
                          <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm p-3 rounded-lg mb-6 leading-snug">
                            {negotiationResult.systemNarrative}
                          </div>

                          <div className="bg-[#e8f5e9] border border-[#a5d6a7] w-full rounded-lg p-3 flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                               <Leaf className="w-5 h-5 text-green-600" />
                               <span className="font-bold text-green-900">Eco-Tokens Earned</span>
                             </div>
                             <span className="font-bold text-green-700 text-lg">+{negotiationResult.tokensEarned}</span>
                          </div>
                          
                          <button 
                             onClick={() => onCheckoutClick && onCheckoutClick(product, negotiationResult.dealPrice, negotiationResult.tokensEarned)}
                             className="w-full bg-[#ffd814] hover:bg-[#f3cc18] text-black font-bold py-3 rounded-md shadow-sm border border-[#fcd200]">
                             Proceed to Checkout
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                            <Info className="w-8 h-8 text-orange-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Almost There</h3>
                          <p className="text-sm text-gray-600 mb-4">{negotiationResult.systemNarrative}</p>
                          <div className="text-lg font-medium text-gray-800 mb-6 flex items-center justify-center gap-2">
                             Counter Offer: <span className="font-bold">₹{negotiationResult.counterOffer}</span>
                          </div>
                          <button onClick={() => setBidAmount(negotiationResult.counterOffer)} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-md shadow-sm mb-2">
                             Accept ₹{negotiationResult.counterOffer}
                          </button>
                          <button onClick={() => { setShowNegotiation(false); setNegotiationResult(null); }} className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-md shadow-sm border border-gray-300">
                             Decline & Close
                          </button>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        EcoRoute's AI Broker will confidentially negotiate with the seller on your behalf. Enter the <strong>maximum</strong> you are willing to pay.
                      </p>

                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Your Maximum Bid (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                          <input 
                            type="number" 
                            min="1"
                            value={bidAmount || ""}
                            onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                            className="w-full pl-8 pr-4 py-3 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-transparent transition-all font-bold text-lg"
                            placeholder="Enter amount"
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-xs text-gray-500 space-y-2">
                        <p>✓ The seller never sees your max price.</p>
                        <p>✓ If the seller's minimum is lower, the AI finds a fair midpoint.</p>
                        <p>✓ Binding agreement if the bid successful.</p>
                      </div>

                      <button 
                        onClick={handleSmartBid}
                        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                      >
                         <Zap className="w-4 h-4 fill-white" /> Submit Smart Bid
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
