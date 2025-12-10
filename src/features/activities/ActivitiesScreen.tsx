import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';

const sample = [
  {
    id: '1',
    activityType: 'scan',
    quantity: 1,
    product: 'Sample Item',
    staff: 'Demo User',
    timestamp: new Date().toISOString(),
  },
];

export function ActivitiesScreen() {
  return (
    <div className="min-h-screen bg-background">
      <ScreenHeader title="Activity" />
      <div className="space-y-3 px-4 py-4">
        {sample.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-base">{item.product}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div>Type: {item.activityType}</div>
              <div>Qty: {item.quantity}</div>
              <div>By: {item.staff}</div>
              <div>At: {new Date(item.timestamp).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

