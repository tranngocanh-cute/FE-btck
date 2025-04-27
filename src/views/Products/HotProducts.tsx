import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Card, CardMedia, CardContent, 
  Button, Box, CircularProgress, Alert
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { productService, Product } from '../../api/product';
import './Products.css';

const HotProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load hot products when component mounts
  useEffect(() => {
    fetchHotProducts();
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  const fetchHotProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getHotProducts();
      
      if (Array.isArray(response.metadata)) {
        setProducts(response.metadata);
      } else {
        // Handle the case where metadata is a single product
        setProducts([response.metadata]);
      }
    } catch (err) {
      console.error('Failed to fetch hot products:', err);
      setError('Không thể tải danh sách sản phẩm nổi bật. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const getRandomCity = () => {
    const cities = [
      'TP. Hồ Chí Minh', 
      'TP. Hà Nội'
    ];
    return cities[Math.floor(Math.random() * cities.length)];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <LocalFireDepartmentIcon sx={{ color: 'error.main', mr: 1, fontSize: 32 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" color='#fff'> 
          Sản phẩm nổi bật
        </Typography>
      </Box>

      {products.length === 0 ? (
        <Alert severity="info">Hiện tại chưa có sản phẩm nổi bật.</Alert>
      ) : (
        <Box className="grid-container">
          {products.map((product) => (
            <Card 
              className="product-card"
              onClick={() => handleProductClick(product._id)}
              sx={{ 
                cursor: 'pointer',
                width: { xs: '100%', sm: '48%', md: '32%', lg: '25%', xl: '18%' },
                minWidth: '200px',
                maxWidth: '270px',
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'white',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.4s ease',
                position: 'relative',
                m: 0,
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.01)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                }
              }}
              key={product._id}
            >
              <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  image={product.product_thumb}
                  alt={product.product_name}
                  sx={{
                    height: 150,
                    objectFit: 'contain',
                    backgroundColor: '#f8f8f8',
                    padding: '8px',
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    backgroundColor: '#f44336',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    zIndex: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  HOT
                </Box>
              </Box>
              <CardContent sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'left',
                padding: '16px',
                backgroundColor: 'white',
                '&:last-child': { paddingBottom: '16px' }
              }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    mb: 1.5,
                    lineHeight: 1.3,
                    height: '2.6em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    color: '#333'
                  }}
                >
                  {product.product_name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                >
                  {product.product_description}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  mb: 1.5
                }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      color: '#e53935',
                      mb: 0.5
                    }}
                  >
                    {formatCurrency(product.product_price)} đ
                  </Typography>
                  {/* Nếu có giá gốc, bạn có thể thêm ở đây */}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#fff8e1',
                      color: '#ff8f00',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      mr: 1,
                      border: '1px solid #ffe082'
                    }}
                  >
                    <span style={{ marginRight: '2px' }}>★</span>
                    <span>5.0</span>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.7rem',
                      color: '#757575',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50',
                      marginRight: '4px'
                    }}></span>
                    {getRandomCity()}
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  mt: 'auto',
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: '12px'
                }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product._id);
                    }}
                    sx={{
                      textTransform: 'none',
                      backgroundColor: '#2196f3',
                      px: 1.5,
                      py: 0.5,
                      fontSize: '0.7rem',
                      borderRadius: '20px',
                      boxShadow: '0 2px 5px rgba(33,150,243,0.3)',
                      '&:hover': {
                        backgroundColor: '#1976d2',
                        boxShadow: '0 4px 8px rgba(33,150,243,0.4)'
                      }
                    }}
                  >
                    <ShoppingCartIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                    Xem chi tiết
                  </Button>
                  <Box
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      backgroundColor: '#e3f2fd',
                      color: '#1565c0',
                      padding: '4px 8px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid #bbdefb'
                    }}
                  >
                    SL: {product.product_quantity|| 2}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default HotProducts; 