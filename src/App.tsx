import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout/Layout';
import Home from './views/Home/Home';
import SignIn from './views/Auth/SignIn';
import SignUp from './views/Auth/SignUp';
import Categories from './views/Products/Categories';
import ProductList from './views/Products/ProductList';
import HotProducts from './views/Products/HotProducts';
import ProductDetail from './views/ProductDetail/ProductDetail';
import About from './views/About/About';
import Checkout from './views/Checkout/Checkout';
import ProductManagement from './views/Admin/Products/ProductManagement';
import AdminProductList from './views/Admin/Products/ProductList';
import AdminRoute from './components/ProtectedRoute/AdminRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { refreshAccessToken, checkAuth } from './api/config';
import './App.css';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: '20px',
        },
      },
    },
  },
});

function App() {
  useEffect(() => {
    // Attempt to refresh the token when the app loads
    const attemptTokenRefresh = async () => {
      try {
        if (checkAuth()) {
          console.log('[App] Attempting to refresh token on app start');
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('[App] Error refreshing token on app start:', error);
      }
    };

    attemptTokenRefresh();

    // Also set up a periodic token refresh
    const tokenRefreshInterval = setInterval(async () => {
      try {
        if (checkAuth()) {
          console.log('[App] Performing periodic token refresh');
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('[App] Error during periodic token refresh:', error);
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes to keep token fresh

    return () => clearInterval(tokenRefreshInterval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="app">
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/products" element={<Categories />} />
                  <Route path="/products/:category" element={<ProductList />} />
                  <Route path="/hot-products" element={<HotProducts />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/admin/products" element={
                    <AdminRoute>
                      <ProductManagement />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products-list" element={
                    <AdminRoute>
                      <AdminProductList />
                    </AdminRoute>
                  } />
                  {/* Other routes will be added later */}
                </Routes>
              </Layout>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
