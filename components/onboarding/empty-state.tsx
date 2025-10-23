"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Link as LinkIcon, 
  CreditCard, 
  BarChart3,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface EmptyStateProps {
  type: 'payments' | 'links' | 'analytics';
  onCreateLink: () => void;
}

export function EmptyState({ type, onCreateLink }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'payments':
        return {
          icon: <CreditCard className="w-12 h-12 text-white" />,
          title: "No payments yet",
          description: "When customers pay you, their payments will appear here.",
          action: "Create your first payment link to start receiving payments"
        };
      case 'links':
        return {
          icon: <LinkIcon className="w-12 h-12 text-white" />,
          title: "No payment links yet",
          description: "Create payment links to start accepting payments from customers.",
          action: "Create your first payment link to get started"
        };
      case 'analytics':
        return {
          icon: <BarChart3 className="w-12 h-12 text-white" />,
          title: "No analytics data yet",
          description: "Analytics will appear here once you start receiving payments.",
          action: "Create a payment link to start tracking your revenue"
        };
    }
  };

  const content = getContent();

  return (
    <Card className="border-dashed border-2 border-white/20 bg-black">
      <CardContent className="p-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          {content.icon}
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">
              {content.title}
            </h3>
            <p className="text-gray-400 max-w-md">
              {content.description}
            </p>
          </div>
          
          <div className="pt-4">
            <Button
              onClick={onCreateLink}
              className="bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Payment Link
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-gray-400">
              {content.action}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

