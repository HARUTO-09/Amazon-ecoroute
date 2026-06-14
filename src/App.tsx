/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { AuthProvider } from "./AuthContext";
import AmazonHomePage from "./components/AmazonHomePage";
import AmazonProductPage from "./components/AmazonProductPage";
import AmazonNav from "./components/AmazonNav";
import AmazonReturnPortal from "./components/AmazonReturnPortal";
import AmazonFooter from "./components/AmazonFooter";
import AmazonAdminDashboard from "./components/AmazonAdminDashboard";
import AmazonProfilePage from "./components/AmazonProfilePage";
import AmazonP2PResalePage from "./components/AmazonP2PResalePage";
import AmazonSearchResultsPage from "./components/AmazonSearchResultsPage";
import AmazonLoginPage from "./components/AmazonLoginPage";
import AmazonSellerDashboard from "./components/AmazonSellerDashboard";
import AmazonCheckoutPage from "./components/AmazonCheckoutPage";
import AmazonThankYouPage from "./components/AmazonThankYouPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "product" | "return" | "admin" | "seller" | "profile" | "p2p" | "search" | "login" | "checkout" | "thank_you">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Checkout state
  const [checkoutPrice, setCheckoutPrice] = useState(0);
  const [checkoutTokens, setCheckoutTokens] = useState(0);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage("search");
  };

  const handleProductClick = (product?: any) => {
    setSelectedProduct(product || null);
    setCurrentPage("product");
  };

  const handleCheckoutClick = (product: any, price: number, tokensEarned: number) => {
    setSelectedProduct(product);
    setCheckoutPrice(price);
    setCheckoutTokens(tokensEarned);
    setCurrentPage("checkout");
  };

  const handleBuyNow = async () => {
    if (selectedProduct && selectedProduct.id && selectedProduct.id.startsWith("P2P-")) {
      try {
        await fetch("/api/p2p/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedProduct.id })
        });
      } catch (e) {
      }
    }
    setCurrentPage("thank_you");
  };

  if (currentPage === "admin") {
    return <AmazonAdminDashboard onExit={() => setCurrentPage("home")} />;
  }
  
  if (currentPage === "seller") {
    return <AmazonSellerDashboard onExit={() => setCurrentPage("home")} />;
  }
  
  if (currentPage === "login") {
    return (
      <AuthProvider>
         <AmazonLoginPage onLoginSuccess={() => setCurrentPage("home")} onLogoClick={() => setCurrentPage("home")} />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="w-full bg-white min-h-screen flex flex-col">
        <div className="bg-[#232F3E] text-white text-xs text-center py-1 cursor-pointer absolute top-0 w-full z-50 opacity-0 hover:opacity-100 transition-opacity flex justify-center gap-4">
           <span onClick={() => setCurrentPage("home")}>[DEV: Home]</span>
           <span onClick={() => setCurrentPage("product")}>[DEV: Product]</span>
           <span onClick={() => setCurrentPage("return")}>[DEV: Return Portal]</span>
           <span onClick={() => setCurrentPage("admin")}>[DEV: Admin Dashboard]</span>
           <span onClick={() => setCurrentPage("seller")}>[DEV: Seller Dashboard]</span>
           <span onClick={() => setCurrentPage("profile")}>[DEV: Profile]</span>
           <span onClick={() => setCurrentPage("p2p")}>[DEV: P2P Resale]</span>
           <span onClick={() => setCurrentPage("search")}>[DEV: Search]</span>
           <span onClick={() => setCurrentPage("login")}>[DEV: Login]</span>
        </div>
        
        {currentPage === "home" && <AmazonHomePage onProductClick={handleProductClick} onReturnsClick={() => setCurrentPage("return")} onP2PClick={() => setCurrentPage("p2p")} onSearch={handleSearch} onLoginClick={() => setCurrentPage("login")} />}
        {currentPage === "product" && (
           <>
            <AmazonNav onLogoClick={() => setCurrentPage("home")} onReturnsClick={() => setCurrentPage("return")} onProfileClick={() => setCurrentPage("profile")} onP2PClick={() => setCurrentPage("p2p")} onSearch={handleSearch} onLoginClick={() => setCurrentPage("login")} />
            <AmazonProductPage onReturnClick={() => setCurrentPage("return")} product={selectedProduct} onCheckoutClick={handleCheckoutClick} />
          </>
        )}
        {currentPage === "checkout" && (
           <AmazonCheckoutPage 
              product={selectedProduct} 
              price={checkoutPrice} 
              tokensEarned={checkoutTokens} 
              onBuyNow={handleBuyNow} 
              onLogoClick={() => setCurrentPage("home")}
           />
        )}
        {currentPage === "thank_you" && (
           <>
            <AmazonNav onLogoClick={() => setCurrentPage("home")} onReturnsClick={() => setCurrentPage("return")} onProfileClick={() => setCurrentPage("profile")} onP2PClick={() => setCurrentPage("p2p")} onSearch={handleSearch} onLoginClick={() => setCurrentPage("login")} />
            <AmazonThankYouPage 
               tokensEarned={checkoutTokens} 
               onContinueShopping={() => setCurrentPage("home")} 
               onLogoClick={() => setCurrentPage("home")}
            />
           </>
        )}
        {currentPage === "return" && (
          <AmazonReturnPortal 
            onBackToHome={() => setCurrentPage("home")} 
            onGoToProduct={() => setCurrentPage("product")}
            onGoToP2P={() => setCurrentPage("p2p")}
          />
        )}
        {currentPage === "profile" && (
          <>
            <AmazonNav onLogoClick={() => setCurrentPage("home")} onReturnsClick={() => setCurrentPage("return")} onProfileClick={() => setCurrentPage("profile")} onP2PClick={() => setCurrentPage("p2p")} onSearch={handleSearch} onLoginClick={() => setCurrentPage("login")} />
            <AmazonProfilePage />
          </>
        )}
        {currentPage === "p2p" && (
          <>
            <AmazonNav onLogoClick={() => setCurrentPage("home")} onReturnsClick={() => setCurrentPage("return")} onProfileClick={() => setCurrentPage("profile")} onP2PClick={() => setCurrentPage("p2p")} onSearch={handleSearch} onLoginClick={() => setCurrentPage("login")} />
            <AmazonP2PResalePage onProductClick={handleProductClick} />
          </>
        )}
        {currentPage === "search" && (
          <>
            <AmazonNav onLogoClick={() => setCurrentPage("home")} onReturnsClick={() => setCurrentPage("return")} onProfileClick={() => setCurrentPage("profile")} onP2PClick={() => setCurrentPage("p2p")} onSearch={handleSearch} onLoginClick={() => setCurrentPage("login")} />
            <AmazonSearchResultsPage query={searchQuery} onProductClick={handleProductClick} />
          </>
        )}
        {currentPage !== "checkout" && currentPage !== "thank_you" && <AmazonFooter />}
      </div>
    </AuthProvider>
  );
}
