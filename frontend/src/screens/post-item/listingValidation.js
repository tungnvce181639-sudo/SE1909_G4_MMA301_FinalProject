export function validateListing({ title, images, category, condition, price, description, selectedLocation }) {
  const errors = {};
  const numericPrice = Number(String(price).replace(/[^0-9]/g, ''));

  if (!title?.trim() || title.trim().length < 5) errors.title = 'Tiêu đề phải có ít nhất 5 ký tự.';
  if (!Array.isArray(images) || images.length === 0) errors.images = 'Vui lòng thêm ít nhất 1 ảnh sản phẩm.';
  if (images?.length > 5) errors.images = 'Tin đăng chỉ được tối đa 5 ảnh.';
  if (!category) errors.category = 'Vui lòng chọn danh mục.';
  if (!condition) errors.condition = 'Vui lòng chọn tình trạng sản phẩm.';
  if (!Number.isSafeInteger(numericPrice) || numericPrice <= 0) errors.price = 'Vui lòng nhập giá hợp lệ lớn hơn 0.';
  if (!description?.trim() || description.trim().length < 20) {
    errors.description = 'Mô tả cần ít nhất 20 ký tự.';
  }
  if (!selectedLocation || /^GPS\s*\(/i.test(selectedLocation)) {
    errors.location = 'Vui lòng chọn tên đường hoặc địa điểm cụ thể trên bản đồ.';
  }

  return errors;
}
