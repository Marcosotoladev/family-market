// src/app/test-prod/page.js
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { db, auth, storage } from '@/lib/firebase/config';
import { ref, listAll } from 'firebase/storage';

export default function TestProdPage() {
  const [results, setResults] = useState({});

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const testResults = {};

    // Test 1: Verificar configuración
    testResults.config = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NO CONFIGURADO',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'NO CONFIGURADO',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'NO CONFIGURADO',
    };

    // Test 2: Verificar autenticación
    testResults.auth = {
      currentUser: auth.currentUser ? auth.currentUser.uid : 'No autenticado',
    };

    // Test 3: Leer colección empleos
    try {
      const empleosQuery = query(collection(db, 'empleos'), limit(1));
      const snapshot = await getDocs(empleosQuery);
      testResults.empleos = {
        success: true,
        count: snapshot.size,
        message: `Se pudieron leer ${snapshot.size} documentos`
      };
    } catch (error) {
      testResults.empleos = {
        success: false,
        error: error.message,
        code: error.code
      };
    }

    // Test 4: Leer un documento específico
    try {
      const docRef = await getDoc(doc(db, 'empleos', '81yisjJPV7Bdo3qs2uhJ'));
      testResults.documento = {
        success: true,
        exists: docRef.exists(),
        message: docRef.exists() ? 'Documento encontrado' : 'Documento no existe'
      };
    } catch (error) {
      testResults.documento = {
        success: false,
        error: error.message,
        code: error.code
      };
    }

    // Test 5: Verificar Storage
    try {
      const storageRef = ref(storage, 'cvs');
      const listResult = await listAll(storageRef);
      testResults.storage = {
        success: true,
        message: 'Storage accesible',
        folders: listResult.prefixes.length
      };
    } catch (error) {
      testResults.storage = {
        success: false,
        error: error.message,
        code: error.code
      };
    }

    setResults(testResults);
    console.log('Resultados de prueba:', testResults);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test de Producción - Firebase</h1>
      
      <div className="space-y-4">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="border rounded p-4">
            <h2 className="font-semibold text-lg mb-2">{key.toUpperCase()}</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-100 rounded">
        <p className="font-semibold">Revisa también la consola del navegador para más detalles</p>
      </div>
    </div>
  );
}