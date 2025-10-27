"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  ArrowRight, 
  X, 
  Gift,
  Zap,
  Shield,
  Send,
  Mail
} from "lucide-react";

interface WelcomeBannerProps {
  isVisible: boolean;
  onStartTour: () => void;
  onDismiss: () => void;
  onCreateFirstLink: () => void;
  onSendMoney?: () => void;
}

export function WelcomeBanner({ 
  isVisible, 
  onStartTour, 
  onDismiss, 
  onCreateFirstLink,
  onSendMoney
}: WelcomeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss();
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="mb-6">
      <Card className="bg-black border border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#97F11D]/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#97F11D]" />
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Welcome to FlowPay! 🎉
                </h2>
                <p className="text-gray-400 mb-4">
                  You're all set to start accepting payments and sending money globally. Let's get you started!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Quick Setup</p>
                      <p className="text-xs text-gray-400">Get started in minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Secure Payments</p>
                      <p className="text-xs text-gray-400">Blockchain-powered</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Send className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Send Money</p>
                      <p className="text-xs text-gray-400">P2P Transfers</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={onCreateFirstLink}
                    className="bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-medium flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    Create Your First Payment Link
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  
                  {onSendMoney && (
                    <Button
                      onClick={onSendMoney}
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Try Send Money
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={onStartTour}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Take a Tour
                  </Button>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

