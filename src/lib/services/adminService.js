// src/lib/services/adminService.js
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  query,
  where,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export class AdminService {
  
  /**
   * Obtener todos los usuarios ordenados alfabéticamente
   */
  static async getAllUsers() {
    try {
      const usersQuery = query(
        collection(db, 'users'), 
        orderBy('firstName', 'asc')
      );
      const querySnapshot = await getDocs(usersQuery);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios por estado
   */
  static async getUsersByStatus(status) {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('accountStatus', '==', status),
        orderBy('firstName', 'asc')
      );
      const querySnapshot = await getDocs(usersQuery);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error obteniendo usuarios por estado:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getUserStats() {
    try {
      const totalUsers = await getCountFromServer(collection(db, 'users'));
      
      const pendingUsers = await getCountFromServer(
        query(collection(db, 'users'), where('accountStatus', '==', 'pending'))
      );
      
      const approvedUsers = await getCountFromServer(
        query(collection(db, 'users'), where('accountStatus', '==', 'approved'))
      );
      
      const suspendedUsers = await getCountFromServer(
        query(collection(db, 'users'), where('accountStatus', '==', 'suspended'))
      );

      const adminUsers = await getCountFromServer(
        query(collection(db, 'users'), where('role', '==', 'admin'))
      );

      return {
        total: totalUsers.data().count,
        pending: pendingUsers.data().count,
        approved: approvedUsers.data().count,
        suspended: suspendedUsers.data().count,
        admins: adminUsers.data().count
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de cuenta de usuario
   */
  static async updateUserStatus(userId, newStatus) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        accountStatus: newStatus,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error actualizando estado de usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar rol de usuario
   */
  static async updateUserRole(userId, newRole) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error actualizando rol de usuario:', error);
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  static async deleteUser(userId) {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true };
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar múltiples campos de usuario
   */
  static async updateUser(userId, updateData) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updateData,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  /**
   * Buscar usuarios por texto
   */
  static async searchUsers(searchTerm) {
    try {
      // Nota: Firestore no soporta búsqueda de texto completo nativa
      // Esta función obtiene todos los usuarios y filtra en el cliente
      // Para una solución más robusta, considera usar Algolia o Elasticsearch
      
      const allUsers = await this.getAllUsers();
      
      const filteredUsers = allUsers.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.familyName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.businessName?.toLowerCase().includes(searchLower)
        );
      });
      
      return filteredUsers;
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      throw error;
    }
  }

  /**
   * Aprobar múltiples usuarios
   */
  static async approveMultipleUsers(userIds) {
    try {
      const batch = [];
      
      for (const userId of userIds) {
        batch.push(this.updateUserStatus(userId, 'approved'));
      }
      
      await Promise.all(batch);
      return { success: true, count: userIds.length };
    } catch (error) {
      console.error('Error aprobando múltiples usuarios:', error);
      throw error;
    }
  }

  /**
   * Verificar si un usuario es admin
   */
  static async isUserAdmin(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return false;
      }
      
      const userData = userDoc.data();
      return userData.role === 'admin';
    } catch (error) {
      console.error('Error verificando rol de admin:', error);
      return false;
    }
  }
}