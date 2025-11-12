import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-lg w-full px-6 text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <svg
            className="w-32 h-32 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Volver al Inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Volver Atrás
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

