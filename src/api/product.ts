import { apiClient } from './config';
import axios from 'axios';

const BASE_URL = 'http://localhost:3055/v1/api';

export interface ProductAttribute {
  manufacturer: string;
  model: string;
  color: string;
}

export interface ProductShop {
  name: string;
  email: string;
}

export interface Product {
  _id: string;
  product_name: string;
  product_thumb: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_type: string;
  product_shop: ProductShop;
  product_attributes: ProductAttribute;
  product_images?: string[]; // Optional array of images
  product_colors?: string[]; // Optional array of colors
  product_sizes?: string[];  // Optional array of sizes
  stock_status?: 'in_stock' | 'out_of_stock';
  isDraft: boolean;
  isPublished: boolean;
  product_hot: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  message: string;
  code: number;
  metadata: Product | Product[]; // Metadata can be a single Product object or an array of Products
}

export const productService = {
  getPublishedProducts: async (): Promise<ProductsResponse> => {
    try {
      console.log('Fetching published products'); // For debugging
      const response = await apiClient.get('/product/published');
      return response.data;
    } catch (error) {
      console.error('Error fetching published products:', error);
      throw error;
    }
  },

  getProductById: async (productId: string): Promise<ProductsResponse> => {
    try {
      console.log(`Fetching product with ID ${productId}`); // For debugging
      const response = await apiClient.get(`/product/findOne/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${productId}:`, error);
      throw error;
    }
  },
  
  searchProductsByCategory: async (category: string): Promise<ProductsResponse> => {
    try {
      console.log(`Searching products for category ${category}`); // For debugging
      const response = await apiClient.get(`/product/search/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching products for category ${category}:`, error);
      throw error;
    }
  },
  
  getHotProducts: async (): Promise<ProductsResponse> => {
    try {
      console.log('Fetching hot products'); // For debugging
      
      // Lấy userId và accessToken từ localStorage
      const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userInfo') || '{}')._id;
      const accessToken = localStorage.getItem('accessToken');
      
      // Cấu hình headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (userId) {
        headers['x-client-id'] = userId;
      }
      
      if (accessToken) {
        headers['authorization'] = accessToken;
      }
      
      // Sử dụng axios trực tiếp nhưng vẫn thêm thông tin xác thực
      const response = await axios.get(`${BASE_URL}/product/hot`, { headers });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching hot products:', error);
      throw error;
    }
  },
  
  updateProduct: async (productId: string, productData: Partial<Product>): Promise<ProductsResponse> => {
    try {
      console.log(`Updating product with ID ${productId}`); // For debugging
      
      // Get authentication tokens
      const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userInfo') || '{}')._id;
      const accessToken = localStorage.getItem('accessToken');
      
      // Configure headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (userId) {
        headers['x-client-id'] = userId;
      }
      
      if (accessToken) {
        headers['authorization'] = accessToken;
      }
      
      // Send API request
      const response = await apiClient.patch(`/product/update/${productId}`, productData, { headers });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating product with ID ${productId}:`, error);
      throw error;
    }
  },
  
  unpublishProduct: async (productId: string): Promise<ProductsResponse> => {
    try {
      console.log(`Unpublishing product with ID ${productId}`); // For debugging
      
      // Get authentication tokens
      const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userInfo') || '{}')._id;
      const accessToken = localStorage.getItem('accessToken');
      
      // Configure headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (userId) {
        headers['x-client-id'] = userId;
      }
      
      if (accessToken) {
        headers['authorization'] = accessToken;
      }
      
      // Send API request
      const response = await apiClient.post(`/product/unpublished/${productId}`, {}, { headers });
      
      return response.data;
    } catch (error) {
      console.error(`Error unpublishing product with ID ${productId}:`, error);
      throw error;
    }
  }
}; 