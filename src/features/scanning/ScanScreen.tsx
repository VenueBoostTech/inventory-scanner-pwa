import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useScanner } from '@/hooks/useScanner';
import { useScanBarcode } from '@/hooks/api/useProducts';
import { useToast } from '@/hooks/use-toast';

export function ScanScreen() {
  const [manualCode, setManualCode] = useState('');
  const { toast } = useToast();
  const { mutateAsync, isPending } = useScanBarcode();
  const { isScanning, error, startScanning, stopScanning } = useScanner();

  const handleDecoded = async (code: string) => {
    await mutateAsync(code);
    toast({ title: 'Scan captured', description: code });
    await stopScanning();
  };

  const handleManualSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!manualCode) return;
    await mutateAsync(manualCode);
    toast({ title: 'Submitted', description: manualCode });
    setManualCode('');
  };

  return (
    <div className="min-h-screen bg-background">
      <ScreenHeader
        title="Scan"
        action={
          isScanning ? (
            <Button size="sm" variant="secondary" onClick={() => void stopScanning()}>
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={() => void startScanning(handleDecoded)}>
              Start
            </Button>
          )
        }
      />
      <div className="space-y-4 px-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle>Live Scanner</CardTitle>
            <CardDescription>Point your camera at a barcode</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              id="scanner"
              className="aspect-square w-full rounded-lg border bg-muted"
              role="presentation"
            />
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              Camera requires HTTPS or localhost.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
            <CardDescription>Enter a code if scanning is unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-2" onSubmit={handleManualSubmit}>
              <Input
                placeholder="Enter barcode"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <Button type="submit" disabled={!manualCode || isPending}>
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

