import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { authStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
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

// Get device info helper
import { getDeviceInfo } from '@/lib/device';

// FormValues type will be defined inside component

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Create schema with localized messages
  const schema = z.object({
    email: z
      .string()
      .min(1, { message: t('auth.validation.email_required') })
      .email({ message: t('auth.validation.email_invalid') }),
    password: z
      .string()
      .min(1, { message: t('auth.validation.password_required') }),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const deviceInfo = getDeviceInfo();

      const response = await apiClient.post<{
        tokens: {
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
          tokenType: string;
        };
        profile: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          role: string;
          clientId: string;
          clientName: string;
          permissions: {
            canScan: boolean;
            canAdjustStock: boolean;
            canAddProducts: boolean;
            canEditProducts: boolean;
            canViewAllWarehouses: boolean;
            canPerformStockCount: boolean;
            canInitiateTransfer: boolean;
            canCompleteTransfer: boolean;
            warehouseIds: string[];
          };
          preferences: {
            language: string;
            timezone: string;
            notificationsEnabled?: boolean;
          };
        };
        client: {
          id: string;
          name: string;
          code: string;
          publicIdentifier: string;
        };
        inventoryAccess: {
          enabled: boolean;
          mobileApp: boolean;
          webApp?: boolean;
          webAppUrl?: string;
          customAppName: string | null;
          customVersion: string | null;
          expiresAt: string | null;
          features: any; // Will be typed properly in authStore
        };
        success?: boolean; // Optional, may be present in response
        message: string;
      }>('/auth/login', {
        email: values.email,
        password: values.password,
        deviceInfo,
      });

      const { tokens, profile, client, inventoryAccess } = response.data;

      // Calculate expiration timestamp
      const expiresAt = Date.now() + (tokens.expiresIn * 1000);

      // Store tokens, profile, client, and inventoryAccess
      authStore.getState().setTokens(tokens.accessToken, tokens.refreshToken, expiresAt);
      authStore.getState().setAuthData(profile, client, inventoryAccess);

      // Show success message
      toast({
        title: t('auth.login.success'),
        description: t('auth.login.successDesc'),
      });

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle API errors
      let errorMessage = t('auth.errors.network_error');
      
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorKey = errorData.errorKey;
        
        // Map error keys to localization keys
        if (errorKey) {
          // Error keys from API are like "auth.invalid_credentials"
          // Map to "auth.errors.invalid_credentials"
          const errorKeyParts = errorKey.split('.');
          if (errorKeyParts.length >= 2) {
            const mappedKey = `auth.errors.${errorKeyParts.slice(1).join('_')}`;
            const translated = t(mappedKey);
            
            // If translation exists and is different from key, use it
            if (translated !== mappedKey) {
              errorMessage = translated;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        // Network or other errors
        errorMessage = error.message;
      }

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });

      // Set form errors if validation errors
      if (error.response?.status === 400) {
        const errors = error.response.data?.errors || {};
        Object.keys(errors).forEach((field) => {
          const fieldName = field as keyof FormValues;
          form.setError(fieldName, {
            type: 'server',
            message: errors[field],
          });
        });
      }
    } finally {
      setIsLoading(false);
    }
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
                      <FormLabel>{t('auth.login.email_label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('auth.login.email_placeholder')}
                          {...field}
                          disabled={isLoading}
                        />
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
                      <FormLabel>{t('auth.login.password_label')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('auth.login.password_placeholder')}
                            {...field}
                            disabled={isLoading}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            disabled={isLoading}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.login.button_loading') : t('auth.login.button_login')}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t('auth.login.forgot_password')}
                  </button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

