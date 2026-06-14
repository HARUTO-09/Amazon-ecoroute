import React, { useState } from "react";
import { User, Package, MapPin, Edit2, Plus, ChevronRight, X, Leaf, Award, ArrowRight } from "lucide-react";
import { useAuth } from "../AuthContext";

export default function AmazonProfilePage() {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"info" | "orders" | "addresses" | "sustainability">("info");
  const [addresses, setAddresses] = useState([
    {
      id: "addr1",
      name: currentUser?.name || "",
      line1: "123 Tech Park Avenue",
      line2: "Block B, 4th Floor",
      city: "Bengaluru, Karnataka 560100",
      country: "India",
      phone: "+91 9876543210",
      isDefault: true
    }
  ]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "", line1: "", line2: "", city: "", country: "", phone: ""
  });
  
  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 min-h-screen">
        <div className="bg-white p-8 rounded shadow-md text-center">
          <h2 className="text-xl font-bold mb-4">You are not signed in</h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const generatedEmail = `${currentUser.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city) return;
    
    setAddresses([...addresses, {
      ...newAddress,
      id: `addr-${Date.now()}`,
      name: newAddress.name || currentUser.name,
      isDefault: addresses.length === 0
    }]);
    setShowAddAddress(false);
    setNewAddress({ name: "", line1: "", line2: "", city: "", country: "", phone: "" });
  };

  const removeAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full font-sans">
      <div className="mb-6">
        <h1 className="text-3xl font-medium">Your Account</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => setActiveTab('info')}
          className={`border rounded-lg p-4 cursor-pointer flex items-center gap-4 transition-colors ${activeTab === 'info' ? 'border-[#007185] bg-[#f0f8fa]' : 'border-gray-300 hover:bg-gray-50'}`}
        >
          <div className="p-3 bg-gray-100 rounded-full">
            <User className="text-[#007185]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Personal Info</h3>
            <p className="text-sm text-gray-500">Edit login, name, and mobile number</p>
          </div>
        </div>
        
        <div 
          onClick={() => setActiveTab('orders')}
          className={`border rounded-lg p-4 cursor-pointer flex items-center gap-4 transition-colors ${activeTab === 'orders' ? 'border-[#007185] bg-[#f0f8fa]' : 'border-gray-300 hover:bg-gray-50'}`}
        >
          <div className="p-3 bg-gray-100 rounded-full">
            <Package className="text-[#007185]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Your Orders</h3>
            <p className="text-sm text-gray-500">Track, return, or buy things again</p>
          </div>
        </div>
        
        <div 
          onClick={() => setActiveTab('addresses')}
          className={`border rounded-lg p-4 cursor-pointer flex items-center gap-4 transition-colors ${activeTab === 'addresses' ? 'border-[#007185] bg-[#f0f8fa]' : 'border-gray-300 hover:bg-gray-50'}`}
        >
          <div className="p-3 bg-gray-100 rounded-full">
            <MapPin className="text-[#007185]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Your Addresses</h3>
            <p className="text-sm text-gray-500">Edit addresses for orders and gifts</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('sustainability')}
          className={`border rounded-lg p-4 cursor-pointer flex items-center gap-4 transition-colors ${activeTab === 'sustainability' ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
        >
          <div className={`p-3 rounded-full ${activeTab === 'sustainability' ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Leaf className={activeTab === 'sustainability' ? 'text-green-600' : 'text-[#007185]'} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Sustainability</h3>
            <p className="text-sm text-gray-500">View your impact and Green Credits</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        {activeTab === 'info' && (
          <div>
            <div className="border-b border-gray-300 p-4 bg-gray-50">
              <h2 className="text-xl font-bold">Personal Information</h2>
            </div>
            <div className="p-0">
              <div className="border-b border-gray-200 p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-bold text-sm text-gray-800">Name</p>
                  <p className="text-sm">{currentUser.name}</p>
                </div>
                <button className="border border-gray-300 rounded-md px-4 py-1.5 text-sm hover:bg-gray-100">Edit</button>
              </div>
              <div className="border-b border-gray-200 p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-bold text-sm text-gray-800">Email</p>
                  <p className="text-sm">{generatedEmail}</p>
                </div>
                <button className="border border-gray-300 rounded-md px-4 py-1.5 text-sm hover:bg-gray-100">Edit</button>
              </div>
              <div className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-bold text-sm text-gray-800">Mobile Number</p>
                  <p className="text-sm">+91 9876543210</p>
                </div>
                <button className="border border-gray-300 rounded-md px-4 py-1.5 text-sm hover:bg-gray-100">Edit</button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div>
            <div className="border-b border-gray-300 p-4 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Orders</h2>
              <div className="flex gap-4 text-sm">
                <span className="font-bold text-[#e77600] border-b-2 border-[#e77600] pb-1 cursor-pointer">Orders</span>
                <span className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer">Buy Again</span>
                <span className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer">Not Yet Shipped</span>
                <span className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer">Cancelled Orders</span>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 text-xs flex justify-between border-b border-gray-300 text-gray-600">
                  <div className="flex gap-8">
                    <div>
                      <p>ORDER PLACED</p>
                      <p className="font-medium text-gray-800">Oct 12, 2025</p>
                    </div>
                    <div>
                      <p>TOTAL</p>
                      <p className="font-medium text-gray-800">₹14,999</p>
                    </div>
                    <div>
                      <p>SHIP TO</p>
                      <p className="text-[#007185] hover:underline cursor-pointer font-medium">{currentUser.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p>ORDER # 408-1234567-8901234</p>
                    <p className="text-[#007185] hover:underline cursor-pointer">View order details</p>
                  </div>
                </div>
                <div className="p-4 flex gap-4">
                  <img src="https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/refurb-45-stainless-graphite-sport-band-midnight-s9?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=eUNRakR3dGYxaW9BQzAzdzRPUlFUVjBoTUc3NjFlV1QzbHd4SVVUcFZVWDE4QUxxTWFsRmJQTXB3MEp1T2pHd0FtWVJCbTFqbVlJVmw3ZkRFUGZoZ0YzaTQrYy82TUg0cFZQeUN1eC9DMlZNQkJEMXc0aklkVno5c3lHT1ZQU0FzcnlGampyTlhrVGsvR1hoblVqQkpn" alt="Product" className="w-20 h-20 object-contain" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer">Apple Watch Series 9 (GPS 45mm)</h3>
                    <p className="text-sm text-gray-600 mt-1">Return window closed on Nov 11, 2025</p>
                    <button className="mt-2 bg-[#ffd814] hover:bg-[#f3cc18] text-sm px-4 py-1.5 rounded-md border border-[#fcd200]">Buy it again</button>
                  </div>
                  <div className="flex flex-col gap-2 w-48">
                    <button className="bg-white hover:bg-gray-50 border border-gray-300 text-sm px-4 py-1.5 rounded-md shadow-sm">Track package</button>
                    <button className="bg-white hover:bg-gray-50 border border-gray-300 text-sm px-4 py-1.5 rounded-md shadow-sm">Write a product review</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'addresses' && (
          <div>
            <div className="border-b border-gray-300 p-4 bg-gray-50">
              <h2 className="text-xl font-bold">Your Addresses</h2>
            </div>
            
            {showAddAddress ? (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Add a new address</h3>
                  <button onClick={() => setShowAddAddress(false)} className="text-gray-500 hover:text-black hover:bg-gray-100 p-1 rounded">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddAddress} className="max-w-md flex flex-col gap-3">
                  <div>
                    <label className="block text-sm font-bold mb-1">Full name</label>
                    <input type="text" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Mobile number</label>
                    <input type="tel" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Flat, House no., Building, Company, Apartment</label>
                    <input type="text" value={newAddress.line1} onChange={e => setNewAddress({...newAddress, line1: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Area, Street, Sector, Village</label>
                    <input type="text" value={newAddress.line2} onChange={e => setNewAddress({...newAddress, line2: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Town/City</label>
                    <input type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Country</label>
                    <input type="text" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none" required />
                  </div>
                  <button type="submit" className="mt-2 bg-[#ffd814] hover:bg-[#f3cc18] rounded-md py-2 px-4 shadow-sm text-sm font-medium border border-[#fcd200] self-start">
                    Add address
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => setShowAddAddress(true)} className="border border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer min-h-[200px]">
                  <Plus size={32} className="mb-2 text-gray-400" />
                  <h3 className="font-bold text-lg">Add Address</h3>
                </div>
                
                {addresses.map(addr => (
                  <div key={addr.id} className="border border-gray-300 rounded-lg p-4 relative min-h-[200px]">
                    {addr.isDefault && (
                      <div className="absolute top-0 right-0 bg-gray-100 px-2 py-1 text-xs border-b border-l border-gray-300 rounded-bl-lg text-gray-600">
                        Default
                      </div>
                    )}
                    <h3 className="font-bold border-b border-gray-200 pb-2 mb-2">{addr.name}</h3>
                    <div className="text-sm leading-relaxed text-gray-700">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>{addr.city}</p>
                      <p>{addr.country}</p>
                      <p>Phone number: {addr.phone}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-gray-200 flex gap-4 text-sm text-[#007185]">
                      <span className="hover:text-[#c45500] hover:underline cursor-pointer">Edit</span>
                      <span onClick={() => removeAddress(addr.id)} className="hover:text-[#c45500] hover:underline cursor-pointer">Remove</span>
                      {!addr.isDefault && (
                        <span onClick={() => {
                          setAddresses(addresses.map(a => ({...a, isDefault: a.id === addr.id})));
                        }} className="border-l border-gray-300 pl-4 hover:text-[#c45500] hover:underline cursor-pointer">
                          Set as Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'sustainability' && (
          <div>
            <div className="border-b border-gray-300 p-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
                 <Leaf className="text-green-600" /> Your Environmental Impact
              </h2>
            </div>
            
            <div className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Credits Balance */}
                  <div className="bg-white border text-center border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                     <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                        <Award size={32} />
                     </div>
                     <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Green Credits</div>
                     <div className="text-4xl font-bold text-gray-900">1,240</div>
                     <div className="mt-3 text-xs text-gray-500">Earned from P2P sales & Renewed purchases</div>
                  </div>

                  <div className="bg-white border text-center border-green-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center bg-gradient-to-b from-white to-green-50">
                     <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total CO₂ Saved</div>
                     <div className="text-4xl font-bold text-green-700 flex items-baseline gap-1">14 <span className="text-lg">kg</span></div>
                     <div className="mt-4 text-xs font-medium text-green-800 bg-green-100 px-3 py-1 rounded-full">
                        Equivalent to charging 1,700 phones
                     </div>
                  </div>

                  <div className="bg-white border text-center border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                     <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Items Diverted</div>
                     <div className="text-4xl font-bold text-gray-900">3</div>
                     <div className="mt-4 text-xs font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                        From landfills via Return Portal
                     </div>
                  </div>
               </div>

               <h3 className="text-lg font-bold mb-4">How to use Green Credits</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="border border-gray-200 rounded-lg p-4 flex gap-4 items-center">
                     <div className="bg-blue-50 text-blue-600 p-3 rounded-full shrink-0">
                        <Package />
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-900">Eco-Priority Shipping</h4>
                        <p className="text-sm text-gray-600 mt-0.5">Use 500 points for consolidated lowest-emission delivery</p>
                     </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 flex gap-4 items-center">
                     <div className="bg-amber-50 text-amber-600 p-3 rounded-full shrink-0">
                        <Award />
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-900">Amazon Renewed Discount</h4>
                        <p className="text-sm text-gray-600 mt-0.5">Use 1,000 points for ₹500 off your next refurbished purchase</p>
                     </div>
                  </div>
               </div>

               <h3 className="text-lg font-bold mb-4">Recent Sustainable Actions</h3>
               <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="border-b border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50">
                     <div className="flex items-center gap-3">
                        <div className="bg-green-100 text-green-600 p-2 rounded">
                           <MapPin size={20} />
                        </div>
                        <div>
                           <div className="font-bold text-sm text-gray-900">Peer-to-Peer Sale Completed</div>
                           <div className="text-xs text-gray-500">You sold "Sony WH-1000XM4" to a neighbor</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="font-bold text-green-600">+450</div>
                        <div className="text-[10px] text-gray-500">Credits Earned</div>
                     </div>
                  </div>

                  <div className="border-b border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50">
                     <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded">
                           <Award size={20} />
                        </div>
                        <div>
                           <div className="font-bold text-sm text-gray-900">Size Prevention Accepted</div>
                           <div className="text-xs text-gray-500">You opted for your recommended size</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="font-bold text-green-600">+100</div>
                        <div className="text-[10px] text-gray-500">Credits Earned</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
