import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Snackbar,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  IconButton,
  Stack,
  FormControlLabel,
  Switch
} from '@mui/material';
import { apiClient } from '../../../api/config';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface ProductAttributes {
  manufacturer: string;
  model: string;
  color: string;
}

interface ProductFormData {
  product_name: string;
  product_description: string;
  product_price: number;
  product_type: string;
  product_thumb: string;
  product_images: string[];
  product_quantity: number;
  product_attributes: ProductAttributes;
  product_hot: boolean;
}

const initialFormData: ProductFormData = {
  product_name: '',
  product_description: '',
  product_price: 0,
  product_type: '',
  product_thumb: '',
  product_images: [],
  product_quantity: 0,
  product_attributes: {
    manufacturer: '',
    model: '',
    color: ''
  },
  product_hot: false
};

// Product types
const productTypes = ['Electronics', 'Laptop', 'AirPort', 'iPhone'];

const ProductManagement: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle text field input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (!name) return;

    // Handle nested attributes
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'product_attributes') {
        setFormData({
          ...formData,
          product_attributes: {
            ...formData.product_attributes,
            [child]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle switch changes (for product_hot)
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle adding a new image URL field
  const handleAddImageUrl = () => {
    if (formData.product_images.length >= 5) {
      setSnackbar({
        open: true,
        message: 'Tối đa 5 ảnh cho mỗi sản phẩm.',
        severity: 'warning'
      });
      return;
    }
    
    setFormData({
      ...formData,
      product_images: [...formData.product_images, '']
    });
  };
  
  // Handle image URL change
  const handleImageUrlChange = (index: number, value: string) => {
    const updatedImages = [...formData.product_images];
    updatedImages[index] = value;
    
    setFormData({
      ...formData,
      product_images: updatedImages
    });
  };
  
  // Handle removing an image URL
  const handleRemoveImageUrl = (index: number) => {
    const updatedImages = [...formData.product_images];
    updatedImages.splice(index, 1);
    
    setFormData({
      ...formData,
      product_images: updatedImages
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.product_name) {
      newErrors.product_name = 'Tên sản phẩm là bắt buộc';
    }
    
    if (!formData.product_description) {
      newErrors.product_description = 'Mô tả sản phẩm là bắt buộc';
    }
    
    if (!formData.product_type) {
      newErrors.product_type = 'Loại sản phẩm là bắt buộc';
    }
    
    if (!formData.product_thumb) {
      newErrors.product_thumb = 'Hình ảnh sản phẩm là bắt buộc';
    }
    
    // Validate product images
    formData.product_images.forEach((imageUrl, index) => {
      if (!imageUrl) {
        newErrors[`product_images.${index}`] = 'URL hình ảnh không được để trống';
      }
    });
    
    if (formData.product_price <= 0) {
      newErrors.product_price = 'Giá sản phẩm phải lớn hơn 0';
    }
    
    if (formData.product_quantity <= 0) {
      newErrors.product_quantity = 'Số lượng sản phẩm phải lớn hơn 0';
    }
    
    // Validate attributes
    if (!formData.product_attributes.manufacturer) {
      newErrors['product_attributes.manufacturer'] = 'Nhà sản xuất là bắt buộc';
    }
    
    if (!formData.product_attributes.model) {
      newErrors['product_attributes.model'] = 'Model là bắt buộc';
    }
    
    if (!formData.product_attributes.color) {
      newErrors['product_attributes.color'] = 'Màu sắc là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Get authentication tokens
      const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userInfo') || '{}')._id;
      const accessToken = localStorage.getItem('accessToken');
      
      // Configure headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (userId) {
        headers['x-client-id'] = userId;
      }
      
      if (accessToken) {
        headers['authorization'] = accessToken;
      }
      
      // Send API request
      await apiClient.post('/product/create', formData, { headers });
      
      // Handle successful response
      setSnackbar({
        open: true,
        message: 'Sản phẩm đã được tạo thành công!',
        severity: 'success'
      });
      
      // Reset form
      setFormData(initialFormData);
      
    } catch (error: unknown) {
      console.error('Error creating product:', error);
      
      // Get error message from API response if available
      let errorMessage = 'Đã xảy ra lỗi khi tạo sản phẩm. Vui lòng thử lại.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as { data?: { message?: string } };
        if (errorResponse.data?.message) {
          errorMessage = errorResponse.data.message;
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Quản lý sản phẩm
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Thêm sản phẩm mới
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            {/* Product Name */}
            <Box>
              <TextField
                fullWidth
                label="Tên sản phẩm"
                name="product_name"
                value={formData.product_name}
                onChange={handleTextChange}
                error={!!errors.product_name}
                helperText={errors.product_name}
                required
              />
            </Box>
            
            {/* Product Type */}
            <Box>
              <FormControl fullWidth error={!!errors.product_type} required>
                <InputLabel id="product-type-label">Loại sản phẩm</InputLabel>
                <Select
                  labelId="product-type-label"
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleSelectChange}
                  label="Loại sản phẩm"
                >
                  {productTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.product_type && (
                  <FormHelperText>{errors.product_type}</FormHelperText>
                )}
              </FormControl>
            </Box>
            
            {/* Product Price */}
            <Box>
              <TextField
                fullWidth
                label="Giá sản phẩm"
                name="product_price"
                type="number"
                value={formData.product_price}
                onChange={handleTextChange}
                error={!!errors.product_price}
                helperText={errors.product_price}
                InputProps={{ inputProps: { min: 0 } }}
                required
              />
            </Box>
            
            {/* Product Quantity */}
            <Box>
              <TextField
                fullWidth
                label="Số lượng"
                name="product_quantity"
                type="number"
                value={formData.product_quantity}
                onChange={handleTextChange}
                error={!!errors.product_quantity}
                helperText={errors.product_quantity}
                InputProps={{ inputProps: { min: 0 } }}
                required
              />
            </Box>
            
            {/* Product Thumbnail */}
            <Box>
              <TextField
                fullWidth
                label="URL hình ảnh"
                name="product_thumb"
                value={formData.product_thumb}
                onChange={handleTextChange}
                error={!!errors.product_thumb}
                helperText={errors.product_thumb}
                required
              />
            </Box>
            
            {/* Product Hot Switch */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.product_hot}
                    onChange={handleSwitchChange}
                    name="product_hot"
                    color="primary"
                  />
                }
                label="Sản phẩm nổi bật (Hot)"
              />
            </Box>
            
            {/* Product Description */}
            <Box>
              <TextField
                fullWidth
                label="Mô tả sản phẩm"
                name="product_description"
                value={formData.product_description}
                onChange={handleTextChange}
                multiline
                rows={4}
                error={!!errors.product_description}
                helperText={errors.product_description}
                required
              />
            </Box>
            
            {/* Product Attributes */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Thuộc tính sản phẩm
              </Typography>
              
              <Stack spacing={3}>
                {/* Manufacturer */}
                <Box>
                  <TextField
                    fullWidth
                    label="Nhà sản xuất"
                    name="product_attributes.manufacturer"
                    value={formData.product_attributes.manufacturer}
                    onChange={handleTextChange}
                    error={!!errors['product_attributes.manufacturer']}
                    helperText={errors['product_attributes.manufacturer']}
                    required
                  />
                </Box>
                
                {/* Model */}
                <Box>
                  <TextField
                    fullWidth
                    label="Model"
                    name="product_attributes.model"
                    value={formData.product_attributes.model}
                    onChange={handleTextChange}
                    error={!!errors['product_attributes.model']}
                    helperText={errors['product_attributes.model']}
                    required
                  />
                </Box>
                
                {/* Color */}
                <Box>
                  <TextField
                    fullWidth
                    label="Màu sắc"
                    name="product_attributes.color"
                    value={formData.product_attributes.color}
                    onChange={handleTextChange}
                    error={!!errors['product_attributes.color']}
                    helperText={errors['product_attributes.color']}
                    required
                  />
                </Box>
              </Stack>
            </Box>
            
            {/* Product Images */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Hình ảnh sản phẩm
              </Typography>
              
              <Stack spacing={3}>
                {formData.product_images.map((imageUrl, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      fullWidth
                      label={`Hình ảnh ${index + 1}`}
                      name={`product_images.${index}`}
                      value={imageUrl}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      error={!!errors[`product_images.${index}`]}
                      helperText={errors[`product_images.${index}`]}
                    />
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveImageUrl(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddImageUrl}
                    disabled={formData.product_images.length >= 5}
                    sx={{ mt: 1 }}
                  >
                    Thêm ảnh {formData.product_images.length >= 5 ? '(Đã đạt giới hạn 5 ảnh)' : ''}
                  </Button>
                  {formData.product_images.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Bạn có thể thêm tối đa 5 ảnh cho sản phẩm
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
            
            {/* Submit Button */}
            <Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Tạo sản phẩm'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
      
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

export default ProductManagement; 