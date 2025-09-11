// src/components/store/StoreHeader.js
import { ArrowLeft, Heart, Share2, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

const StoreHeader = ({ storeData }) => {
  const router = useRouter();
  const { businessName, storeLogo, profileImage } = storeData;

  const handleBack = () => {
    router.push('/');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: `Visita ${businessName} en Family Market`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copiar al clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 border-b border-gray-200"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Lado izquierdo - Botón atrás y logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{ 
                backgroundColor: 'var(--store-primary, #2563eb)',
                color: 'white',
                borderRadius: 'var(--store-border-radius, 0.5rem)'
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              {(storeLogo || profileImage) && (
                <div 
                  className="w-10 h-10 overflow-hidden border-2"
                  style={{ 
                    borderColor: 'var(--store-primary, #2563eb)',
                    borderRadius: 'var(--store-border-radius, 0.5rem)'
                  }}
                >
                  <img
                    src={storeLogo || profileImage}
                    alt={businessName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <h1 className="font-semibold text-gray-900 text-lg">
                  {businessName}
                </h1>
                <div className="flex items-center space-x-1">
                  <Star 
                    className="w-4 h-4 fill-current" 
                    style={{ color: 'var(--store-primary, #2563eb)' }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'var(--store-primary, #2563eb)' }}
                  >
                    4.8
                  </span>
                  <span className="text-sm text-gray-500">(125)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Acciones */}
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{ 
                backgroundColor: 'var(--store-secondary, #64748b)',
                color: 'white',
                borderRadius: 'var(--store-border-radius, 0.5rem)'
              }}
            >
              <Heart className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleShare}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{ 
                backgroundColor: 'var(--store-secondary, #64748b)',
                color: 'white',
                borderRadius: 'var(--store-border-radius, 0.5rem)'
              }}
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;