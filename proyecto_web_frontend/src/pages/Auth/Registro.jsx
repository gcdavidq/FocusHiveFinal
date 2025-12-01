import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authAPI } from "../../services/api";;

const Registro = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '', // Cambiado de 'usuario' a 'username'
    password: '',
    confirm_password: '' // Nuevo campo
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    // Validar username (según tu backend: 3-45 caracteres)
    if (!formData.username) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    } else if (formData.username.length > 45) {
      newErrors.username = 'El usuario no puede exceder 45 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Solo letras, números y guión bajo (_)';
    }

    // Validar contraseña (según tu backend: mínimo 8 caracteres, mayúscula, minúscula, número)
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Debe contener mayúscula, minúscula y número';
    }

    // Validar confirmación de contraseña
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar error previo de API
    setApiError('');

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Llamar a la API real
      const response = await authAPI.register(formData);

      console.log('✅ Registro exitoso:', response);

      // Mostrar mensaje de éxito (opcional)
      // alert(response.message || 'Usuario registrado exitosamente');

      // Redirigir al login o al cuestionario diagnóstico
      // Opción 1: Redirigir al login para que inicie sesión
      navigate('/login', {
        state: {
          message: '¡Registro exitoso! Ahora inicia sesión.',
          email: formData.email
        }
      });

      // Opción 2: Auto-login y redirigir al cuestionario
      // const loginResponse = await authAPI.login({
      //   username: formData.username,
      //   password: formData.password
      // });
      // navigate('/cuestionario-diagnostico');

    } catch (error) {
      console.error('❌ Error en registro:', error);

      // Manejar errores específicos del backend
      const errorMessage = error.message || 'Error al crear la cuenta';

      // Detectar tipo de error y asignar al campo correcto
      if (errorMessage.toLowerCase().includes('username') ||
          errorMessage.toLowerCase().includes('usuario')) {
        setErrors(prev => ({
          ...prev,
          username: errorMessage
        }));
      } else if (errorMessage.toLowerCase().includes('email') ||
                 errorMessage.toLowerCase().includes('correo')) {
        setErrors(prev => ({
          ...prev,
          email: errorMessage
        }));
      } else {
        // Error genérico
        setApiError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-6xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Left Side - Illustration */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>

              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  ¡Comienza tu aventura con FocusHive!
                </h2>

                <div className="my-8">
                  <div className="w-64 h-64 mx-auto bg-white bg-opacity-10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                    <svg
                      className="w-40 h-40 text-white opacity-80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                </div>

                <p className="text-lg text-blue-100 mb-4">
                  Personaliza tu método de estudio
                </p>
                <p className="text-sm text-blue-200">
                  Únete a nuestra comunidad de estudiantes
                </p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Registrarse gratis
                </h3>
                <p className="text-gray-600 mb-8">
                  Crea tu cuenta y comienza a aprender mejor
                </p>

                {/* Error general de API */}
                {apiError && (
                  <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Error al registrar</p>
                      <p className="text-sm text-red-600 mt-1">{apiError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={`block w-full pl-12 pr-4 py-3 border-2 ${
                          errors.email ? 'border-red-500' : 'border-gray-200'
                        } rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        placeholder="tu@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre de Usuario
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={`block w-full pl-12 pr-4 py-3 border-2 ${
                          errors.username ? 'border-red-500' : 'border-gray-200'
                        } rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        placeholder="tu_usuario"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.username}</span>
                      </p>
                    )}
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={`block w-full pl-12 pr-12 py-3 border-2 ${
                          errors.password ? 'border-red-500' : 'border-gray-200'
                        } rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.password}</span>
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                    </p>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={`block w-full pl-12 pr-12 py-3 border-2 ${
                          errors.confirm_password ? 'border-red-500' : 'border-gray-200'
                        } rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.confirm_password}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#2a4a6f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creando cuenta...</span>
                      </>
                    ) : (
                      <span>Crear cuenta</span>
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    ¿Ya tienes una cuenta?{' '}
                    <Link
                      to="/login"
                      className="text-[#1e3a5f] font-semibold hover:text-[#2a4a6f] transition-colors duration-200"
                    >
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;