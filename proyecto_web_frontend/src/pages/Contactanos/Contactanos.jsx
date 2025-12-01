import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageCircle, Send, MapPin, Clock } from 'lucide-react';

const Contactanos = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío del formulario
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ nombre: '', email: '', mensaje: '' });
      
      // Resetear mensaje de éxito después de 5 segundos
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      items: [
        { label: 'Consultas', value: 'focushiveconsultas@gmail.com' },
        { label: 'Soporte', value: 'focushivesupport@gmail.com' }
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Phone,
      title: 'Teléfono',
      items: [
        { label: 'Principal', value: '(01) 617-3000' },
        { label: 'Alternativo', value: '(01) 812-1620' },
        { label: 'Directo', value: '(01) 732-8421' }
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      items: [
        { label: 'Perú', value: '+51 987 654 321' },
        { label: 'Internacional 1', value: '+51 903 153 565' },
        { label: 'Internacional 2', value: '+51 987 600 123' }
      ],
      color: 'from-emerald-500 to-emerald-600'
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

        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Contáctanos
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Envíanos tus preguntas, comentarios o sugerencias. Te responderemos lo más pronto posible.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Envíanos un mensaje</h2>
              <p className="text-gray-600">Completa el formulario y nos pondremos en contacto contigo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none"
                  placeholder="Tu nombre completo"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Mensaje */}
              <div>
                <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1e3a5f] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#2a4a6f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar mensaje</span>
                  </>
                )}
              </button>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center space-x-3 animate-slide-down">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-800 font-medium">
                    ¡Mensaje enviado con éxito! Te responderemos pronto.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 animate-fade-in">
            {/* Contact Cards */}
            {contactInfo.map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{contact.title}</h3>
                      <div className="space-y-2">
                        {contact.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{item.label}:</span>
                            <span className="text-sm font-medium text-gray-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Additional Info Card */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-start space-x-4 mb-4">
                <Clock className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Horario de atención</h3>
                  <p className="text-blue-200">
                    Lunes a Viernes: 9:00 AM - 6:00 PM<br />
                    Sábados: 10:00 AM - 2:00 PM<br />
                    Domingos: Cerrado
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 mt-6">
                <MapPin className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Ubicación</h3>
                  <p className="text-blue-200">
                    Lima, Perú<br />
                    Disponible en toda Latinoamérica
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Síguenos en redes sociales</h3>
              <p className="text-gray-600 mb-4 text-sm">
                También puedes encontrarnos en nuestras redes sociales para estar al tanto de las novedades:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Facebook</span>
                <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">Twitter</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Instagram</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">LinkedIn</span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">YouTube</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contactanos;