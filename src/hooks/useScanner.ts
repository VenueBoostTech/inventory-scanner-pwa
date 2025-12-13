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

      // Try to get available cameras first for better mobile support
      let cameras: Array<{ id: string; label: string }> = [];
      try {
        cameras = await Html5Qrcode.getCameras();
      } catch (camError) {
        console.warn('Could not enumerate cameras, using facingMode:', camError);
      }

      let cameraId: string | undefined;
      
      // Prefer back camera (environment) on mobile
      if (cameras.length > 0) {
        const backCamera = cameras.find(cam => 
          cam.label.toLowerCase().includes('back') || 
          cam.label.toLowerCase().includes('rear') ||
          cam.label.toLowerCase().includes('environment')
        );
        if (backCamera) {
          cameraId = backCamera.id;
        } else {
          // Fallback to first available camera
          cameraId = cameras[0].id;
        }
      }

      // Use camera ID if available, otherwise use facingMode
      const videoConstraints = cameraId 
        ? { deviceId: { exact: cameraId } }
        : { facingMode: 'environment' };

      try {
        await scanner.start(
          videoConstraints,
          { 
            fps: 10, 
            qrbox,
            aspectRatio: 1.0, // Better for mobile
            disableFlip: false, // Allow rotation
          },
          onSuccess,
          (errorMessage) => {
            // Log scanning errors but don't stop scanning
            console.debug('Scanning error:', errorMessage);
          },
        );
      } catch (startError) {
        // If environment camera fails, try user camera (front) as fallback
        if (!cameraId && videoConstraints.facingMode === 'environment') {
          console.warn('Back camera failed, trying front camera...');
          try {
            await scanner.start(
              { facingMode: 'user' },
              { 
                fps: 10, 
                qrbox,
                aspectRatio: 1.0,
                disableFlip: false,
              },
              onSuccess,
              (errorMessage) => {
                console.debug('Scanning error:', errorMessage);
              },
            );
          } catch (fallbackError) {
            throw startError; // Throw original error if fallback also fails
          }
        } else {
          throw startError;
        }
      }

      setIsScanning(true);
      setError(null);
    } catch (err: unknown) {
      setIsScanning(false);
      let errorMessage = 'Camera failed to start. Check permissions and try again.';
      
      if (err instanceof Error) {
        console.error('Scanner start error:', err);
        
        // Provide more specific error messages
        if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError' || err.message.includes('no camera')) {
          errorMessage = 'No camera found. Please ensure your device has a camera.';
        } else if (err.name === 'NotReadableError' || err.message.includes('could not start')) {
          errorMessage = 'Camera is already in use by another application.';
        } else if (err.message.includes('HTTPS')) {
          errorMessage = 'Camera requires HTTPS. Please use a secure connection.';
        } else {
          errorMessage = `Camera error: ${err.message}`;
        }
      } else {
        console.error('Scanner start error:', err);
      }
      
      setError(errorMessage);
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

