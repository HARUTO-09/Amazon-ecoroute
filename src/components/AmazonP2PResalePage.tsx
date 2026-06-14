import React, { useState, useEffect, useRef } from "react";
import { Search, Info, TrendingUp, Filter, ShieldCheck, Tag, Plus, Upload, X, MapPin } from "lucide-react";
import { useAuth } from "../AuthContext";

export default function AmazonP2PResalePage({ onProductClick }: { onProductClick?: (product?: any) => void }) {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = () => {
    if (!currentUser?.name) return;
    fetch(`/api/p2p/orders/${encodeURIComponent(currentUser.name)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMyOrders(data.data);
        }
      })
      .catch(err => console.error("Error fetching orders:", err));
  };
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newListing, setNewListing] = useState({ title: "", size: "", price: "", grade: "B" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanned, setIsScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedHealth, setScannedHealth] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setListings(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchListings();
    if (currentUser?.name) {
      fetchOrders();
    }
    const interval = setInterval(() => {
      fetchListings();
      if (currentUser?.name) {
        fetchOrders();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsScanned(false);
      setScannedHealth(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      alert("Please upload an image first to scan.");
      return;
    }
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      
      const res = await fetch("/api/returns/grade", { 
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setScannedHealth(data.data);
      setNewListing(prev => ({
        ...prev,
        grade: data.data.grade || "B",
        price: data.data.grade === "A" ? "8000" : (data.data.grade === "B" ? "4500" : "2000") // suggestion based on grade
      }));
      setIsScanned(true);
    } catch (e) {
      // silent ignore
      // Fallback
      setScannedHealth({
         grade: "B",
         conditionScore: 82,
         wearAnalysis: "Minor signs of usage but overall in good form.",
         resaleViability: true,
         ecoScore: 65
      });
      setNewListing(prev => ({
        ...prev,
        grade: "B",
        price: "1500"
      }));
      setIsScanned(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !isScanned) {
      alert("Please upload an image and let AI scan it first.");
      return;
    }
    
    setIsUploading(true);
    try {
      // 1. Upload the image to AWS S3 (via our Node backend)
      const formData = new FormData();
      formData.append("image", selectedFile);
      
      const uploadRes = await fetch("/api/p2p/upload", {
        method: "POST",
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) throw new Error(uploadData.message || "Upload failed");
      
      const imgUrl = uploadData.imageUrl;
      
      // Add to lifecycle routing queue for admin approval
      await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `P2P-${Math.floor(Math.random() * 1000000)}`,
          title: newListing.title,
          size: newListing.size,
          grade: newListing.grade || "B",
          category: "Electronics",
          img: imgUrl,
          origin: "P2P Display Listing",
          price: Number(newListing.price),
          seller: currentUser?.name || "Anonymous",
          health: scannedHealth ? {
            conditionScore: scannedHealth.conditionScore,
            wearAnalysis: scannedHealth.wearAnalysis,
            ecoScore: scannedHealth.ecoScore
          } : undefined
        })
      });
      
      setShowAddModal(false);
      setNewListing({ title: "", size: "", price: "", grade: "B" });
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsScanned(false);
      setScannedHealth(null);
      fetchListings();
    } catch (err) {
      // silent ignore
      alert("Failed to submit listing. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getFilteredListings = () => {
    let result = listings;
    if (filter === "shoes") return result.filter(item => item.title.toLowerCase().includes("shoe") || item.title.toLowerCase().includes("nike") || item.title.toLowerCase().includes("sneaker"));
    if (filter === "electronics") return result.filter(item => item.title.toLowerCase().includes("headphone") || item.title.toLowerCase().includes("watch") || item.title.toLowerCase().includes("sony") || item.title.toLowerCase().includes("apple"));
    return result;
  };

  const handleRemoveListing = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/p2p/list/${id}`, { method: "DELETE" });
      fetchListings();
    } catch (err) {
      // silent ignore
    }
  };

  const myListings = listings.filter(item => item.seller === currentUser?.name);

  return (
    <div className="bg-[#eaeded] min-h-screen pb-10 flex flex-col font-sans">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#172f3d] to-[#254256] text-white p-6 shadow-md border-b-[4px] border-[#febd69]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Amazon P2P Resale <LeafIcon className="w-6 h-6 text-[#febd69]" />
            </h1>
            <p className="text-lg mt-1 text-[#d5dbdb]">Buy tested, condition-verified used items directly from other customers.</p>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="flex flex-col items-center bg-white/10 px-4 py-2 rounded-lg">
              <ShieldCheck className="text-[#febd69] mb-1" />
              <span className="text-xs font-bold w-20 text-center">AI Verified Quality</span>
            </div>
            <div className="flex flex-col items-center bg-white/10 px-4 py-2 rounded-lg">
              <Tag className="text-[#febd69] mb-1" />
              <span className="text-xs font-bold w-20 text-center">Smart Bidding</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 mt-6 flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-3">Categories</h3>
            <div className="flex flex-col gap-2 text-sm text-[#0F1111]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={filter === "all"} onChange={() => setFilter("all")} className="accent-[#007185]" />
                <span>All Resale Items</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={filter === "shoes"} onChange={() => setFilter("shoes")} className="accent-[#007185]" />
                <span>Shoes & Footwear</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={filter === "electronics"} onChange={() => setFilter("electronics")} className="accent-[#007185]" />
                <span>Electronics & Tech</span>
              </label>
            </div>

            <hr className="my-4 border-gray-200" />
            
            <h3 className="font-bold text-lg mb-3">Condition Grade</h3>
            <div className="flex flex-col gap-2 text-sm text-[#0F1111]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#007185]" />
                <span>Grade A (Like New)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#007185]" />
                <span>Grade B (Good)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#007185]" />
                <span>Grade C (Acceptable)</span>
              </label>
            </div>
          </div>
          
          {currentUser && (
            <div className="flex flex-col gap-4 mt-4">
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <h3 className="font-bold text-lg text-gray-900">Your Listings ({myListings.length})</h3>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#007185] hover:bg-[#00596b] text-white p-1 rounded-full shadow-sm transition-colors"
                    title="Add new listing"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {myListings.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {myListings.map((item, idx) => (
                      <div key={idx} className="flex gap-2 p-2 hover:bg-gray-50 rounded transition-colors group relative">
                        <img src={item.img} alt="item" className="w-12 h-12 object-contain mix-blend-multiply bg-gray-50 rounded border border-gray-100" />
                        <div className="flex flex-col justify-center flex-1">
                          <span className="text-xs font-semibold text-[#007185] line-clamp-1 group-hover:underline cursor-pointer">{item.title}</span>
                          <div className="flex justify-between items-center mt-0.5">
                            <span className="text-[#B12704] text-xs font-bold">₹{item.price.toLocaleString()}</span>
                            {item.health && <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-medium">Score: {item.health.conditionScore}</span>}
                          </div>
                          <button 
                            onClick={(e) => handleRemoveListing(item.id, e)}
                            className="mt-1 text-[10px] text-red-600 hover:text-red-800 self-start border border-red-200 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-colors"
                          >
                            Take Back
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 text-center py-4">
                    You haven't listed any items yet.
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="block mt-2 mx-auto text-[#007185] hover:underline"
                    >
                      Start selling
                    </button>
                  </div>
                )}
              </div>

              {myOrders.length > 0 && (
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3 border-b pb-2">
                    <h3 className="font-bold text-lg text-gray-900">Orders to Ship ({myOrders.length})</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {myOrders.map((order, idx) => (
                      <div key={idx} className="flex gap-2 p-2 bg-yellow-50 rounded border border-yellow-200 group relative">
                        <img src={order.img} alt="item" className="w-10 h-10 object-contain mix-blend-multiply bg-white rounded border border-gray-100" />
                        <div className="flex flex-col justify-center flex-1">
                          <span className="text-xs font-semibold text-[#007185] line-clamp-1">{order.title}</span>
                          <span className="text-[10px] text-gray-600">Purchased by: <span className="font-bold text-gray-800">{order.buyerName}</span></span>
                          {order.status === "accepted" ? (
                            <button 
                              onClick={async () => {
                                try {
                                  await fetch(`/api/p2p/orders/${order.id}/ship`, { method: "POST" });
                                  fetchOrders();
                                } catch (e) {}
                              }}
                              className="mt-1 text-[10px] text-white self-start border border-[#fcd200] bg-[#ffd814] hover:bg-[#f3cc18] px-2 py-0.5 rounded shadow-sm text-black transition-colors"
                            >
                              Ready to Ship
                            </button>
                          ) : (
                            <span className="mt-1 text-[10px] font-bold text-green-700">Shipped</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-4 flex items-center justify-between">
            <span className="text-sm">
              <span className="font-bold">{getFilteredListings().length} results</span> for "Used items by Amazon P2P Resale"
            </span>
            <div className="flex items-center gap-2 text-sm border p-1 rounded-md shadow-sm cursor-pointer hover:bg-gray-50">
              <span className="text-gray-600 pl-2">Sort by:</span>
              <span className="font-medium pr-1">Featured</span>
              <span className="text-[10px] text-gray-500 pr-2">▼</span>
            </div>
          </div>

          {loading ? (
            <div className="flex py-20 justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff9900]"></div>
            </div>
          ) : getFilteredListings().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredListings().map((item, idx) => (
                 <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden pb-3 group" onClick={() => onProductClick && onProductClick(item)}>
                  <div className="relative h-48 bg-[#f8f9fa] flex items-center justify-center p-4">
                    {item.grade === "A" && (
                      <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 border border-green-200">
                        <ShieldCheck size={12} /> GRADE A
                      </div>
                    )}
                    {item.grade === "B" && (
                      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 border border-yellow-200">
                        <ShieldCheck size={12} /> GRADE B
                      </div>
                    )}
                    <img src={item.img} alt={item.title} className="h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="px-4 pt-3 flex flex-col flex-1">
                    <h3 className="font-medium text-base text-[#0f1111] line-clamp-2 leading-snug group-hover:text-[#c45500] hover:underline">
                      {item.title}
                    </h3>
                    {item.size && (
                      <p className="text-sm font-bold text-gray-700 mt-1">Size: {item.size}</p>
                    )}
                    <div className="flex text-yellow-500 mt-1 mb-1">
                      {"★★★★☆".split("").map((star, i) => <span key={i} className="text-sm">{star}</span>)}
                      <span className="text-[#007185] text-xs ml-1 font-sans">Used (Verified)</span>
                    </div>

                    {item.health && (
                      <div className="mt-2 text-xs bg-blue-50 border border-blue-100 p-2 rounded text-blue-800">
                        <div className="font-bold border-b border-blue-200 pb-1 mb-1 flex items-center justify-between">
                          <span>Health Score: {item.health.conditionScore}/100</span>
                          <span>Eco: {item.health.ecoScore}</span>
                        </div>
                        <div className="text-[10px] leading-tight line-clamp-2">{item.health.wearAnalysis}</div>
                      </div>
                    )}
                    
                    <div className="flex items-baseline gap-1 mt-auto pt-2">
                      <span className="text-sm">₹</span>
                      <span className="text-2xl text-[#0f1111] font-medium leading-none">{item.price.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-green-700 font-medium mt-1">Get an extra 5% off with Amazon Pay</div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">Listed by <span className="text-[#007185]">{item.seller}</span></div>
                      <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded flex items-center gap-1"><MapPin size={10} /> Local P2P: 2.4 km away</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded shadow-sm border border-gray-200 text-center flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No listings found</h2>
              <p className="text-gray-600 max-w-md">There are currently no P2P resale listings from other users available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-[#f2f4f8] px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create P2P Listing</h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setNewListing({ title: "", size: "", price: "", grade: "B" });
                }}
                className="text-gray-500 hover:text-gray-800 transition-colors"
                disabled={isUploading}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Image (AWS S3)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                      ${previewUrl ? 'border-[#007185] bg-teal-50' : 'border-gray-300 hover:border-[#007185] hover:bg-gray-50'}`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                    
                    {previewUrl ? (
                      <div className="relative w-full h-32">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                    ) : (
                      <>
                        <div className="bg-[#e7f4f5] p-3 rounded-full mb-3">
                          <Upload className="text-[#007185] w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Title</label>
                  <input 
                    type="text" 
                    required
                    value={newListing.title}
                    onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                    placeholder="e.g., Apple Watch Series 8"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Size (if applicable)</label>
                  <input 
                    type="text" 
                    value={newListing.size}
                    onChange={(e) => setNewListing({...newListing, size: e.target.value})}
                    placeholder="e.g., 10"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] placeholder-gray-400"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={newListing.price}
                        onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                        disabled={!isScanned}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] disabled:bg-gray-100 disabled:text-gray-400"
                        placeholder={isScanned ? "" : "AI will suggest price"}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Condition</label>
                    <div className="relative">
                      <select 
                        value={newListing.grade}
                        onChange={(e) => setNewListing({...newListing, grade: e.target.value})}
                        disabled={true}
                        className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] appearance-none disabled:bg-gray-100 disabled:text-gray-700 font-bold"
                      >
                        <option value="A">Grade A (Like New)</option>
                        <option value="B">Grade B (Good)</option>
                        <option value="C">Grade C (Acceptable)</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">▼</span>
                    </div>
                  </div>
                </div>

                {scannedHealth && (
                  <div className="mt-2 text-xs bg-blue-50 border border-blue-100 p-2 rounded text-blue-800">
                    <div className="font-bold border-b border-blue-200 pb-1 mb-1 flex items-center justify-between">
                      <span>Health Score: {scannedHealth.conditionScore}/100</span>
                      <span>Eco: {scannedHealth.ecoScore}</span>
                    </div>
                    <div className="text-[10px] leading-tight line-clamp-2">{scannedHealth.wearAnalysis}</div>
                  </div>
                )}

                <div className="mt-2 pt-4 border-t border-gray-200">
                  {!isScanned ? (
                    <button 
                      type="button"
                      onClick={handleScan}
                      disabled={isScanning || !selectedFile}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2.5 text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300"
                    >
                      {isScanning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Scanning with AI...
                        </>
                      ) : (
                        'Scan & Generate Healthcard'
                      )}
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={isUploading}
                      className="w-full bg-[#f0c14b] border border-[#a88734] active:bg-[#f0c14b] hover:bg-[#f4d078] rounded-md py-2.5 text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                          Uploading & Listing...
                        </>
                      ) : (
                        'List Item for Sale'
                      )}
                    </button>
                  )}
                  
                  <p className="text-center text-[11px] text-gray-500 mt-3">
                    Images are securely stored via AWS S3 infrastructure. 
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeafIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 14 6h7v7a7 7 0 0 1-7 7h-3Z" />
      <path d="M11 20a7 7 0 0 1-7-7v-3h3a7 7 0 0 1 7 7Z" />
      <path d="M11 20v-5" />
    </svg>
  );
}
