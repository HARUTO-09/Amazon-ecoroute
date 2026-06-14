import { useEffect, useState, useRef } from "react";
import { CheckCircle, Leaf, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../AuthContext";

export default function AmazonThankYouPage({ tokensEarned, onContinueShopping, onLogoClick }: { tokensEarned: number, onContinueShopping: () => void, onLogoClick: () => void }) {
  const { addEcoTokens } = useAuth();
  const [showTokensAnimation, setShowTokensAnimation] = useState(false);
  const [flyLeaves, setFlyLeaves] = useState(false);
  const hasAddedTokensRef = useRef(false);

  useEffect(() => {
    if (hasAddedTokensRef.current) return;
    
    // Wait for initial render to finish before showing animation
    const timer1 = setTimeout(() => {
      setShowTokensAnimation(true);
      setFlyLeaves(true);
    }, 800);

    const timer2 = setTimeout(() => {
      if (!hasAddedTokensRef.current) {
        addEcoTokens(tokensEarned);
        hasAddedTokensRef.current = true;
      }
    }, 1800); // add them when animation hits peak

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [addEcoTokens, tokensEarned]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col items-center mt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow border border-green-100 p-8 w-full text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-[#ffd814]"></div>
          
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you for your purchase!</h1>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">Your order is confirmed. A receipt and shipping details have been sent to your email. By choosing a pre-owned item, you've made a great choice for the planet.</p>

          <AnimatePresence>
            {showTokensAnimation && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="bg-[#e8f5e9] border border-[#a5d6a7] rounded-xl p-6 mb-8 max-w-sm mx-auto shadow-sm relative"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-green-900 font-bold uppercase tracking-wider">Rewards Earned</div>
                    <div className="text-3xl font-bold text-green-700">+{tokensEarned} <span className="text-lg">Tokens</span></div>
                  </div>
                </div>
                <div className="text-sm text-green-800 mt-3 font-medium">
                  Watch your balance instantly update in the top nav!
                </div>
              </motion.div>
            )}
           </AnimatePresence>

          <button 
             onClick={onContinueShopping}
             className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors border border-gray-300 inline-flex items-center gap-2"
          >
             Continue Shopping <ArrowRight className="w-4 h-4" />
          </button>

        </motion.div>
      </main>

      {/* Fly to navbar animation overlay */}
      {flyLeaves && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                top: '50%', 
                left: '50%', 
                opacity: 0, 
                scale: 0 
              }}
              animate={{ 
                top: ['50%', `${20 + Math.random() * 10}%`, '15px'],
                left: ['50%', `calc(50% + ${(Math.random() - 0.5) * 400}px)`, 'calc(100vw - 200px)'], 
                opacity: [0, 1, 1, 0],
                scale: [0, (Math.random() * 1.5) + 1, 1, 0],
                rotate: [0, Math.random() * 360, Math.random() * 720]
              }}
              transition={{ 
                duration: 1.6 + Math.random() * 0.5,
                delay: i * 0.05,
                ease: "easeInOut",
                times: [0, 0.4, 0.8, 1]
              }}
            >
              <Leaf 
                className={`text-green-${Math.random() > 0.5 ? '500' : '400'} drop-shadow-md`} 
                size={Math.random() * 20 + 20}
                fill="currentColor" 
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
