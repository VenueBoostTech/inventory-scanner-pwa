import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useScanner } from '@/hooks/useScanner';
import { useProduct, useUpdateProduct, useScanBarcode } from '@/hooks/api/useProducts';
import { Package, CheckCircle2, AlertCircle, Zap, Loader2 } from 'lucide-react';

export function LinkBarcodeScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isScanning, error, startScanning, stopScanning } = useScanner();
  const [barcode, setBarcode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [conflictingProduct, setConflictingProduct] = useState<any>(null);

  const { data: product, isLoading } = useProduct(id || '');
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutateAsync: scanBarcode } = useScanBarcode();
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [notFoundModalOpen, setNotFoundModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('products.linkBarcode')} showBack />
        <div className="space-y-4 px-4 py-4">
          {/* Product Info Skeleton */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scan Barcode Skeleton */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-48 w-full rounded-lg mb-3" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* OR Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-border" />
            <Skeleton className="h-3 w-8" />
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Manual Entry Skeleton */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('products.linkBarcode')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  const handleDecoded = async (code: string) => {
    if (!id) return;
    
    setIsScanningBarcode(true);
    setScannedBarcode(code);
    
    try {
      // Check if barcode exists in system
      const scanResult = await scanBarcode({ barcode: code });
      
      if (scanResult.result === 'found' && scanResult.product) {
        // Barcode is already linked to another product
        setConflictingProduct(scanResult.product);
        setErrorMessage(t('products.barcodeAlreadyLinked'));
        setErrorModalOpen(true);
        await stopScanning();
      } else {
        // Barcode not found - suggest manual link
        setBarcode(code);
        setNotFoundModalOpen(true);
        await stopScanning();
      }
    } catch (error: any) {
      // If 404 or not found, barcode is available
      if (error?.response?.status === 404 || error?.response?.status === 400) {
        setBarcode(code);
        setNotFoundModalOpen(true);
        await stopScanning();
      } else {
        toast({
          title: t('common.error'),
          description: error?.response?.data?.message || t('scan.scanError'),
          variant: 'destructive',
        });
        await stopScanning();
      }
    } finally {
      setIsScanningBarcode(false);
    }
  };

  const handleCheckBarcode = async () => {
    if (!barcode || barcode.trim() === '' || !id) {
      toast({
        title: t('common.error'),
        description: t('products.pleaseScanOrEnterBarcode'),
        variant: 'destructive',
      });
      return;
    }

    if (barcode === product.sku) {
      toast({
        title: t('common.error'),
        description: t('products.barcodeCannotBeSameAsSku'),
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);

    try {
      // First check if barcode exists in system
      try {
        const scanResult = await scanBarcode({ barcode: barcode.trim() });
        if (scanResult.result === 'found' && scanResult.product) {
          // Barcode is already linked to another product
          setConflictingProduct(scanResult.product);
          setErrorMessage(t('products.barcodeAlreadyLinked'));
          setErrorModalOpen(true);
          setIsChecking(false);
          return;
        }
      } catch (scanError: any) {
        // If 404, barcode is available - continue to link
        if (scanError?.response?.status !== 404 && scanError?.response?.status !== 400) {
          throw scanError;
        }
      }

      // Link the barcode
      await updateProduct({
        productId: id,
        barcode: barcode.trim(),
      });
      setSuccessModalOpen(true);
    } catch (error: any) {
      // Check if error indicates barcode conflict
      const errorMsg = error?.response?.data?.message || '';
      if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('exists')) {
        // Try to extract conflicting product info from error if available
        setConflictingProduct(error?.response?.data?.conflictingProduct || null);
        setErrorMessage(errorMsg || t('products.barcodeAlreadyLinked'));
        setErrorModalOpen(true);
      } else {
        toast({
          title: t('common.error'),
          description: errorMsg || t('products.barcodeLinkError'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsChecking(false);
    }
  };


  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    navigate(`/products/${product.id}`);
  };

  const handleErrorClose = () => {
    setErrorModalOpen(false);
    setBarcode('');
    setConflictingProduct(null);
  };

  const handleViewConflictingProduct = () => {
    if (conflictingProduct) {
      navigate(`/products/${conflictingProduct.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('products.linkBarcode')} showBack />

      <div className="space-y-4 px-4 py-4">
        {/* Product Info */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-center gap-3">
              {product.imagePath ? (
                <img
                  src={product.imagePath}
                  alt={product.title}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{product.title}</p>
                <p className="text-xs text-muted-foreground">{t('products.sku')}: {product.sku}</p>
                <p className="text-xs text-muted-foreground">
                  {t('products.current')}: {product.barcode ? product.barcode : t('products.noBarcodeLinked')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan Barcode */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.scanBarcode')}</h3>
            <div>
              {isScanning ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mb-3 w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                  onClick={() => void stopScanning()}
                >
                  {t('scan.stop')}
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="mb-3 w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                  onClick={() => void startScanning(handleDecoded)}
                >
                  {t('scan.startScanning')}
                </Button>
              )}
            </div>
            <div className="relative w-full" role="presentation">
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
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            {isScanning && (
              <div className="mt-3 rounded-lg border border-[#164945]/20 bg-[#164945]/5 p-3">
                <div className="flex items-start gap-3">
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#164945] mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {t('scan.scanningInProgress')}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('scan.scanningTip')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isScanningBarcode && (
              <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-start gap-3">
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {t('products.checking')}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('products.checkingBarcodeDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* OR Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">{t('products.or')}</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Manual Entry */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.enterManually')}</h3>
            <Input
              placeholder={t('products.enterBarcode')}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="mb-3"
            />
            <Button
              onClick={handleCheckBarcode}
              disabled={!barcode || isChecking || isUpdating}
              className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {isChecking || isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('products.linking')}
                </>
              ) : (
                t('products.linkBarcode')
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="mt-2">{t('products.barcodeLinkedSuccessfully')}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <p className="text-sm font-semibold">{barcode}</p>
              <p className="text-sm text-muted-foreground">
                → {product.title} ({product.sku})
              </p>
            </div>

            <Button
              onClick={handleSuccessClose}
              className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {t('products.backToProduct')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                <div className="mt-2">{t('products.barcodeAlreadyLinked')}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            {conflictingProduct && (
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-medium">{conflictingProduct.title}</p>
                <p className="text-xs text-muted-foreground">{t('products.sku')}: {conflictingProduct.sku}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleErrorClose}
                className="flex-1"
              >
                {t('products.tryDifferentBarcode')}
              </Button>
              {conflictingProduct && (
                <Button
                  onClick={handleViewConflictingProduct}
                  className="flex-1 border-none bg-[#164945] text-white hover:bg-[#123b37]"
                >
                  {t('products.viewProduct')}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Not Found Modal */}
      <Dialog open={notFoundModalOpen} onOpenChange={setNotFoundModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2">{t('products.barcodeNotInSystem')}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('products.barcodeNotInSystemDesc').replace('{barcode}', scannedBarcode || barcode)}
            </p>
            <p className="text-sm font-medium text-foreground">
              {t('products.suggestManualLink')}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNotFoundModalOpen(false);
                  setScannedBarcode('');
                }}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => {
                  setNotFoundModalOpen(false);
                  setScannedBarcode('');
                  // Focus on manual input
                  document.querySelector('input[placeholder*="barcode"]')?.focus();
                }}
                className="flex-1 border-none bg-[#164945] text-white hover:bg-[#123b37]"
              >
                {t('products.useManualLink')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
