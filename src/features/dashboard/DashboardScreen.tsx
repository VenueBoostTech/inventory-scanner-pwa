import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';

export function DashboardScreen() {
  return (
    <div className="min-h-screen bg-background">
      <ScreenHeader title="Dashboard" />
      <div className="space-y-4 px-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Add your KPIs and summaries here.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

