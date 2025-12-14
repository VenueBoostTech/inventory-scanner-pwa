import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getDeviceInfo } from '@/lib/device';
import type { Product } from '@/types/api';

export interface CreateProductRequest {
  title: string;
  titleAl: string;
  productSku: string;
  barcode?: string;
  shortDescription?: string;
  shortDescriptionAl?: string;
  description?: string;
  descriptionAl?: string;
  categoryIds?: string | string[];
  priceAl?: number;
  priceEur?: number;
  initialQuantity?: number;
  lowQuantity?: number;
  enableLowStockAlert?: boolean;
  warehouseId?: string;
  image?: File;
}

export interface CreateProductResponse {
  message: string;
  product: Product;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateProductRequest) => {
      const deviceInfo = getDeviceInfo();
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Required fields
      formData.append('title', request.title);
      formData.append('titleAl', request.titleAl);
      formData.append('productSku', request.productSku);
      
      // Optional fields
      if (request.barcode) {
        formData.append('barcode', request.barcode);
      }
      
      if (request.shortDescription) {
        formData.append('shortDescription', request.shortDescription);
      }
      
      if (request.shortDescriptionAl) {
        formData.append('shortDescriptionAl', request.shortDescriptionAl);
      }
      
      if (request.description) {
        formData.append('description', request.description);
      }
      
      if (request.descriptionAl) {
        formData.append('descriptionAl', request.descriptionAl);
      }
      
      // Categories - can be string or array
      if (request.categoryIds) {
        if (Array.isArray(request.categoryIds)) {
          request.categoryIds.forEach((id) => {
            formData.append('categoryIds', id);
          });
        } else {
          formData.append('categoryIds', request.categoryIds);
        }
      }
      
      // Pricing
      if (request.priceAl !== undefined) {
        formData.append('priceAl', request.priceAl.toString());
      }
      
      if (request.priceEur !== undefined) {
        formData.append('priceEur', request.priceEur.toString());
      }
      
      // Stock management
      if (request.initialQuantity !== undefined) {
        formData.append('initialQuantity', request.initialQuantity.toString());
      }
      
      if (request.lowQuantity !== undefined) {
        formData.append('lowQuantity', request.lowQuantity.toString());
      }
      
      if (request.enableLowStockAlert !== undefined) {
        formData.append('enableLowStockAlert', request.enableLowStockAlert.toString());
      }
      
      if (request.warehouseId) {
        formData.append('warehouseId', request.warehouseId);
      }
      
      // Image file
      if (request.image) {
        formData.append('image', request.image);
      }
      
      // Device info as JSON string
      formData.append('deviceInfo', JSON.stringify(deviceInfo));
      
      // Make request with FormData (axios will set Content-Type to multipart/form-data automatically)
      const { data } = await apiClient.post<CreateProductResponse>('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['scan-history'] });
    },
  });
}

