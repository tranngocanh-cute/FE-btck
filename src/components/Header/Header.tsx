import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  InputBase, 
  Badge, 
  IconButton, 
  Box, 
  styled, 
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  ListItemButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '20px',
  backgroundColor: 'white',
  marginRight: '16px',
  marginLeft: '0',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: '16px',
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'black',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'black',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

// Menu items (can be extracted to a separate file)
const menuItems = [
  { text: 'Trang chủ', path: '/' },
  { text: 'Danh mục', path: '/products' },
  { text: 'Sản phẩm nổi bật', path: '/hot-products' },
  { text: 'Về chúng tôi', path: '/about' }
];

// Menu items chỉ dành cho ADMIN
const adminMenuItems = [
  { text: 'Thêm sản phẩm mới', path: '/admin/products' },
  { text: 'Quản lý sản phẩm', path: '/admin/products-list' }
];

const Header = () => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<{show: boolean, message: string}>({
    show: false,
    message: ''
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { cartCount, toggleCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  
  // Kiểm tra người dùng có phải là ADMIN hay không
  const isAdmin = user?.roles?.includes('ADMIN');
  
  // For debugging - log user data
  console.log('User data in Header:', { user, isAdmin, roles: user?.roles });
  
  // Handle drawer toggle
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
       (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleLogout = async () => {
    try {
      // Close the user menu
      handleUserMenuClose();
      
      // Clear any existing location state
      window.history.replaceState({}, document.title);
      
      // Show notification
      setNotification({
        show: true,
        message: 'Đang đăng xuất...'
      });
      
      // Call logout function (which will redirect to login page)
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Show error notification
      setNotification({
        show: true,
        message: 'Đã xảy ra lỗi khi đăng xuất'
      });
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      show: false
    });
  };
  
  // Function to check if a menu item is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Mobile menu drawer
  const mobileMenuDrawer = (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      sx={{
        '& .MuiDrawer-paper': { 
          width: '80%', 
          maxWidth: '300px',
          backgroundColor: 'black',
          color: 'white'
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component={Link} to="/" sx={{ color: 'white', textDecoration: 'none' }}>
          APPLE STORE
        </Typography>
        <IconButton onClick={toggleDrawer(false)} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path}
              onClick={toggleDrawer(false)}
              className={`mobile-menu-item ${isActive(item.path) ? 'active' : ''}`}
              sx={{ py: 2 }}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Admin menu items */}
        {isAdmin && (
          <>
            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />
            {adminMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  component={Link} 
                  to={item.path}
                  onClick={toggleDrawer(false)}
                  className={`mobile-menu-item ${isActive(item.path) ? 'active' : ''}`}
                  sx={{ py: 2, color: '#f50057' }}
                >
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
        
        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />
        
        {isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton sx={{ py: 2 }}>
                <PersonIcon sx={{ mr: 2 }} />
                <ListItemText primary={user?.name || 'User'} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ py: 2 }}>
                <LogoutIcon sx={{ mr: 2 }} />
                <ListItemText primary="Đăng xuất" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                to="/signin"
                onClick={toggleDrawer(false)}
                className={`mobile-menu-item ${isActive('/signin') ? 'active' : ''}`}
                sx={{ py: 2 }}
              >
                <ListItemText primary="Đăng nhập" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                to="/signup"
                onClick={toggleDrawer(false)}
                className={`mobile-menu-item ${isActive('/signup') ? 'active' : ''}`}
                sx={{ py: 2 }}
              >
                <ListItemText primary="Đăng ký" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );
  
  // User dropdown menu
  const userMenu = (
    <Menu
      anchorEl={userMenuAnchor}
      open={Boolean(userMenuAnchor)}
      onClose={handleUserMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ p: 2, width: 250 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Thông tin người dùng
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Tên: {user?.name || 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Email: {user?.email || 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          ID: {user?._id || 'N/A'}
        </Typography>
      </Box>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
        Đăng xuất
      </MenuItem>
    </Menu>
  );
  
  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'black' }}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 'bold',
              mr: 1,
              ml: isMobile ? 0 : -1,
              fontSize: isMobile ? '1.1rem' : '1.25rem'
            }}
          >
            APPLE STORE
          </Typography>

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              ml: -1
            }}>
              {menuItems.map((item) => (
                <Link
                  key={item.text}
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.text}
                </Link>
              ))}
              
              {/* Admin menu items in desktop view */}
              {isAdmin && adminMenuItems.map((item) => (
                <Link
                  key={item.text}
                  to={item.path}
                  className={`nav-link admin-link ${isActive(item.path) ? 'active' : ''}`}
                  style={{ color: '#f50057' }}
                >
                  {item.text}
                </Link>
              ))}
            </Box>
          )}
          
          {/* Search Bar */}
          <Search sx={{ display: { xs: 'none', sm: 'block' }, ml: 'auto', mr: 2 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Tìm kiếm"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          
          {/* Icons and Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <>
                {isAuthenticated ? (
                  <IconButton
                    onClick={handleUserMenuOpen}
                    color="inherit"
                    size="large"
                    sx={{ mr: 1 }}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                ) : (
                  <>
                    <Button 
                      component={Link} 
                      to="/signin" 
                      color="inherit" 
                      sx={{ mr: 1 }}
                    >
                      Đăng nhập
                    </Button>
                    <Button 
                      component={Link} 
                      to="/signup" 
                      variant="outlined" 
                      color="inherit" 
                      sx={{ borderColor: 'white', mr: 2 }}
                    >
                      Đăng ký
                    </Button>
                  </>
                )}
              </>
            )}
            
            <IconButton 
              color="inherit"
              onClick={toggleCart}
              size="large"
            >
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      {mobileMenuDrawer}
      
      {/* User Menu */}
      {userMenu}
      
      {/* Notification */}
      <Snackbar 
        open={notification.show} 
        autoHideDuration={3000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header; 