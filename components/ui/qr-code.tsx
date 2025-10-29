'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from './button';
import { useNotification } from '@/components/providers/notification-provider';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  showDownload?: boolean;
  showCopy?: boolean;
  title?: string;
  description?: string;
}

export function QRCodeComponent({
  value,
  size = 200,
  className = '',
  showDownload = true,
  showCopy = true,
  title,
  description
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { success } = useNotification();

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    const generateQR = async () => {
      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: '#97F11D', // FlowPay green
            light: '#000000'  // Black background
          },
          errorCorrectionLevel: 'M'
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [value, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `flowpay-qr-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      success('Copied!', 'Link copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {title && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
      )}
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-lg border-2 border-[#97F11D]/30 shadow-[0_0_20px_rgba(151,241,29,0.1)]"
        />
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-black/80 rounded-lg p-2">
            <span className="text-[#97F11D] text-xs font-mono">
              {value.length > 30 ? `${value.slice(0, 15)}...${value.slice(-15)}` : value}
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        {showCopy && (
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="bg-black border-[#97F11D]/30 text-white hover:bg-[#97F11D]/10 hover:border-[#97F11D]/60"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-[#97F11D]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {isCopied ? 'Copied!' : 'Copy Link'}
          </Button>
        )}
        
        {showDownload && (
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="bg-black border-[#97F11D]/30 text-white hover:bg-[#97F11D]/10 hover:border-[#97F11D]/60"
          >
            <Download className="w-4 h-4" />
            Download QR
          </Button>
        )}
      </div>
    </div>
  );
}
