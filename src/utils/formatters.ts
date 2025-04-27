/**
 * Hàm định dạng số tiền về dạng có dấu phân cách ngàn
 * @param value - Số tiền cần định dạng
 * @returns Chuỗi đã được định dạng
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
}; 