import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { cartService } from '../api/cart';

// Định nghĩa kiểu dữ liệu cho sản phẩm từ API
interface ApiCartItem {
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

// Định nghĩa kiểu dữ liệu cho sản phẩm trong giỏ hàng - Make sure this is exported
export interface CartItem {
  id: string;
  name: string;
  fullName: string;
  price: string;
  image: string;
  color: string;
  colorName: string;
  quantity: number;
  size?: string;
}

// Định nghĩa kiểu dữ liệu cho context
interface CartContextType {
  cartItems: CartItem[];
  cart: CartItem[]; // Alias for cartItems to match with Checkout component
  cartCount: number;
  isCartOpen: boolean;
  addToCart: (item: CartItem, skipOpenCart?: boolean) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (id: string) => Promise<void>;
  increaseQuantity: (id: string, color: string) => void;
  decreaseQuantity: (id: string, color: string) => void;
  updateQuantity: (id: string, quantity: number) => Promise<boolean>;
  toggleCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;
  clearCart: () => void; // Add clearCart function
  isLoading: boolean;
}

// Tạo context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook để sử dụng context - Exported
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Chuyển đổi từ dữ liệu API sang CartItem
  const mapApiCartItemToCartItem = (apiItem: ApiCartItem): CartItem => {
    return {
      id: apiItem.productId,
      name: apiItem.name,
      fullName: apiItem.name,
      price: apiItem.price.toString(),
      image: apiItem.thumb,
      color: apiItem.product_attributes.color || '',
      colorName: apiItem.product_attributes.color || 'Default',
      quantity: apiItem.quantity
    };
  };

  // Fetch giỏ hàng từ API
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartService.getCart();
      
      if (response.metadata && response.metadata.products) {
        // Chuyển đổi dữ liệu API sang định dạng CartItem
        const cartItems = response.metadata.products.map(mapApiCartItemToCartItem);
        setCartItems(cartItems);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tải giỏ hàng khi component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCart();
    }
  }, []);

  const addToCart = async (item: CartItem, skipOpenCart?: boolean) => {
    try {
      // Gọi API thêm vào giỏ hàng
      await cartService.addToCart({
        productId: item.id,
        quantity: item.quantity
      });
      
      // Fetch lại giỏ hàng sau khi thêm thành công
      await fetchCart();
      
      // Chỉ mở giỏ hàng khi thêm sản phẩm mới nếu không có skipOpenCart
      if (!skipOpenCart) {
        setIsCartOpen(true);
      }
      
      // Return success with no error message
      return { success: true };
    } catch (error: unknown) {
      console.error("Failed to add item to cart:", error);
      
      // Get error message from API response if available
      let errorMessage = 'Không thể thêm sản phẩm vào giỏ hàng';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as { data?: { message?: string } };
        if (errorResponse.data?.message) {
          errorMessage = errorResponse.data.message;
        }
      }
      
      // Return error with message
      return { success: false, message: errorMessage };
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      setIsLoading(true);
      // Gọi API xóa sản phẩm khỏi giỏ hàng
      await cartService.deleteItem(id);
      
      // Fetch lại giỏ hàng sau khi xóa thành công
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      // Cập nhật local state trong trường hợp lỗi
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const increaseQuantity = (id: string, color: string) => {
    // Tìm sản phẩm cần tăng số lượng
    const item = cartItems.find(item => item.id === id && item.color === color);
    if (!item) return;

    const newQuantity = item.quantity + 1;
    
    // Cập nhật UI ngay lập tức để phản hồi nhanh với người dùng
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.color === color
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
    
    // Sau đó gọi API để cập nhật trên server
    cartService.updateQuantity({
      productId: id,
      quantity: newQuantity
    }).catch(error => {
      console.error("Failed to update quantity:", error);
      // Nếu có lỗi, fetch lại giỏ hàng để đồng bộ dữ liệu
      fetchCart();
    });
  };

  const decreaseQuantity = (id: string, color: string) => {
    // Tìm sản phẩm cần giảm số lượng
    const item = cartItems.find(item => item.id === id && item.color === color);
    if (!item || item.quantity <= 1) return;

    const newQuantity = item.quantity - 1;
    
    // Cập nhật UI ngay lập tức để phản hồi nhanh với người dùng
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.color === color && item.quantity > 1
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
    
    // Sau đó gọi API để cập nhật trên server
    cartService.updateQuantity({
      productId: id,
      quantity: newQuantity
    }).catch(error => {
      console.error("Failed to update quantity:", error);
      // Nếu có lỗi, fetch lại giỏ hàng để đồng bộ dữ liệu
      fetchCart();
    });
  };

  const updateQuantity = async (id: string, quantity: number): Promise<boolean> => {
    try {
      // Gọi API cập nhật số lượng sản phẩm
      await cartService.updateQuantity({
        productId: id,
        quantity: quantity
      });
      
      // Fetch lại giỏ hàng sau khi cập nhật thành công
      await fetchCart();
      
      return true;
    } catch (error) {
      console.error("Failed to update quantity:", error);
      return false;
    }
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const clearCart = () => {
    setCartItems([]);
    setIsCartOpen(false);
  };

  const value = {
    cartItems,
    cart: cartItems,
    cartCount,
    isCartOpen,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    toggleCart,
    closeCart,
    fetchCart,
    clearCart,
    isLoading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext; 