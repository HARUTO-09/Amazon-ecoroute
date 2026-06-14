import { useState } from "react";
import { Lock, MapPin, CreditCard, ChevronRight, Leaf } from "lucide-react";

export default function AmazonCheckoutPage({ product, price, tokensEarned, onBuyNow, onLogoClick }: { product?: any, price: number, tokensEarned: number, onBuyNow: () => void, onLogoClick: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onBuyNow();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Checkout Header */}
      <header className="bg-white border-b border-gray-300 py-4 px-8 flex justify-between items-center bg-gradient-to-b from-gray-50 to-white shadow-sm">
        <div onClick={onLogoClick} className="cursor-pointer">
          <div style={{
             backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg')",
             backgroundPosition: "center",
             backgroundSize: "contain",
             width: "110px",
             height: "36px",
             backgroundRepeat: "no-repeat"
          }} />
        </div>
        <h1 className="text-3xl font-medium text-gray-800 tracking-tight hidden sm:block">Checkout</h1>
        <div className="flex items-center text-gray-500 font-medium">
          <Lock className="w-6 h-6 mr-1" />
        </div>
      </header>

      {/* Checkout Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 font-sans">
        
        {/* Left Column (Details) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Shipping Address */}
          <div className="bg-white rounded p-1 border-b border-gray-200">
             <div className="flex gap-4 p-4">
                <span className="font-bold text-xl inline-block w-6">1</span>
                <div className="flex-1">
                   <div className="flex justify-between items-start mb-1">
                     <h2 className="text-lg font-bold text-gray-900">Shipping address</h2>
                     <span className="text-[#007185] hover:underline text-sm cursor-pointer hover:text-[#c45500]">Change</span>
                   </div>
                   <div className="text-sm text-gray-900 leading-snug">
                     <span className="font-bold">Revanth Kumar</span><br/>
                     Flat 202, Greenwoods Apts, Koregaon Park, Pune 411001, Maharashtra, India
                   </div>
                </div>
             </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded p-1 border-b border-gray-200">
             <div className="flex gap-4 p-4">
                <span className="font-bold text-xl inline-block w-6">2</span>
                <div className="flex-1">
                   <div className="flex justify-between items-start mb-1">
                     <h2 className="text-lg font-bold text-gray-900">Payment method</h2>
                     <span className="text-[#007185] hover:underline text-sm cursor-pointer hover:text-[#c45500]">Change</span>
                   </div>
                   <div className="flex items-center gap-4 text-sm text-gray-900">
                      <div>
                         <span className="font-bold flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600"/> Amazon Pay ICICI Credit Card <span className="text-gray-500 font-normal">ending in 1234</span></span>
                         <div className="text-[#007185] cursor-pointer mt-1 hover:underline hover:text-[#c45500]">Billing address: Same as shipping address</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Review Items */}
          <div className="bg-white border border-gray-300 rounded shadow-sm p-5 pb-8">
            <h2 className="text-xl font-bold mb-4 text-[#c45500]">3 &nbsp;&nbsp;Review items and delivery</h2>
            <div className="border border-gray-200 rounded p-4 flex gap-6">
               <div className="w-32 h-32 shrink-0 flex items-center justify-center p-2 rounded">
                 <img src={product?.img || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"} alt="Product" className="max-w-full max-h-full object-contain mix-blend-multiply" />
               </div>
               <div className="flex-1 flex flex-col justify-start">
                 <h3 className="font-bold text-gray-900 text-base">{product?.title || "Product details unavailable"}</h3>
                 <div className="text-[#B12704] font-bold text-lg my-1">₹{price.toLocaleString()}</div>
                 <div className="text-xs text-gray-600 mb-1">Sold by: {product?.seller || "P2P Verified Seller"}</div>
                 <div className="text-sm mt-3">Condition: <span className="font-bold">Grade {product?.grade || "A"} (Refurbished/Pre-owned)</span></div>
                 <div className="mt-4 flex items-center gap-2">
                    <span className="bg-gray-200 rounded-md px-3 py-1 font-medium text-sm text-gray-800 shadow-sm border border-gray-300">Qty: 1</span>
                 </div>
               </div>
               <div className="w-48 text-sm">
                  <div className="font-bold text-gray-900 mb-1">Choose a delivery option:</div>
                  <div className="flex items-start gap-2 mb-2 p-2 bg-green-50 rounded border border-green-200">
                    <input type="radio" checked readOnly className="mt-1" />
                    <span className="text-green-800 font-bold">Tomorrow<br/><span className="text-xs text-green-700 font-normal">FREE Delivery with Amazon Prime</span></span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column (Order Summary box) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-300 rounded-md p-5 pb-6 top-6 sticky shadow-sm">
             <button 
               onClick={handleBuyNow}
               disabled={isProcessing}
               className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black text-sm font-bold py-3 rounded-lg shadow-sm border border-[#FCD200] active:bg-[#F0B800]
                          disabled:opacity-75 disabled:cursor-wait relative transition-colors focus:ring-2 focus:ring-blue-500 mb-3"
             >
                {isProcessing ? 'Processing Order...' : 'Place your order'}
             </button>
             
             <div className="text-[11px] text-gray-600 text-center leading-snug mb-5 pb-5 border-b border-gray-200">
               By placing your order, you agree to Amazon's <span className="text-[#007185] hover:underline hover:text-[#c45500] cursor-pointer">privacy notice</span> and <span className="text-[#007185] hover:underline hover:text-[#c45500] cursor-pointer">conditions of use</span>.
             </div>
             
             <h3 className="font-bold text-lg mb-3">Order Summary</h3>
             
             <div className="flex justify-between text-sm mb-2 text-gray-700">
                <span>Items:</span>
                <span>₹{price.toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-sm mb-2 pb-3 border-b border-gray-200 text-gray-700">
                <span>Delivery:</span>
                <span>₹0.00</span>
             </div>
             
             <div className="flex justify-between font-bold text-xl text-[#B12704] mt-3 mb-5">
                <span>Order Total:</span>
                <span>₹{price.toLocaleString()}</span>
             </div>

             <div className="bg-gradient-to-br from-green-50 to-[#e8f5e9] border border-green-200 p-3 pt-4 rounded text-sm text-green-900 leading-snug text-center relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-300"></div>
                <div className="font-bold flex flex-col justify-center items-center gap-1 mb-2">
                   <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-1">
                      <Leaf className="w-5 h-5 text-green-600"/>
                   </div>
                   <span className="text-[15px]">You'll earn +{tokensEarned} Eco-Tokens!</span>
                </div>
                <span className="text-xs text-green-800/80">Thanks for making a sustainable choice by buying pre-owned.</span>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
}
