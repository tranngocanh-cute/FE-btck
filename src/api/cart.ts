import { apiClient } from './config';

interface CartResponse {
  message: string;
  code: number;
  metadata: CartData;
}

interface CartData {
  _id: string;
  userId: string;
  status: string;
  products: CartProductItem[];
  modifiedOn: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CartProductItem {
  productId: string;
  shopId: string;
  quantity: number;
  name: string;
  price: number;
  thumb: string;
  product_attributes: {
    manufacturer: string;
    model: string;
    color: string;
  };
}

interface AddToCartResponse {
  message: string;
  code: number;
  metadata: CartData;
}

interface AddToCartRequest {
  productId: string;
  quantity: number;
}

interface DeleteCartItemResponse {
  message: string;
  code: number;
  metadata: CartData;
}

interface UpdateQuantityRequest {
  productId: string;
  quantity: number;
}

interface UpdateQuantityResponse {
  message: string;
  code: number;
  metadata: CartData;
}

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    try {
      // Get user ID and access token from localStorage
      const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userInfo') || '{}')._id;
      const accessToken = localStorage.getItem('accessToken');
      
      // Configure headers
      const headers: Record<string, string> = {};
      if (userId) {
        headers['x-client-id'] = userId;
      }
      if (accessToken) {
        headers['authorization'] = accessToken;
      }
      
      console.log('API Get Cart Headers:', headers);
      const response = await apiClient.get('/cart/getCart', { headers });
      console.log('Get Cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  addToCart: async (data: AddToCartRequest): Promise<AddToCartResponse> => {
    try {
      // Get user ID and access token from localStorage
      const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userInfo') || '{}')._id;
      const accessToken = localStorage.getItem('accessToken');
      
      // Configure headers
      const headers: Record<string, string> = {};
      if (userId) {
        headers['x-client-id'] = userId;
      }
      if (accessToken) {
        headers['authorization'] = accessToken;
      }
      
      console.log('API Add to Cart Headers:', headers);
      const response = await apiClient.post('/cart/addToCart', data, { headers });
      console.log('Add to Cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding product to cart:', error);
      throw error;
    }
  },
  
  deleteItem: async (productId: string): Promise<DeleteCartItemResponse> => {
    try {
      // Get user ID and access token from localStorage
      const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userInfo') || '{}')._id;
      const accessToken = localStorage.getItem('accessToken');
      
      // Configure headers
      const headers: Record<string, string> = {};
      if (userId) {
        headers['x-client-id'] = userId;
      }
      if (accessToken) {
        headers['authorization'] = accessToken;
      }
      
      console.log('API Delete Cart Item Headers:', headers);
      const response = await apiClient.delete(`/cart/deleteItem/${productId}`, { headers });
      console.log('Delete Cart Item response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting product from cart:', error);
      throw error;
    }
  },
  
  updateQuantity: async (data: UpdateQuantityRequest): Promise<UpdateQuantityResponse> => {
    try {
      // Get user ID and access token from localStorage
      const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userInfo') || '{}')._id;
      const accessToken = localStorage.getItem('accessToken');
      
      // Configure headers
      const headers: Record<string, string> = {};
      if (userId) {
        headers['x-client-id'] = userId;
      }
      if (accessToken) {
        headers['authorization'] = accessToken;
      }
      
      console.log('API Update Quantity Headers:', headers);
      const response = await apiClient.patch('/cart/updateQuantity', {
        productId: data.productId,
        quantity: data.quantity
      }, { headers });
      console.log('Update Quantity response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating product quantity:', error);
      throw error;
    }
  }
}; 