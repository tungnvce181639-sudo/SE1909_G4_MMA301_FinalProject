import apiClient from './apiClient';

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export async function getProfile() {
  try {
    const response = await apiClient.get('/profile/me');
    return response.user;
  } catch (error) {
    console.error('[profileApi] Error fetching profile:', error);
    throw error;
  }
}

/**
 * Update current user profile
 * @param {Object} updates - Profile updates
 * @param {string} updates.fullName - Full name (optional)
 * @param {string} updates.phoneNumber - Phone number (optional)
 * @param {string} updates.avatarUrl - Avatar URL (optional)
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateProfile(updates) {
  try {
    const response = await apiClient.put('/profile/me', updates);
    return response.user;
  } catch (error) {
    console.error('[profileApi] Error updating profile:', error);
    throw error;
  }
}

export default {
  getProfile,
  updateProfile,
};
