import React, { useState } from "react";
import { Search, ShoppingCart, MapPin, Leaf, Menu } from "lucide-react";
import { useAuth } from "../AuthContext";

export default function AmazonNav({ onLogoClick, onReturnsClick, onProfileClick, onP2PClick, onSearch, onLoginClick }: { onLogoClick?: () => void, onReturnsClick?: () => void, onProfileClick?: () => void, onP2PClick?: () => void, onSearch?: (query: string) => void, onLoginClick?: () => void }) {
  const { currentUser, login, logout, ecoTokens } = useAuth();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [searchInput, setSearchInput] = useState("");


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      login(usernameInput.trim());
      setUsernameInput("");
      setShowLoginMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLoginMenu(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() && onSearch) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <header className="flex flex-col w-full font-sans min-w-[1000px]">
      {/* Top Nav (Dark) */}
      <div className="bg-[#131921] px-4 py-2 flex items-center gap-4 text-white">
        {/* Amazon Logo */}
        <div onClick={onLogoClick} className="flex items-end cursor-pointer px-2 pt-1 hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm border border-transparent">
          <div style={{
             backgroundImage: "url('https://m.media-amazon.com/images/G/31/gno/sprites/nav-sprite-global-1x-hm-dsk-reorg.png')",
             backgroundPosition: "-10px -51px",
             width: "97px",
             height: "30px",
             backgroundRepeat: "no-repeat"
          }} />
        </div>

        {/* Location Delivery Widget */}
        <div className="flex flex-col items-start px-2 cursor-pointer hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm border border-transparent">
          <span className="text-[#cccccc] text-xs ml-4 leading-3">Delivering to {currentUser?.name || "Guest"} 110001</span>
          <div className="flex items-center gap-1 font-bold text-sm leading-4">
            <MapPin size={16} className="text-white" /> <span className="mt-1">Update location</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-1 h-10 rounded overflow-hidden bg-white ml-2 rounded-md focus-within:ring-2 focus-within:ring-[#f90]">
          <button type="button" className="bg-[#f3f3f3] hover:bg-[#e3e6e6] text-[#555] text-xs px-3 border-r border-gray-300 flex items-center focus:ring-2 focus:ring-[#f90] focus:z-10 cursor-pointer">
            All <span className="ml-1 text-[8px]">▼</span>
          </button>
          <input 
            type="text" 
            className="flex-1 px-3 text-black outline-none placeholder-gray-500 font-medium"
            placeholder="Search Amazon.in"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] w-11 flex items-center justify-center transition-colors">
            <Search size={22} className="text-[#333]" />
          </button>
        </form>

        {/* Language selector (mock) */}
        <div className="flex items-end px-2 cursor-pointer hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm border border-transparent h-12 pb-2">
          <div className="flex items-baseline font-bold text-sm">
             EN <span className="ml-1 text-[8px] text-gray-400">▼</span>
          </div>
        </div>

        {/* Account Info */}
        <div 
          onClick={() => {
            if (!currentUser && onLoginClick) {
              onLoginClick();
            } else {
              setShowLoginMenu(!showLoginMenu);
            }
          }}
          onMouseEnter={() => {
            if (currentUser) setShowLoginMenu(true);
          }}
          onMouseLeave={() => setShowLoginMenu(false)}
          className="relative flex flex-col flex-start px-2 cursor-pointer hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm border border-transparent justify-center h-12"
        >
          <span className="text-white text-xs leading-3 font-normal">Hello, {currentUser?.name || "Sign in"}</span>
          <span className="font-bold text-sm leading-4 flex items-center">Account & Lists <span className="ml-1 text-[8px] text-gray-400">▼</span></span>
          
          {showLoginMenu && currentUser && (
            <div 
              className="absolute top-12 right-0 w-72 bg-white text-black p-4 rounded-md shadow-xl z-50 border border-gray-300 cursor-default"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
               <div className="flex flex-col gap-3">
                   <div className="flex flex-col gap-2">
                     <p className="font-bold text-sm text-gray-800">Hello, {currentUser.name}</p>
                     
                     <div className="w-full bg-gray-100 h-px my-1"></div>
                     <p className="font-medium text-xs text-gray-700 mb-1">Switch Account</p>
                     <p className="text-xs text-gray-500 mb-2">Logout to switch users via AWS Cognito</p>
                     
                     <div className="w-full bg-gray-100 h-px my-1"></div>
                     {onProfileClick && (
                       <button 
                         onClick={() => {
                           setShowLoginMenu(false);
                           onProfileClick();
                         }} 
                         className="text-[#007185] hover:text-[#c45500] hover:underline text-xs text-left mb-1"
                       >
                         Your Account
                       </button>
                     )}
                     <button onClick={handleLogout} className="text-[#007185] hover:text-[#c45500] hover:underline text-xs text-left">
                       Sign Out
                     </button>
                   </div>
               </div>
            </div>
          )}
        </div>

        {/* Returns */}
        <div onClick={onReturnsClick} className="flex flex-col flex-start px-2 cursor-pointer hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm border border-transparent justify-center h-12">
          <span className="text-white text-xs leading-3 font-normal">Returns</span>
          <span className="font-bold text-sm leading-4">& Orders</span>
        </div>

        {/* Green Credits */}
        {currentUser && (
          <div onClick={onProfileClick} className="flex flex-col flex-start px-2 cursor-pointer hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm border border-transparent justify-center h-12 relative group">
             <div className="flex items-center gap-1">
               <Leaf size={14} className="text-green-400" />
               <span className="font-bold text-sm leading-4 text-green-400">{ecoTokens.toLocaleString()}</span>
             </div>
             <span className="text-white text-xs leading-3 font-normal mt-1">Green Credits</span>
             
             <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-white text-black p-4 rounded-md shadow-xl z-50 border border-gray-200 hidden group-hover:block cursor-default tooltip-arrow">
                <h4 className="font-bold text-gray-900 border-b pb-2 mb-2 flex items-center gap-2">
                   <Leaf size={16} className="text-green-600" /> Sustainable Impact
                </h4>
                <p className="text-xs text-gray-600 mb-2">You've saved <strong className="text-green-700">14kg of CO₂</strong> this year by choosing renewed or P2P products.</p>
                <div className="bg-green-50 text-green-800 text-xs p-2 rounded border border-green-200 font-medium leading-snug">
                   Redeem credits for free eco-priority shipping on your next Renewed purchase!
                </div>
             </div>
          </div>
        )}

        {/* Cart */}
        <div className="flex items-end px-2 cursor-pointer hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm border border-transparent h-12 pb-2">
          <div className="relative flex items-center">
             <ShoppingCart size={34} className="text-white relative z-10" />
             <span className="absolute top-1 left-3.5 text-[#f08804] font-bold text-sm z-20">0</span>
          </div>
          <span className="font-bold text-sm mt-auto ml-1">Cart</span>
        </div>
      </div>

      {/* Sub Nav (Lighter dark) */}
      <div className="bg-[#232f3e] text-white px-4 py-2 flex items-center gap-3 text-sm font-medium overflow-x-auto whitespace-nowrap hide-scroll min-h-[38px]">
        <div className="flex items-center gap-1 cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent">
          <Menu size={20} /> All
        </div>
        <span className="cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent">Fresh</span>
        <span className="cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent">MX Player</span>
        <span className="cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent">Sell</span>
        <span className="cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent">Best Sellers</span>
        <span onClick={onP2PClick} className="cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent text-[#febd69] font-bold">Amazon P2P Resale 🍃</span>
        <span className="cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent">Today's Deals</span>
        <span className="cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent">Mobiles</span>
        <span className="cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent">Electronics</span>
        <span className="cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent">Customer Service</span>
      </div>
    </header>
  );
}
