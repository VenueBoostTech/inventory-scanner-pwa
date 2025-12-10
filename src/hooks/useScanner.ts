import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function useScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async (
    onSuccess: (decodedText: string) => void,
    elementId = 'scanner',
  ) => {
    try {
      const target = document.getElementById(elementId);
      if (!target) {
        setError('Scanner element not found.');
        return;
      }

      // If a previous scanner exists, ensure it is stopped and cleared.
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      }

      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;

      const rect = target.getBoundingClientRect();
      const desiredWidth = Math.floor(rect.width * 0.7);
      const desiredHeight = Math.floor(rect.height * 0.7);
      const qrbox = {
        width: Math.max(140, desiredWidth),
        height: Math.max(100, Math.min(desiredHeight, rect.height - 16)),
      };

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox },
        onSuccess,
        () => {},
      );

      setIsScanning(true);
      setError(null);
    } catch (err: unknown) {
      setIsScanning(false);
      setError('Camera failed to start. Check permissions and try again.');
      console.error('Scanner start error:', err);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      if (scannerRef.current) {
        await scannerRef.current.clear();
      }
    } catch (err) {
      console.error('Scanner stop error:', err);
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      void stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isScanning, error, startScanning, stopScanning };
}

