import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { authStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function LoginScreen() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    // Placeholder login - replace with API call.
    authStore
      .getState()
      .setTokens('demo-access-token', 'demo-refresh-token');
    authStore.getState().setProfile({
      id: 'demo',
      name: 'Demo User',
      email: values.email,
      role: 'manager',
      clientId: 'client-1',
      clientName: 'Inventory Inc.',
      permissions: {
        canScan: true,
        canAdjustStock: true,
        canPerformStockCount: true,
        canInitiateTransfer: true,
        canCompleteTransfer: true,
        canAddProducts: true,
        canEditProducts: true,
        canViewAllWarehouses: true,
        warehouseIds: [],
      },
      features: {
        stockAdjustments: true,
        stockCounts: true,
        stockTransfers: true,
        addProducts: true,
        editProducts: true,
        barcodeScanning: true,
        multiLanguage: false,
      },
      preferences: {
        language: 'en',
        timezone: 'UTC',
      },
    });
    navigate('/scan', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <ScreenHeader title="Login" />
      <div className="px-4 py-6">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Inventory Scanner</CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

