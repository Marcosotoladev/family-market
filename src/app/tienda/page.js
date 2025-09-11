// src/app/tienda/test/page.js
export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ Test funcionando
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          La ruta estática /tienda/test está trabajando correctamente
        </p>
        <p className="text-sm text-gray-500">
          Si ves esto, Next.js está funcionando bien
        </p>
      </div>
    </div>
  );
}