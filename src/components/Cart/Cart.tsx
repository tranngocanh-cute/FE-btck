import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Checkbox,
  Avatar,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const { 
    cartItems, 
    cartCount, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    isLoading,
    updateQuantity
  } = useCart();

  // Tính tổng tiền
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Chuyển đổi giá từ string sang number (loại bỏ ký tự không phải số)
      const price = Number(item.price.replace(/[^\d]/g, ''));
      return total + price * item.quantity;
    }, 0);
  };

  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
    }).format(amount) + 'đ';
  };

  const total = calculateTotal();

  // Xử lý xóa sản phẩm
  const handleRemoveItem = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      await removeFromCart(id);
      showSnackbar('Đã xóa sản phẩm khỏi giỏ hàng');
    }
  };
  
  // Xử lý tăng số lượng
  const handleIncreaseQuantity = async (id: string, color: string) => {
    // Tìm sản phẩm cần tăng số lượng
    const item = cartItems.find(item => item.id === id && item.color === color);
    if (!item) return;

    const newQuantity = item.quantity + 1;
    
    // Gọi API cập nhật số lượng
    try {
      const success = await updateQuantity(id, newQuantity);
      if (success) {
        showSnackbar('Cập nhật số lượng thành công');
      } else {
        showSnackbar('Cập nhật thất bại, vui lòng thử lại');
      }
    } catch {
      showSnackbar('Đã xảy ra lỗi khi cập nhật giỏ hàng');
    }
  };
  
  // Xử lý giảm số lượng
  const handleDecreaseQuantity = async (id: string, color: string) => {
    // Tìm sản phẩm cần giảm số lượng
    const item = cartItems.find(item => item.id === id && item.color === color);
    if (!item || item.quantity <= 1) return;

    const newQuantity = item.quantity - 1;
    
    // Gọi API cập nhật số lượng
    try {
      const success = await updateQuantity(id, newQuantity);
      if (success) {
        showSnackbar('Cập nhật số lượng thành công');
      } else {
        showSnackbar('Cập nhật thất bại, vui lòng thử lại');
      }
    } catch {
      showSnackbar('Đã xảy ra lỗi khi cập nhật giỏ hàng');
    }
  };
  
  // Hiển thị thông báo
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  
  // Đóng thông báo
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Hàm xử lý khi nhấn nút Checkout
  const handleCheckout = () => {
    closeCart(); // Đóng giỏ hàng trước khi chuyển trang
    navigate('/checkout');
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={closeCart}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '450px' },
            backgroundColor: 'white',
            color: 'black',
            boxSizing: 'border-box',
            padding: 0,
          },
        }}
      >
        <Box className="cart-container">
          {/* Header */}
          <Box className="cart-header">
            <Typography variant="h6" fontWeight="bold">
              Your cart ({cartCount})
            </Typography>
            <IconButton onClick={closeCart}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          {/* Loading indicator */}
          {isLoading && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">Đang tải...</Typography>
            </Box>
          )}

          {/* Cart items */}
          <Box className="cart-items">
            {!isLoading && cartItems.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">Giỏ hàng trống</Typography>
              </Box>
            ) : (
              cartItems.map((item) => (
                <Box key={`${item.id}-${item.color}`} className="cart-item">
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Checkbox />
                    <Box sx={{ width: '80px', height: '80px', mr: 2 }}>
                      <Avatar 
                        variant="square"
                        src={item.image} 
                        alt={item.name} 
                        sx={{ width: '100%', height: '100%' }}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.colorName}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                        {item.price}
                      </Typography>
                    </Box>
                    {/* Nút xóa sản phẩm */}
                    <IconButton 
                      onClick={() => handleRemoveItem(item.id)}
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, ml: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDecreaseQuantity(item.id, item.color)}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 1, minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton size="small" onClick={() => handleIncreaseQuantity(item.id, item.color)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))
            )}
          </Box>

          {/* Cart footer */}
          {cartItems.length > 0 && (
            <Box className="cart-footer">
              <Box sx={{ px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">Total</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(total)}
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2, py: 1.5, borderRadius: 3 }}
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
      
      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Cart; 