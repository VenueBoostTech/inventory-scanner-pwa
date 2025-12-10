import { useState, type ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useScanner } from '@/hooks/useScanner';
import { useScanBarcode } from '@/hooks/api/useProducts';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, Plus, Search, XCircle } from 'lucide-react';

export function ScanScreen() {
  const [manualCode, setManualCode] = useState('');
  const [lastScan, setLastScan] = useState<{
    code: string;
    productName: string;
    time: Date;
  } | null>(null);
  const { toast } = useToast();
  const { mutateAsync, isPending } = useScanBarcode();
  const { isScanning, error, startScanning, stopScanning } = useScanner();

  const recentScans = [
    {
      id: 'scan_001',
      barcode: '8901234567890',
      action: 'lookup',
      result: 'found',
      product: { title: 'Premium Coffee Beans', sku: 'COF-001' },
      warehouse: { name: 'Main Warehouse', code: 'WH-001' },
      scannedAt: '2025-12-09T14:30:00Z',
    },
  ];

  const formatResult = (result: string) => {
    const map: Record<string, { label: string; className: string; icon: ReactElement }> = {
      found: { label: 'Found', className: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle2 className="h-4 w-4" /> },
      not_found: { label: 'Not Found', className: 'bg-red-50 text-red-700', icon: <XCircle className="h-4 w-4" /> },
      created: { label: 'Created', className: 'bg-blue-50 text-blue-700', icon: <Plus className="h-4 w-4" /> },
      error: { label: 'Error', className: 'bg-amber-50 text-amber-700', icon: <AlertCircle className="h-4 w-4" /> },
    };
    return map[result] ?? map.found;
  };

  const formatAction = (action: string) => {
    const map: Record<string, { label: string; icon: ReactElement }> = {
      lookup: { label: 'Lookup', icon: <Search className="h-4 w-4" /> },
      add_product: { label: 'Added', icon: <Plus className="h-4 w-4" /> },
      stock_adjust: { label: 'Adjusted', icon: <AlertCircle className="h-4 w-4" /> },
      stock_count: { label: 'Counted', icon: <AlertCircle className="h-4 w-4" /> },
    };
    return map[action] ?? map.lookup;
  };

  const formatTimeAgo = (date: string | Date) => {
    const target = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(target, { addSuffix: true });
  };

  const handleDecoded = async (code: string) => {
    const result = await mutateAsync(code);
    setLastScan({
      code,
      productName: (result as { title?: string } | null)?.title ?? 'Unknown product',
      time: new Date(),
    });
    toast({ title: 'Scan captured', description: code });
    await stopScanning();
  };

  const handleManualSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!manualCode) return;
    const result = await mutateAsync(manualCode);
    setLastScan({
      code: manualCode,
      productName: (result as { title?: string } | null)?.title ?? 'Unknown product',
      time: new Date(),
    });
    toast({ title: 'Submitted', description: manualCode });
    setManualCode('');
  };

  return (
    <div className="min-h-screen bg-background">
      <ScreenHeader title="Scan" />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-3 rounded-lg border border-border bg-white p-3">
          <div>
            <p className="text-md font-semibold text-foreground">Scan items in the warehouse</p>
            <p className="text-sm text-muted-foreground">
              Hold steady over a barcode to identify the product and pull stock info.
            </p>
            {isScanning ? (
              <Button
                size="sm"
                variant="secondary"
                className="mt-2 w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                onClick={() => void stopScanning()}
              >
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                className="mt-2 w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                onClick={() => void startScanning(handleDecoded)}
              >
                Start scanning
              </Button>
            )}
          </div>
          <div
            className="relative w-full"
            role="presentation"
          >
            <div
              id="scanner"
              className="scanner-container h-48 w-full overflow-hidden rounded-lg border bg-muted/60"
              aria-label="Camera preview"
            />
            {!isScanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
                Start scanning to see the live camera preview.
              </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end text-xs text-[#043f3b]">
            <div className="text-right">
              <span className="font-semibold uppercase tracking-wide text-[11px] text-[#043f3b]/80">
                Last scan:
              </span>{' '}
              <span className="font-semibold text-[13px] text-[#043f3b]">
                {lastScan?.productName ?? 'No scans yet'}
              </span>
              <div className="text-[11px] text-[#043f3b]/80">
                {lastScan
                  ? `${lastScan.code} • ${format(lastScan.time, 'MMM d, yyyy h:mm a')}`
                  : 'Scan a barcode to see details'}
              </div>
            </div>
          </div>
        </div>

        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="px-3 pt-3 pb-2">
            <CardTitle className="text-md font-semibold text-foreground">Manual entry</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter or paste the product barcode if the camera isn’t available.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <form className="flex gap-2" onSubmit={handleManualSubmit}>
              <Input
                placeholder="Enter barcode"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <Button
                type="submit"
                disabled={!manualCode || isPending}
                className="h-11 border-none bg-[#164945] text-white hover:bg-[#123b37]"
              >
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="flex items-start justify-between gap-3 px-3 pt-3 pb-2">
            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="text-md font-semibold text-foreground">Recent scans</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Latest lookups and results.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 whitespace-nowrap text-[#164945] hover:bg-[#164945]/10"
            >
              See all
            </Button>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {recentScans.length === 0 ? (
              <div className="rounded-md border border-dashed border-muted-foreground/30 px-3 py-4 text-center text-sm text-muted-foreground">
                No scans yet. Start scanning or add a barcode manually.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Product</TableHead>
                    <TableHead className="w-[20%]">Barcode</TableHead>
                    <TableHead className="w-[20%]">Status</TableHead>
                    <TableHead className="w-[20%] text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentScans.map((scan) => {
                    const status = formatResult(scan.result);
                    const action = formatAction(scan.action);
                    return (
                      <TableRow key={scan.id}>
                        <TableCell className="align-middle">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground">
                              {scan.product?.title ?? 'Unknown product'}
                            </span>
                            <span className="text-xs text-muted-foreground">{scan.product?.sku}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{scan.barcode}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              {action.icon}
                              {action.label}
                            </span>
                            <Badge className={status.className} variant="secondary">
                              <span className="flex items-center gap-1">
                                {status.icon}
                                {status.label}
                              </span>
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatTimeAgo(scan.scannedAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

