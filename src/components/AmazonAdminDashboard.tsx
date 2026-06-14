import React, { useState, useEffect } from 'react';
import { Leaf, ArrowRight, CheckCircle, PackageSearch, Factory, RefreshCw, BarChart2, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RouteOption {
  route: string;
  score: number;
  cost: number;
  carbon: number;
  recommendation: string;
}

export default function AmazonAdminDashboard({ onExit }: { onExit: () => void }) {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [approvedRoute, setApprovedRoute] = useState<RouteOption | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'metrics' | 'inventory'>('queue');
  const [completedP2PListings, setCompletedP2PListings] = useState(1245);
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedQueueItem, setSelectedQueueItem] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [p2pListings, setP2pListings] = useState<any[]>([]);
  const [inventoryTab, setInventoryTab] = useState<'hub' | 'p2p'>('hub');

  useEffect(() => {
    fetchQueue();
    fetchInventory();
    fetchP2pListings();
    // Poll the queue every 5 seconds
    const interval = setInterval(() => {
       fetchQueue();
       fetchInventory();
       fetchP2pListings();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchP2pListings = async () => {
    try {
      const res = await fetch("/api/p2p/listings");
      const data = await res.json();
      if (data.success) {
        setP2pListings(data.data);
      }
    } catch (e) {
      // silent ignore
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (e) {
      // silent ignore
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/admin/queue");
      const data = await res.json();
      if (data.success && data.data) {
        setQueue(data.data);
        setSelectedQueueItem((prev) => {
          if (!prev && data.data.length > 0) return data.data[0];
          return prev;
        });
      }
    } catch (e) {
      // silent ignore
    }
  };

  useEffect(() => {
    if (!selectedQueueItem) return;
    
    // Fetch routing options when the selected item changes
    const evaluateRouting = async () => {
      setIsLoading(true);
      setApprovedRoute(null);
      try {
        const res = await fetch("/api/admin/routing/evaluate", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conditionGrade: selectedQueueItem.grade, category: selectedQueueItem.category || "Shoes" })
        });
        const data = await res.json();
        if (data.success) {
          setRoutes(data.data);
        } else if (data.fallback) {
          setRoutes(data.fallback);
        }
      } catch(e) {
        setRoutes([
          { route: "Peer-to-Peer Exchange", score: 0.92, cost: 40, carbon: 0.6, recommendation: "Highest sustainability and margin" },
          { route: "Refurbish", score: 0.65, cost: 320, carbon: 7.1, recommendation: "Secondary option" },
          { route: "Resell As-Is", score: 0.30, cost: 580, carbon: 12.4, recommendation: "High carbon footprint, default path" }
        ]);
      }
      setIsLoading(false);
    };

    evaluateRouting();
  }, [selectedQueueItem]);

  const handleRemoveP2pListing = async (id: string) => {
    try {
      await fetch(`/api/p2p/list/${id}`, { method: "DELETE" });
      fetchP2pListings();
    } catch (e) {
      // silent ignore
    }
  };

  const handleApprove = async (route: RouteOption) => {
    setApprovedRoute(route);
    if (route.route === "Peer-to-Peer Exchange") {
      setCompletedP2PListings(prev => prev + 1);
      try {
        await fetch("/api/p2p/list", {
          method: "POST",
          headers: { "Content-Type" : "application/json" },
          body: JSON.stringify({
             title: selectedQueueItem?.title,
             size: selectedQueueItem?.size,
             price: selectedQueueItem?.price || 1500,
             grade: selectedQueueItem?.grade || "B",
             img: selectedQueueItem?.img,
             seller: selectedQueueItem?.seller || "Amazon Certified Resale",
             health: selectedQueueItem?.health
          })
        });
      } catch (e) {}
    } else if (route.route === "Refurbish" || route.route === "Resell As-Is") {
      try {
         await fetch("/api/admin/inventory", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             category: selectedQueueItem?.category || "Unknown",
             grade: selectedQueueItem?.grade || "B",
             value: route.route === "Refurbish" ? 2000 : 1000
           })
         });
         fetchInventory();
      } catch (e) {}
    }
  };

  const handleNextItem = async () => {
    if (selectedQueueItem) {
      // Remove from queue
      try {
        await fetch(`/api/admin/queue/${selectedQueueItem.id}`, { method: 'DELETE' });
        
        // Fetch new queue state
        const res = await fetch("/api/admin/queue");
        const data = await res.json();
        if (data.success && data.data) {
          setQueue(data.data);
          setSelectedQueueItem(data.data.length > 0 ? data.data[0] : null);
        }
        setApprovedRoute(null);
      } catch (e) {}
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans flex text-[#0f1111]">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#232F3E] text-white flex flex-col hidden md:flex">
        <div className="p-4 flex items-center gap-2 border-b border-gray-700">
           {/* Amazon Logo */}
           <div style={{
              backgroundImage: "url('https://m.media-amazon.com/images/G/31/gno/sprites/nav-sprite-global-1x-hm-dsk-reorg.png')",
              backgroundPosition: "-10px -51px",
              width: "97px",
              height: "30px",
              backgroundRepeat: "no-repeat",
              filter: "brightness(0) invert(1)"
           }} />
           <span className="text-xs text-gray-400 font-bold tracking-wider mt-2 ml-1">ADMIN</span>
        </div>
        <nav className="flex-1 py-4">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`w-full flex items-center justify-start gap-3 px-6 py-3 cursor-pointer ${activeTab === 'queue' ? 'bg-[#37475A] text-white border-l-4 border-white font-medium' : 'text-gray-300 hover:bg-[#37475A] hover:text-white transition-colors border-l-4 border-transparent'}`}
          >
             <RefreshCw className="w-5 h-5" /> Return Queue
          </button>
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`w-full flex items-center justify-start gap-3 px-6 py-3 cursor-pointer ${activeTab === 'metrics' ? 'bg-[#37475A] text-white border-l-4 border-white font-medium' : 'text-gray-300 hover:bg-[#37475A] hover:text-white transition-colors border-l-4 border-transparent'}`}
          >
             <BarChart2 className="w-5 h-5" /> Sustainability Metrics
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-start gap-3 px-6 py-3 cursor-pointer ${activeTab === 'inventory' ? 'bg-[#37475A] text-white border-l-4 border-white font-medium' : 'text-gray-300 hover:bg-[#37475A] hover:text-white transition-colors border-l-4 border-transparent'}`}
          >
             <PackageSearch className="w-5 h-5" /> Inventory
          </button>
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={onExit} className="w-full py-2 bg-gray-700/50 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors text-gray-300">
             Exit
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Lifecycle Routing Matrix</h1>
            <p className="text-sm text-gray-500 mt-1">AI-powered reverse logistics optimization</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="text-gray-500 hover:text-gray-700 relative">
               <Bell className="w-6 h-6" />
               <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
                P
             </div>
          </div>
        </header>

        {activeTab === 'queue' && (
          <>
            {/* Queue Overview */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Pending Routing Evaluations <span className="bg-[#e77600] text-white text-xs px-2 py-1 rounded-full">{queue.length}</span>
              </h2>
            </div>
            
            {queue.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                 No items in routing queue. Items from Return Portal or P2P Listings will appear here in real-time.
              </div>
            ) : (
              <div className="flex gap-8 items-start h-[calc(100vh-180px)]">
                {/* Left Column: Queue List */}
                <div className="w-80 flex flex-col gap-2 overflow-y-auto pr-2 pb-8 sticky top-0 shrink-0">
                  {queue.map(item => (
                    <div 
                       key={item.id} 
                       onClick={() => { setSelectedQueueItem(item); setApprovedRoute(null); }}
                       className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedQueueItem?.id === item.id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                       <div className="w-12 h-12 bg-white rounded border border-gray-100 flex items-center justify-center p-1 shrink-0">
                          <img src={item.img} className="max-w-full max-h-full object-contain" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-gray-900 truncate">{item.title}</div>
                          <div className="flex items-center justify-between mt-1.5">
                             <div className="flex items-center gap-2">
                               <div className="text-[10px] font-mono text-gray-500">{item.id}</div>
                               <span className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded ${item.grade === 'A' ? 'bg-blue-100 text-blue-700' : item.grade === 'C' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>Gr {item.grade}</span>
                             </div>
                             {item.timestamp && (
                               <span className="text-[10px] text-gray-400 font-medium">
                                  {Math.floor((Date.now() - item.timestamp) / 60000)}m ago
                               </span>
                             )}
                          </div>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Right Column: Detail View */}
                <div className="flex-1 overflow-y-auto pb-8">
                  {selectedQueueItem ? (
                    <>
                      {/* Product Return Context */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                         <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                               <div className="w-24 h-24 bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-center shrink-0">
                                  <img src={selectedQueueItem.img} className="max-w-full max-h-full object-contain" />
                               </div>
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <div className="text-xs text-gray-500 font-mono tracking-wide">{selectedQueueItem.id}</div>
                                     <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-bold">{selectedQueueItem.category || "General"}</span>
                                  </div>
                                  <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{selectedQueueItem.title}</h2>
                                  <div className="flex items-center gap-4 text-sm">
                                     <div className="flex items-center gap-1.5 text-gray-600">
                                        <span className="font-medium text-gray-800">Condition:</span>
                                        <span className={`font-bold ${selectedQueueItem.grade === 'A' ? 'text-blue-700' : selectedQueueItem.grade === 'C' ? 'text-red-700' : 'text-green-700'}`}>
                                           Grade {selectedQueueItem.grade}
                                        </span>
                                     </div>
                                     <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                     <div className="text-gray-600">
                                        <span className="font-medium text-gray-800">Origin:</span> {selectedQueueItem.origin || "Unknown"}
                                     </div>
                                  </div>
                               </div>
                            </div>
                            <button onClick={onExit} className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700">
                               Exit
                            </button>
                         </div>
                      </div>

                      {/* Routing Options */}
                      <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                        <span>AI Recommended Routes</span>
                        <span className="text-xs font-normal text-gray-500">Optimizing for sustainability & margin</span>
                      </h3>
                      
                      {isLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                             <div key={i} className="h-32 bg-white border border-gray-100 shadow-sm animate-pulse rounded-xl w-full"></div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                           {routes.map((route, index) => (
                              <motion.div 
                                 key={route.route}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: index * 0.1 }}
                                 className={`p-5 rounded-xl border transition-all ${index === 0 ? 'border-green-400 bg-gradient-to-br from-green-50 to-white shadow-sm ring-1 ring-green-100 ring-offset-2' : 'border-gray-200 bg-white hover:border-gray-300'} relative overflow-hidden`}
                              >
                                 {index === 0 && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-4 py-1.5 uppercase tracking-wider rounded-bl-lg shadow-sm">
                                       AI Top Pick
                                    </div>
                                 )}
                                 
                                 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pt-1">
                                     <div className="flex-1 pr-6 xl:pr-0">
                                        <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-1">
                                           {route.route === "Peer-to-Peer Exchange" && <Leaf className="w-5 h-5 text-green-600" />}
                                           {route.route === "Refurbish" && <RefreshCw className="w-5 h-5 text-amber-500" />}
                                           {route.route === "Resell As-Is" && <Factory className="w-5 h-5 text-gray-500" />}
                                           {route.route === "Donate" && <Leaf className="w-5 h-5 text-green-500" />}
                                           {route.route}
                                        </h4>
                                        <p className="text-sm text-gray-600">{route.recommendation}</p>
                                     </div>
                                     
                                     <div className="flex flex-wrap sm:flex-nowrap gap-4 sm:gap-8 items-center bg-gray-50 xl:bg-transparent p-4 xl:p-0 rounded-lg">
                                        <div className="text-left xl:text-center w-full sm:w-auto">
                                           <div className="text-xs text-gray-500 mb-1 font-medium">Carbon Impact</div>
                                           <div className={`font-bold text-lg flex items-center gap-1.5 ${route.carbon < 5 ? 'text-green-600' : 'text-gray-900'}`}>
                                              {route.carbon} kg
                                              {route.carbon < 5 && <Leaf className="w-4 h-4" />}
                                           </div>
                                        </div>
                                        
                                        <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                                        
                                        <div className="text-left xl:text-center w-full sm:w-auto">
                                           <div className="text-xs text-gray-500 mb-1 font-medium">Avg Cost</div>
                                           <div className="font-bold text-lg text-gray-900">₹{route.cost}</div>
                                        </div>
                                        
                                        <div className="w-full sm:w-auto sm:ml-4 flex justify-end">
                                        <button 
                                           onClick={() => handleApprove(route)}
                                           className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition-colors ${
                                              approvedRoute?.route === route.route 
                                                ? 'bg-blue-600 text-white border-blue-600 cursor-default' 
                                                : index === 0 
                                                  ? 'bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-gray-900' 
                                                  : 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-700'
                                           }`}
                                        >
                                           {approvedRoute?.route === route.route ? (
                                              <>Approved <CheckCircle className="w-4 h-4" /></>
                                           ) : (
                                              "Approve Route"
                                           )}
                                        </button>
                                        </div>
                                     </div>
                                 </div>
                                 
                                 {/* Visual Carbon Bar */}
                                 <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-4">
                                    <div className="text-xs font-medium text-gray-500 w-28 shrink-0">Carbon allowance</div>
                                    <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                                       <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${Math.min((route.carbon / 15) * 100, 100)}%` }}
                                          transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 + 0.2 }}
                                          className={`h-full ${route.carbon < 2 ? 'bg-green-500' : route.carbon < 8 ? 'bg-amber-400' : 'bg-red-500'}`}
                                       ></motion.div>
                                    </div>
                                    {index === 0 && (
                                       <div className="text-[11px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full shrink-0">
                                          Saves 11.8kg CO₂
                                       </div>
                                    )}
                                 </div>
                              </motion.div>
                           ))}
                        </div>
                      )}

                      <AnimatePresence>
                          {approvedRoute && (
                             <motion.div 
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
                             >
                                <div className="text-center sm:text-left">
                                   <h4 className="font-bold text-blue-900 flex items-center gap-2 justify-center sm:justify-start">
                                      <CheckCircle className="w-5 h-5 text-blue-600" /> Recommendation Approved
                                   </h4>
                                   <p className="text-sm text-blue-800 mt-1.5">
                                      Item <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded">{selectedQueueItem.id}</span> has been routed to <strong>{approvedRoute.route}</strong>.
                                   </p>
                                </div>
                                <button 
                                   onClick={handleNextItem}
                                   className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-2 text-sm font-bold transition-colors w-full sm:w-auto justify-center shrink-0"
                                >
                                   Process Next Item <ArrowRight className="w-4 h-4" />
                                </button>
                             </motion.div>
                          )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center text-gray-500 flex flex-col items-center justify-center h-[calc(100vh-220px)]">
                       <h3 className="text-lg font-bold text-gray-700 mb-2">No Item Selected</h3>
                       <p className="text-sm">Select an item from the queue to process its return routing decisions.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'metrics' && (
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col min-h-[400px]">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <Leaf className="w-6 h-6" />
                    <h2 className="text-xl font-bold text-gray-800">P2P Reselling Impact</h2>
                  </div>
                  <p className="text-gray-500 max-w-2xl text-sm">
                    Environmental metrics calculated in real-time based on successfully completed Peer-to-Peer exchanges.
                    Each direct exchange avoids the carbon cost of forward and reverse warehouse logistics.
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-right shrink-0">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Completed P2P Exchanges</div>
                  <div className="text-3xl font-bold text-blue-600 flex items-center justify-end gap-3">
                    {completedP2PListings.toLocaleString()}
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setCompletedP2PListings(prev => prev + 1)} className="bg-white border border-gray-300 rounded p-0.5 hover:bg-gray-100 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                      </button>
                      <button onClick={() => setCompletedP2PListings(prev => Math.max(0, prev - 1))} className="bg-white border border-gray-300 rounded p-0.5 hover:bg-gray-100 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-8">
                 <div className="p-5 border border-green-100 rounded-lg bg-green-50 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-green-100 opacity-50">
                       <Leaf className="w-24 h-24" />
                    </div>
                    <div className="text-sm text-green-800 font-medium mb-1">CO₂ Offset (kg)</div>
                    <div className="text-3xl font-bold text-green-700 mt-1">
                      <motion.span 
                        key={completedP2PListings}
                        initial={{ opacity: 0.5, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      >
                        {(completedP2PListings * 11.8).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </motion.span>
                    </div>
                    <div className="text-xs text-green-600 mt-2">~11.8 kg avoided per exchange</div>
                 </div>
                 
                 <div className="p-5 border border-blue-100 rounded-lg bg-blue-50 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-blue-100 opacity-50">
                       <PackageSearch className="w-24 h-24" />
                    </div>
                    <div className="text-sm text-blue-800 font-medium mb-1">Waste Diverted (kg)</div>
                    <div className="text-3xl font-bold text-blue-700 mt-1">
                      <motion.span 
                        key={completedP2PListings}
                        initial={{ opacity: 0.5, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      >
                        {(completedP2PListings * 1.5).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </motion.span>
                    </div>
                    <div className="text-xs text-blue-600 mt-2">Saved from liquidation/landfill</div>
                 </div>
                 
                 <div className="p-5 border border-purple-100 rounded-lg bg-purple-50 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-purple-100 opacity-50">
                       <RefreshCw className="w-24 h-24" />
                    </div>
                    <div className="text-sm text-purple-800 font-medium mb-1">Water Saved (Liters)</div>
                    <div className="text-3xl font-bold text-purple-700 mt-1">
                      <motion.span 
                        key={completedP2PListings}
                        initial={{ opacity: 0.5, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      >
                        {(completedP2PListings * 500).toLocaleString()}
                      </motion.span>
                    </div>
                    <div className="text-xs text-purple-600 mt-2">Avoided new manufacturing</div>
                 </div>
              </div>
              
              <div className="mt-auto bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Equivalent Environmental Impact</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100 shadow-sm grow-0 shrink-0">
                      🚗
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-700">
                        {Math.round((completedP2PListings * 11.8) / 4.6).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase font-medium leading-tight">Cars off road<br/>(days)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100 shadow-sm grow-0 shrink-0">
                      📱
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-700">
                        {Math.round((completedP2PListings * 11.8) / 0.008).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase font-medium leading-tight">Smartphones<br/>charged</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100 shadow-sm grow-0 shrink-0">
                      🌳
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-700">
                        {Math.round((completedP2PListings * 11.8) / 21).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase font-medium leading-tight">Trees planted<br/>(yearly impact)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100 shadow-sm grow-0 shrink-0">
                      💧
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-700">
                        {Math.round((completedP2PListings * 500) / 2.5).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase font-medium leading-tight">People's daily<br/>drinking water</div>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        )}

        {activeTab === 'inventory' && (
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-xl font-bold">Inventory Management</h2>
                   <div className="flex gap-4 mt-2">
                     <button 
                       onClick={() => setInventoryTab('hub')}
                       className={`text-sm pb-1 font-medium ${inventoryTab === 'hub' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                       Local Hub Inventory
                     </button>
                     <button 
                       onClick={() => setInventoryTab('p2p')}
                       className={`text-sm pb-1 font-medium ${inventoryTab === 'p2p' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                       Approved P2P Listings
                     </button>
                   </div>
                 </div>
                 <button className="text-sm text-blue-600 font-medium my-auto hover:text-blue-800">Filter</button>
              </div>
              <div className="overflow-x-auto">
                {inventoryTab === 'hub' ? (
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-gray-200 text-sm text-gray-500">
                           <th className="pb-3 font-medium">SKU</th>
                           <th className="pb-3 font-medium">Product Category</th>
                           <th className="pb-3 font-medium">Condition</th>
                           <th className="pb-3 font-medium">In Stock</th>
                           <th className="pb-3 font-medium">Est. Value</th>
                        </tr>
                     </thead>
                     <tbody className="text-sm">
                        {inventory.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100 items-center">
                               <td className="py-4 font-mono text-gray-600">{item.sku}</td>
                               <td className="py-4">{item.category}</td>
                               <td className="py-4">
                                 <span className={`px-2 py-1 ${item.grade === 'A' ? 'bg-blue-100 text-blue-800' : item.grade === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'} rounded font-bold text-[10px]`}>
                                   GRADE {item.grade}
                                 </span>
                               </td>
                               <td className="py-4">{item.stock}</td>
                               <td className="py-4">₹{item.value.toLocaleString()}</td>
                            </tr>
                        ))}
                     </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-gray-200 text-sm text-gray-500">
                           <th className="pb-3 font-medium">Item</th>
                           <th className="pb-3 font-medium">Seller</th>
                           <th className="pb-3 font-medium">Condition</th>
                           <th className="pb-3 font-medium">Price</th>
                           <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="text-sm">
                        {p2pListings.length === 0 ? (
                          <tr><td colSpan={5} className="py-8 text-center text-gray-500">No active P2P listings</td></tr>
                        ) : p2pListings.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100">
                               <td className="py-4">
                                 <div className="flex items-center gap-3">
                                   <img src={item.img} className="w-10 h-10 object-contain rounded border border-gray-200 bg-white" />
                                   <div className="font-medium text-gray-800">{item.title}</div>
                                 </div>
                               </td>
                               <td className="py-4">{item.seller}</td>
                               <td className="py-4">
                                 <span className={`px-2 py-1 ${item.grade === 'A' ? 'bg-blue-100 text-blue-800' : item.grade === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'} rounded font-bold text-[10px]`}>
                                   GRADE {item.grade}
                                 </span>
                               </td>
                               <td className="py-4">₹{item.price.toLocaleString()}</td>
                               <td className="py-4 text-right">
                                 <button 
                                   onClick={() => handleRemoveP2pListing(item.id)}
                                   className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded"
                                 >
                                   Remove from P2P
                                 </button>
                               </td>
                            </tr>
                        ))}
                     </tbody>
                  </table>
                )}
              </div>
           </div>
        )}

      </main>
    </div>
  );
}
