// src/app/api/search/route.js
// Busca en productos, servicios y empleos de Firebase
// SOLO de la tienda especificada

import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get('q');
  const storeSlug = searchParams.get('store');

  if (!q || q.trim().length < 1) {
    return Response.json({ results: [] });
  }

  if (!storeSlug) {
    console.error('❌ No se proporcionó storeSlug');
    return Response.json({ results: [], error: 'storeSlug requerido' }, { status: 400 });
  }

  try {
    console.log('🔍 Buscando:', q, 'en tienda:', storeSlug);
    const queryLower = q.toLowerCase();
    const allResults = [];

    // PRIMERO: Obtener el usuarioId basado en el storeSlug
    let userId = null;
    try {
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('storeSlug', '==', storeSlug));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        userId = userSnapshot.docs[0].id;
        console.log('✅ Usuario encontrado:', userId);
      } else {
        console.error('❌ Tienda no encontrada:', storeSlug);
        return Response.json({ results: [], error: 'Tienda no encontrada' }, { status: 404 });
      }
    } catch (error) {
      console.error('❌ Error obteniendo usuarioId:', error.message);
      return Response.json({ results: [], error: 'Error obteniendo tienda' }, { status: 500 });
    }

    // BUSCAR EN PRODUCTOS (solo de esta tienda)
    try {
      console.log('📦 Buscando en productos de usuarioId:', userId);
      const productosRef = collection(db, 'productos');
      const productQuery = query(productosRef, where('usuarioId', '==', userId));
      const productosSnapshot = await getDocs(productQuery);

      productosSnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (
          data.nombre?.toLowerCase().includes(queryLower) ||
          data.descripcion?.toLowerCase().includes(queryLower)
        ) {
          allResults.push({
            id: doc.id,
            name: data.nombre,
            price: data.precio,
            image: data.imagenPrincipal || data.imagen,
            description: data.descripcion,
            slug: doc.id,
            type: 'producto'
          });
        }
      });
      console.log(`✅ Encontrados ${productosSnapshot.size} documentos en productos`);
    } catch (error) {
      console.error('❌ Error buscando productos:', error.message);
    }

    // BUSCAR EN SERVICIOS (solo de esta tienda)
    try {
      console.log('🔧 Buscando en servicios de usuarioId:', userId);
      const serviciosRef = collection(db, 'servicios');
      const servicioQuery = query(serviciosRef, where('usuarioId', '==', userId));
      const serviciosSnapshot = await getDocs(servicioQuery);

      serviciosSnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (
          data.nombre?.toLowerCase().includes(queryLower) ||
          data.descripcion?.toLowerCase().includes(queryLower)
        ) {
          allResults.push({
            id: doc.id,
            name: data.nombre,
            price: data.precio,
            image: data.imagenPrincipal || data.imagen,
            description: data.descripcion,
            slug: doc.id,
            type: 'servicio'
          });
        }
      });
      console.log(`✅ Encontrados ${serviciosSnapshot.size} documentos en servicios`);
    } catch (error) {
      console.error('❌ Error buscando servicios:', error.message);
    }

    // BUSCAR EN EMPLEOS (solo de esta tienda)
    try {
      console.log('💼 Buscando en empleos de usuarioId:', userId);
      const empleosRef = collection(db, 'empleos');
      const empleoQuery = query(empleosRef, where('usuarioId', '==', userId));
      const empleosSnapshot = await getDocs(empleoQuery);

      empleosSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Manejar ubicacion como objeto o string
        let ubicacionTexto = '';
        if (typeof data.ubicacion === 'object' && data.ubicacion) {
          ubicacionTexto = data.ubicacion.ciudad || data.ubicacion.provincia || '';
        } else if (typeof data.ubicacion === 'string') {
          ubicacionTexto = data.ubicacion;
        }
        
        if (
          data.titulo?.toLowerCase().includes(queryLower) ||
          data.nombre?.toLowerCase().includes(queryLower) ||
          data.descripcion?.toLowerCase().includes(queryLower) ||
          data.empresa?.toLowerCase().includes(queryLower) ||
          ubicacionTexto.toLowerCase().includes(queryLower)
        ) {
          allResults.push({
            id: doc.id,
            name: data.titulo || data.nombre,
            company: data.empresa,
            location: typeof data.ubicacion === 'object' ? (data.ubicacion?.ciudad || data.ubicacion?.provincia) : data.ubicacion,
            image: data.foto,
            description: data.descripcion,
            slug: doc.id,
            type: 'empleo'
          });
        }
      });
      console.log(`✅ Encontrados ${empleosSnapshot.size} documentos en empleos`);
    } catch (error) {
      console.error('❌ Error buscando empleos:', error.message);
    }

    console.log(`📊 Total de resultados: ${allResults.length}`);
    return Response.json({ results: allResults.slice(0, 10), success: true });

  } catch (error) {
    console.error('💥 Error general en búsqueda:', error);
    return Response.json({ 
      results: [], 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}