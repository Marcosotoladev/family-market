// src/components/store/StoreFooter.js
'use client';

import { Heart } from 'lucide-react';

export default function StoreFooter({ storeData }) {
  const currentYear = new Date().getFullYear();
  const memberSince = storeData.createdAt ? new Date(storeData.createdAt.toDate()).getFullYear() : currentYear;

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            © {currentYear} {storeData.businessName} • Familia {storeData.familyName}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Miembro de Family Market desde {memberSince}
          </p>
          <div className="flex items-center justify-center text-xs text-gray-400">
            <span>Creado con</span>
            <Heart className="w-3 h-3 mx-1 text-red-400" />
            <span>en</span>
            <a 
              href="/"
              className="ml-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Family Market
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}