import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Divider,
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { apiClient } from '../../api/config';
import './Checkout.css';

interface CartItem {
  id: string;
  name: string;
  fullName: string;
  price: string;
  image: string;
  color: string;
  colorName: string;
  size: string;
  quantity: number;
}

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  note: string;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

interface OrderInfo {
  totalAmount: number;
  itemCount: number;
  shippingInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    note: string;
  };
}

interface OrderResponse {
  message: string;
  metadata: {
    success: boolean;
    message: string;
    orderInfo: OrderInfo;
    emailSent: boolean;
  };
}

// Extend CartContextType to include needed properties
interface ExtendedCartContext {
  cart: CartItem[];
  clearCart: () => void;
  cartCount: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cart, clearCart } = useCart() as ExtendedCartContext; // Type casting
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    note: ''
  });

  // Verify authenticated user and cart has items
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin', { state: { from: '/checkout' } });
    }
    
    if (cart.length === 0) {
      navigate('/');
    }
  }, [isAuthenticated, cart, navigate]);

  // Calculate total price
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  const shippingFee = 50000; // Phí vận chuyển cố định (50,000 VND)
  const subtotal = calculateSubtotal();
  const total = subtotal + shippingFee;

  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('Vui lòng đăng nhập để tiếp tục thanh toán');
      return;
    }
    
    if (cart.length === 0) {
      setError('Giỏ hàng của bạn đang trống');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Extract product IDs from cart
      const productIds = cart.map((item: CartItem) => item.id);
      
      // Create checkout payload
      const checkoutData = {
        productIds,
        ...formData
      };
      
      // Get user ID and token
      const userId = localStorage.getItem('userId');
      const accessToken = localStorage.getItem('accessToken');
      
      if (!userId || !accessToken) {
        throw new Error('Thông tin xác thực không hợp lệ');
      }
      
      // Make API request
      const response = await apiClient.post('/cart/checkout', checkoutData, {
        headers: {
          'x-client-id': userId,
          'authorization': accessToken
        }
      });
      
      console.log('Checkout response:', response);
      
      // Xử lý response API
      const orderResponse = response.data as OrderResponse;
      
      if (orderResponse.metadata?.success) {
        // Lưu thông tin đơn hàng
        setOrderInfo(orderResponse.metadata.orderInfo);
        setEmailSent(orderResponse.metadata.emailSent);
        
        // Advance to next step
        setActiveStep(1);
        
        // Clear cart after successful order
        clearCart();
      } else {
        throw new Error('Đặt hàng không thành công');
      }
      
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      
      // Type guard to handle error response safely
      const errorResponse = err as ErrorResponse;
      setError(errorResponse.response?.data?.message || errorResponse.message || 'Có lỗi xảy ra khi xử lý đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Handle error snackbar close
  const handleCloseSnackbar = () => {
    setError(null);
  };

  // Steps for the checkout process
  const steps = ['Thông tin thanh toán', 'Xác nhận đơn hàng'];

  return (
    <div className="checkout-page">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom className="page-title">
            Thanh toán
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 && (
            <Grid container spacing={4}>
              {/* Left Side - Cart Items */}
              <Grid item xs={12} md={5} lg={4}>
                <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Tóm tắt đơn hàng
                  </Typography>
                  
                  <List sx={{ mb: 2 }}>
                    {cart.map((item) => (
                      <ListItem key={item.id} alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar 
                            alt={item.name} 
                            src={item.image} 
                            variant="square"
                            sx={{ width: 60, height: 60, mr: 2 }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {formatPrice(parseFloat(item.price))}
                              </Typography>
                              {' x ' + item.quantity}
                              {item.color && <span> - Màu: {item.colorName}</span>}
                              {item.size && <span> - Size: {item.size}</span>}
                            </>
                          }
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatPrice(parseFloat(item.price) * item.quantity)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Tạm tính:</Typography>
                    <Typography variant="body1">{formatPrice(subtotal)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Phí vận chuyển:</Typography>
                    <Typography variant="body1">{formatPrice(shippingFee)}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Tổng cộng:</Typography>
                    <Typography variant="h6" color="primary.main">{formatPrice(total)}</Typography>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Right Side - Checkout Form */}
              <Grid item xs={12} md={7} lg={8}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin giao hàng
                  </Typography>
                  
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Họ và tên"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Số điện thoại"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Địa chỉ giao hàng"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Thành phố"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Mã bưu điện"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Ghi chú đơn hàng"
                          name="note"
                          multiline
                          rows={3}
                          value={formData.note}
                          onChange={handleChange}
                          placeholder="Thông tin thêm về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          fullWidth
                          disabled={loading}
                          sx={{ mt: 2, py: 1.5, borderRadius: '8px' }}
                        >
                          {loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Xác nhận đặt hàng'
                          )}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Order Confirmation Step */}
          {activeStep === 1 && (
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" component="h2" gutterBottom color="success.main">
                  Đặt hàng thành công!
                </Typography>
                
                <Typography variant="body1" paragraph>
                  Cảm ơn bạn đã đặt hàng tại Apple Store. Đơn hàng của bạn đã được xác nhận.
                </Typography>
                
                {orderInfo && (
                  <Box sx={{ my: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1, width: '100%' }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Tổng tiền:</strong> {formatPrice(orderInfo.totalAmount)}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Số lượng sản phẩm:</strong> {orderInfo.itemCount}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                      Thông tin giao hàng:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {orderInfo.shippingInfo.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Email: {orderInfo.shippingInfo.email}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Điện thoại: {orderInfo.shippingInfo.phone}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Địa chỉ: {orderInfo.shippingInfo.address}, {orderInfo.shippingInfo.city}, {orderInfo.shippingInfo.zipCode}
                    </Typography>
                    {orderInfo.shippingInfo.note && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Ghi chú: {orderInfo.shippingInfo.note}
                      </Typography>
                    )}
                  </Box>
                )}
                
                <Typography variant="body2" paragraph sx={{ color: emailSent ? 'success.main' : 'text.secondary' }}>
                  {emailSent 
                    ? 'Email xác nhận đơn hàng đã được gửi đến địa chỉ email của bạn.' 
                    : 'Chúng tôi sẽ gửi email xác nhận đơn hàng và thông tin vận chuyển đến địa chỉ email của bạn.'}
                </Typography>
                
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
      
      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Checkout; 