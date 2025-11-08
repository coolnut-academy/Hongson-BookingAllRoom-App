import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/users`;

// Interface ตรงกับ DTO ของ Backend
interface UserData {
  name: string;
  username: string;
  password?: string;
  role: 'user' | 'admin' | 'god';
  displayName?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const userService = {
  getAllUsers: () => {
    return axios.get(API_URL, { headers: getAuthHeaders() });
  },

  createUser: (userData: UserData) => {
    return axios.post(API_URL, userData, { headers: getAuthHeaders() });
  },

  // UpdateUserDto ของเราเป็น Partial<UserData> อยู่แล้ว
  updateUser: (id: string, userData: Partial<UserData>) => {
    if (userData.password === '') delete userData.password;
    return axios.put(`${API_URL}/${id}`, userData, { headers: getAuthHeaders() });
  },

  deleteUser: (id: string) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  },

  resetPassword: (id: string, newPassword?: string) => {
    return axios.post(
      `${API_URL}/${id}/reset-password`,
      { newPassword },
      { headers: getAuthHeaders() },
    );
  },
};

export type { UserData };

