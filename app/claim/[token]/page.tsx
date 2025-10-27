'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, CreditCard, Clock, User, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useFlowMainnet } from '@/components/providers/flow-provider-mainnet';
import { useNotification } from '@/components/providers/notification-provider';
import { formatAmount, formatAddress } from '@/lib/utils';
import { Transfer } from '@/lib/supabase';

export default function ClaimPage() {
  const params = useParams();
  const claimToken = params.token as string;
  const { isConnected, user, connectWallet } = useFlowMainnet();
  const { success, error: showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<'crypto' | 'fiat'>('crypto');
  const [recipientAddress, setRecipientAddress] = useState('');

  useEffect(() => {
    if (claimToken) {
      loadTransferDetails();
    }
  }, [claimToken]);

  const loadTransferDetails = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/transfers/${claimToken}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transfer not found');
      }

      if (data.success) {
        setTransfer(data.transfer);
      } else {
        throw new Error(data.error || 'Failed to load transfer');
      }

    } catch (error) {
      console.error('Error loading transfer:', error);
      showError(error instanceof Error ? error.message : 'Failed to load transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!transfer) return;

    if (payoutMethod === 'crypto' && !isConnected) {
      await connectWallet();
      return;
    }

    if (payoutMethod === 'crypto' && !recipientAddress && !user?.addr) {
      showError('Please enter recipient address or connect wallet');
      return;
    }

    setClaiming(true);

    try {
      const response = await fetch('/api/transfers/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimToken: transfer.claim_token,
          recipientAddress: payoutMethod === 'crypto' ? (recipientAddress || user?.addr) : undefined,
          payoutMethod: payoutMethod,
          recipientEmail: payoutMethod === 'fiat' ? transfer.recipient_email : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim transfer');
      }

      if (data.success) {
        success('Transfer claimed successfully!');
        
        // Reload transfer details to show updated status
        await loadTransferDetails();
        
        if (payoutMethod === 'fiat') {
          // For fiat payouts, we might redirect to Crossmint offramp
          alert('Fiat payout initiated! You will be redirected to complete the process.');
        }
      } else {
        throw new Error(data.error || 'Failed to claim transfer');
      }

    } catch (error) {
      console.error('Error claiming transfer:', error);
      showError(error instanceof Error ? error.message : 'Failed to claim transfer');
    } finally {
      setClaiming(false);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      return { expired: true, text: 'Expired' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { expired: false, text: `${days}d ${hours}h remaining` };
    } else if (hours > 0) {
      return { expired: false, text: `${hours}h ${minutes}m remaining` };
    } else {
      return { expired: false, text: `${minutes}m remaining` };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'claimed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Claimed</Badge>;
      case 'refunded':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Refunded</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#97F11D] mx-auto mb-4" />
            <p>Loading transfer details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Transfer Not Found</h2>
            <p className="text-gray-600">This transfer link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining(transfer.expires_at);
  const canClaim = transfer.status === 'pending' && !timeRemaining.expired;

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">💰 Money Waiting for You!</h1>
        <p className="text-gray-600">Someone sent you money via FlowPay</p>
      </div>

      {/* Transfer Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transfer Details</span>
            {getStatusBadge(transfer.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount */}
          <div className="text-center">
            <div className="text-4xl font-bold text-[#97F11D] mb-2">
              {formatAmount(transfer.amount.toString())}
            </div>
            <div className="text-xl text-gray-600">{transfer.token}</div>
          </div>

          {/* Sender Info */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">From:</span>
            <span className="font-mono text-sm">{formatAddress(transfer.sender_address)}</span>
          </div>

          {/* Note */}
          {transfer.note && (
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <span className="text-sm text-gray-600">Message:</span>
                <p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">{transfer.note}</p>
              </div>
            </div>
          )}

          {/* Expiry */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Expires:</span>
            <span className={`text-sm font-medium ${timeRemaining.expired ? 'text-red-600' : 'text-gray-900'}`}>
              {timeRemaining.text}
            </span>
          </div>

          {/* Status Messages */}
          {transfer.status === 'claimed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Transfer Claimed</h3>
                  <p className="text-sm text-green-700">
                    This transfer was claimed on {new Date(transfer.claimed_at!).toLocaleDateString()}
                    {transfer.claimed_by_address && (
                      <span> by {formatAddress(transfer.claimed_by_address)}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {transfer.status === 'refunded' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Transfer Refunded</h3>
                  <p className="text-sm text-blue-700">
                    This transfer was refunded to the sender because it expired.
                  </p>
                </div>
              </div>
            </div>
          )}

          {transfer.status === 'expired' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Transfer Expired</h3>
                  <p className="text-sm text-red-700">
                    This transfer has expired and can no longer be claimed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Form */}
      {canClaim && (
        <Card>
          <CardHeader>
            <CardTitle>Claim Your Money</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payout Method Selection */}
            <div className="space-y-3">
              <Label>Choose how to receive your money:</Label>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={payoutMethod === 'crypto' ? 'default' : 'outline'}
                  onClick={() => setPayoutMethod('crypto')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Wallet className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Crypto Wallet</div>
                    <div className="text-xs opacity-80">Receive to Flow wallet</div>
                  </div>
                </Button>
                
                <Button
                  variant={payoutMethod === 'fiat' ? 'default' : 'outline'}
                  onClick={() => setPayoutMethod('fiat')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <CreditCard className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Bank Account</div>
                    <div className="text-xs opacity-80">Receive to bank via Crossmint</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Recipient Address (for crypto) */}
            {payoutMethod === 'crypto' && (
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">
                  Recipient Address {isConnected && user?.addr && '(or leave empty to use connected wallet)'}
                </Label>
                <Input
                  id="recipientAddress"
                  placeholder={isConnected && user?.addr ? user.addr : "Enter Flow wallet address"}
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
                {isConnected && user?.addr && (
                  <p className="text-xs text-gray-500">
                    Connected wallet: {formatAddress(user.addr)}
                  </p>
                )}
              </div>
            )}

            {/* Fiat Info */}
            {payoutMethod === 'fiat' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Bank Transfer</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      You'll be redirected to Crossmint to complete the bank transfer process.
                      Funds will be sent to your bank account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Claim Button */}
            <Button 
              onClick={handleClaim}
              disabled={claiming || (payoutMethod === 'crypto' && !recipientAddress && !user?.addr)}
              className="w-full"
              size="lg"
            >
              {claiming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Claiming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Claim {formatAmount(transfer.amount.toString())} {transfer.token}
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-800">Security Notice</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    This transfer expires in {timeRemaining.text}. 
                    If not claimed by then, the funds will be returned to the sender.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
