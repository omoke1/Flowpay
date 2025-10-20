"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.id as string;
  
  useEffect(() => {
    // Redirect to the new checkout page
    router.replace(`/checkout/${linkId}`);
  }, [linkId, router]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#97F11D]" />
        <p className="text-white text-lg">Redirecting to checkout...</p>
      </div>
    </div>
  );
}