import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
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
                <StepLabel color='#fff'>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 && (
            <div className="checkout-grid">
              {/* Left Side - Cart Items */}
              <div className="checkout-grid-item checkout-summary">
                <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" component="h2" gutterBottom className="order-summary-title">
                    Đơn hàng của bạn
                  </Typography>
                  <List sx={{ mb: 2 }}>
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.color}-${item.size}`} className="cart-item">
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar
                              alt={item.name}
                              src={item.image}
                              variant="rounded"
                              sx={{ width: 64, height: 64 }}
                              className="item-image"
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={item.fullName}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="rgba(255, 255, 255, 0.7)">
                                  {`Màu: ${item.colorName}, Size: ${item.size}`}<br />
                                  {`Số lượng: ${item.quantity}`}<br />
                                  {formatPrice(parseFloat(item.price) * item.quantity)}
                                </Typography>
                              </React.Fragment>
                            }
                            sx={{ ml: 1 }}
                          />
                        </ListItem>
                      </div>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ py: 1 }}>
                    <div className="summary-row">
                      <Typography variant="body1">Tạm tính</Typography>
                      <Typography variant="body1">{formatPrice(subtotal)}</Typography>
                    </div>
                  </Box>
                  <Box sx={{ py: 1 }}>
                    <div className="summary-row">
                      <Typography variant="body1">Phí vận chuyển</Typography>
                      <Typography variant="body1">{formatPrice(shippingFee)}</Typography>
                    </div>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ py: 1 }}>
                    <div className="summary-row">
                      <Typography variant="body1" className="order-total">Tổng cộng</Typography>
                      <Typography variant="body1" className="order-total">{formatPrice(total)}</Typography>
                    </div>
                  </Box>
                </Paper>
              </div>
              
              {/* Right Side - Shipping Information */}
              <div className="checkout-grid-item checkout-form">
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom className="shipping-info-title">
                    Thông tin giao hàng
                  </Typography>
                  <Box component="form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                      <div className="form-grid-item half">
                        <TextField
                          required
                          id="name"
                          name="name"
                          label="Họ tên"
                          fullWidth
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-grid-item half">
                        <TextField
                          required
                          id="email"
                          name="email"
                          label="Email"
                          fullWidth
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-grid-item full">
                        <TextField
                          required
                          id="phone"
                          name="phone"
                          label="Số điện thoại"
                          fullWidth
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-grid-item full">
                        <TextField
                          required
                          id="address"
                          name="address"
                          label="Địa chỉ"
                          fullWidth
                          autoComplete="street-address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-grid-item half">
                        <TextField
                          required
                          id="city"
                          name="city"
                          label="Thành phố"
                          fullWidth
                          autoComplete="address-level2"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-grid-item half">
                        <TextField
                          required
                          id="zipCode"
                          name="zipCode"
                          label="Mã bưu điện"
                          fullWidth
                          autoComplete="postal-code"
                          value={formData.zipCode}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-grid-item full">
                        <TextField
                          id="note"
                          name="note"
                          label="Ghi chú đơn hàng"
                          fullWidth
                          multiline
                          rows={4}
                          value={formData.note}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-grid-item full">
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          fullWidth
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận đặt hàng'}
                        </Button>
                      </div>
                    </div>
                  </Box>
                </Paper>
              </div>
            </div>
          )}
          
          {activeStep === 1 && orderInfo && (
            <Box textAlign="center" className="success-animation">
              <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', width: 80, height: 80, mb: 2 }}>
                    <span className="success-icon">✓</span>
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    Cảm ơn bạn đã đặt hàng!
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
                  </Typography>
                  
                  {emailSent && (
                    <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
                      Email xác nhận đã được gửi đến địa chỉ {orderInfo.shippingInfo.email}
                    </Alert>
                  )}
                  
                  <Divider sx={{ width: '100%', my: 3 }} />
                  
                  <Box sx={{ width: '100%', mb: 3 }}>
                    <Typography variant="h6" gutterBottom className="order-summary-title">
                      Thông tin đơn hàng
                    </Typography>
                    
                    <div className="confirmation-grid">
                      <div className="confirmation-grid-item">
                        <Typography variant="subtitle1" gutterBottom>
                          Thông tin giao hàng
                        </Typography>
                        <Typography variant="body2">
                          {orderInfo.shippingInfo.name}<br />
                          {orderInfo.shippingInfo.email}<br />
                          {orderInfo.shippingInfo.phone}<br />
                          {orderInfo.shippingInfo.address}<br />
                          {orderInfo.shippingInfo.city}, {orderInfo.shippingInfo.zipCode}
                        </Typography>
                      </div>
                      <div className="confirmation-grid-item">
                        <Typography variant="subtitle1" gutterBottom>
                          Chi tiết thanh toán
                        </Typography>
                        <Typography variant="body2">
                          Tổng tiền: {formatPrice(orderInfo.totalAmount)}<br />
                          Số lượng: {orderInfo.itemCount} sản phẩm<br />
                          Phương thức thanh toán: Thanh toán khi nhận hàng
                        </Typography>
                      </div>
                    </div>
                  </Box>
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/')}
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Box>
              </Paper>
            </Box>
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