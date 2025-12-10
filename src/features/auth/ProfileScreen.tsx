import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { authStore } from '@/stores/authStore';

export function ProfileScreen() {
  const profile = authStore((state) => state.profile);
  const logout = authStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-background">
      <ScreenHeader title="Profile" />
      <div className="space-y-4 px-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle>{profile?.name ?? 'User'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Email: {profile?.email ?? '—'}</div>
            <div>Role: {profile?.role ?? '—'}</div>
            <div>Client: {profile?.clientName ?? '—'}</div>
          </CardContent>
        </Card>
        <Button variant="destructive" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}

