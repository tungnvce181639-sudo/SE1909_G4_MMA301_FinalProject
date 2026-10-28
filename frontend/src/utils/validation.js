/**
 * Form Validation Utilities
 * Provides validation functions for various form fields
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Vui lòng nhập email' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Email không đúng định dạng' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validates FPT Edu email format
 * @param {string} email - Email to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateFPTEduEmail = (email) => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  if (!email.trim().toLowerCase().endsWith('@fpt.edu.vn')) {
    return { isValid: false, error: 'Vui lòng sử dụng email @fpt.edu.vn' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid: boolean, error: string, strength: object }
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Vui lòng nhập mật khẩu', strength: { level: 0, label: 'Chưa nhập' } };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự', strength: { level: 1, label: 'Yếu' } };
  }

  // Calculate strength
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[\d!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  const strengthLabels = ['Yếu', 'Tốt', 'Rất mạnh'];
  const strengthColors = ['#ba1a1a', '#f26f21', '#006b55'];

  return {
    isValid: true,
    error: '',
    strength: {
      level: strength,
      label: strengthLabels[strength - 1] || 'Yếu',
      color: strengthColors[strength - 1] || '#ba1a1a',
    },
  };
};

/**
 * Validates full name
 * @param {string} fullName - Full name to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim() === '') {
    return { isValid: false, error: 'Vui lòng nhập họ và tên' };
  }

  if (fullName.trim().length < 2) {
    return { isValid: false, error: 'Họ và tên phải có ít nhất 2 ký tự' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validates password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Password to confirm
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Vui lòng xác nhận mật khẩu' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Mật khẩu xác nhận không khớp' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validates OTP code
 * @param {string} otp - OTP to validate
 * @param {number} length - Expected OTP length (default: 6)
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateOTP = (otp, length = 6) => {
  if (!otp || otp.trim() === '') {
    return { isValid: false, error: 'Vui lòng nhập mã OTP' };
  }

  if (otp.length !== length) {
    return { isValid: false, error: `Mã OTP phải có ${length} số` };
  }

  if (!/^\d+$/.test(otp)) {
    return { isValid: false, error: 'Mã OTP chỉ được chứa số' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validates required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateRequired = (value, fieldName = 'Trường này') => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `Vui lòng nhập ${fieldName.toLowerCase()}` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validates phone number (Vietnam format)
 * @param {string} phone - Phone number to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: true, error: '' }; // Phone is optional
  }

  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(phone.trim())) {
    return { isValid: false, error: 'Số điện thoại không đúng định dạng' };
  }

  return { isValid: true, error: '' };
};
