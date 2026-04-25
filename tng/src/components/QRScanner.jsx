
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera, Loader, RotateCcw } from 'lucide-react';
import jsQR from 'jsqr';
 
export default function QRScanner() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(true);
  const [hasScanned, setHasScanned] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [scannedAmount, setScannedAmount] = useState(null);
  const [error, setError] = useState(null);
 
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 720 },
          height: { ideal: 1280 }
        }
      };
 
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
 
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  }, []);
 
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);
 
  const scanQR = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
 
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
 
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
 
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
 
      if (code) {
        const parsed = parseQRData(code.data);
        setMerchant(parsed.merchant);
        setScannedAmount(parsed.amount);
        setQrData(code.data);
        stopCamera();
 
        if (parsed.amount && parsed.amount > 0) {
          navigate('/pay', {
            state: {
              merchant: parsed.merchant || 'Scanned Merchant',
              amount: parsed.amount,
              qrData: code.data,
              creditLimit: 500,
            },
          });
          return;
        }
 
        setIsScanning(false);
        setHasScanned(true);
      }
    }
  }, [isScanning, stopCamera, navigate]);
 
  const parseQRData = (data) => {
    let merchantName = 'Scanned Merchant';
    let amountValue = null;
 
    try {
      const parsed = JSON.parse(data);
      merchantName = parsed.merchant || parsed.name || parsed.store || merchantName;
      if (parsed.amount) amountValue = parseFloat(parsed.amount);
    } catch {
      const lines = data.split('\n').filter(line => line.trim());
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.includes('merchant:') || lower.includes('store:') || lower.includes('shop:')) {
          merchantName = line.split(':')[1]?.trim() || line;
          continue;
        }
        const amountMatch =
          line.match(/rm\s*([0-9]+(?:\.[0-9]{1,2})?)/i) ||
          line.match(/amount[:\s]*([0-9]+(?:\.[0-9]{1,2})?)/i);
        if (amountMatch) amountValue = parseFloat(amountMatch[1]);
        if (
          merchantName === 'Scanned Merchant' &&
          (lower.includes('grocer') || lower.includes('station') || lower.includes('mart') ||
            lower.includes('shop') || lower.includes('store'))
        ) {
          merchantName = line;
        }
      }
      if (merchantName === 'Scanned Merchant' && lines.length > 0) {
        merchantName = lines[0];
      }
    }
 
    return { merchant: merchantName, amount: amountValue };
  };
 
  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    navigate('/pay', {
      state: {
        merchant: merchant || 'Scanned Merchant',
        amount,
        qrData,
        creditLimit: 500,
      },
    });
  };
 
  const resetScanner = () => {
    setHasScanned(false);
    setQrData(null);
    setPaymentAmount('');
    setMerchant('');
    setError(null);
    setIsScanning(true);
    startCamera();
  };
 
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);
 
  useEffect(() => {
    let intervalId;
    if (isScanning && !hasScanned) {
      intervalId = setInterval(scanQR, 200);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isScanning, hasScanned, scanQR]);
 
  // Payment amount input screen
  if (hasScanned && qrData) {
    return (
      <div className="flex flex-col" style={{ height: '100%', background: '#f0f4ff' }}>
        <style>{`
          .amount-input::-webkit-inner-spin-button,
          .amount-input::-webkit-outer-spin-button {
            opacity: 1;
            height: 40px;
          }
          .pay-btn {
            background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%);
            box-shadow: 0 4px 15px rgba(37,99,235,0.4);
            transition: box-shadow 0.2s, transform 0.1s;
          }
          .pay-btn:hover:not(:disabled) {
            box-shadow: 0 6px 20px rgba(37,99,235,0.5);
            transform: translateY(-1px);
          }
          .pay-btn:disabled {
            background: #93c5fd;
            box-shadow: none;
          }
          .scan-btn {
            background: white;
            border: 1.5px solid #dbeafe;
            color: #1d4ed8;
            transition: background 0.2s;
          }
          .scan-btn:hover {
            background: #eff6ff;
          }
          .amount-input:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
          }
        `}</style>
 
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'white',
          borderBottom: '1px solid #e0e7ff',
          boxShadow: '0 1px 4px rgba(37,99,235,0.07)',
        }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Enter Payment Amount</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, marginTop: '1px' }}>Review and confirm your payment</p>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: '#f1f5f9', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} color="#475569" />
          </button>
        </div>
 
        <div className="flex-1 flex flex-col" style={{ padding: '20px 16px', gap: '14px' }}>
 
          {/* Merchant info card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 2px 12px rgba(37,99,235,0.08)',
            border: '1px solid #e0e7ff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Icon */}
              <div style={{
                width: '46px', height: '46px', flexShrink: 0,
                background: 'linear-gradient(135deg, #dbeafe, #eff6ff)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #bfdbfe',
              }}>
                <Camera size={20} color="#2563eb" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                  Merchant
                </div>
                <h3 style={{
                  fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {merchant || 'Scanned Merchant'}
                </h3>
              </div>
              {/* Blue checkmark badge */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
              }}>
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
 
            {/* Divider */}
            <div style={{ height: '1px', background: '#f1f5f9', margin: '14px 0' }} />
 
            {/* Status row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#64748b' }}>QR Code scanned successfully</span>
            </div>
 
            {/* Suggested amount banner */}
            {scannedAmount && (
              <div style={{
                marginTop: '12px', padding: '10px 14px',
                background: 'linear-gradient(135deg, #dbeafe, #eff6ff)',
                borderRadius: '10px', border: '1px solid #bfdbfe',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '500' }}>Suggested amount</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#1d4ed8' }}>
                  RM {scannedAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
 
          {/* Amount input card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 2px 12px rgba(37,99,235,0.08)',
            border: '1px solid #e0e7ff',
          }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Payment Amount
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '18px', fontWeight: '700', color: '#94a3b8',
                pointerEvents: 'none',
              }}>
                RM
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="amount-input"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 54px',
                  border: '1.5px solid #e0e7ff',
                  borderRadius: '12px',
                  fontSize: '24px',
                  fontWeight: '800',
                  outline: 'none',
                  background: '#f8faff',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                placeholder="0.00"
                autoFocus
              />
            </div>
            {!scannedAmount && (
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                Amount was not embedded in the QR — please enter it manually.
              </p>
            )}
          </div>
 
          {/* Spacer */}
          <div style={{ flex: 1 }} />
 
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingBottom: '8px' }}>
            <button
              onClick={resetScanner}
              className="flex-1 btn scan-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600' }}
            >
              <RotateCcw size={15} />
              Scan Again
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 btn pay-btn"
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              style={{ color: 'white', fontWeight: '700', border: 'none' }}
            >
              Pay Now
            </button>
          </div>
 
        </div>
      </div>
    );
  }
 
  // Camera scanning screen
  return (
    <div
      className="flex flex-col"
      style={{ height: '100%', background: 'black', overflow: 'hidden' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white" style={{ flexShrink: 0 }}>
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/20">
          <X size={24} />
        </button>
      </div>
 
      {/* Camera area */}
      <div
        style={{
          flex: '1 1 0',
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          touchAction: 'none',
          background: 'black',
        }}
      >
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black">
            <div className="text-center text-white">
              <X size={48} className="mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
              <p className="text-sm mb-4">{error}</p>
              <button onClick={startCamera} className="btn btn-primary">Try Again</button>
            </div>
          </div>
        ) : (
          <>
            {/* Video — absolute so it doesn't affect layout size */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
 
            <canvas ref={canvasRef} style={{ display: 'none' }} />
 
            {/* Scanning frame overlay — centered over video */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '280px',
                    height: '280px',
                    border: '2px solid white',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                  }}
                />
                <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-white rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-white rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-white rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-white rounded-br-lg" />
                <div
                  className="absolute left-2 right-2 h-0.5 bg-red-500 animate-pulse"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          </>
        )}
      </div>
 
      {/* Instructions — outside camera container, sits below the video in normal flow */}
      {!error && (
        <div
          style={{ flexShrink: 0, background: 'white', paddingBottom: '24px', paddingTop: '16px', textAlign: 'center', width: '100%'  }}
          className="text-center text-white"
        >
          <Camera size={28} className="mx-auto mb-2" />
          <p className="text-sm font-medium">Position QR code within the frame</p>
          {isScanning && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Loader size={14} className="animate-spin" />
              <span className="text-xs">Scanning for QR code...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}