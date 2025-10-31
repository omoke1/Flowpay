"use client";

import { useEffect, useState } from "react";

interface SubscriptionItem {
  id: string;
  plan_name?: string;
  status: string;
  current_period_end?: string;
}

interface PaymentItem {
  id: string;
  processed_at: string;
  amount: number;
  currency: string;
  status: string;
}

export function CustomerManagePanel({ manageToken }: { manageToken: string | null }) {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const hasToken = Boolean(manageToken);

  useEffect(() => {
    if (!hasToken) return;
    (async () => {
      setLoading(true);
      try {
        const [sRes, bRes] = await Promise.all([
          fetch("/api/customer-portal/subscriptions", {
            headers: { Authorization: `Bearer ${manageToken}` },
          }),
          fetch("/api/customer-portal/billing", {
            headers: { Authorization: `Bearer ${manageToken}` },
          }),
        ]);

        const sJson = await sRes.json();
        const bJson = await bRes.json();
        setSubscriptions(Array.isArray(sJson) ? sJson : sJson.subscriptions ?? []);
        setPayments(Array.isArray(bJson) ? bJson : bJson.payments ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [manageToken, hasToken]);

  if (!hasToken) {
    return <div className="text-green-400/80">Open this page via your secure manage link to view your subscription.</div>;
  }
  if (loading) return <div className="text-green-400">Loading...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-neutral-800 bg-black p-4">
        <h3 className="text-green-400 mb-2">Subscription</h3>
        {subscriptions.length === 0 ? (
          <div className="text-neutral-400 text-sm">No subscription found for this link.</div>
        ) : (
          subscriptions.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <div className="text-white">{s.plan_name ?? "Plan"} • {s.status}</div>
                <div className="text-xs text-neutral-400">
                  Renews {s.current_period_end ? new Date(s.current_period_end).toDateString() : "-"}
                </div>
              </div>
              <button
                className="px-3 py-1 rounded bg-green-500 text-black"
                onClick={async () => {
                  await fetch(`/api/customer-portal/subscriptions/${s.id}/cancel`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${manageToken}` },
                  });
                  location.reload();
                }}
              >
                Cancel
              </button>
            </div>
          ))
        )}
      </div>

      <div className="rounded-lg border border-neutral-800 bg-black p-4">
        <h3 className="text-green-400 mb-2">Billing</h3>
        <button
          className="mb-3 px-3 py-1 rounded bg-green-500 text-black"
          onClick={async () => {
            await fetch("/api/customer-portal/profile", {
              method: "POST",
              headers: { Authorization: `Bearer ${manageToken}` },
            });
            alert("If supported, a payment-method update link or flow will be provided.");
          }}
        >
          Update Payment Method
        </button>
        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm text-white">
              <span>{new Date(p.processed_at).toLocaleDateString()}</span>
              <span>
                {p.amount} {p.currency}
              </span>
              <span className={p.status === "paid" ? "text-green-400" : "text-yellow-400"}>{p.status}</span>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="text-neutral-400 text-sm">No billing history yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}


