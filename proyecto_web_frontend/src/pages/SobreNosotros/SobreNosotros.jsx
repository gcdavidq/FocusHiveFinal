import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Linkedin, Github, Mail } from 'lucide-react';

const SobreNosotros = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Gian Carlos Quezada Marceliano',
      role: 'Backend & Arquitectura',
      description: 'Encargado de la arquitectura y desarrollo del Backend del proyecto',
      image: null, // Puedes añadir la ruta de la imagen después
      social: {
        linkedin: '#',
        github: '#',
        email: 'gian.quezada@focushive.com'
      },
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 2,
      name: 'Josué Abel Florián Párraga',
      role: 'Jefe del Proyecto',
      description: 'Jefe y encargado del proyecto',
      image: null,
      social: {
        linkedin: '#',
        github: '#',
        email: 'josue.florian@focushive.com'
      },
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 3,
      name: 'Victor Nikolai Huarcaya Pumacayo',
      role: 'UX/UI & Frontend',
      description: 'Encargado del diseño UX/UI y desarrollo Frontend',
      image: null,
      social: {
        linkedin: '#',
        github: '#',
        email: 'victor.huarcaya@focushive.com'
      },
      color: 'from-pink-400 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container-custom py-12">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-700 hover:text-[#1e3a5f] transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Regresar al inicio</span>
        </Link>

        {/* Header Section */}
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Sobre nosotros
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            "Somos una startup fundada por estudiantes apasionados por la tecnología, 
            enfocados en ofrecer soluciones innovadoras mediante el desarrollo de software 
            de alta calidad y tecnologías avanzadas."
          </p>
        </div>

        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header with Gradient */}
              <div className={`h-24 bg-gradient-to-br ${member.color} relative`}>
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
              </div>

              {/* Profile Image Placeholder */}
              <div className="px-6 -mt-14 mb-4 relative z-10">
                <div className="w-28 h-28 bg-white rounded-full shadow-xl border-4 border-white mx-auto flex items-center justify-center">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-3xl font-bold`}>
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="px-6 pb-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-[#1e3a5f] font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {member.description}
                </p>

                {/* Social Links */}
                <div className="flex justify-center space-x-3">
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 group"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href={member.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-800 rounded-full flex items-center justify-center transition-all duration-300 group"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href={`mailto:${member.social.email}`}
                    className="w-10 h-10 bg-gray-100 hover:bg-purple-600 rounded-full flex items-center justify-center transition-all duration-300 group"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mission/Vision Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 md:p-12 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
              <p className="text-gray-600 leading-relaxed">
                Revolucionar la forma en que los estudiantes aprenden, proporcionando 
                herramientas personalizadas que se adaptan a su estilo único de aprendizaje 
                y los ayudan a alcanzar su máximo potencial académico.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Visión</h3>
              <p className="text-gray-600 leading-relaxed">
                Ser la plataforma líder en educación personalizada en Latinoamérica, 
                transformando la experiencia educativa de millones de estudiantes mediante 
                tecnología innovadora y una comunidad de apoyo mutuo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SobreNosotros;