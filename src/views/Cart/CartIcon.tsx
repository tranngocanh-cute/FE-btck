// CartIcon.tsx
import { Badge, IconButton, Drawer } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState } from 'react';
import { useCart } from './CartContext';
import CartDrawer from './CartDrawer';

export default function CartIcon() {
  const { items } = useCart();
  const qty = items.reduce((s, i) => s + i.qty, 0);
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton size="large" onClick={() => setOpen(true)}>
        <Badge badgeContent={qty} color="error" overlap="rectangular">
          <ShoppingCartIcon sx={{ color: 'white' }} />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <CartDrawer onClose={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
