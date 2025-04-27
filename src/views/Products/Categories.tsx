import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Box, Typography, Container, useTheme, useMediaQuery, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './Products.css';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const categories = [
    {
      id: 'iphone',
      displayName: 'iPhone',
      description: 'Trải nghiệm công nghệ đỉnh cao với bộ sưu tập iPhone. Thiết kế sang trọng, hiệu năng mạnh mẽ và camera chuyên nghiệp.',
      specs: ['Chip A16 Bionic', 'Camera 48MP', 'Dynamic Island', 'Màn hình Super Retina XDR'],
      price: 'Từ 22.990.000₫',
      fallbackUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-card-40-iphone15prohero-202309?wid=680&hei=528&fmt=p-jpg&qlt=95&.v=1693086290312'
    },
    {
      id: 'ipad',
      displayName: 'iPad',
      description: 'Sức mạnh ấn tượng với chip M2, màn hình Liquid Retina tuyệt đẹp và đa dạng tính năng sáng tạo cho công việc và giải trí.',
      specs: ['Chip M2', 'Màn hình Liquid Retina', 'Apple Pencil', 'iPadOS mới nhất'],
      price: 'Từ 16.990.000₫',
      fallbackUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-card-40-pro-202210?wid=680&hei=528&fmt=p-jpg&qlt=95&.v=1664578794100'
    },
    {
      id: 'macbook',
      displayName: 'Macbook',
      description: 'Hiệu năng vượt trội với thời lượng pin cả ngày, màn hình Retina sắc nét và sự mượt mà của hệ sinh thái Apple.',
      specs: ['Chip M3 Pro/Max', 'Màn hình Liquid Retina XDR', 'Pin lên đến 22 giờ', 'macOS mới nhất'],
      price: 'Từ 32.990.000₫',
      fallbackUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-14-m3-pro-silver-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697230830112'
    },
    {
      id: 'airpods',
      displayName: 'AirPods',
      description: 'Âm thanh đỉnh cao với công nghệ khử tiếng ồn chủ động, chế độ trong suốt và trải nghiệm âm thanh không dây hoàn hảo.',
      specs: ['Chống ồn chủ động', 'Chế độ trong suốt', 'Âm thanh không gian', 'Chống nước IPX4'],
      price: 'Từ 4.390.000₫',
      fallbackUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-card-40-airpods-202209?wid=680&hei=528&fmt=p-jpg&qlt=95&.v=1661016986712'
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCategoryClick = (category: string) => {
    navigate(`/products/${category}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  // Card component to maintain consistency
  const CategoryCard = ({ category, cardClassName, titleVariant }: { 
    category: (typeof categories)[number], 
    cardClassName: string,
    titleVariant: "h3" | "h4" | "h5"
  }) => {
    // Special styling for each card
    const isIPhone = category.id === 'iphone';
    const isIPad = category.id === 'ipad';
    const isMacbook = category.id === 'macbook';
    const isAirPods = category.id === 'airpods';
    
    const cardStyle = {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: isIPhone ? 'rgba(0, 0, 0, 0.6)' : (
          isIPad || isMacbook || isAirPods ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)'
        ),
        zIndex: 1
      },
    };

    return (
    <Paper
      className={`category-card ${cardClassName}`}
      onClick={() => handleCategoryClick(category.id)}
      elevation={5}
      sx={{
        ...cardStyle,
        background: isIPhone || isIPad || isMacbook || isAirPods
          ? 'transparent'
          : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease-in-out',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          background: isIPhone || isIPad || isMacbook || isAirPods
            ? 'transparent'
            : 'rgba(255, 255, 255, 0.95)',
        }
      }}
    >
      {/* iPhone special background */}
      {isIPhone && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("https://media.vneconomy.vn/w800/images/upload/2024/09/10/apple-iphone-16-pro-series.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1
            }
          }} 
        />
      )}

      {/* iPad special background */}
      {isIPad && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("https://www.macworld.com/wp-content/uploads/2024/10/2024-iPad-mini-8.jpg?quality=50&strip=all")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1
            }
          }} 
        />
      )}

      {/* Macbook special background */}
      {isMacbook && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("https://store.bellestoreinc.com/wp-content/uploads/2024/11/MacBook-Pro-M4-Pro-Max-2024.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1
            }
          }} 
        />
      )}

      {/* AirPods special background */}
      {isAirPods && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("https://cdn.tgdd.vn//News/0//tai-nghe-bluetooth-airpods-pro-2-magsafe-charge-apple-mqd83-trang-2-845x472.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1
            }
          }} 
        />
      )}

      <Box className="category-content" sx={{ 
        position: 'relative', 
        height: '100%', 
        zIndex: isIPhone || isIPad || isMacbook || isAirPods ? 2 : 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isIPhone || isIPad || isMacbook || isAirPods ? 'flex-start' : 'space-between'
      }}>
        {!isIPhone && !isIPad && !isMacbook && !isAirPods && (
          <Box 
            className="category-background" 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              opacity: 0.05,
              backgroundImage: `url(${category.fallbackUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: -1,
              filter: 'blur(8px)',
            }} 
          />
        )}
        
        <Box className="category-text" sx={{ 
          zIndex: 2, 
          p: 3,
          color: isIPhone || isIPad || isMacbook || isAirPods ? 'white' : 'inherit'
        }}>
          {/* Show "New" chip only on larger cards */}
          {((!isMacbook && !isAirPods) || !cardClassName.includes('small')) && (
            <Chip 
              label={`New`} 
              color="primary" 
              size="small" 
              sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                background: isIPhone || isIPad || isMacbook || isAirPods
                  ? 'linear-gradient(45deg, #ff9800, #f44336)'
                  : 'linear-gradient(45deg, #f44336, #ff9800)',
                color: 'white'
              }} 
            />
          )}
          
          <Typography 
            className="category-title" 
            variant={titleVariant} 
            sx={{ 
              fontWeight: 'bold', 
              background: isIPhone || isIPad || isMacbook || isAirPods
                ? 'linear-gradient(45deg, #ffffff, #e0f7fa)'
                : 'linear-gradient(45deg, #1976d2, #42a5f5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: isIPhone || isIPad || isMacbook || isAirPods ? '0 2px 10px rgba(0, 0, 0, 0.7)' : 'none'
            }}
          >
            {category.displayName}
          </Typography>
          
          {/* Show description only on larger cards - except iPad */}
          {((!isMacbook && !isAirPods && !isIPad) || (!isIPad && !cardClassName.includes('small'))) && (
            <Typography 
              className="category-subtitle" 
              variant="body1"
              sx={{ 
                color: isIPhone || isIPad || isMacbook || isAirPods ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary', 
                my: 2, 
                fontWeight: 500,
                maxWidth: isIPhone || isIPad || isMacbook || isAirPods ? '80%' : '100%'
              }}
            >
              {category.description}
            </Typography>
          )}
          
          {/* Show specs only on larger cards - except iPad */}
          {((!isMacbook && !isAirPods && !isIPad) || (!isIPad && !cardClassName.includes('small'))) && (
            <Box sx={{ my: 2 }}>
              {category.specs.map((spec, index) => (
                <Chip 
                  key={index}
                  label={spec}
                  size="small"
                  sx={{ 
                    mr: 1, 
                    mb: 1, 
                    background: isIPhone || isIPad || isMacbook || isAirPods 
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(25, 118, 210, 0.1)', 
                    color: isIPhone || isIPad || isMacbook || isAirPods ? 'white' : 'primary.main',
                    fontWeight: 500
                  }} 
                />
              ))}
            </Box>
          )}
          
          {/* Show price only on larger cards - except iPad */}
          {((!isMacbook && !isAirPods && !isIPad) || (!isIPad && !cardClassName.includes('small'))) && (
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                color: isIPhone || isIPad || isMacbook || isAirPods ? '#ff9800' : 'error.main', 
                mb: 2,
                textShadow: isIPhone || isIPad || isMacbook || isAirPods ? '0 2px 5px rgba(0, 0, 0, 0.5)' : 'none'
              }}
            >
              {category.price}
            </Typography>
          )}
          
          {/* Show button for all cards */}
          <Button 
            variant="contained" 
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              borderRadius: '30px', 
              textTransform: 'none',
              fontWeight: 'bold',
              mt: (isMacbook || isAirPods) && cardClassName.includes('small') ? 2 : 0,
              background: isIPhone || isIPad || isMacbook || isAirPods 
                ? 'linear-gradient(45deg, #ff9800, #f44336)'
                : 'linear-gradient(45deg, #1976d2, #42a5f5)',
              boxShadow: isIPhone || isIPad || isMacbook || isAirPods
                ? '0 4px 20px rgba(255, 152, 0, 0.5)'
                : '0 4px 20px rgba(25, 118, 210, 0.5)',
              '&:hover': {
                background: isIPhone || isIPad || isMacbook || isAirPods
                  ? 'linear-gradient(45deg, #f57c00, #d32f2f)'
                  : 'linear-gradient(45deg, #1565c0, #1976d2)',
                boxShadow: isIPhone || isIPad || isMacbook || isAirPods
                  ? '0 6px 25px rgba(255, 152, 0, 0.7)'
                  : '0 6px 25px rgba(25, 118, 210, 0.7)',
              }
            }}
          >
            Khám phá ngay
          </Button>
        </Box>
        
        {!isIPhone && !isIPad && !isMacbook && !isAirPods && (
          <Box 
            className="category-image-container" 
            sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.5s ease',
              transform: 'translateY(0px) scale(1)',
              '&:hover': {
                transform: 'translateY(-5px) scale(1.05)',
              }
            }}
          >
            <img
              src={category.fallbackUrl}
              alt={`${category.displayName} category`}
              className="category-image"
              style={{ 
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))',
                transition: 'all 0.5s ease',
              }}
            />
          </Box>
        )}
      </Box>
    </Paper>
    );
  };

  return (
    <div 
      className="categories-page"
      style={{
        backgroundImage: 'url("https://c0.wallpaperflare.com/preview/279/4/1014/apple-apple-device-blur-business.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        minHeight: '100vh'
      }}
    >
      {/* Black overlay */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 0
        }} 
      />
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            background: 'linear-gradient(45deg, #64b5f6, #e0f7fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
          }}
        >
          Khám phá sản phẩm
        </Typography>
        
        <Typography
          variant="h6"
          component="p"
          align="center"
          sx={{ 
            mb: 5, 
            maxWidth: '800px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 400
          }}
        >
          Trải nghiệm những sản phẩm công nghệ tiên tiến nhất với thiết kế sang trọng và hiệu năng vượt trội
        </Typography>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ width: '100%' }}
        >
          {isMobile ? (
            // Mobile layout
            <Box className="grid-container">
              {categories.map((category) => (
                <Box key={category.id} className="grid-item mobile-item" sx={{ mb: 4 }}>
                  <motion.div variants={itemVariants} style={{ width: '100%', height: '100%' }}>
                    <CategoryCard 
                      category={category} 
                      cardClassName="category-card-mobile" 
                      titleVariant="h4" 
                    />
                  </motion.div>
                </Box>
              ))}
            </Box>
          ) : isTablet ? (
            // Tablet layout
            <Box className="grid-container">
              {categories.map((category, index) => (
                <Box 
                  key={category.id} 
                  className="grid-item tablet-item" 
                  sx={{ mb: 4 }}
                >
                  <motion.div 
                    variants={itemVariants} 
                    style={{ width: '100%', height: '100%' }}
                    custom={index}
                  >
                    <CategoryCard 
                      category={category} 
                      cardClassName="category-card-tablet" 
                      titleVariant="h4" 
                    />
                  </motion.div>
                </Box>
              ))}
            </Box>
          ) : (
            // Desktop layout
            <Box className="layout-container">
              <Box className="featured-layout">
                {/* Left side - Featured iPhone */}
                <Box className="grid-item featured-item">
                  <motion.div variants={itemVariants} style={{ width: '100%', height: '100%' }}>
                    <CategoryCard 
                      category={categories[0]} 
                      cardClassName="category-card-featured" 
                      titleVariant="h3" 
                    />
                  </motion.div>
                </Box>

                {/* Right column */}
                <Box className="secondary-items">
                  {/* iPad - top */}
                  <Box className="medium-item">
                    <motion.div variants={itemVariants} style={{ width: '100%', height: '100%' }}>
                      <CategoryCard 
                        category={categories[1]} 
                        cardClassName="category-card-medium" 
                        titleVariant="h4" 
                      />
                    </motion.div>
                  </Box>
                  
                  {/* Small items container - bottom */}
                  <Box className="small-items-container">
                    {/* Macbook */}
                    <Box className="small-item">
                      <motion.div variants={itemVariants} style={{ width: '100%', height: '100%' }}>
                        <CategoryCard 
                          category={categories[2]} 
                          cardClassName="category-card-small" 
                          titleVariant="h5" 
                        />
                      </motion.div>
                    </Box>
                    
                    {/* AirPods */}
                    <Box className="small-item">
                      <motion.div variants={itemVariants} style={{ width: '100%', height: '100%' }}>
                        <CategoryCard 
                          category={categories[3]} 
                          cardClassName="category-card-small" 
                          titleVariant="h5" 
                        />
                      </motion.div>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </motion.div>
      </Container>
    </div>
  );
};

export default Categories;
