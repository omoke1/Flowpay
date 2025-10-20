"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowUser } from "@/components/providers/flow-provider";
import { useNotification } from "@/components/providers/notification-provider";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { 
  Save, 
  Moon, 
  Sun,
  Eye, 
  EyeOff,
  KeyRound, 
  ShieldAlert,
  Copy,
  Check,
  BarChart3
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { loggedIn, address, logOut } = useFlowUser();
  const { success, error, warning } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    name: "",
    email: "",
    darkMode: true,
    emailNotifications: true,
    publicKey: "",
    secretKey: "",
    webhookUrl: ""
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copied, setCopied] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loggedIn) {
      router.push("/");
      return;
    }
    fetchSettings();
  }, [loggedIn, router, address]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/settings?walletAddress=${address}`);
      const data = await response.json();
            if (data.settings) {
              setSettings({
                name: data.settings.name || "",
                email: data.settings.email || "",
                darkMode: data.settings.dark_mode ?? true,
                emailNotifications: data.settings.email_notifications ?? true,
                publicKey: data.settings.public_key || "",
                secretKey: data.settings.secret_key || "",
                webhookUrl: data.settings.webhook_url || ""
              });
            }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage("");
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          updates: {
            name: settings.name,
            email: settings.email,
            dark_mode: settings.darkMode,
            email_notifications: settings.emailNotifications,
            webhook_url: settings.webhookUrl,
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        success(
          "Settings Saved! ✅",
          "Your preferences have been updated successfully"
        );
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        error(
          "Save Failed",
          "Failed to save settings. Please try again."
        );
        setMessage("Failed to save settings. Please try again.");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      error(
        "Save Failed",
        "Failed to save settings. Please try again."
      );
      setMessage("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const rotateKeys = async () => {
    if (confirm('Are you sure you want to rotate your API keys? This will invalidate your current keys.')) {
      try {
        const response = await fetch('/api/settings/rotate-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: address,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setSettings({
            ...settings,
            publicKey: data.publicKey,
            secretKey: data.secretKey,
          });
          
          warning(
            "API Keys Rotated! 🔑",
            "Your API keys have been rotated. Update your integrations with the new keys."
          );
          
          setMessage("API keys rotated successfully!");
          setTimeout(() => setMessage(""), 3000);
        } else {
          error(
            "Rotation Failed",
            "Failed to rotate API keys. Please try again."
          );
          setMessage("Failed to rotate API keys. Please try again.");
        }
      } catch (error: any) {
        console.error("Error rotating API keys:", error);
        error(
          "Rotation Failed",
          "Failed to rotate API keys. Please try again."
        );
        setMessage("Failed to rotate API keys. Please try again.");
      }
    }
  };

  const revokeSessions = async () => {
    if (confirm('Are you sure you want to revoke all sessions? You will need to log in again.')) {
      try {
        const response = await fetch('/api/settings/revoke-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: address,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          warning(
            "Sessions Revoked! 🔒",
            "All sessions have been revoked. You will be logged out shortly."
          );
          
          setMessage("All sessions revoked successfully!");
          setTimeout(() => setMessage(""), 3000);
          // Optionally log out the user
          setTimeout(() => {
            logOut();
          }, 2000);
        } else {
          error(
            "Revocation Failed",
            "Failed to revoke sessions. Please try again."
          );
          setMessage("Failed to revoke sessions. Please try again.");
        }
      } catch (error: any) {
        console.error("Error revoking sessions:", error);
        error(
          "Revocation Failed",
          "Failed to revoke sessions. Please try again."
        );
        setMessage("Failed to revoke sessions. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="settings" onLogout={logOut} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Settings" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={address}
          onLogout={logOut}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div>
            <h2 className="text-xl tracking-tight font-semibold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your preferences and API</p>
            {message && (
              <div className={`mt-2 text-sm ${message.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {message}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Profile */}
            <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-zinc-900/10 dark:border-white/10 p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Profile</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="block text-gray-600 dark:text-gray-400 mb-1">Name</span>
                  <input 
                    type="text" 
                    className="w-full rounded-lg bg-white dark:bg-white/5 border border-zinc-900/10 dark:border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#97F11D]/40" 
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                  />
                </label>
                <label className="text-sm">
                  <span className="block text-gray-600 dark:text-gray-400 mb-1">Email</span>
                  <input 
                    type="email" 
                    className="w-full rounded-lg bg-white dark:bg-white/5 border border-zinc-900/10 dark:border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#97F11D]/40" 
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                  />
                </label>
              </div>
              <div className="mt-4">
                <button 
                  onClick={saveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 bg-[#97F11D] text-black font-medium hover:brightness-95 border border-[#97F11D]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-zinc-900/10 dark:border-white/10 p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Preferences</div>
              <div className="mt-3 space-y-3 text-sm">
                <label className="flex items-center justify-between gap-2">
                  <span className="text-gray-700 dark:text-gray-300">Dark mode</span>
                  <button 
                    onClick={() => {
                      const newDarkMode = !settings.darkMode;
                      setSettings({...settings, darkMode: newDarkMode});
                      // Apply theme immediately
                      if (newDarkMode) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10"
                  >
                    {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </button>
                </label>
                <label className="flex items-center justify-between gap-2">
                  <span className="text-gray-700 dark:text-gray-300">Email notifications</span>
                  <input 
                    type="checkbox" 
                    className="h-4 w-7 rounded-full bg-black/[0.06] dark:bg-white/10 border border-zinc-900/10 dark:border-white/10 accent-[#97F11D]" 
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* API & Webhooks */}
            <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-zinc-900/10 dark:border-white/10 p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">API & Webhooks</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="block text-gray-600 dark:text-gray-400 mb-1">Public Key</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={settings.publicKey} 
                      className="w-full rounded-lg bg-white dark:bg-white/5 border border-zinc-900/10 dark:border-white/10 px-3 py-2" 
                    />
                    <button 
                      onClick={() => copyToClipboard(settings.publicKey, 'public')}
                      className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10"
                    >
                      {copied === 'public' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <label className="text-sm">
                  <span className="block text-gray-600 dark:text-gray-400 mb-1">Secret Key</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type={showSecretKey ? "text" : "password"} 
                      readOnly 
                      value={settings.secretKey} 
                      className="w-full rounded-lg bg-white dark:bg-white/5 border border-zinc-900/10 dark:border-white/10 px-3 py-2" 
                    />
                    <button 
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10"
                    >
                      {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="block text-gray-600 dark:text-gray-400 mb-1">Webhook URL</span>
                  <input 
                    type="url" 
                    placeholder="https://your-domain.com/webhooks/flowpay" 
                    className="w-full rounded-lg bg-white dark:bg-white/5 border border-zinc-900/10 dark:border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#97F11D]/40"
                    value={settings.webhookUrl}
                    onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                  />
                </label>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => router.push("/dashboard/settings/webhook-logs")}
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 text-gray-900 dark:text-gray-200 border border-zinc-900/10 dark:border-white/10"
                >
                  <BarChart3 className="h-4 w-4" />
                  View webhook logs
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-zinc-900/10 dark:border-white/10 p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Danger zone</div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Rotate API keys and revoke sessions.</p>
              <div className="mt-3 space-y-2">
                <button 
                  onClick={rotateKeys}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 bg-red-600/10 text-red-700 dark:text-red-300 hover:bg-red-600/15 border border-red-600/20"
                >
                  <KeyRound className="h-4 w-4" />
                  Rotate keys
                </button>
                <button 
                  onClick={revokeSessions}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 bg-red-600/10 text-red-700 dark:text-red-300 hover:bg-red-600/15 border border-red-600/20"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Revoke sessions
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
