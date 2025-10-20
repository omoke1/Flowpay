"use client";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

function StatCard({ title, value, icon, change, changeType = "neutral" }: StatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-[#97F11D]";
      case "negative":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-zinc-900/10 dark:border-white/10 rounded-2xl p-6 hover:bg-white/5 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        {change && (
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {change}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  stats: {
    totalRevenue: string;
    activeLinks: number;
    customers: number;
    avgPaymentTime: string;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        value={stats.totalRevenue}
        icon="💵"
        change="+12.5%"
        changeType="positive"
      />
      <StatCard
        title="Active Links"
        value={stats.activeLinks.toString()}
        icon="🔗"
        change="+3"
        changeType="positive"
      />
      <StatCard
        title="Customers"
        value={stats.customers.toString()}
        icon="👥"
        change="+8"
        changeType="positive"
      />
      <StatCard
        title="Avg. Payment Time"
        value={stats.avgPaymentTime}
        icon="⚡"
        change="-0.2s"
        changeType="positive"
      />
    </div>
  );
}
