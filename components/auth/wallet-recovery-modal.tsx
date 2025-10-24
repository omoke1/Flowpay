"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";

interface RecoveryInfo {
  address: string;
  seedPhrase: string;
  privateKey: string;
  publicKey: string;
  derivationPath: string;
  createdAt: string;
  warning: string;
}

interface WalletRecoveryModalProps {
  recoveryInfo: RecoveryInfo;
  onClose: () => void;
  onConfirm: () => void;
}

export function WalletRecoveryModal({ recoveryInfo, onClose, onConfirm }: WalletRecoveryModalProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadRecoveryInfo = () => {
    const data = {
      ...recoveryInfo,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowpay-recovery-${recoveryInfo.address.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-black border-white/10 max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-[#97F11D]/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-[#97F11D]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            🔐 Save Your Wallet Recovery Information
          </CardTitle>
          <CardDescription className="text-gray-400">
            This information is required to access your Flow wallet. Save it securely!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-2">Critical Security Warning</h3>
                <p className="text-red-300 text-sm">
                  {recoveryInfo.warning} Store this information in a secure location. 
                  Anyone with access to this information can control your wallet.
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Wallet Address</label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-gray-900 text-green-400 p-3 rounded border text-sm font-mono break-all">
                {recoveryInfo.address}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(recoveryInfo.address, 'address')}
                className="border-white/20"
              >
                {copied === 'address' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Seed Phrase */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Seed Phrase (12 words)</label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-gray-900 text-blue-400 p-3 rounded border text-sm font-mono">
                {showSeedPhrase ? recoveryInfo.seedPhrase : '•'.repeat(50)}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                className="border-white/20"
              >
                {showSeedPhrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(recoveryInfo.seedPhrase, 'seed')}
                className="border-white/20"
              >
                {copied === 'seed' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Private Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Private Key</label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-gray-900 text-yellow-400 p-3 rounded border text-sm font-mono break-all">
                {showPrivateKey ? recoveryInfo.privateKey : '•'.repeat(64)}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="border-white/20"
              >
                {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(recoveryInfo.privateKey, 'private')}
                className="border-white/20"
              >
                {copied === 'private' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Public Key</label>
              <code className="block bg-gray-900 text-gray-400 p-2 rounded border text-xs font-mono break-all">
                {recoveryInfo.publicKey}
              </code>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Derivation Path</label>
              <code className="block bg-gray-900 text-gray-400 p-2 rounded border text-xs font-mono">
                {recoveryInfo.derivationPath}
              </code>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={downloadRecoveryInfo}
              className="flex-1 bg-[#97F11D] hover:bg-[#97F11D]/80 text-black"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Recovery File
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              I've Saved This Information
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
