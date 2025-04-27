import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardMedia, CardContent, Button, Box, Snackbar, Alert, CircularProgress, Paper } from '@mui/material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Carousel from 'react-material-ui-carousel';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../../context/AuthContext';
import { productService, Product } from '../../api/product';
import './Home.css';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface LocationState {
  loginSuccess?: boolean;
  signupSuccess?: boolean;
}

interface BannerItem {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'info' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [discountRates, setDiscountRates] = useState<Record<string, number>>({});

  const bannerItems: BannerItem[] = [
    {
      id: 1,
      image: 'https://i0.wp.com/blog.ugreen.com/wp-content/uploads/2020/10/iphone-12-banner-1.png?fit=1140%2C680&ssl=1',
      title: 'iPhone 15 Pro',
      description: 'Trải nghiệm điện thoại cao cấp với công nghệ đỉnh cao',
      buttonText: 'Mua ngay',
      buttonLink: '/products/iphone'
    },
    {
      id: 2,
      image: 'https://tiendung.vn/images/product/iphone-16/2024-Banner-apple-iphone-16-pro.jpg?1725963330231',
      title: 'iPad Pro',
      description: 'Mạnh mẽ và linh hoạt, iPad Pro mới với chip M2',
      buttonText: 'Khám phá',
      buttonLink: '/products/ipad'
    },
    {
      id: 3,
      image: 'https://applescoop.org/image/story/iphone-18-rumors-variable-aperture-lenses-for-pro-models-applescoop-2024-11-09-13-23-19.jpg',
      title: 'MacBook Air',
      description: 'Mỏng nhẹ và mạnh mẽ với thời lượng pin cả ngày',
      buttonText: 'Tìm hiểu thêm',
      buttonLink: '/products/macbook'
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getPublishedProducts();
        if (response.metadata) {
          const productsData = Array.isArray(response.metadata) 
            ? response.metadata 
            : [response.metadata];
          
          // Tạo discount rate cho mỗi sản phẩm
          const discounts: Record<string, number> = {};
          productsData.forEach(product => {
            // Random từ 10 đến 20
            discounts[product._id] = Math.floor(Math.random() * 11) + 10;
          });
          
          setDiscountRates(discounts);
          setProducts(productsData);
        } else {
          setProducts([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const state = location.state as LocationState;
    
    if (state?.loginSuccess && user) {
      setNotification({
        show: true,
        message: `Đăng nhập thành công! Chào mừng ${user.name || 'bạn'} quay trở lại.`,
        type: 'success'
      });
      window.history.replaceState({}, document.title);
    } else if (state?.signupSuccess && user) {
      setNotification({
        show: true,
        message: `Đăng ký thành công! Chào mừng ${user.name || 'bạn'} đến với Apple Store.`,
        type: 'success'
      });
      window.history.replaceState({}, document.title);
    }
  }, [location, user]);

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      show: false
    });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleBannerButtonClick = (link: string) => {
    navigate(link);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getRandomCity = () => {
    const cities = [
      'TP. Hồ Chí Minh', 
      'TP. Hà Nội'
    ];
    return cities[Math.floor(Math.random() * cities.length)];
  };

  return (
    <div className="home" style={{ width: '100%', maxWidth: '100%' }}>
      <div className="banner-slider">
        <Carousel
          animation="fade"
          autoPlay
          indicators
          navButtonsAlwaysVisible
          interval={6000}
          duration={1000}
          swipe
          sx={{ width: '100%' }}
        >
          {bannerItems.map((item) => (
            <div key={item.id} className="banner-item">
              <Box 
                sx={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '500px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <Container maxWidth="md">
                  <Box className="banner-content" sx={{ textAlign: 'center', color: 'white' }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
                      {item.description}
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      onClick={() => handleBannerButtonClick(item.buttonLink)}
                      className="banner-button"
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 10px rgba(0, 0, 0, 0.3)'
                        }
                      }}
                    >
                      {item.buttonText}
                    </Button>
                  </Box>
                </Container>
              </Box>
            </div>
          ))}
        </Carousel>
      </div>

      <div className="featured-products-section">
        <Container maxWidth="xl" sx={{ py: 8, px: { xs: 3, md: 4 } }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            align="center" 
            className="featured-products-title"
            sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <LocalFireDepartmentIcon className="fire-icon" sx={{ mr: 1 }} />
            DANH SÁCH SẢN PHẨM
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 3 }}>{error}</Alert>
          ) : products.length === 0 ? (
            <Alert severity="info" sx={{ my: 3 }}>Không có sản phẩm nào.</Alert>
          ) : (
            <Box 
              sx={{ 
                width: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                margin: '-12px'
              }}
            >
              {products.map((product) => (
                <Box
                  key={product._id}
                  sx={{
                    width: {
                      xs: '100%',
                      sm: '50%',
                      md: '33.33%',
                      lg: '20%',
                      xl: '16.66%'
                    },
                    padding: '12px',
                    boxSizing: 'border-box'
                  }}
                >
                  <Card 
                    className="featured-product-card"
                    onClick={() => handleProductClick(product._id)}
                    sx={{ 
                      width: '100%',
                      cursor: 'pointer', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={product.product_thumb || `https://placehold.co/300x200/333/fff?text=${encodeURIComponent(product.product_name)}`}
                        alt={product.product_name}
                        sx={{ 
                          height: 180, 
                          objectFit: 'contain', 
                          backgroundColor: '#f5f5f5',
                          padding: '8px'
                        }}
                      />
                      {/* Discount tag */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          backgroundColor: 'error.main',
                          color: 'white',
                          fontWeight: 'bold',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem'
                        }}
                      >
                        -{discountRates[product._id] || 15}%
                      </Box>
                    </Box>
                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start', 
                        textAlign: 'left', 
                        padding: '12px',
                        '&:last-child': { paddingBottom: '12px' }
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontSize: '0.9rem',
                          fontWeight: 600, 
                          mb: 1, 
                          lineHeight: 1.2,
                          height: '2.4em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {product.product_name}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'flex-start', 
                        mb: 1 
                      }}>
                        <Typography 
                          variant="h6" 
                          color="error.main" 
                          sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.95rem',
                            mb: 0.5
                          }}
                        >
                          {formatPrice(product.product_price)}
                        </Typography>
                        <Typography 
                          sx={{ 
                            textDecoration: 'line-through', 
                            color: 'text.secondary',
                            fontSize: '0.8rem'
                          }}
                        >
                          {formatPrice(Math.round(product.product_price * (1 + discountRates[product._id] / 100) || 1.15))}
                        </Typography>
                      </Box>
                      
                      {/* Rating */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            backgroundColor: '#fff9c4', 
                            px: 0.5,
                            mr: 1, 
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            color: '#ff8f00',
                            fontSize: '0.7rem'
                          }}
                        >
                          5.0
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          {getRandomCity()}
                        </Typography>
                      </Box>
                      
                      {/* Conditional Rendering based on stock_status */}
                      {product.stock_status === 'out_of_stock' ? (
                        <Typography 
                          variant="button" 
                          color="error" 
                          sx={{ fontWeight: 'bold', mt: 'auto', fontSize: '0.8rem' }}
                        >
                          Hết hàng
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 'auto' }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product._id);
                            }}
                            className="featured-product-button"
                            sx={{ 
                              textTransform: 'none', 
                              backgroundColor: '#1976d2',
                              px: 1,
                              py: 0.5,
                              fontSize: '0.7rem',
                              '&:hover': {
                                backgroundColor: '#1565c0'
                              }
                            }}
                          >
                            <ShoppingCartIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                            Xem chi tiết
                          </Button>
                          <Typography 
                            variant="body2" 
                            className="product-quantity"
                            sx={{ fontSize: '0.7rem' }}
                          >
                            {product.product_quantity}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </div>

      <Box 
        className="hot-products-section"
        sx={{ 
          py: 5, 
          backgroundImage: 'url("https://4kwallpapers.com/images/walls/thumbs_2t/11375.jpg")',
        }}
      >
        <Container maxWidth="lg" className="hot-products-content">
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 4 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }} className="hot-products-title">
              <LocalFireDepartmentIcon 
                className="fire-icon" 
                sx={{ 
                  fontSize: '2.5rem',
                  color: '#ff4500',
                  animation: 'flicker 1.5s infinite alternate',
                  filter: 'drop-shadow(0 0 5px #ff4500)',
                  marginRight: '10px'
                }} 
              />
              <Typography variant="h4" component="h2" fontWeight="bold">
                Sản phẩm nổi bật
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              className="hot-product-button"
              component={Link} 
              to="/hot-products"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: '30px', px: 3 }}
            >
              Xem tất cả
            </Button>
          </Box>
          <Typography variant="subtitle1" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.8)' }}>
            Khám phá các sản phẩm được ưa chuộng nhất với ưu đãi đặc biệt
          </Typography>
          
          {/* Hot products promo image */}
          <Paper 
            elevation={0}
            className="hot-product-card"
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <Box sx={{ flex: 1, p: 3 }}>
              <Typography 
                variant="h3" 
                component="h3" 
                fontWeight="bold" 
                sx={{ 
                  background: 'linear-gradient(45deg, #ff4500, #ff7800)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 2
                }}
              >
                Sản phẩm HOT
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 3 }}>
                Khám phá ngay các sản phẩm đang được săn đón nhiều nhất hiện nay!
              </Typography>
              <Button 
                variant="contained"
                className="hot-product-button"
                size="large"
                component={Link}
                to="/hot-products"
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: '30px', px: 3 }}
              >
                Khám phá ngay
              </Button>
            </Box>
            <Box 
              sx={{ 
                flex: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                p: 2 
              }}
            >
              <img 
                src="https://vnmedia.vn/file/8a10a0d36ccebc89016ce0c6fa3e1b83/072023/macbook_205_inch_20230724105159.jpg" 
                alt="Hot Products"
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '10px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                  transform: 'perspective(1000px) rotateY(-5deg)',
                  transition: 'transform 0.5s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg)';
                }}
              />
            </Box>
          </Paper>
        </Container>
      </Box>

      <div className="cta-section">
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Đăng ký nhận thông tin ưu đãi
          </Typography>
          <Typography variant="body1" paragraph>
            Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
          </Typography>
          <Button variant="contained" color="primary" size="large">
            Đăng ký ngay
          </Button>
        </Container>
      </div>

      <Snackbar
        open={notification.show}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;