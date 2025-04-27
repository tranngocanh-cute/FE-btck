import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  IconButton, 
  Snackbar,
  Paper,
  Divider,
  Alert as MuiAlert,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import { 
  ShoppingCart, 
  Favorite, 
  Share, 
  Star,
  StarHalf,
  LocalShipping,
  VerifiedUser,
  Update
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import type { CartItem } from '../../context/CartContext';
import { productService, Product } from '../../api/product';
import './ProductDetail.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Carousel from 'react-material-ui-carousel';

// Create a simple fallback for motion.div if framer-motion is not available
const MotionBox = ({ children, style, ...props }: React.ComponentProps<typeof Box>) => {
  return (
    <Box 
      sx={{ 
        ...style, 
        opacity: 1, 
        transform: 'translateY(0)',
        transition: 'all 0.5s ease-out'
      }} 
      {...props}
    >
      {children}
    </Box>
  );
};

// Color name mapping for display purposes
const colorMap: Record<string, string> = {
  "#000000": "Black",
  "#FFFFFF": "White",
  "#6F8FAF": "Steel Blue",
};

// Sample recommended products
const recommendedProducts = [
  {
    id: '1',
    name: 'iPhone 13 Pro',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-pro-family-hero?wid=940&hei=1112&fmt=png-alpha&.v=1631220221000',
    price: 27990000,
  },
  {
    id: '2',
    name: 'AirPods Pro',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MWP22?wid=1144&hei=1144&fmt=jpeg&qlt=80&.v=1591634795000',
    price: 4990000,
  },
  {
    id: '3',
    name: 'Apple Watch Series 7',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKUQ3_VW_34FR+watch-45-alum-midnight-nc-7s_VW_34FR_WF_CO?wid=1400&hei=1400&trim=1%2C0&fmt=p-jpg&qlt=95&.v=1632171067000%2C1631661671000',
    price: 10990000,
  },
  {
    id: '4',
    name: 'MacBook Air',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-201810?wid=904&hei=840&fmt=jpeg&qlt=80&.v=1633027804000',
    price: 28990000,
  },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('Sản phẩm đã được thêm vào giỏ hàng!');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) {
        setError('Product ID not found.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await productService.getProductById(id!);
        // Check if metadata is an object (not an array)
        if (response.metadata && typeof response.metadata === 'object' && !Array.isArray(response.metadata)) {
          // Directly use the metadata object as the product
          const fetchedProduct = response.metadata as Product;
          setProduct(fetchedProduct);
          // Set initial selected color/size based on new fields
          if (fetchedProduct.product_colors && fetchedProduct.product_colors.length > 0) {
            setSelectedColor(fetchedProduct.product_colors[0]);
          } else if (fetchedProduct.product_attributes?.color) {
            // Use color from product_attributes if product_colors doesn't exist
            setSelectedColor(fetchedProduct.product_attributes.color);
          }
          
          if (fetchedProduct.product_sizes && fetchedProduct.product_sizes.length > 0) {
             setSelectedSize(fetchedProduct.product_sizes[0]);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleQuantityChange = (amount: number) => {
    const newQuantity = Math.max(1, quantity + amount);
    setQuantity(newQuantity);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Create the cart item
    const cartItem: CartItem = { 
      id: product._id, 
      name: product.product_name,
      fullName: product.product_name,
      price: product.product_price.toString(),
      image: product.product_images?.[selectedImageIndex] || product.product_thumb,
      color: selectedColor || product.product_colors?.[0] || '', 
      colorName: colorMap[selectedColor || product.product_colors?.[0] || ''] || 'Default',
      size: selectedSize || product.product_sizes?.[0] || '',
      quantity: quantity,
    };
    
    try {
      const result = await addToCart(cartItem);
      
      if (result.success) {
        setSnackbarMessage('Sản phẩm đã được thêm vào giỏ hàng!');
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage(result.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        setSnackbarSeverity('error');
      }
      
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setSnackbarMessage('Lỗi kết nối, vui lòng thử lại sau.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    // Create the cart item
    const cartItem: CartItem = { 
      id: product._id, 
      name: product.product_name,
      fullName: product.product_name,
      price: product.product_price.toString(),
      image: product.product_images?.[selectedImageIndex] || product.product_thumb,
      color: selectedColor || product.product_colors?.[0] || '', 
      colorName: colorMap[selectedColor || product.product_colors?.[0] || ''] || 'Default',
      size: selectedSize || product.product_sizes?.[0] || '',
      quantity: quantity,
    };
    
    try {
      // Truyền true cho skipOpenCart để không mở giỏ hàng
      const result = await addToCart(cartItem, true);
      
      if (result.success) {
        // Proceed to checkout
        navigate('/checkout');
      } else {
        // Show error
        setSnackbarMessage(result.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Failed to process buy now:", error);
      setSnackbarMessage('Lỗi kết nối, vui lòng thử lại sau.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Render Loading state
  if (loading) {
    return (
      <div className="product-detail-page">
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Box className="loading-spinner" sx={{ height: 80, width: 80 }}></Box>
        </Container>
      </div>
    );
  }

  // Render Error state
  if (error) {
    return (
      <div className="product-detail-page">
        <Container sx={{ textAlign: 'center', py: 5 }}>
          <MuiAlert severity="error">{error}</MuiAlert>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')} 
            sx={{ mt: 2, color: 'white', borderColor: 'white' }}
          >
            Quay về trang chủ
          </Button>
        </Container>
      </div>
    );
  }

  // Render Not Found state
  if (!product) {
    return (
      <div className="product-detail-page">
        <Container sx={{ textAlign: 'center', py: 5 }}>
          <MuiAlert severity="warning">Không tìm thấy sản phẩm.</MuiAlert>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')} 
            sx={{ mt: 2, color: 'white', borderColor: 'white' }}
          >
            Quay về trang chủ
          </Button>
        </Container>
      </div>
    );
  }
  
  // Use optional chaining and nullish coalescing for safety
  const productImages = product?.product_images ?? [product?.product_thumb].filter(Boolean) as string[];
  const productColors = product?.product_colors ?? [];
  const productSizes = product?.product_sizes ?? [];

  return (
    <div className="product-detail-page">
      <Container maxWidth="xl">
        {/* Main Product Section */}
        <Box className="product-detail-container" sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {/* Product Images */}
            <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(50% - 16px)' } }}>
              <Paper elevation={0} className="product-image-paper">
                <Carousel
                  className="product-carousel"
                  animation="fade"
                  interval={5000}
                  navButtonsAlwaysVisible
                  indicators={true}
                  navButtonsProps={{
                    style: {
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '50%',
                      color: 'white',
                      margin: '0 10px',
                      transition: 'background-color 0.3s ease'
                    }
                  }}
                  indicatorContainerProps={{
                    style: {
                      marginTop: '10px',
                      position: 'relative',
                      zIndex: 1
                    }
                  }}
                  indicatorIconButtonProps={{
                    style: {
                      color: 'rgba(255, 255, 255, 0.5)',
                      padding: '5px',
                      transition: 'color 0.3s ease'
                    }
                  }}
                  activeIndicatorIconButtonProps={{
                    style: {
                      color: '#2196f3'
                    }
                  }}
                >
                  {productImages.map((image, index) => (
                    <Box 
                      key={index}
                      className="product-image-container" 
                      sx={{ 
                        height: 400, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        p: 2 
                      }}
                    >
                      <img 
                        src={image} 
                        alt={`${product.product_name} ${index + 1}`} 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          objectFit: 'contain',
                          transition: 'transform 0.3s ease'
                        }} 
                      />
                    </Box>
                  ))}
                </Carousel>
                
                {productImages.length > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    overflowX: 'auto', 
                    p: 2, 
                    justifyContent: 'center',
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: '3px',
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.4)',
                      },
                    },
                  }}>
                    {productImages.map((img, index) => (
                      <Box 
                        key={index}
                        className={`product-thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                        sx={{
                          minWidth: 60,
                          height: 60,
                          borderRadius: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: index === selectedImageIndex ? '2px solid #2196f3' : '2px solid transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          }
                        }}
                        onClick={() => handleImageSelect(index)}
                      >
                        <img 
                          src={img} 
                          alt={`${product.product_name} ${index + 1}`} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }} 
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
            
            {/* Product Details */}
            <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(50% - 16px)' } }}>
              <Paper elevation={0} className="product-details-paper">
                <Box className="product-details-info">
                  <Typography variant="h4" component="h1" className="product-title" gutterBottom sx={{ textAlign: 'left' }}>
                    {product.product_name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <Box sx={{ display: 'flex', color: '#FFD700' }}>
                      <Star fontSize="small" />
                      <Star fontSize="small" />
                      <Star fontSize="small" />
                      <Star fontSize="small" />
                      <StarHalf fontSize="small" />
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      (142 đánh giá)
                    </Typography>
                    <Chip 
                      label={product.product_type} 
                      size="small" 
                      sx={{ 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        color: 'white',
                        fontWeight: 500,
                        ml: 'auto'
                      }} 
                    />
                  </Box>
                  
                  <Typography variant="h5" component="p" sx={{ fontWeight: 'bold', my: 2, color: '#2196f3', textAlign: 'left' }}>
                    {formatPrice(product.product_price)}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    {product.product_description || 'Không có mô tả'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShipping sx={{ color: '#4caf50' }} />
                      <Typography variant="body2">Giao hàng miễn phí</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VerifiedUser sx={{ color: '#2196f3' }} />
                      <Typography variant="body2">Bảo hành 12 tháng</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Update sx={{ color: '#ff9800' }} />
                      <Typography variant="body2">Đổi trả trong 30 ngày</Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  {/* Color Selection */}
                  {productColors.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Màu: {colorMap[selectedColor] || selectedColor}
                      </Typography>
                      <Box className="color-selector">
                        {productColors.map((color) => (
                          <Box
                            key={color}
                            className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                            sx={{
                              bgcolor: color,
                            }}
                            onClick={() => handleColorSelect(color)}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Size Selection */}
                  {productSizes.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Size: {selectedSize || 'Chọn kích thước'}
                      </Typography>
                      <Box className="size-selector">
                        {productSizes.map((size) => (
                          <Chip 
                            key={size}
                            label={size}
                            clickable
                            onClick={() => handleSizeSelect(size)}
                            sx={{ 
                              background: selectedSize === size ? 'rgba(33, 150, 243, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                              color: 'white',
                              borderColor: selectedSize === size ? '#2196f3' : 'transparent',
                              fontWeight: selectedSize === size ? 600 : 400,
                              '&:hover': {
                                background: selectedSize === size ? 'rgba(33, 150, 243, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Quantity */}
                  <Box sx={{ mb: 3 }}>
                    <Box className="quantity-selector">
                      <IconButton size="small" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography className="quantity-value">{quantity}</Typography>
                      <IconButton size="small" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.product_quantity}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {/* Action Buttons */}
                  <Box className="action-buttons">
                    <Button 
                      variant="contained" 
                      startIcon={<ShoppingCart />} 
                      onClick={handleAddToCart}
                      ref={buttonRef}
                      disabled={product.stock_status === 'out_of_stock'}
                      sx={{ flexGrow: 1 }}
                    >
                      Thêm vào giỏ hàng
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={handleBuyNow}
                      disabled={product.stock_status === 'out_of_stock'}
                      sx={{ flexGrow: 1 }}
                    >
                      Mua ngay
                    </Button>
                  </Box>
                  
                  {/* Social/Wishlist Icons */}
                  <Box className="social-actions">
                    <Button startIcon={<Favorite />}>Thêm vào danh sách yêu thích</Button>
                    <Button startIcon={<Share />}>Chia sẻ</Button>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* Recommended Products Section */}
        <Box className="product-detail-container" sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ 
            mb: 3, 
            color: 'white', 
            fontWeight: 600,
            textAlign: 'center'
          }}>
            Sản Phẩm Đề Xuất
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            justifyContent: 'center'
          }}>
            {recommendedProducts.map((product) => (
              <MotionBox
                key={product.id}
                style={{ flex: '1 1 200px', maxWidth: '280px' }}
              >
                <Card 
                  sx={{ 
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
                    }
                  }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={product.image}
                    alt={product.name}
                    sx={{ padding: 2, objectFit: 'contain' }}
                  />
                  <CardContent sx={{ p: 2, pt: 1 }}>
                    <Typography gutterBottom variant="body1" component="div" sx={{ color: 'white', fontWeight: 500 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                      {formatPrice(product.price)}
                    </Typography>
                  </CardContent>
                </Card>
              </MotionBox>
            ))}
          </Box>
        </Box>
      </Container>
      
      {/* Success Snackbar */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default ProductDetail; 