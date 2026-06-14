export default function AmazonFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full font-sans mt-auto">
      {/* Back to top */}
      <div 
        onClick={scrollToTop}
        className="bg-[#37475A] hover:bg-[#475a6f] text-white text-center py-4 cursor-pointer text-[13px] font-medium"
      >
        Back to top
      </div>

      {/* Main Footer Links */}
      <div className="bg-[#232F3E] text-white py-10 px-4 md:px-10 lg:px-20">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          <div>
            <h3 className="font-bold text-base mb-3">Get to Know Us</h3>
            <ul className="text-[13px] space-y-2 text-[#DDD] flex flex-col items-start">
              <a href="#" className="hover:underline">About Us</a>
              <a href="#" className="hover:underline">Careers</a>
              <a href="#" className="hover:underline">Press Releases</a>
              <a href="#" className="hover:underline">Amazon Science</a>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-base mb-3">Connect with Us</h3>
            <ul className="text-[13px] space-y-2 text-[#DDD] flex flex-col items-start">
              <a href="#" className="hover:underline">Facebook</a>
              <a href="#" className="hover:underline">Twitter</a>
              <a href="#" className="hover:underline">Instagram</a>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-base mb-3">Make Money with Us</h3>
            <ul className="text-[13px] space-y-2 text-[#DDD] flex flex-col items-start">
              <a href="#" className="hover:underline">Sell on Amazon</a>
              <a href="#" className="hover:underline">Sell under Amazon Accelerator</a>
              <a href="#" className="hover:underline">Protect and Build Your Brand</a>
              <a href="#" className="hover:underline">Amazon Global Selling</a>
              <a href="#" className="hover:underline">Become an Affiliate</a>
              <a href="#" className="hover:underline">Fulfilment by Amazon</a>
              <a href="#" className="hover:underline">Advertise Your Products</a>
              <a href="#" className="hover:underline">Amazon Pay on Merchants</a>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-base mb-3">Let Us Help You</h3>
            <ul className="text-[13px] space-y-2 text-[#DDD] flex flex-col items-start">
              <a href="#" className="hover:underline">COVID-19 and Amazon</a>
              <a href="#" className="hover:underline">Your Account</a>
              <a href="#" className="hover:underline">Returns Centre</a>
              <a href="#" className="hover:underline">100% Purchase Protection</a>
              <a href="#" className="hover:underline">Amazon App Download</a>
              <a href="#" className="hover:underline">Help</a>
            </ul>
          </div>
        </div>

        {/* Divider and Logo section */}
        <div className="max-w-[1000px] mx-auto mt-10 pt-10 border-t border-gray-600 flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex items-end px-2 pt-1 cursor-pointer">
             <div style={{
                backgroundImage: "url('https://m.media-amazon.com/images/G/31/gno/sprites/nav-sprite-global-1x-hm-dsk-reorg.png')",
                backgroundPosition: "-10px -51px",
                width: "97px",
                height: "30px",
                backgroundRepeat: "no-repeat"
             }} />
          </div>
          
          <div className="flex gap-2 text-[13px]">
             <button className="flex items-center gap-2 border border-gray-500 rounded px-3 py-1.5 hover:border-gray-300">
               <span className="w-4 h-4 rounded-full border border-gray-400 text-[10px] flex items-center justify-center">🌐</span> English
             </button>
             <button className="flex items-center gap-2 border border-gray-500 rounded px-3 py-1.5 hover:border-gray-300">
               <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" className="w-4 h-3 object-cover" /> India
             </button>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-[#CCC]">
          <a href="#" className="hover:underline px-1">Australia</a>
          <a href="#" className="hover:underline px-1">Brazil</a>
          <a href="#" className="hover:underline px-1">Canada</a>
          <a href="#" className="hover:underline px-1">China</a>
          <a href="#" className="hover:underline px-1">France</a>
          <a href="#" className="hover:underline px-1">Germany</a>
          <a href="#" className="hover:underline px-1">Italy</a>
          <a href="#" className="hover:underline px-1">Japan</a>
          <a href="#" className="hover:underline px-1">Mexico</a>
          <a href="#" className="hover:underline px-1">Netherlands</a>
          <a href="#" className="hover:underline px-1">Poland</a>
          <a href="#" className="hover:underline px-1">Singapore</a>
          <a href="#" className="hover:underline px-1">Spain</a>
          <a href="#" className="hover:underline px-1">Turkey</a>
          <a href="#" className="hover:underline px-1">United Arab Emirates</a>
          <a href="#" className="hover:underline px-1">United Kingdom</a>
          <a href="#" className="hover:underline px-1">United States</a>
        </div>
      </div>

      {/* Bottom Legal Section */}
      <div className="bg-[#131A22] text-[#CCC] py-8 text-[11px] text-center flex flex-col items-center justify-center px-4">
         <div className="flex flex-wrap justify-center gap-4 mb-2">
            <a href="#" className="hover:underline">Conditions of Use & Sale</a>
            <a href="#" className="hover:underline">Privacy Notice</a>
            <a href="#" className="hover:underline">Interest-Based Ads</a>
         </div>
         <div>© 1996-2026, Amazon.com, Inc. or its affiliates</div>
      </div>
    </footer>
  );
}
