import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle, AlertCircle, Camera, Loader2, ShieldCheck, ArrowRight, Info } from "lucide-react";
import AmazonNav from "./AmazonNav";
import { useAuth } from "../AuthContext";

export default function AmazonReturnPortal({ onBackToHome, onGoToProduct, onGoToP2P }: { onBackToHome?: () => void, onGoToProduct?: () => void, onGoToP2P?: () => void }) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<0|1|2|3>(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<any>(null);
  
  const [isListing, setIsListing] = useState(false);
  const [listingPrice, setListingPrice] = useState("1500");

  const mockOrders = [
    {
      id: "114-1234567-8901234",
      date: "12 May 2025",
      total: "₹3,495",
      shipTo: currentUser?.name || "Maya",
      status: "Delivered yesterday",
      canReturn: true,
      items: [
        {
          id: "item_1",
          title: "Nike Men's Revolution 6 Running Shoe",
          img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
          desc: "Size: 10 | Color: Black/White"
        }
      ]
    },
    {
      id: "114-9876543-2109876",
      date: "10 April 2025",
      total: "₹40,000",
      shipTo: currentUser?.name || "Maya",
      status: "Delivered 14 April 2025",
      canReturn: false,
      items: [
        {
          id: "item_2",
          title: "Apple Watch Series 9 (GPS 45mm)",
          img: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/refurb-45-stainless-graphite-sport-band-midnight-s9?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=eUNRakR3dGYxaW9BQzAzdzRPUlFUVjBoTUc3NjFlV1QzbHd4SVVUcFZVWDE4QUxxTWFsRmJQTXB3MEp1T2pHd0FtWVJCbTFqbVlJVmw3ZkRFUGZoZ0YzaTQrYy82TUg0cFZQeUN1eC9DMlZNQkJEMXc0aklkVno5c3lHT1ZQU0FzcnlGampyTlhrVGsvR1hoblVqQkpn",
          desc: "Space Gray Aluminum Case"
        }
      ]
    }
  ];

  const handleCreateListing = async () => {
    setIsListing(true);
    try {
      // Add to lifecycle routing queue for admin approval
      await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `RET-${Math.floor(Math.random() * 1000000)}`,
          title: selectedItem ? selectedItem.title : "Unknown Item",
          grade: gradingResult?.grade || "B",
          category: selectedItem && selectedItem.title.includes("Shoe") ? "Shoes" : "Electronics",
          img: selectedItem ? selectedItem.img : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
          origin: "Return to P2P Listing",
          price: parseInt(listingPrice, 10) || 1500,
          seller: currentUser?.name || "Anonymous",
          health: gradingResult ? {
            conditionScore: gradingResult.conditionScore,
            wearAnalysis: gradingResult.wearAnalysis,
            ecoScore: gradingResult.ecoScore
          } : undefined
        })
      });
      
      // alert("Your listing has been submitted for review! It will appear on the P2P Resale page once approved.");
      if (onGoToP2P) onGoToP2P();
    } catch (e) {
      // silent ignore
      setIsListing(false);
    }
  };

  const handleStandardReturn = async () => {
    try {
      await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `RET-${Math.floor(Math.random() * 1000000)}`,
          title: selectedItem ? selectedItem.title : "Unknown Item",
          grade: gradingResult?.grade || "B",
          category: selectedItem && selectedItem.title.includes("Shoe") ? "Shoes" : "Electronics",
          img: selectedItem ? selectedItem.img : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
          origin: "Standard Return"
        })
      });
      if (onBackToHome) onBackToHome();
    } catch (e) {
      // silent ignore
    }
  };
  
  const [policySummary, setPolicySummary] = useState<string | null>(null);
  const [isFetchingPolicy, setIsFetchingPolicy] = useState(false);
  const [showPolicyTooltip, setShowPolicyTooltip] = useState(false);

  const fetchPolicySummary = async () => {
    if (policySummary) return; // already fetched
    setIsFetchingPolicy(true);
    try {
      const res = await fetch("/api/returns/policy-summary", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPolicySummary(data.data.summary);
      }
    } catch (e) {
      // silent ignore
      setPolicySummary("You have 30 days to return most items. Fashion items must be unused with tags.");
    }
    setIsFetchingPolicy(false);
  };
  
  const [previousReturns, setPreviousReturns] = useState([
    { id: "RET-94218", item: "Adidas Ultraboost 22", date: "Oct 12, 2025", status: "Sold via P2P", tokens: "+100" },
    { id: "RET-81002", item: "Sony WH-1000XM4", date: "Sep 05, 2025", status: "Warehouse Return", tokens: "0" },
    { id: "RET-78211", item: "Levi's 501 Original Fit", date: "Aug 22, 2025", status: "Refurbished", tokens: "+50" },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5));
    }
  };

  const startGrading = async () => {
    setIsGrading(true);
    setStep(2);
    
    // Send real file if one is uploaded
    try {
      const formData = new FormData();
      if (files && files.length > 0) {
        formData.append("image", files[0]);
      }
      
      const res = await fetch("/api/returns/grade", { 
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setGradingResult(data.data);
    } catch (e) {
      // silent ignore
      // Fallback if API fails
      setGradingResult({
         grade: "B",
         conditionScore: 82,
         wearAnalysis: "Minor scuffing on the heel. Outsole intact. No structural damage.",
         resaleViability: true,
         ecoScore: 90
      });
    }

    setIsGrading(false);
    setStep(3);
  };

  return (
    <div className="bg-[#f2f4f8] font-sans pb-12">
      <AmazonNav onLogoClick={onBackToHome} />
      
      <main className="max-w-[1000px] mx-auto pt-6 px-4">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
           <div>
             <h1 className="text-[28px] font-normal leading-tight text-black">{step === 0 ? "Your Orders" : "Your Returns"}</h1>
             {step > 0 && (
               <div className="text-sm text-[#007185] mt-1 hover:text-[#c45500] hover:underline cursor-pointer flex items-center" onClick={() => setStep(0)}>
                  ‹ Back to Your Orders
               </div>
             )}
           </div>
           
           {step > 0 ? (
             <div className="hidden md:flex gap-8 text-sm">
               <div className={`border-b-4 ${step >= 1 ? 'border-[#e77600] font-bold' : 'border-transparent text-gray-500'} pb-2`}>1. Select Item</div>
               <div className={`border-b-4 ${step >= 2 ? 'border-[#e77600] font-bold' : 'border-transparent text-gray-500'} pb-2`}>2. Condition Grading</div>
               <div className={`border-b-4 ${step >= 3 ? 'border-[#e77600] font-bold' : 'border-transparent text-gray-500'} pb-2`}>3. Confirm Route</div>
             </div>
           ) : (
             <div className="flex gap-4 mb-2">
                <input type="text" placeholder="Search all orders" className="border border-gray-400 p-2 text-sm rounded shadow-sm w-48 focus:border-[#e77600] outline-none" />
                <button className="bg-gray-800 text-white rounded-full px-4 text-sm font-bold shadow-sm">Search Orders</button>
             </div>
           )}
        </div>

        {step === 0 && (
          <div className="space-y-4 mb-8">
            {mockOrders.map(order => (
              <div key={order.id} className="border border-gray-300 text-sm bg-white rounded-lg overflow-hidden">
                <div className="bg-[#f0f2f2] p-3 text-gray-600 flex flex-wrap justify-between items-start border-b border-gray-300">
                  <div className="flex gap-8">
                    <div>
                      <div className="uppercase text-xs font-normal">Order placed</div>
                      <div>{order.date}</div>
                    </div>
                    <div>
                      <div className="uppercase text-xs font-normal">Total</div>
                      <div>{order.total}</div>
                    </div>
                    <div>
                      <div className="uppercase text-xs font-normal">Ship to</div>
                      <div className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer">{order.shipTo}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="uppercase text-xs font-normal">Order # {order.id}</div>
                    <div className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer mt-1">View order details</div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{order.status}</h3>
                  {order.items.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img src={item.img} alt={item.title} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <a href="#" className="font-bold text-[#007185] hover:text-[#c45500] hover:underline line-clamp-2">{item.title}</a>
                        {item.desc && <div className="text-[#565959] text-xs mt-1">{item.desc}</div>}
                        <div className="mt-4 flex gap-2">
                           <button className="bg-[#ffd814] hover:bg-[#f3cc18] rounded-full px-4 py-1.5 text-sm font-medium border border-[#fcd200] shadow-sm">
                             Buy it again
                           </button>
                           {order.canReturn && (
                             <button
                               onClick={() => {
                                 setSelectedItem(item);
                                 setStep(1);
                               }}
                               className="bg-white hover:bg-gray-50 rounded-full px-4 py-1.5 text-sm font-medium border border-gray-300 shadow-sm"
                             >
                               Return or replace items
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step > 0 && selectedItem && (
          <div className="bg-white border border-gray-300 rounded p-6 shadow-sm mb-6">
             <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-[120px] h-[120px] flex-none bg-gray-50 flex items-center justify-center p-2 border border-gray-200">
                  <img src={selectedItem.img} alt={selectedItem.title} className="object-contain mix-blend-multiply h-full" />
                </div>
                <div className="flex-1">
                   <h2 className="text-lg font-bold text-[#0F1111]">{selectedItem.title}</h2>
                   {selectedItem.desc && <p className="text-sm text-gray-600 mt-1">{selectedItem.desc}</p>}
                   <p className="text-sm text-gray-600 mt-1">Delivered: Yesterday</p>
                   <div className="mt-2 text-sm flex items-center gap-2 relative">
                      <span className="bg-gray-100 px-2 py-1 border border-gray-300 rounded text-gray-700 font-medium">Return Window Open</span>
                      
                      <div 
                        className="relative flex items-center"
                        onMouseEnter={() => {
                          setShowPolicyTooltip(true);
                          fetchPolicySummary();
                        }}
                        onMouseLeave={() => setShowPolicyTooltip(false)}
                      >
                        <Info size={16} className="text-gray-500 hover:text-[#007185] cursor-pointer" />
                        
                        {showPolicyTooltip && (
                          <div className="absolute top-6 left-0 w-64 bg-white border border-gray-300 shadow-lg rounded p-3 z-10 animate-in fade-in zoom-in duration-200">
                            <h4 className="font-bold text-xs text-black mb-1">Return Policy Summary</h4>
                            {isFetchingPolicy ? (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Loader2 size={12} className="animate-spin text-[#e77600]" /> Generating AI summary...
                              </div>
                            ) : (
                              <p className="text-xs text-gray-700 leading-tight">
                                {policySummary}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                   </div>
                </div>
             </div>

             <hr className="border-gray-200 mb-6" />

           {step === 1 && (
             <div className="animate-in fade-in duration-300">
               <h3 className="text-lg font-bold text-[#0F1111] mb-2 flex items-center gap-2">
                 Why are you returning this?
               </h3>
               <select className="w-full md:w-[350px] p-2 border border-gray-400 rounded bg-[#f0f2f2] focus:bg-white focus:ring-2 focus:ring-[#e77600] focus:outline-none focus:border-[#e77600] mb-6 text-sm">
                 <option>Size was too small</option>
                 <option>Size was too large</option>
                 <option>Item defective or doesn't work</option>
                 <option>No longer needed</option>
               </select>

               <div className="bg-[#f8fbf9] border border-[#a5d6a7] rounded-lg p-5 mb-6">
                  <div className="flex items-start gap-3">
                     <ShieldCheck size={24} className="text-[#27ae60] mt-1 flex-none" />
                     <div>
                       <h4 className="font-bold text-[#1b5e20] text-lg">Trust-Certified Resale (Recommended)</h4>
                       <p className="text-sm text-[#0d3d22] mt-1">Upload 3 photos to instantly list on Amazon Resale. Earn up to <span className="font-bold text-[#B12704]">₹2,000</span> directly + <span className="font-bold text-green-700">100 Eco-Tokens</span>.</p>
                       <p className="text-xs text-green-700 opacity-80 mt-1">Avoids warehouse shipping. Reduces 12.4kg CO₂.</p>
                     </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#c8e6c9]">
                     <p className="font-bold text-[#0F1111] text-sm mb-3">Upload Photos of Item (Max 5)</p>
                     
                     <div className="flex flex-wrap gap-3">
                       {files.map((file, i) => (
                         <div key={i} className="w-[100px] h-[100px] bg-gray-100 border border-gray-300 rounded relative group overflow-hidden">
                           <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                           <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white/80 rounded-full w-6 h-6 flex flex-col justify-center items-center text-xs text-red-600 font-bold opacity-0 group-hover:opacity-100">✕</button>
                         </div>
                       ))}
                       
                       {files.length < 5 && (
                         <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="w-[100px] h-[100px] bg-[#f7f7f7] hover:bg-[#f0f0f0] border-2 border-dashed border-gray-400 hover:border-gray-500 rounded flex flex-col items-center justify-center cursor-pointer transition-colors"
                         >
                           <Camera size={24} className="text-gray-500 mb-1" />
                           <span className="text-xs text-gray-500 font-medium">Add Photo</span>
                         </div>
                       )}
                       <input type="file" hidden accept="image/*" capture="environment" multiple ref={fileInputRef} onChange={handleFileChange} />
                     </div>

                     <div className="mt-5">
                       <button 
                         disabled={files.length === 0}
                         onClick={startGrading}
                         className="bg-[#ffd814] hover:bg-[#f3cc18] disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-full px-6 py-2 text-sm font-medium border border-[#fcd200] shadow-[0_1px_0_rgba(255,255,255,.4)_inset]"
                       >
                         Scan & Generate Health Card
                       </button>
                       {files.length === 0 && <span className="text-xs text-gray-500 ml-3">Upload at least 1 photo to continue</span>}
                     </div>
                  </div>
               </div>
               
               <div className="text-center pt-2">
                 <a href="#" className="text-[#007185] hover:text-[#c45500] hover:underline text-sm font-medium">Standard Return (Warehouse Ship & Refund)</a>
               </div>
             </div>
           )}

           {step === 2 && isGrading && (
              <div className="py-12 flex flex-col items-center justify-center h-[300px] animate-in fade-in duration-300">
                 <div className="relative">
                    <Loader2 size={48} className="animate-spin text-[#e77600]" />
                    <ShieldCheck size={20} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#27ae60]" />
                 </div>
                 <h3 className="text-xl font-bold text-[#0F1111] mt-6 mb-2">Analyzing Item Condition</h3>
                 <p className="text-sm text-gray-600 text-center max-w-sm">
                   Our system is scanning images for wear patterns, structural integrity, and authenticity...
                 </p>
                 <div className="w-64 h-2 bg-gray-200 rounded-full mt-6 overflow-hidden">
                    <div className="h-full bg-[#27ae60] w-1/2 animate-[pulse_1s_ease-in-out_infinite]"></div>
                 </div>
              </div>
           )}

           {step === 3 && gradingResult && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6 bg-[#e8f5e9] p-4 border border-[#a5d6a7] rounded-lg">
                  <div className="bg-white rounded-full p-1 shadow-sm">
                    <CheckCircle size={32} className="text-[#27ae60]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1b5e20]">Condition Verified!</h3>
                    <p className="text-sm text-[#0d3d22]">Your product Health Card has been generated.</p>
                  </div>
                </div>

                <div className="bg-white border border-[#27ae60] rounded-xl shadow-md p-6 max-w-2xl mx-auto mb-6 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#27ae60] to-[#f39c12]"></div>
                   
                   <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                      <div className="flex-none flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border-4 border-[#F39C12] flex items-center justify-center bg-white shadow-sm mb-3">
                          <span className="text-4xl font-bold text-[#F39C12]">{gradingResult.grade}</span>
                        </div>
                        <span className="font-bold text-[#D68910] text-lg">Minor Wear</span>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600 mt-2">
                           SCORE: {gradingResult.conditionScore}/100
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 w-full">
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Wear Analysis</h4>
                          <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded border-l-2 border-[#F39C12]">
                            {gradingResult.wearAnalysis}
                          </p>
                        </div>
                        
                        {gradingResult.detectedLabels && gradingResult.detectedLabels.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">AWS Rekognition Labels</h4>
                            <div className="flex flex-wrap gap-1">
                              {gradingResult.detectedLabels.map((label: string, index: number) => (
                                <span key={index} className="text-[10px] font-bold text-[#007185] bg-[#e7f4f5] border border-[#007185] px-2 py-0.5 rounded-full">
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-gray-50 p-2 rounded">
                             <div className="text-xs text-gray-500 font-medium">Authenticity</div>
                             <div className="text-sm font-bold text-green-700 flex items-center gap-1 mt-0.5">
                                <ShieldCheck size={14} /> Verified Pass
                             </div>
                           </div>
                           <div className="bg-gray-50 p-2 rounded">
                             <div className="text-xs text-gray-500 font-medium">Eco Warranty</div>
                             <div className="text-sm font-bold text-[#0F1111] mt-0.5">
                                60 Days
                             </div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-8">
                  {['D', 'E'].includes(gradingResult?.grade) ? (
                    <div className="border-[2px] border-[#27ae60] rounded-lg p-5 bg-[#f0f9f4] relative col-span-2">
                       <div className="absolute top-0 right-0 bg-[#27ae60] text-white text-xs font-bold px-2 py-1 rounded-bl-lg">Eco Recommended</div>
                       <h4 className="font-bold text-lg text-[#0F1111] flex items-center gap-2">
                         Local Drop-off: Donate/Recycle
                       </h4>
                       <p className="text-sm text-gray-700 mt-2">This item's condition (Grade {gradingResult?.grade}) does not meet the requirements for P2P resale. Instead of shipping it back to our warehouse, drop it off at a verified local recycling partner to reduce emissions and earn rewards!</p>
                       
                       <div className="mt-4 bg-white p-4 rounded shadow-sm border border-[#27ae60]/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="font-bold text-[#0F1111] mb-2 text-sm">Nearest Drop-off Location</div>
                            <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                               <strong>GreenWay E-Waste & Recycling</strong><br/>
                               454 Eco Park Rd, South District<br/>
                               Open Today: 9:00 AM - 5:00 PM<br/>
                               <span className="text-[#007185] mt-1 inline-block cursor-pointer hover:underline">View on Map</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-center">
                             <div className="font-bold text-[#0F1111] mb-2 text-sm">Your Drop-off Rewards</div>
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Amazon Gift Card:</span>
                                <span className="font-bold text-sm text-[#B12704]">₹500</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Eco-Token Bonus:</span>
                                <span className="font-bold text-sm text-[#27ae60]">+250 Tokens</span>
                             </div>
                             <div className="text-xs text-gray-500 mt-2 italic">Rewards are issued instantly after the partner scans your QR code at drop-off.</div>
                          </div>
                       </div>
                       
                       <div className="flex gap-4 mt-6">
                         <button 
                           onClick={() => { alert('Directions and Drop-off QR code sent to your email!'); if (onBackToHome) onBackToHome(); }}
                           className="flex-1 bg-[#ffd814] hover:bg-[#f3cc18] rounded-full py-2 text-sm font-medium border border-[#fcd200] shadow-[0_1px_0_rgba(255,255,255,.4)_inset]"
                         >
                           Get Drop-off Code & Directions
                         </button>
                         <button onClick={handleStandardReturn} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full py-2 text-sm font-medium border border-gray-300 shadow-sm">
                           Continue Standard Return
                         </button>
                       </div>
                    </div>
                  ) : (
                    <div className="border-[2px] border-[#e77600] rounded-lg p-5 bg-[#fff8f2] relative cursor-pointer group col-span-2 md:col-span-1">
                       <div className="absolute top-0 right-0 bg-[#e77600] text-white text-xs font-bold px-2 py-1 rounded-bl-lg">Highest Value</div>
                       <h4 className="font-bold text-lg text-[#0F1111] flex items-center gap-2">
                         List on Amazon Resale <ArrowRight size={18} className="text-[#e77600] group-hover:translate-x-1 transition-transform" />
                       </h4>
                       <p className="text-sm text-gray-700 mt-2">You set the price. Item ships directly to next buyer.</p>
                       
                       <div className="mt-4 bg-white p-3 rounded shadow-sm border border-[#e77600]/30">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-sm text-gray-600">Your Bid Price (₹):</span>
                             <input 
                               type="number" 
                               value={listingPrice}
                               onChange={(e) => setListingPrice(e.target.value)}
                               className="w-24 border border-gray-400 rounded px-2 py-1 text-right focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none font-bold text-lg text-[#B12704]" 
                             />
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-gray-600">Eco-Token Bonus:</span>
                             <span className="font-bold text-sm text-[#27ae60]">+100 Tokens</span>
                          </div>
                       </div>
                       <button 
                         disabled={isListing}
                         onClick={handleCreateListing} 
                         className="w-full mt-4 bg-[#ffd814] hover:bg-[#f3cc18] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full py-2 text-sm font-medium border border-[#fcd200] shadow-[0_1px_0_rgba(255,255,255,.4)_inset]"
                       >
                         {isListing ? 'Creating Listing...' : 'Create Listing'}
                       </button>
                    </div>
                  )}

                  <div className="border border-gray-300 rounded-lg p-5 bg-white cursor-pointer hover:bg-gray-50 col-span-2 md:col-span-1">
                     <h4 className="font-bold text-lg text-[#0F1111]">Standard Return</h4>
                     <p className="text-sm text-gray-700 mt-2">Item ships to Amazon warehouse. Refund to original payment.</p>
                     
                     <div className="mt-4 p-3 opacity-70">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-sm text-gray-600">Refund Value:</span>
                           <span className="font-bold text-lg text-[#0F1111]">₹3,695</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">Eco-Token Bonus:</span>
                           <span className="font-bold text-sm text-gray-500">0 Tokens</span>
                        </div>
                     </div>
                     <button onClick={handleStandardReturn} className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full py-2 text-sm font-medium border border-gray-300 shadow-sm">
                       Proceed to Refund
                     </button>
                  </div>
                </div>

              </div>
           )}

         </div>
        )}

        {step === 0 && (
          <div className="bg-white border border-gray-300 rounded p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0F1111] mb-4">Return History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-700 bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Return ID</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Eco-Tokens</th>
                </tr>
              </thead>
              <tbody>
                {previousReturns.map((ret) => (
                  <tr key={ret.id} className="border-b border-gray-100/50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{ret.id}</td>
                    <td className="px-4 py-3">{ret.item}</td>
                    <td className="px-4 py-3">{ret.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        ret.status === "Sold via P2P" ? "bg-green-100 text-green-800" :
                        ret.status === "Refurbished" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${ret.tokens !== "0" ? "text-[#27ae60]" : "text-gray-400"}`}>
                      {ret.tokens}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
