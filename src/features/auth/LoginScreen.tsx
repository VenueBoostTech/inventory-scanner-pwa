import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { authStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';
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

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

const Logo = () => (
  <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#164945]/10">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className="h-7 w-7 text-[#164945]"
      role="img"
      aria-label="Inventory Scanner logo"
    >
      <path
        fill="currentColor"
        d="M12 10h40a2 2 0 0 1 2 2v40a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Zm4 8v28h32V18H16Zm6 4h20v4H22v-4Zm0 10h20v4H22v-4Z"
      />
    </svg>
  </div>
);

export function LoginScreen() {
  const { t } = useI18n();
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
    <div className="flex min-h-screen items-center justify-center bg-background px-8">
      <div className="w-full max-w-md">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="px-0 pb-4 text-center">
            <Logo />
            <CardTitle className="text-2xl font-semibold text-foreground">
              {t('auth.login.title')}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t('auth.login.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.login.email')}</FormLabel>
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
                      <FormLabel>{t('auth.login.password')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                >
                  {t('auth.login.continue')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

