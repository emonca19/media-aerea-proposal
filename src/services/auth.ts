import { mockUsers } from '../mocks/users';
import { User } from '../types';

export const auth = {
  login: async (email: string, password: string) => {
    // Simulamos un delay para hacer más realista la experiencia
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // En un ambiente real, aquí validaríamos la contraseña
    // Por ahora, cualquier contraseña funciona para facilitar las pruebas
    
    return {
      user,
      token: 'mock-jwt-token'
    };
  },
  getCurrentUser: async (): Promise<User> => {
    // Simulamos obtener el usuario actual del almacenamiento local
    // En un ambiente real, esto validaría el token JWT
    const mockCurrentUser = mockUsers[0]; // Por defecto retornamos el piloto
    return mockCurrentUser;
  },

  logout: async () => {
    // En un ambiente real, aquí invalidaríamos el token
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },
};
