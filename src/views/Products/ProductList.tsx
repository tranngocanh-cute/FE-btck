import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Card, CardMedia, CardContent, 
  Button, Box, Pagination, CircularProgress, Alert
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './Products.css';
import { productService, Product } from '../../api/product';

// Fixed categories
const categoryMap = {
  "iphone": {
    name: "IPHONE",
    displayName: "iPhone"
  },
  "ipad": {
    name: "IPAD",
    displayName: "iPad"
  },
  "macbook": {
    name: "MACBOOK",
    displayName: "MacBook"
  },
  "airpods": {
    name: "AIRPODS",
    displayName: "AirPods"
  }
};

const ProductList = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  // Type safety for category lookup
  const safeCategory = category ? (categoryMap[category.toLowerCase() as keyof typeof categoryMap] || null) : null;

  // Load products when component mounts or category changes
  useEffect(() => {
    if (safeCategory) {
      fetchProductsByCategory(safeCategory.name);
    }
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [category]);

  const fetchProductsByCategory = async (categoryName: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.searchProductsByCategory(categoryName);
      if (Array.isArray(response.metadata)) {
        setProducts(response.metadata);
      } else {
        setProducts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching products for category ${categoryName}:`, err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Pagination
  const productsPerPage = 8;
  const pageCount = Math.ceil(products.length / productsPerPage);
  const displayedProducts = products.slice(
    (page - 1) * productsPerPage, 
    page * productsPerPage
  );

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="products" style={{ backgroundColor: '#f0f0f0' }}>
      <Container maxWidth="xl" sx={{ py: 6, px: { xs: 2, md: 4 } }}>
        {/* Product List Section */}
        {safeCategory ? (
          <>
            <Typography 
              variant="h3" 
              component="h1" 
              className="product-title"
              align="center"
              gutterBottom 
              sx={{ 
                mb: 4,
                color: '#2196f3',
                fontWeight: 'bold'
              }}
            >
              SẢN PHẨM {safeCategory.displayName}
            </Typography>
            
            <Box className="products-container">
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ my: 3 }}>{error}</Alert>
              ) : products.length === 0 ? (
                <Alert severity="info" sx={{ my: 3 }}>Không có sản phẩm nào trong danh mục này.</Alert>
              ) : (
                <>
                  {/* Products Grid */}
                  <Box className="grid-container" sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    width: '100%'
                  }}>
                    {displayedProducts.map((product) => (
                      <Card 
                        className="product-card"
                        onClick={() => handleProductClick(product._id)}
                        sx={{ 
                          cursor: 'pointer', 
                          width: { xs: '100%', sm: '46%', md: '31%', lg: '23%', xl: '15%' },
                          minWidth: '160px',
                          maxWidth: '230px',
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
                            image={product.product_thumb || `https://placehold.co/300x200/333/fff?text=${encodeURIComponent(product.product_name)}`}
                            alt={product.product_name}
                            sx={{ 
                              height: 180, 
                              objectFit: 'contain', 
                              backgroundColor: '#f8f8f8',
                              padding: '12px',
                              transition: 'transform 0.5s ease',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                          {/* Discount tag */}
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
                            -{Math.floor(Math.random() * 11) + 10}%
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
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.product_price)}
                            </Typography>
                            <Typography 
                              sx={{ 
                                textDecoration: 'line-through', 
                                color: '#9e9e9e', 
                                fontSize: '0.75rem'
                              }}
                            >
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(product.product_price * 1.15))}
                            </Typography>
                          </Box>
                          
                          {/* Rating and City */}
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
                              {Math.random() > 0.5 ? 'TP. Hồ Chí Minh' : 'TP. Hà Nội'}
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
                              SL: {product.product_quantity}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                  
                  {/* Pagination */}
                  {pageCount > 1 && (
                    <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                      <Pagination 
                        count={pageCount} 
                        page={page} 
                        onChange={handlePageChange} 
                        color="primary" 
                        size="large"
                        sx={{ '& .MuiPaginationItem-root': { color: 'white' } }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </>
        ) : (
          <Alert severity="warning" sx={{ my: 5 }}>Danh mục không hợp lệ. Vui lòng chọn một danh mục khác.</Alert>
        )}
      </Container>
    </div>
  );
};

export default ProductList; 