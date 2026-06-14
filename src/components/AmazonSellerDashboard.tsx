import React, { useState, useEffect } from "react";
import { 
  Package, LayoutDashboard, Camera, Sparkles, CheckCircle2, AlertCircle, X, Store, Box, RotateCcw, TrendingUp, IndianRupee, MapPin, Activity, ShieldCheck, Leaf, Search, Filter, Droplets, RefreshCw, BarChart3, ChevronRight, Zap, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SellerReturnItem {
  id: string;
  orderId: string;
  title: string;
  img: string;
  returnReason: string;
  returnDate: string;
  category: string;
}

interface GradedItem extends SellerReturnItem {
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  issues: string[];
  suggestedPrice: number;
  originalPrice: number;
  aiRecommendation: string;
  reasoning: string;
  healthStats: {
    authenticity: number;
    sanitization: number;
    usageEstimate: string;
    sustainabilityScore: number;
    trustScore: number;
  };
  routingOptions: RoutingOption[];
  localDemand: number;
  aiGeneratedTitle: string;
  aiGeneratedDesc: string;
}

interface RoutingOption {
  name: string;
  recovery: number;
  speed: string;
  carbon: number;
  cost: number;
  score: number;
  aiConfidence: number;
}

const mockReturnsQueue: SellerReturnItem[] = [
  {
    id: "RET-84221",
    orderId: "112-928371-291823",
    title: "Men's Synthetic Running Shoes",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    returnReason: "Item defective or doesn't work",
    returnDate: "2026-06-12",
    category: "Footwear"
  },
  {
    id: "RET-75199",
    orderId: "114-129482-123456",
    title: "Wireless Bluetooth Earbuds Pro",
    img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
    returnReason: "Missing parts or accessories",
    returnDate: "2026-06-13",
    category: "Electronics"
  },
  {
    id: "RET-99212",
    orderId: "111-456789-098765",
    title: "Smart Desk Lamp with Wireless Charging",
    img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    returnReason: "Bought by mistake",
    returnDate: "2026-06-14",
    category: "Home"
  },
  {
    id: "RET-54812",
    orderId: "113-128472-882191",
    title: "Cotton T-Shirt Basic (White)",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    returnReason: "Stained on arrival",
    returnDate: "2026-06-14",
    category: "Apparel"
  },
  {
    id: "RET-23190",
    orderId: "111-827361-998827",
    title: "Gaming Mechanical Keyboard",
    img: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
    returnReason: "Keys sticking",
    returnDate: "2026-06-13",
    category: "Electronics"
  },
];

const impactData = [
  { name: 'Jan', co2: 400, items: 240, revenue: 12000 },
  { name: 'Feb', co2: 300, items: 139, revenue: 8000 },
  { name: 'Mar', co2: 600, items: 480, revenue: 24000 },
  { name: 'Apr', co2: 800, items: 390, revenue: 19000 },
  { name: 'May', co2: 500, items: 430, revenue: 21000 },
  { name: 'Jun', co2: 900, items: 580, revenue: 29000 },
];

export default function AmazonSellerDashboard({ onExit }: { onExit: () => void }) {
  const [activeTab, setActiveTab] = useState<'returns' | 'analytics' | 'inventory'>('returns');
  const [returnsQueue, setReturnsQueue] = useState<SellerReturnItem[]>(() => {
    const saved = localStorage.getItem('seller_returnsQueue_v3');
    return saved ? JSON.parse(saved) : mockReturnsQueue;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gradedItems, setGradedItems] = useState<GradedItem[]>(() => {
    const saved = localStorage.getItem('seller_gradedItems_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [inventoryItems, setInventoryItems] = useState<(GradedItem & { status: string })[]>(() => {
    const saved = localStorage.getItem('seller_inventoryItems_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    localStorage.setItem('seller_returnsQueue_v3', JSON.stringify(returnsQueue));
  }, [returnsQueue]);

  useEffect(() => {
    localStorage.setItem('seller_gradedItems_v3', JSON.stringify(gradedItems));
  }, [gradedItems]);

  useEffect(() => {
    localStorage.setItem('seller_inventoryItems_v3', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  const [searchQuery, setSearchQuery] = useState("");

  const [filterGrade, setFilterGrade] = useState("All");
  const [selectedItem, setSelectedItem] = useState<GradedItem | null>(null);

  const processingSteps = [
    "Uploading Images...",
    "Detecting Wear...",
    "Authenticating Product...",
    "Estimating Recovery Value...",
    "Calculating Carbon Impact...",
    "Generating Health Card...",
    "Routing Optimization Complete"
  ];

  const handleBulkAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep(0);

    const stepDuration = 600; // ms per step
    const totalDuration = stepDuration * processingSteps.length;

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (100 / (totalDuration / 100));
      });
    }, 100);

    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => prev < processingSteps.length - 1 ? prev + 1 : prev);
    }, stepDuration);

    try {
      const res = await fetch("/api/seller/bulk-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: returnsQueue })
      });
      const data = await res.json();
      
      setTimeout(() => {
         clearInterval(progressInterval);
         clearInterval(stepInterval);
         setAnalysisProgress(100);
         setAnalysisStep(processingSteps.length - 1);
         
         setTimeout(() => {
           setIsAnalyzing(false);
           // Hydrate with more mocked data for our new UI since API might not return all new fields
           const enhanced = (data.data || []).map((item: any) => enhanceGradedItem(item));
           setGradedItems(enhanced);
           setReturnsQueue([]);
         }, 800);
      }, totalDuration);

    } catch(err) {
       console.error(err);
       clearInterval(progressInterval);
       clearInterval(stepInterval);
       setIsAnalyzing(false);
    }
  };

  const enhanceGradedItem = (item: any): GradedItem => {
    // Generate realistic routing options based on grade
    const grade = item.grade || 'B';
    const isApparel = item.title.includes("Shirt") || item.title.includes("Shoe");
    
    let routes: RoutingOption[] = [
      { name: "Relist as Renewed", recovery: item.originalPrice * 0.8, speed: "Fast", carbon: 12.4, cost: 0, score: 85, aiConfidence: 92 },
      { name: "Refurbish", recovery: item.originalPrice * 0.9, speed: "Medium", carbon: 8.2, cost: item.originalPrice * 0.1, score: 78, aiConfidence: 88 },
      { name: "Local P2P Resale", recovery: item.originalPrice * 0.7, speed: "Very Fast", carbon: 18.5, cost: 0, score: 95, aiConfidence: 96 },
      { name: "Donate", recovery: 0, speed: "Fast", carbon: 22.0, cost: 150, score: 90, aiConfidence: 99 },
      { name: "Recycle", recovery: 0, speed: "Slow", carbon: 5.0, cost: 300, score: 40, aiConfidence: 99 },
    ];

    if (grade === 'A' || grade === 'B') {
      routes = routes.filter(r => r.name !== "Recycle" && r.name !== "Donate");
    } else if (grade === 'C') {
      routes = routes.filter(r => r.name !== "Relist as Renewed");
    } else {
      routes = routes.filter(r => r.name === "Donate" || r.name === "Recycle" || r.name === "Refurbish");
    }

    // Sort by score
    routes.sort((a, b) => b.score - a.score);

    return {
      ...item,
      healthStats: {
        authenticity: 99,
        sanitization: grade === 'A' ? 100 : 85,
        usageEstimate: grade === 'A' ? "0 hours" : grade === 'B' ? "< 10 hours" : "> 50 hours",
        sustainabilityScore: grade === 'A' ? 98 : grade === 'B' ? 85 : 60,
        trustScore: 94
      },
      routingOptions: routes,
      aiRecommendation: routes[0].name,
      localDemand: Math.floor(Math.random() * 80) + 12,
      aiGeneratedTitle: `[Renewed] ${item.title} - Excellent Condition`,
      aiGeneratedDesc: `This ${item.title} has been precision-inspected by Amazon AI. It shows minimal signs of wear and functions perfectly. Includes original accessories.`
    };
  };

  const filteredItems = gradedItems.filter(item => {
    if (filterGrade !== "All" && item.grade !== filterGrade) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleApproveListing = async (item: GradedItem, route: RoutingOption) => {
    // If route is P2P, send to P2P endpoint
    if (route.name === "Local P2P Resale") {
       try {
         await fetch("/api/p2p/list", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             title: item.aiGeneratedTitle || item.title,
             grade: item.grade,
             price: Math.floor(route.recovery),
             img: item.img,
             seller: "Sneaker&Tech Co.",
             health: item.healthStats
           })
         });
       } catch (e) {
         console.error("Failed to list on P2P", e);
       }
    }
    
    // Add to inventory tab
    setInventoryItems(prev => [{...item, status: route.name}, ...prev]);
    
    setGradedItems(prev => prev.filter(i => i.id !== item.id));
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#232F3E] text-white flex flex-col shrink-0 min-h-screen">
        <div className="p-5 flex items-center gap-3 border-b border-gray-700">
          <Store className="w-7 h-7 text-amber-500" />
          <h1 className="text-xl font-bold tracking-tight">Seller Central</h1>
        </div>
        
        <div className="p-5 flex flex-col gap-1">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Store Profile</div>
          <div className="font-semibold text-sm mb-1">Sneaker&Tech Co.</div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" /> 200 returns / month
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <button 
            onClick={() => setActiveTab('returns')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${activeTab === 'returns' ? 'bg-[#37475A] text-white shadow-sm' : 'text-gray-300 hover:bg-[#37475A]/50 hover:text-white'}`}
          >
             <div className="flex items-center gap-3 text-sm font-medium"><RotateCcw className="w-4 h-4" /> Returns Queue</div>
             {(returnsQueue.length > 0 || gradedItems.length > 0) && <span className="bg-amber-500 text-[#232F3E] text-[10px] font-bold px-2 py-0.5 rounded-full">{returnsQueue.length + gradedItems.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-[#37475A] text-white shadow-sm' : 'text-gray-300 hover:bg-[#37475A]/50 hover:text-white'}`}
          >
             <BarChart3 className="w-4 h-4" /> <span className="text-sm font-medium">Eco Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-[#37475A] text-white shadow-sm' : 'text-gray-300 hover:bg-[#37475A]/50 hover:text-white'}`}
          >
             <div className="flex items-center gap-3 text-sm font-medium"><Box className="w-4 h-4" /> Inventory</div>
             {inventoryItems.length > 0 && <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{inventoryItems.length}</span>}
          </button>
        </nav>
        
        <div className="p-4">
          <button onClick={onExit} className="w-full py-2 bg-gray-700/50 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors text-gray-300">
             Exit
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full relative">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
               {activeTab === 'returns' ? 'Advanced Return Queue' : activeTab === 'analytics' ? 'Eco Impact Analytics' : 'Inventory'}
            </h2>
            <p className="text-gray-500 mt-1.5 text-sm">
               {activeTab === 'returns' ? 'Automate grading, pricing, and routing with Amazon AI.' : 'Monitor your sustainability performance and return recoveries.'}
            </p>
          </div>
          
          {activeTab === 'returns' && (
             <div className="flex gap-3">
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Target className="w-4 h-4" />
                   </div>
                   <div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Recovery Rate</div>
                      <div className="font-bold text-gray-900 leading-none">84.2%</div>
                   </div>
                </div>
             </div>
          )}
        </header>

        {activeTab === 'analytics' && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm flex flex-col relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><Leaf className="w-24 h-24" /></div>
                   <div className="text-sm font-semibold text-gray-600 mb-1 z-10 flex items-center gap-2"><Leaf className="w-4 h-4 text-green-500"/> CO₂ Reduced</div>
                   <div className="text-4xl font-black text-gray-900 z-10">3.5<span className="text-lg text-gray-500 font-normal"> Tons</span></div>
                   <div className="text-xs text-green-600 font-medium mt-2 z-10">+12% from last month</div>
                </div>
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm flex flex-col relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><RefreshCw className="w-24 h-24" /></div>
                   <div className="text-sm font-semibold text-gray-600 mb-1 z-10 flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-500"/> Waste Prevented</div>
                   <div className="text-4xl font-black text-gray-900 z-10">1,240<span className="text-lg text-gray-500 font-normal"> kg</span></div>
                   <div className="text-xs text-green-600 font-medium mt-2 z-10">Equivalent to 400 trees</div>
                </div>
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm flex flex-col relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><IndianRupee className="w-24 h-24" /></div>
                   <div className="text-sm font-semibold text-gray-600 mb-1 z-10 flex items-center gap-2"><Activity className="w-4 h-4 text-amber-500"/> Recovery Revenue</div>
                   <div className="text-4xl font-black text-gray-900 z-10">₹94K</div>
                   <div className="text-xs text-green-600 font-medium mt-2 z-10">+24% YoY Growth</div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                   <h3 className="text-base font-bold text-gray-900 mb-6">Carbon Reduction Over Time</h3>
                   <div className="h-64 w-full">
                      <ResponsiveContainer>
                         <AreaChart data={impactData}>
                           <defs>
                             <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                           <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                           <Area type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                   <h3 className="text-base font-bold text-gray-900 mb-6">Recovered Items by Category</h3>
                   <div className="h-64 w-full">
                      <ResponsiveContainer>
                         <BarChart data={impactData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                           <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                           <Bar dataKey="items" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'returns' && (
          <div className="flex flex-col gap-6">
             
             {isAnalyzing && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 relative overflow-hidden border border-gray-800"
               >
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
                  
                  <div className="relative z-10 mx-auto max-w-2xl text-center">
                     <Sparkles className="w-10 h-10 text-blue-400 mx-auto mb-4 animate-bounce" />
                     <h3 className="text-2xl font-bold mb-2">Live AI Processing</h3>
                     <p className="text-gray-400 mb-8 max-w-md mx-auto">Our neural networks are analyzing images, cross-referencing market data, and optimizing return routes.</p>
                     
                     <div className="space-y-4 max-w-md mx-auto text-left">
                        {processingSteps.map((step, idx) => (
                           <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${idx < analysisStep ? 'text-green-400' : idx === analysisStep ? 'text-white scale-105 transform origin-left' : 'text-gray-600'}`}>
                              {idx < analysisStep ? (
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                              ) : idx === analysisStep ? (
                                <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-700 shrink-0" />
                              )}
                              <span className={`font-mono text-sm ${idx === analysisStep ? 'font-bold' : ''}`}>{step}</span>
                           </div>
                        ))}
                     </div>
                     
                     <div className="mt-10 h-1.5 bg-gray-800 rounded-full overflow-hidden max-w-md mx-auto">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${analysisProgress}%` }}
                        />
                     </div>
                  </div>
               </motion.div>
             )}

             {!isAnalyzing && returnsQueue.length > 0 && (
               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                     <LayoutDashboard className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">You have {returnsQueue.length} pending returns</h3>
                  <p className="text-gray-500 mb-6 max-w-md">Our AI can instantly grade these items, generate condition notes, and recommend the most profitable and sustainable outcome.</p>
                  <button 
                    onClick={handleBulkAIAnalysis}
                    className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-gray-900 font-bold py-3 px-8 rounded-full shadow-sm transition-all hover:shadow-md flex items-center gap-2"
                  >
                     <Sparkles className="w-5 h-5" /> Auto-Grade with AI
                  </button>
               </div>
             )}

             {!isAnalyzing && gradedItems.length > 0 && (
                <div className="space-y-6">
                  {/* Advanced Queue Controls */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                     <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search returns..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                     </div>
                     <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select 
                          value={filterGrade} 
                          onChange={(e) => setFilterGrade(e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                           <option value="All">All Grades</option>
                           <option value="A">Grade A</option>
                           <option value="B">Grade B</option>
                           <option value="C">Grade C</option>
                           <option value="D">Grade D</option>
                           <option value="E">Grade E</option>
                        </select>
                     </div>
                  </div>

                  <AnimatePresence>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredItems.map((item, index) => (
                        <motion.div 
                          key={item.id}
                          layoutId={`item-${item.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setSelectedItem(item)}
                          className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col"
                        >
                          <div className="h-40 bg-gray-50 relative border-b border-gray-100 flex items-center justify-center p-4">
                             <img src={item.img} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                             <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                                item.grade === 'A' ? 'bg-green-100 text-green-700' : 
                                item.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                item.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {item.grade}
                             </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                             <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1 font-mono">{item.id}</div>
                             <h4 className="font-bold text-gray-900 leading-tight mb-3 line-clamp-2">{item.title}</h4>
                             
                             <div className="mt-auto pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                      <Zap className="w-3.5 h-3.5" />
                                      {item.aiRecommendation}
                                   </div>
                                   <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                                </div>
                             </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                  
                  {filteredItems.length === 0 && (
                     <div className="text-center py-12 text-gray-400">No products match your filters.</div>
                  )}
                </div>
             )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="flex flex-col gap-6">
             {inventoryItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No items in your inventory yet. Process returns to add them here.</div>
             ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-500">
                         <thead className="text-xs text-gray-700 bg-gray-50 border-b border-gray-200">
                            <tr>
                               <th className="px-6 py-4 font-bold">Product</th>
                               <th className="px-6 py-4 font-bold">Status/Route</th>
                               <th className="px-6 py-4 font-bold">Grade</th>
                               <th className="px-6 py-4 font-bold">Action</th>
                            </tr>
                         </thead>
                         <tbody>
                            {inventoryItems.map(item => (
                               <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="px-6 py-4 flex items-center gap-4">
                                     <div className="w-10 h-10 bg-white border border-gray-200 rounded p-1 shrink-0">
                                        <img src={item.img} className="w-full h-full object-contain" />
                                     </div>
                                     <div>
                                        <div className="font-bold text-gray-900">{item.title}</div>
                                        <div className="text-xs font-mono text-gray-400">{item.id}</div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">{item.status}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                       item.grade === 'A' ? 'bg-green-50 text-green-700 border-green-200' : 
                                       item.grade === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                       item.grade === 'C' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                       'bg-red-50 text-red-700 border-red-200'
                                     }`}>Grade {item.grade}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                     <button className="text-amber-600 hover:text-amber-700 font-medium text-xs border border-amber-200 px-3 py-1 rounded hover:bg-amber-50 transition-colors">
                                        Edit Details
                                     </button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             )}
          </div>
        )}
      </main>

      {/* Product Health Card Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-y-auto w-full h-full">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm w-full h-full"
            />
            
            <motion.div 
              layoutId={`item-${selectedItem.id}`}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden relative z-10 flex flex-col md:flex-row border border-gray-100 max-h-full"
            >
               <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm z-20 hover:bg-gray-100">
                 <X className="w-5 h-5 text-gray-600" />
               </button>

               {/* Left Column: Health Card */}
               <div className="w-full md:w-2/5 shrink-0 bg-gray-50 border-r border-gray-100 p-8 overflow-y-auto">
                  <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-6 flex items-center gap-2">
                     <ShieldCheck className="w-6 h-6 text-[#007185]" /> Health Card
                  </h2>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">AI Grade</span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${
                             selectedItem.grade === 'A' ? 'bg-green-100 text-green-700 border-2 border-green-200' : 
                             selectedItem.grade === 'B' ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' :
                             selectedItem.grade === 'C' ? 'bg-amber-100 text-amber-700 border-2 border-amber-200' :
                             'bg-red-100 text-red-700 border-2 border-red-200'
                           }`}>
                             {selectedItem.grade}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div>
                           <div className="flex justify-between text-xs mb-1 font-medium">
                              <span className="text-gray-600">Authenticity</span>
                              <span className="text-green-600">{selectedItem.healthStats.authenticity}%</span>
                           </div>
                           <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{width: `${selectedItem.healthStats.authenticity}%`}}></div></div>
                        </div>
                        <div>
                           <div className="flex justify-between text-xs mb-1 font-medium">
                              <span className="text-gray-600">Sanitization</span>
                              <span className={selectedItem.healthStats.sanitization > 90 ? "text-green-600" : "text-amber-600"}>{selectedItem.healthStats.sanitization}%</span>
                           </div>
                           <div className="h-1.5 bg-gray-100 rounded-full"><div className={`h-full rounded-full ${selectedItem.healthStats.sanitization > 90 ? 'bg-green-500' : 'bg-amber-500'}`} style={{width: `${selectedItem.healthStats.sanitization}%`}}></div></div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                           <span className="text-xs font-semibold text-gray-600">Est. Usage</span>
                           <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{selectedItem.healthStats.usageEstimate}</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Leaf className="w-4 h-4"/> Eco Score</span>
                        <span className="font-bold text-gray-900">{selectedItem.healthStats.sustainabilityScore}/100</span>
                     </div>
                     <p className="text-xs text-gray-500 leading-relaxed mb-4">This score indicates the carbon efficiency of recovering this item versus manufacturing a new one.</p>
                     
                     <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-semibold text-gray-600 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Local Demand</span>
                           <span className="text-xs font-bold text-[#007185] bg-[#E7F4F5] px-2 py-0.5 rounded">{selectedItem.localDemand} buyers nearby</span>
                        </div>
                        <p className="text-[10px] text-gray-400">High search volume within 20km radius.</p>
                     </div>
                  </div>
               </div>

               {/* Right Column: AI Routing & Action */}
               <div className="w-full md:w-3/5 p-8 flex flex-col overflow-y-auto">
                  <div className="mb-8">
                    <div className="font-mono text-xs text-gray-400 mb-1">{selectedItem.id}</div>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{selectedItem.title}</h3>
                  </div>

                  <div className="mb-8">
                     <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Smart Lifecycle Routing
                     </h4>
                     <div className="space-y-3">
                        {selectedItem.routingOptions.map((route, idx) => (
                           <div key={idx} className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${idx === 0 ? 'bg-amber-50 border-amber-400 shadow-sm relative' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                              {idx === 0 && <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm">Top Recommendation</div>}
                              <div className="flex justify-between items-center mb-2">
                                 <div className="font-bold text-gray-900 text-base flex flex-col">
                                    {route.name}
                                    <span className="font-normal text-gray-500 text-xs">Cost: ₹{route.cost}</span>
                                 </div>
                                 <div className="text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 text-right">
                                   Recovery: <br/>₹{Math.floor(route.recovery)}
                                 </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 border-t border-gray-200/50 pt-2 mt-2 text-xs">
                                 <div><span className="text-gray-500 block text-[10px] uppercase">Speed</span><span className="font-medium text-gray-800">{route.speed}</span></div>
                                 <div><span className="text-gray-500 block text-[10px] uppercase">Carbon Saved</span><span className="font-medium text-green-600">-{route.carbon}kg</span></div>
                                 <div><span className="text-gray-500 block text-[10px] uppercase">AI Confidence</span><span className="font-medium text-blue-600">{route.aiConfidence}%</span></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {selectedItem.routingOptions[0].name === "Relist as Renewed" || selectedItem.routingOptions[0].name === "Local P2P Resale" ? (
                     <div className="mt-auto bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <Sparkles className="w-3.5 h-3.5 text-blue-500" /> 1-Click AI Relisting
                        </h4>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                           <div className="text-sm font-bold text-gray-900 mb-1">{selectedItem.aiGeneratedTitle}</div>
                           <div className="text-xs text-gray-600 leading-relaxed line-clamp-2">{selectedItem.aiGeneratedDesc}</div>
                           <div className="mt-3 flex gap-2">
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" /> {Math.floor(selectedItem.routingOptions[0].recovery)}</span>
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Category: {selectedItem.category}</span>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleApproveListing(selectedItem, selectedItem.routingOptions[0])}
                          className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-gray-900 font-bold py-3 px-8 rounded-xl shadow-sm transition-all"
                        >
                           Approve & Execute "{selectedItem.routingOptions[0].name}"
                        </button>
                     </div>
                  ) : (
                     <div className="mt-auto">
                        <button 
                          onClick={() => handleApproveListing(selectedItem, selectedItem.routingOptions[0])}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl shadow-sm transition-all"
                        >
                           Execute Route: {selectedItem.routingOptions[0].name}
                        </button>
                     </div>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}
