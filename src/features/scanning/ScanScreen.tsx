import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { authStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { useScanner } from '@/hooks/useScanner';
import { useScanBarcode } from '@/hooks/api/useProducts';
import { useScanHistory } from '@/hooks/api/useScanHistory';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Plus, XCircle, ArrowRight, Info, Lightbulb } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function ScanScreen() {
  const { t } = useI18n();
  const [manualCode, setManualCode] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const [lastScan] = useState<{
    code: string;
    productName: string;
    time: Date;
  } | null>(null);
  const { toast } = useToast();
  const { mutateAsync, isPending } = useScanBarcode();
  const { isScanning, error, startScanning, stopScanning } = useScanner();
  const profile = authStore((state) => state.profile);
  const warehouseId = profile?.permissions?.warehouseIds?.[0];

  // API hooks
  const { data: scanHistoryData } = useScanHistory({
    limit: 10,
    warehouseId,
  });

  const recentScans = scanHistoryData?.data || [];

  const getStatusIcon = (result: string) => {
    switch (result) {
      case 'found':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'not_found':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'created':
        return <Plus className="h-4 w-4 text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
  };

  const getStatusLabel = (result: string) => {
    switch (result) {
      case 'found':
        return t('scan.found');
      case 'not_found':
        return t('scan.notFound');
      case 'created':
        return t('scan.created');
      case 'error':
        return t('common.error');
      default:
        return t('scan.found');
    }
  };



  const navigate = useNavigate();

  const handleDecoded = async (code: string) => {
    try {
      const result = await mutateAsync({ barcode: code, warehouseId });
      await stopScanning();
      navigate('/scan/result', { state: { scanResult: result, barcode: code } });
    } catch (error) {
      await stopScanning();
      toast({
        title: t('common.error'),
        description: t('scan.scanError'),
        variant: 'destructive',
      });
    }
  };

  const handleManualSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!manualCode) return;
    try {
      const result = await mutateAsync({ barcode: manualCode, warehouseId });
      navigate('/scan/result', { state: { scanResult: result, barcode: manualCode } });
      setManualCode('');
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('scan.scanError'),
        variant: 'destructive',
      });
    }
  };

  const handleSkuSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!skuCode) return;
    // TODO: Implement SKU search API call
    toast({ title: 'SKU Search', description: `Searching for SKU: ${skuCode}` });
    setSkuCode('');
  };

  return (
    <div className="min-h-screen bg-background pb-[max(4rem,calc(4rem+env(safe-area-inset-bottom)))]">
      <ScreenHeader title={t('scan.title')} />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-3 rounded-lg border border-border bg-white p-3">
          <div>
            <p className="text-md font-semibold text-foreground">{t('scan.scanItems')}</p>
            <p className="text-sm text-muted-foreground">
              {t('scan.holdSteady')}
            </p>
            {isScanning ? (
              <Button
                size="sm"
                variant="secondary"
                className="mt-2 w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                onClick={() => void stopScanning()}
              >
                {t('scan.stop')}
              </Button>
            ) : (
              <Button
                size="sm"
                className="mt-2 w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                onClick={() => void startScanning(handleDecoded)}
              >
                {t('scan.startScanning')}
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
                {t('scan.scannerPlaceholder')}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end text-xs text-[#043f3b]">
            <div className="text-right">
              <span className="font-semibold uppercase tracking-wide text-[11px] text-[#043f3b]/80">
                {t('scan.lastScan')}
              </span>{' '}
              <span className="font-semibold text-[13px] text-[#043f3b]">
                {lastScan?.productName ?? t('scan.noScansYet')}
              </span>
              <div className="text-[11px] text-[#043f3b]/80">
                {lastScan
                  ? `${lastScan.code} • ${format(lastScan.time, 'MMM d, yyyy h:mm a')}`
                  : t('scan.scanBarcode')}
              </div>
            </div>
          </div>
        </div>

        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="px-3 pt-3 pb-2">
            <CardTitle className="text-md font-semibold text-foreground">{t('scan.manualEntry')}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
             {t('scan.enterBarcode')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <form className="flex gap-2" onSubmit={handleManualSubmit}>
              <Input
                placeholder={t('scan.enterBarcodePlaceholder')}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <Button
                type="submit"
                disabled={!manualCode || isPending}
                className="h-11 border-none bg-[#164945] text-white hover:bg-[#123b37]"
              >
                {t('common.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="px-3 pt-3 pb-2">
            <CardTitle className="text-md font-semibold text-foreground">{t('scan.searchBySku')}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t('scan.searchBySkuSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <form className="flex gap-2" onSubmit={handleSkuSubmit}>
              <Input
                placeholder={t('scan.enterSkuPlaceholder')}
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
              />
              <Button
                type="submit"
                disabled={!skuCode || isPending}
                className="h-11 border-none bg-[#164945] text-white hover:bg-[#123b37]"
              >
                {t('common.search')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-3 px-3 pt-3 pb-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-md font-semibold text-foreground">{t('scan.recentScans')}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t('scan.latestLookups')}
              </CardDescription>
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate('/scan/all')}
                className="mt-2 flex items-center gap-1 text-sm font-medium text-[#164945] hover:underline cursor-pointer"
              >
                {t('common.seeAll')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-3 mt-2 pb-3">
            {recentScans.length === 0 ? (
              <div className="rounded-md border border-dashed border-muted-foreground/30 px-3 py-4 text-center text-sm text-muted-foreground">
                {t('scan.noScans')}
              </div>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {scan.product?.title ?? 'Unknown Product'}
                      </p>
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          SKU: {scan.product?.sku || '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Barcode: {scan.barcode || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(scan.result)}
                        <span className="text-xs font-medium text-foreground">
                          {getStatusLabel(scan.result)}
                        </span>
                      </div>
                        <span className="text-xs text-muted-foreground">
                          {scan.scannedAt?.formattedDateTime || scan.scannedAt?.date || '—'}
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-3 px-3 pt-3 pb-2">
            <div className="flex items-start gap-3 flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945]/10">
                <Info className="h-5 w-5 text-[#164945]" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-md font-semibold text-foreground">{t('scan.needHelp')}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {t('scan.learnHow')}
                </CardDescription>
              </div>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto flex justify-end sm:justify-start">
              <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-[#164945] hover:underline cursor-pointer"
                  >
                    {t('common.learnMore')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[75%] sm:w-[400px]">
                    <SheetHeader className="text-left space-y-1">
                      <SheetTitle className="text-left">{t('scan.scanningGuide')}</SheetTitle>
                      <SheetDescription className="text-left">
                        {t('scan.learnTroubleshoot')}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {/* How Scanning Works */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">{t('scan.howItWorks')}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>{t('scan.pointCamera')}</p>
                          <p>{t('scan.autoLookup')}</p>
                          <p>{t('scan.ifFound')}</p>
                          <p>{t('scan.manualEntry')}</p>
                        </div>
                      </div>

                      {/* Troubleshooting */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <h3 className="text-sm font-semibold text-foreground">
                            {t('scan.whyNotFound')}
                          </h3>
                        </div>
                        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {t('scan.productNotExist')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('scan.createProduct')}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {t('scan.productExists')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('scan.searchLink')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tip */}
                      <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-emerald-600" />
                          <p className="text-sm font-semibold text-foreground">{t('scan.tip')}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('scan.afterLinking')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button
                        onClick={() => setInfoOpen(false)}
                        className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                      >
                        {t('common.gotIt')}
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

