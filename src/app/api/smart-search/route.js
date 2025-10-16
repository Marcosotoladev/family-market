// src/app/api/smart-search/route.js
import { NextResponse } from 'next/server';
import { analyzeSearchIntent } from '@/lib/ai/openaiService';
import { db } from '@/lib/firebase/config';
import { collection, query, getDocs, limit } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { searchQuery } = await request.json();

    if (!searchQuery || searchQuery.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query de búsqueda requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Búsqueda recibida:', searchQuery);

    // 1. Analizar intención con IA
    const intentAnalysis = await analyzeSearchIntent(searchQuery);
    
    if (!intentAnalysis.success) {
      console.error('Error en análisis de intención:', intentAnalysis.error);
    }

    const analysis = intentAnalysis.data;
    console.log('🤖 Análisis de IA:', JSON.stringify(analysis, null, 2));

    // 2. Buscar en Firestore según el análisis
    const results = {
      analysis,
      productos: [],
      servicios: [],
      empleos: [],
    };

    // Buscar productos
    if (analysis.tipo_busqueda.includes('productos')) {
      results.productos = await searchProducts(searchQuery, analysis);
    }

    // Buscar servicios
    if (analysis.tipo_busqueda.includes('servicios')) {
      results.servicios = await searchServices(searchQuery, analysis);
    }

    // Buscar empleos
    if (analysis.tipo_busqueda.includes('empleos')) {
      results.empleos = await searchJobs(searchQuery, analysis);
    }

    console.log('✅ Resultados encontrados:', {
      productos: results.productos.length,
      servicios: results.servicios.length,
      empleos: results.empleos.length,
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error en smart-search:', error);
    return NextResponse.json(
      { error: 'Error en la búsqueda inteligente', details: error.message },
      { status: 500 }
    );
  }
}

// Función para buscar productos
async function searchProducts(searchQuery, analysis) {
  try {
    console.log('🔎 Buscando productos...');
    
    // ⚠️ CAMBIO: productos en español
    const productsRef = collection(db, 'productos');
    
    // Traer TODOS los productos SIN FILTRO de estado
    const q = query(
      productsRef,
      limit(100)
    );

    const snapshot = await getDocs(q);
    console.log(`📦 ${snapshot.docs.length} productos encontrados en total`);
    
    let productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtrar por estado "disponible" MANUALMENTE
    productos = productos.filter(p => p.estado === 'disponible');
    console.log(`✅ ${productos.length} productos con estado disponible`);

    console.log('🔍 Productos antes de filtrar por búsqueda:', productos.length);
    if (productos[0]) {
      console.log('📝 Primer producto ejemplo:', {
        nombre: productos[0].nombre,
        titulo: productos[0].titulo,
        categoria: productos[0].categoria,
        subcategoria: productos[0].subcategoria,
        estado: productos[0].estado
      });
    }

    // Normalizar el query de búsqueda
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);
    console.log('🔤 Términos de búsqueda:', searchTerms);
    console.log('🔤 Palabras clave IA:', analysis.palabras_clave);
    console.log('🗂️ Categorías sugeridas IA:', analysis.categorias_productos);

    // Filtrar productos por coincidencia
    productos = productos.filter(producto => {
      const searchableText = `
        ${producto.nombre || ''} 
        ${producto.titulo || ''}
        ${producto.descripcion || ''} 
        ${producto.categoria || ''}
        ${producto.subcategoria || ''}
        ${producto.palabrasClave?.join(' ') || ''}
      `.toLowerCase();

      // Buscar por términos del query original
      const matchesSearchTerms = searchTerms.some(term => 
        searchableText.includes(term)
      );

      // Buscar por palabras clave de la IA
      const matchesAIKeywords = analysis.palabras_clave?.some(palabra => 
        searchableText.includes(palabra.toLowerCase())
      );

      // Buscar si la categoría coincide
      const matchesAICategories = analysis.categorias_productos?.some(cat => {
        const catLower = cat.toLowerCase();
        const prodCat = (producto.categoria || '').toLowerCase();
        const prodSubcat = (producto.subcategoria || '').toLowerCase();
        
        // Coincidencia exacta
        if (prodCat === catLower) return true;
        
        // Coincidencia parcial
        if (prodCat.includes(catLower) || catLower.includes(prodCat)) return true;
        
        // Coincidencia por palabras en común
        const catWords = catLower.split('_');
        const prodCatWords = prodCat.split('_');
        const hasCommonWord = catWords.some(word => prodCatWords.includes(word));
        
        return hasCommonWord;
      });

      const isMatch = matchesSearchTerms || matchesAIKeywords || matchesAICategories;
      
      if (isMatch) {
        console.log('✅ Match encontrado:', producto.nombre || producto.titulo);
        console.log('   Categoría:', producto.categoria);
        console.log('   Subcategoría:', producto.subcategoria);
        console.log('   Estado:', producto.estado);
      }

      return isMatch;
    });

    console.log('✅ Productos después de filtrar:', productos.length);

    return productos.slice(0, 10);

  } catch (error) {
    console.error('Error buscando productos:', error);
    return [];
  }
}

// Función para buscar servicios
async function searchServices(searchQuery, analysis) {
  try {
    console.log('🔎 Buscando servicios...');
    
    const servicesRef = collection(db, 'servicios');
    
    const q = query(
      servicesRef,
      limit(100)
    );

    const snapshot = await getDocs(q);
    console.log(`🔧 ${snapshot.docs.length} servicios encontrados en total`);
    
    let servicios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtrar por estado disponible manualmente
    servicios = servicios.filter(s => s.estado === 'disponible');
    console.log(`✅ ${servicios.length} servicios con estado disponible`);

    if (servicios[0]) {
      console.log('📝 Primer servicio ejemplo:', {
        titulo: servicios[0].titulo,
        categoria: servicios[0].categoria,
        subcategoria: servicios[0].subcategoria,
        estado: servicios[0].estado
      });
    }

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);
    console.log('🔤 Términos de búsqueda servicios:', searchTerms);

    servicios = servicios.filter(servicio => {
      const searchableText = `
        ${servicio.titulo || ''} 
        ${servicio.descripcion || ''} 
        ${servicio.categoria || ''}
        ${servicio.subcategoria || ''}
        ${servicio.palabrasClave?.join(' ') || ''}
      `.toLowerCase();

      const matchesSearchTerms = searchTerms.some(term => 
        searchableText.includes(term)
      );

      const matchesAIKeywords = analysis.palabras_clave?.some(palabra => 
        searchableText.includes(palabra.toLowerCase())
      );

      const matchesAICategories = analysis.categorias_servicios?.some(cat => {
        const catLower = cat.toLowerCase();
        const servCat = (servicio.categoria || '').toLowerCase();
        
        return servCat === catLower || 
               servCat.includes(catLower) || 
               catLower.includes(servCat);
      });

      const isMatch = matchesSearchTerms || matchesAIKeywords || matchesAICategories;
      
      if (isMatch) {
        console.log('✅ Servicio match:', servicio.titulo);
      }

      return isMatch;
    });

    console.log('✅ Servicios después de filtrar:', servicios.length);

    return servicios.slice(0, 10);

  } catch (error) {
    console.error('Error buscando servicios:', error);
    return [];
  }
}

// Función para buscar empleos
async function searchJobs(searchQuery, analysis) {
  try {
    console.log('🔎 Buscando empleos...');
    
    // ⚠️ CAMBIO: employment en inglés (según tu captura)
    const jobsRef = collection(db, 'empleos');
    
    const q = query(
      jobsRef,
      limit(100)
    );

    const snapshot = await getDocs(q);
    console.log(`💼 ${snapshot.docs.length} empleos encontrados en total`);
    
    let empleos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtrar por estado activo manualmente
    empleos = empleos.filter(e => e.estado === 'activo');
    console.log(`✅ ${empleos.length} empleos con estado activo`);

    if (empleos[0]) {
      console.log('📝 Primer empleo ejemplo:', {
        titulo: empleos[0].titulo,
        categoria: empleos[0].categoria,
        tipoPublicacion: empleos[0].tipoPublicacion,
        estado: empleos[0].estado
      });
    }

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);

    empleos = empleos.filter(empleo => {
      const searchableText = `
        ${empleo.titulo || ''} 
        ${empleo.descripcion || ''} 
        ${empleo.categoria || ''}
        ${empleo.subcategoria || ''}
        ${empleo.habilidades?.join(' ') || ''}
      `.toLowerCase();

      const matchesSearchTerms = searchTerms.some(term => 
        searchableText.includes(term)
      );

      const matchesAIKeywords = analysis.palabras_clave?.some(palabra => 
        searchableText.includes(palabra.toLowerCase())
      );

      const matchesAICategories = analysis.categorias_empleos?.some(cat => {
        const catLower = cat.toLowerCase();
        const jobCat = (empleo.categoria || '').toLowerCase();
        
        return jobCat === catLower || 
               jobCat.includes(catLower) || 
               catLower.includes(jobCat);
      });

      const isMatch = matchesSearchTerms || matchesAIKeywords || matchesAICategories;
      
      if (isMatch) {
        console.log('✅ Empleo match:', empleo.titulo);
      }

      return isMatch;
    });

    console.log('✅ Empleos después de filtrar:', empleos.length);

    return empleos.slice(0, 10);

  } catch (error) {
    console.error('Error buscando empleos:', error);
    return [];
  }
}