import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useProducts } from '@/hooks/api/useProducts';
import { format } from 'date-fns';

export function ProductsScreen() {
  const [search, setSearch] = useState('');
  const { data, isPending, error, refetch } = useProducts({ search });

  return (
    <div className="min-h-screen bg-background">
      <ScreenHeader
        title="Products"
        action={
          <Button size="sm" variant="ghost" onClick={() => void refetch()}>
            Refresh
          </Button>
        }
      />
      <div className="space-y-4 px-4 py-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="secondary" onClick={() => void refetch()}>
            Go
          </Button>
        </div>

        {isPending && <p className="text-sm text-muted-foreground">Loading products…</p>}
        {error && (
          <p className="text-sm text-destructive">
            Failed to load products. Check API configuration.
          </p>
        )}

        <div className="grid gap-3">
          {data?.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="text-base">{product.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div>SKU: {product.sku}</div>
                <div>Barcode: {product.barcode}</div>
                <div>Stock: {product.stockQuantity}</div>
                <div>Updated: {format(new Date(), 'PP')}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isPending && !data?.length && (
          <p className="text-sm text-muted-foreground">No products found.</p>
        )}
      </div>
    </div>
  );
}

