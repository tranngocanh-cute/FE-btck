import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import Cart from '../Cart/Cart';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const authPages = ['/signin', '/signup'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Header />}
      <main className="main-content">
        {children}
      </main>
      {!isAuthPage && <Footer />}
      <Cart />
    </>
  );
};

export default Layout; 