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
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
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
        console.log('QR Code detected:', code.data);
        setIsScanning(false);
        setHasScanned(true);
        setQrData(code.data);
        parseQRData(code.data);
        stopCamera();
        return; // Exit early to prevent further scanning
      }
    }
  }, [isScanning, stopCamera]);

  const parseQRData = (data) => {
    console.log('Parsing QR data:', data);
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(data);
      if (parsed.merchant) {
        setMerchant(parsed.merchant);
      } else if (parsed.name) {
        setMerchant(parsed.name);
      } else if (parsed.store) {
        setMerchant(parsed.store);
      } else {
        setMerchant('Scanned Merchant');
      }
    } catch {
      // If not JSON, try to extract merchant name from string
      const lines = data.split('\n').filter(line => line.trim());
      let merchantName = 'Scanned Merchant';

      for (const line of lines) {
        // Look for merchant/store patterns
        if (line.toLowerCase().includes('merchant:') ||
            line.toLowerCase().includes('store:') ||
            line.toLowerCase().includes('shop:')) {
          merchantName = line.split(':')[1]?.trim() || line;
          break;
        }
        // If line looks like a business name (contains common business words)
        if (line.length > 3 &&
            (line.toLowerCase().includes('grocer') ||
             line.toLowerCase().includes('station') ||
             line.toLowerCase().includes('mart') ||
             line.toLowerCase().includes('shop') ||
             line.toLowerCase().includes('store'))) {
          merchantName = line;
          break;
        }
      }

      // If no specific merchant found, use first meaningful line
      if (merchantName === 'Scanned Merchant' && lines.length > 0) {
        merchantName = lines[0];
      }

      setMerchant(merchantName);
    }
  };

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    // Navigate to payment approval with the scanned data
    navigate('/pay', {
      state: {
        merchant: merchant || 'Scanned Merchant',
        amount: amount,
        qrData: qrData
      }
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
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    let intervalId;
    if (isScanning && !hasScanned) {
      intervalId = setInterval(scanQR, 200); // Scan every 200ms
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isScanning, hasScanned, scanQR]);

  // Payment amount input screen
  if (hasScanned && qrData) {
    return (
      <div className="flex flex-col" style={{ height: '100%', background: 'var(--bg)' }}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Enter Payment Amount</h2>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-6">
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Camera size={20} color="var(--success)" />
              </div>
              <div>
                <h3 className="font-semibold">{merchant || 'Scanned Merchant'}</h3>
                <p className="text-sm text-muted">QR Code scanned successfully</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Payment Amount (RM)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg text-lg"
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetScanner}
              className="flex-1 btn"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
              <RotateCcw size={16} className="mr-2" />
              Scan Again
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 btn btn-primary"
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
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
    <div className="flex flex-col" style={{ height: '100%', background: 'black' }}>
      <div className="flex items-center justify-between p-4 bg-black/80 text-white">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-white/20"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black">
            <div className="text-center text-white">
              <X size={48} className="mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* QR code scanning frame */}
                <div
                  className="border-2 border-white rounded-lg bg-black/20"
                  style={{
                    width: '280px',
                    height: '280px',
                  }}
                />
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-white rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-white rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-white rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-white rounded-br-lg"></div>

                {/* Scanning line animation */}
                <div
                  className="absolute left-2 right-2 h-0.5 bg-red-500 animate-pulse"
                  style={{
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-center text-white">
                <Camera size={32} className="mx-auto mb-2" />
                <p className="text-sm font-medium">Position QR code within the frame</p>
                {isScanning && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-xs">Scanning for QR code...</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}