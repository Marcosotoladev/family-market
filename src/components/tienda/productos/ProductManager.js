// src/components/tienda/productos/ProductManager.js
'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { generarSlugProducto } from '@/lib/helpers/productHelpers';
import { autoCompletarDatosProducto } from '@/types/product';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import ProductCard from './ProductCard';
import { Plus, ArrowLeft, Package } from 'lucide-react';

export default function ProductManager({ storeId, storeData }) {
  const { user } = useAuth();
  const [view, setView] = useState('list'); // 'list' | 'form' | 'view'
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar productos
  useEffect(() => {
    if (storeId) {
      loadProducts();
    }
  }, [storeId]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const productsRef = collection(db, 'productos');
      const q = query(
        productsRef, 
        where('usuarioId', '==', storeId),
        orderBy('fechaCreacion', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setView('form');
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setView('form');
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setView('view');
  };

  const handleSaveProduct = async (productData) => {
    try {
      setIsSaving(true);
      
      // Auto-completar datos desde storeData
      const productDataCompleto = autoCompletarDatosProducto(productData, storeData);
      
      if (selectedProduct) {
        // Actualizar producto existente
        const productRef = doc(db, 'productos', selectedProduct.id);
        await updateDoc(productRef, {
          ...productDataCompleto,
          fechaActualizacion: serverTimestamp()
        });
        
        // Actualizar en estado local
        setProducts(prev => prev.map(p => 
          p.id === selectedProduct.id 
            ? { ...p, ...productDataCompleto, fechaActualizacion: new Date().toISOString() }
            : p
        ));
      } else {
        // Crear nuevo producto
        const newProduct = {
          ...productDataCompleto,
          usuarioId: storeId, // Campo requerido por las reglas de Firestore
          tiendaId: storeId, // Para mantener compatibilidad
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          totalVentas: 0,
          totalVistas: 0,
          // Inicializar nuevas funcionalidades
          valoraciones: {
            promedio: 0,
            total: 0,
            distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          },
          interacciones: {
            vistas: 0,
            favoritos: 0,
            compartidas: 0,
            comentarios: 0
          },
          slug: generarSlugProducto ? generarSlugProducto(productDataCompleto.titulo, Date.now().toString()) : productDataCompleto.titulo.toLowerCase().replace(/\s+/g, '-')
        };
        
        const docRef = await addDoc(collection(db, 'productos'), newProduct);
        
        // Agregar al estado local
        setProducts(prev => [{
          id: docRef.id,
          ...newProduct,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        }, ...prev]);
      }
      
      setView('list');
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error al guardar el producto. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'productos', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar el producto. Intenta nuevamente.');
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = product.estado === 'disponible' ? 'pausado' : 'disponible';
      const productRef = doc(db, 'productos', product.id);
      
      await updateDoc(productRef, {
        estado: newStatus,
        fechaActualizacion: serverTimestamp()
      });
      
      setProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, estado: newStatus, fechaActualizacion: new Date().toISOString() }
          : p
      ));
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar el estado. Intenta nuevamente.');
    }
  };

  const handleDuplicateProduct = (product) => {
    const duplicatedProduct = {
      ...product,
      titulo: `${product.titulo} (Copia)`,
      id: undefined,
      fechaCreacion: undefined,
      fechaActualizacion: undefined,
      totalVentas: 0,
      totalVistas: 0
    };
    
    setSelectedProduct(duplicatedProduct);
    setView('form');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedProduct(null);
  };

  // Verificar permisos
  if (!user || storeId !== user.uid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso no autorizado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No tienes permisos para gestionar estos productos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {view === 'list' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Gestión de Productos
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  Administra tu catálogo de productos
                </p>
              </div>
              
              <button
                onClick={handleCreateProduct}
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Producto
              </button>
            </div>
          </div>

          {/* Lista de productos */}
          <ProductList
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onToggleStatus={handleToggleStatus}
            onDuplicate={handleDuplicateProduct}
            onView={handleViewProduct}
            onCreateNew={handleCreateProduct}
            isLoading={isLoading}
          />
        </div>
      )}

      {view === 'form' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductForm
            producto={selectedProduct}
            storeId={storeId}
            onSave={handleSaveProduct}
            onCancel={handleBackToList}
            isLoading={isSaving}
          />
        </div>
      )}

      {view === 'view' && selectedProduct && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver a la lista
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEditProduct(selectedProduct)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDuplicateProduct(selectedProduct)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Duplicar
                </button>
              </div>
            </div>
          </div>

          {/* Vista previa del producto */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Vista Previa del Producto
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Vista en Tarjeta
                </h3>
                <ProductCard
                  product={selectedProduct}
                  storeData={storeData}
                  variant="grid"
                  showContactInfo={false}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Vista Destacada
                </h3>
                <ProductCard
                  product={selectedProduct}
                  storeData={storeData}
                  variant="featured"
                  showContactInfo={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}