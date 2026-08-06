import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const loadingToast = toast.loading('Iniciando sesión...');
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, accessToken, refreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('¡Bienvenido!', { id: loadingToast });
      return userData;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión', { id: loadingToast });
      throw error;
    }
  };

  const register = async (data) => {
    const loadingToast = toast.loading('Creando cuenta...');
    try {
      const response = await authAPI.register(data);
      const { user: userData, accessToken, refreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('Cuenta creada. Verifica tu email.', { id: loadingToast });
      return userData;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrarse', { id: loadingToast });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Sesión cerrada');
  };

  const updateProfile = async (data) => {
    const loadingToast = toast.loading('Actualizando perfil...');
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Perfil actualizado', { id: loadingToast });
      return updatedUser;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar', { id: loadingToast });
      throw error;
    }
  };

  const changePassword = async (data) => {
    const loadingToast = toast.loading('Cambiando contraseña...');
    try {
      await authAPI.changePassword(data);
      toast.success('Contraseña cambiada', { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña', { id: loadingToast });
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    const loadingToast = toast.loading('Enviando email...');
    try {
      await authAPI.forgotPassword(email);
      toast.success('Si el email existe, recibirás instrucciones', { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error', { id: loadingToast });
      throw error;
    }
  };

  const resetPassword = async (data) => {
    const loadingToast = toast.loading('Restableciendo...');
    try {
      await authAPI.resetPassword(data);
      toast.success('Contraseña restablecida', { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error', { id: loadingToast });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isClient: user?.role === 'client',
    isProfessional: user?.role === 'professional',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};