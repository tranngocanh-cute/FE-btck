import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, Typography, Grid, Card, CardMedia, CardContent, 
  Button, Box, Pagination, Chip, CircularProgress, Alert
} from '@mui/material';
import './Products.css';
import { productService, Product } from '../../api/product';

// Fixed categories with images
const categories = [
  { 
    name: "IPHONE", 
    image: "https://placehold.co/300x300/ffffff/333333?text=iPhone&font=playfair", 
    displayName: "Iphone",
    imgElement: (
      <div className="category-image-container">
        <img 
          src="/images/iphone.png" 
          alt="iPhone" 
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/300x300/ffffff/333333?text=iPhone&font=playfair";
          }}
          className="category-image" 
        />
      </div>
    )
  },
  { 
    name: "IPAD", 
    image: "https://placehold.co/300x300/ffffff/333333?text=iPad&font=playfair", 
    displayName: "Ipad",
    imgElement: (
      <div className="category-image-container">
        <img 
          src="/images/ipad.png" 
          alt="iPad" 
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/300x300/ffffff/333333?text=iPad&font=playfair";
          }}
          className="category-image" 
        />
      </div>
    )
  },
  { 
    name: "MACBOOK", 
    image: "https://placehold.co/300x300/ffffff/333333?text=Macbook&font=playfair", 
    displayName: "Macbook",
    imgElement: (
      <div className="category-image-container">
        <img 
          src="/images/macbook.png" 
          alt="Macbook" 
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/300x300/ffffff/333333?text=Macbook&font=playfair";
          }}
          className="category-image" 
        />
      </div>
    )
  },
  { 
    name: "AIRPODS", 
    image: "https://placehold.co/300x300/ffffff/333333?text=Airpods&font=playfair", 
    displayName: "Airpods",
    imgElement: (
      <div className="category-image-container">
        <img 
          src="/images/airpods.png" 
          alt="Airpods" 
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/300x300/ffffff/333333?text=Airpods&font=playfair";
          }}
          className="category-image" 
        />
      </div>
    )
  }
];

const Products = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  // Determine the selected category
  const selectedCategory = category ? 
    categories.find(c => c.name.toLowerCase() === category.toLowerCase()) || null 
    : null;

  // Load products when component mounts or category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory.name);
    }
  }, [selectedCategory]);

  const fetchProductsByCategory = async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.searchProductsByCategory(category);
      if (Array.isArray(response.metadata)) {
        setProducts(response.metadata);
      } else {
        setProducts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching products for category ${category}:`, err);
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

  const handleCategoryClick = (category: string) => {
    navigate(`/products/${category.toLowerCase()}`);
    setPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Format price with Vietnamese currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="products">
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Danh mục sản phẩm
        </Typography>
        
        {/* Category Cards */}
        <Box sx={{ maxWidth: 1400, mx: 'auto', mb: 5 }}>
          <Grid container spacing={3} justifyContent="center">
            {categories.map((cat) => (
              <Grid item xs={12} sm={6} md={3} key={cat.name}>
                <Card 
                  className={`category-card ${selectedCategory === cat ? 'selected' : ''}`}
                  onClick={() => handleCategoryClick(cat.name)}
                  sx={{ 
                    cursor: 'pointer', 
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    transform: selectedCategory === cat ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: selectedCategory === cat ? '0 8px 16px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ py: 4 }}>
                    <Typography variant="h5" component="h3" fontWeight="bold">
                      {cat.displayName}
                    </Typography>
                    {cat.imgElement}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Product List Section */}
        <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 5 }}>
          {selectedCategory ? (
            <>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                Sản phẩm {selectedCategory.displayName}
              </Typography>
              
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
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Grid container spacing={3} justifyContent="center" sx={{ mx: 'auto' }}>
                      {displayedProducts.map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                          <Card 
                            className="product-card"
                            onClick={() => handleProductClick(product._id)}
                            sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
                          >
                            <CardMedia
                              component="img"
                              image={product.product_thumb || `https://placehold.co/300x200/333/fff?text=${encodeURIComponent(product.product_name)}`}
                              alt={product.product_name}
                              sx={{ height: 200, objectFit: 'contain' }}
                            />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {product.product_type}
                              </Typography>
                              <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                                {product.product_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: '40px' }}>
                                {product.product_description && product.product_description.length > 60 
                                  ? `${product.product_description.substring(0, 60)}...` 
                                  : product.product_description || 'Không có mô tả'}
                              </Typography>
                              <Typography variant="body1" color="text.primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                                {formatPrice(product.product_price)}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Chip 
                                  label={product.stock_status === 'in_stock' ? "Còn hàng" : "Hết hàng"} 
                                  color={product.stock_status === 'in_stock' ? "success" : "error"} 
                                  size="small" 
                                />
                                <Button 
                                  variant="contained" 
                                  color="primary" 
                                  size="small"
                                  disabled={product.stock_status !== 'in_stock'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductClick(product._id);
                                  }}
                                >
                                  Mua ngay
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
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
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          ) : (
            <Alert severity="info" sx={{ my: 5 }}>Vui lòng chọn một danh mục để xem sản phẩm</Alert>
          )}
        </Box>
      </Container>
    </div>
  );
};

export default Products; 