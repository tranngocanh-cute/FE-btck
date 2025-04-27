import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  FormHelperText
} from '@mui/material';
import { productService, Product } from '../../../api/product';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatCurrency } from '../../../utils/formatters';

// Product types
const productTypes = ['Electronics', 'Laptop', 'AirPort', 'iPhone', 'Clothing'];

interface EditFormData {
  product_name: string;
  product_description: string;
  product_price: number;
  product_type: string;
  product_thumb: string;
  product_quantity: number;
  product_attributes: {
    manufacturer: string;
    model: string;
    color: string;
  };
  product_hot: boolean;
  stock_status: 'in_stock' | 'out_of_stock';
}

const initialEditFormData: EditFormData = {
  product_name: '',
  product_description: '',
  product_price: 0,
  product_type: '',
  product_thumb: '',
  product_quantity: 0,
  product_attributes: {
    manufacturer: '',
    model: '',
    color: ''
  },
  product_hot: false,
  stock_status: 'in_stock'
};

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>(initialEditFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [currentProductName, setCurrentProductName] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Nếu API có hỗ trợ lấy tất cả sản phẩm (bao gồm cả draft), dùng nó thay vì getPublishedProducts
      const response = await productService.getPublishedProducts();
      
      if (Array.isArray(response.metadata)) {
        setProducts(response.metadata);
      } else {
        setProducts([response.metadata]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Handle opening edit dialog
  const handleEditClick = async (product: Product) => {
    try {
      setCurrentProductId(product._id);
      setUpdateLoading(true);
      
      // Gọi API lấy chi tiết sản phẩm
      const response = await productService.getProductById(product._id);
      const productDetail = response.metadata as Product;
      
      // Cập nhật form với dữ liệu chi tiết sản phẩm
      setEditFormData({
        product_name: productDetail.product_name,
        product_description: productDetail.product_description,
        product_price: productDetail.product_price,
        product_type: productDetail.product_type,
        product_thumb: productDetail.product_thumb,
        product_quantity: productDetail.product_quantity,
        product_attributes: {
          manufacturer: productDetail.product_attributes?.manufacturer || '',
          model: productDetail.product_attributes?.model || '',
          color: productDetail.product_attributes?.color || ''
        },
        product_hot: productDetail.product_hot || false,
        stock_status: productDetail.stock_status || 'in_stock'
      });
      
      setEditDialogOpen(true);
    } catch (error) {
      console.error(`Error fetching product detail: ${error}`);
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin chi tiết sản phẩm. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle closing edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentProductId(null);
    setEditFormData(initialEditFormData);
    setFormErrors({});
  };

  // Handle text field changes in edit form
  const handleEditTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (!name) return;

    // Handle nested attributes
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'product_attributes') {
        setEditFormData({
          ...editFormData,
          product_attributes: {
            ...editFormData.product_attributes,
            [child]: value
          }
        });
      }
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }
  };

  // Handle select changes in edit form
  const handleEditSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle switch changes in edit form
  const handleEditSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: checked
    });
  };

  // Validate edit form
  const validateEditForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!editFormData.product_name) {
      newErrors.product_name = 'Tên sản phẩm là bắt buộc';
    }
    
    if (!editFormData.product_description) {
      newErrors.product_description = 'Mô tả sản phẩm là bắt buộc';
    }
    
    if (!editFormData.product_type) {
      newErrors.product_type = 'Loại sản phẩm là bắt buộc';
    }
    
    if (!editFormData.product_thumb) {
      newErrors.product_thumb = 'Hình ảnh sản phẩm là bắt buộc';
    }
    
    if (editFormData.product_price <= 0) {
      newErrors.product_price = 'Giá sản phẩm phải lớn hơn 0';
    }
    
    if (editFormData.product_quantity < 0) {
      newErrors.product_quantity = 'Số lượng sản phẩm không thể âm';
    }
    
    // Validate attributes
    if (!editFormData.product_attributes.manufacturer) {
      newErrors['product_attributes.manufacturer'] = 'Nhà sản xuất là bắt buộc';
    }
    
    if (!editFormData.product_attributes.model) {
      newErrors['product_attributes.model'] = 'Model là bắt buộc';
    }
    
    if (!editFormData.product_attributes.color) {
      newErrors['product_attributes.color'] = 'Màu sắc là bắt buộc';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle update product
  const handleUpdateProduct = async () => {
    if (!currentProductId || !validateEditForm()) {
      return;
    }
    
    setUpdateLoading(true);
    
    try {
      await productService.updateProduct(currentProductId, editFormData);
      
      // Update local state
      setProducts(products.map(p => 
        p._id === currentProductId 
          ? { ...p, ...editFormData } 
          : p
      ));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Sản phẩm đã được cập nhật thành công!',
        severity: 'success'
      });
      
      // Close dialog
      handleCloseEditDialog();
      
      // Refresh product list
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      
      setSnackbar({
        open: true,
        message: 'Đã xảy ra lỗi khi cập nhật sản phẩm. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle opening delete dialog
  const handleDeleteClick = (product: Product) => {
    setCurrentProductId(product._id);
    setCurrentProductName(product.product_name);
    setDeleteDialogOpen(true);
  };

  // Handle closing delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentProductId(null);
    setCurrentProductName('');
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!currentProductId) {
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      await productService.unpublishProduct(currentProductId);
      
      // Remove product from local state
      setProducts(products.filter(p => p._id !== currentProductId));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Sản phẩm đã được xóa thành công!',
        severity: 'success'
      });
      
      // Close dialog
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting product:', error);
      
      setSnackbar({
        open: true,
        message: 'Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý danh sách sản phẩm
      </Typography>
      
      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hình ảnh</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Nổi bật</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={product.product_thumb}
                        alt={product.product_name}
                        sx={{ width: 50, height: 50, objectFit: 'contain' }}
                      />
                    </TableCell>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>{product.product_type}</TableCell>
                    <TableCell>{formatCurrency(product.product_price)} đ</TableCell>
                    <TableCell>{product.product_quantity}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.stock_status === 'in_stock' ? 'Còn hàng' : 'Hết hàng'} 
                        color={product.stock_status === 'in_stock' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.product_hot ? 'Hot' : 'Thường'}
                        color={product.product_hot ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditClick(product)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(product)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Cập nhật sản phẩm</DialogTitle>
        <DialogContent>
          {updateLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" noValidate sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Tên sản phẩm"
                name="product_name"
                value={editFormData.product_name}
                onChange={handleEditTextChange}
                error={!!formErrors.product_name}
                helperText={formErrors.product_name}
                margin="normal"
                required
              />
              
              <FormControl fullWidth margin="normal" error={!!formErrors.product_type} required>
                <InputLabel id="product-type-label">Loại sản phẩm</InputLabel>
                <Select
                  labelId="product-type-label"
                  name="product_type"
                  value={editFormData.product_type}
                  onChange={handleEditSelectChange}
                  label="Loại sản phẩm"
                >
                  {productTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.product_type && (
                  <FormHelperText>{formErrors.product_type}</FormHelperText>
                )}
              </FormControl>
              
              <TextField
                fullWidth
                label="Giá sản phẩm"
                name="product_price"
                type="number"
                value={editFormData.product_price}
                onChange={handleEditTextChange}
                error={!!formErrors.product_price}
                helperText={formErrors.product_price}
                InputProps={{ inputProps: { min: 0 } }}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Số lượng"
                name="product_quantity"
                type="number"
                value={editFormData.product_quantity}
                onChange={handleEditTextChange}
                error={!!formErrors.product_quantity}
                helperText={formErrors.product_quantity}
                InputProps={{ inputProps: { min: 0 } }}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="URL hình ảnh"
                name="product_thumb"
                value={editFormData.product_thumb}
                onChange={handleEditTextChange}
                error={!!formErrors.product_thumb}
                helperText={formErrors.product_thumb}
                margin="normal"
                required
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.product_hot}
                    onChange={handleEditSwitchChange}
                    name="product_hot"
                    color="primary"
                  />
                }
                label="Sản phẩm nổi bật (Hot)"
                sx={{ my: 2, display: 'block' }}
              />
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="stock-status-label">Trạng thái tồn kho</InputLabel>
                <Select
                  labelId="stock-status-label"
                  name="stock_status"
                  value={editFormData.stock_status}
                  onChange={handleEditSelectChange}
                  label="Trạng thái tồn kho"
                >
                  <MenuItem value="in_stock">Còn hàng</MenuItem>
                  <MenuItem value="out_of_stock">Hết hàng</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Mô tả sản phẩm"
                name="product_description"
                value={editFormData.product_description}
                onChange={handleEditTextChange}
                multiline
                rows={4}
                error={!!formErrors.product_description}
                helperText={formErrors.product_description}
                margin="normal"
                required
              />
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Thuộc tính sản phẩm
              </Typography>
              
              <TextField
                fullWidth
                label="Nhà sản xuất"
                name="product_attributes.manufacturer"
                value={editFormData.product_attributes.manufacturer}
                onChange={handleEditTextChange}
                error={!!formErrors['product_attributes.manufacturer']}
                helperText={formErrors['product_attributes.manufacturer']}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Model"
                name="product_attributes.model"
                value={editFormData.product_attributes.model}
                onChange={handleEditTextChange}
                error={!!formErrors['product_attributes.model']}
                helperText={formErrors['product_attributes.model']}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Màu sắc"
                name="product_attributes.color"
                value={editFormData.product_attributes.color}
                onChange={handleEditTextChange}
                error={!!formErrors['product_attributes.color']}
                helperText={formErrors['product_attributes.color']}
                margin="normal"
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={updateLoading}>
            Hủy
          </Button>
          <Button 
            onClick={handleUpdateProduct} 
            variant="contained" 
            disabled={updateLoading}
            startIcon={updateLoading ? <CircularProgress size={24} /> : null}
          >
            {updateLoading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa sản phẩm "{currentProductName}" không? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteProduct} 
            variant="contained" 
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={24} /> : null}
          >
            {deleteLoading ? 'Đang xóa...' : 'Xóa sản phẩm'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProductList; 