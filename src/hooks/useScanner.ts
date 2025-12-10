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
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        onSuccess,
        () => {},
      );

      setIsScanning(true);
      setError(null);
    } catch (err) {
      setError('Failed to start camera. Please check permissions.');
      console.error(err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    }
    scannerRef.current = null;
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      void stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isScanning, error, startScanning, stopScanning };
}

