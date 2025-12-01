import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-[calc(100vh-140px)] flex items-center relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-pink-400 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 left-20 w-12 h-12 bg-purple-400 rounded-full opacity-20"></div>
      
      <div className="container-custom py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="block text-gray-900">Enfócate.</span>
              <span className="block text-gray-900">Aprende.</span>
              <span className="block text-gray-900">Domina.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 max-w-xl">
              La única app que personaliza tu método de estudio y te motiva en comunidad.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/registro"
                className="bg-[#1e3a5f] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#2a4a6f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
              >
                Descubre tu método de estudio ideal
              </Link>
              
              <Link
                to="/registro"
                className="bg-white text-[#1e3a5f] px-8 py-4 rounded-lg font-semibold text-lg border-2 border-[#1e3a5f] hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-center"
              >
                Regístrate gratis
              </Link>
            </div>

            {/* Stats or Features */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-[#1e3a5f]">1000+</div>
                <div className="text-gray-600">Estudiantes activos</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-[#1e3a5f]">50+</div>
                <div className="text-gray-600">Métodos de estudio</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-[#1e3a5f]">95%</div>
                <div className="text-gray-600">Satisfacción</div>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative lg:pl-12 animate-fade-in">
            {/* Illustration Container */}
            <div className="relative">
              {/* Background Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-200 rounded-full opacity-30 blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-blue-200 rounded-full opacity-30 blur-3xl"></div>
              
              {/* Whiteboard/Screen */}
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="aspect-square flex items-center justify-center">
                  {/* Placeholder for your illustration */}
                  <div className="text-center space-y-4">
                    <div className="w-48 h-48 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center">
                        <svg
                          className="w-24 h-24 text-[#1e3a5f]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        Tu método personalizado
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Descubre cómo estudiar mejor
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 right-0 w-16 h-16 bg-yellow-400 rounded-xl transform rotate-12 animate-bounce opacity-80"></div>
              <div className="absolute bottom-10 left-0 w-12 h-12 bg-pink-400 rounded-full animate-pulse opacity-80"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;