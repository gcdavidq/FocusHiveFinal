import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, X, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full animate-slide-up">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mensaje de registro exitoso (si viene del registro)
  const registroExitoso = location.state?.message;
  const emailFromRegistro = location.state?.email;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '', // Cambiado de 'usuario' a 'username'
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(!!registroExitoso);

  // Estados para modales de recuperación
  const [recoveryStep, setRecoveryStep] = useState(null);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores
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

    if (!formData.username) {
      newErrors.username = 'El usuario es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar mensajes previos
    setApiError('');
    setShowSuccessMessage(false);

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Llamar a la API real de login
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password
      });

      console.log('✅ Login exitoso:', response);

      // El token y el usuario ya se guardaron en localStorage desde api.js
      // Puedes acceder al usuario con: response.user

      // Redirigir según el estado del usuario
      // Opción 1: Si el usuario no ha completado el cuestionario
      if (!response.user.has_completed_diagnostic) {
        navigate('/cuestionario');
      } else {
        // Opción 2: Ir al dashboard o home
        navigate('/');
      }

    } catch (error) {
      console.error('❌ Error en login:', error);

      // Manejar errores específicos
      const errorMessage = error.message || 'Error al iniciar sesión';

      // Detectar tipo de error
      if (errorMessage.toLowerCase().includes('credenciales')) {
        setApiError('Usuario o contraseña incorrectos. Por favor, verifica tus datos.');
        // Opcional: limpiar los campos visualmente si prefieres
        setFormData({ username: formData.username, password: '' });
        return;


      } else if (errorMessage.toLowerCase().includes('usuario')) {
        setErrors({
          username: errorMessage
        });
        return;
      } else if (errorMessage.toLowerCase().includes('contraseña')) {
        setErrors({
          password: errorMessage
        });
        return;
      } else {
        setApiError(errorMessage);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAllModals = () => {
    setRecoveryStep(null);
    setRecoveryEmail('');
    setRecoveryCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (recoveryEmail) {
      // TODO: Llamar a tu API de recuperación de contraseña
      // await authAPI.requestPasswordReset(recoveryEmail);

      // Por ahora, simular envío de código
      console.log('📧 Solicitud de recuperación para:', recoveryEmail);
      setRecoveryStep('code');
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (recoveryCode) {
      // TODO: Validar código con tu API
      // await authAPI.verifyResetCode(recoveryCode);

      console.log('🔢 Código ingresado:', recoveryCode);
      setRecoveryStep('password');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert('Por favor completa ambos campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // TODO: Llamar a tu API para restablecer contraseña
    // await authAPI.resetPassword({ code: recoveryCode, newPassword });

    alert('¡Contraseña restablecida con éxito!');
    closeAllModals();
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
                  ¡Bienvenido a FocusHive!
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>

                <p className="text-lg text-blue-100 mb-4">
                  Continúa tu viaje de aprendizaje
                </p>
                <p className="text-sm text-blue-200">
                  Accede a tu método personalizado
                </p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Iniciar sesión
                </h3>
                <p className="text-gray-600 mb-8">
                  Ingresa a tu cuenta para continuar
                </p>

                {/* Mensaje de registro exitoso */}
                {showSuccessMessage && registroExitoso && (
                  <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800">¡Registro exitoso!</p>
                      <p className="text-sm text-green-600 mt-1">{registroExitoso}</p>
                    </div>
                    <button
                      onClick={() => setShowSuccessMessage(false)}
                      className="text-green-400 hover:text-green-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Error general de API */}
                {apiError && (
                  <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Error al iniciar sesión</p>
                      <p className="text-sm text-red-600 mt-1">{apiError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Usuario */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                      Usuario
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
                        placeholder="Tu nombre de usuario"
                        autoComplete="username"
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
                        autoComplete="current-password"
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
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setRecoveryStep('email')}
                      className="text-sm text-[#1e3a5f] hover:text-[#2a4a6f] font-medium transition-colors duration-200"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
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
                        <span>Iniciando sesión...</span>
                      </>
                    ) : (
                      <span>Iniciar sesión</span>
                    )}
                  </button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    ¿Aún no tienes una cuenta?{' '}
                    <Link
                      to="/registro"
                      className="text-[#1e3a5f] font-semibold hover:text-[#2a4a6f] transition-colors duration-200"
                    >
                      Crea tu cuenta
                    </Link>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal 1: Recuperar cuenta */}
      <Modal
        isOpen={recoveryStep === 'email'}
        onClose={closeAllModals}
        title="Recupera tu cuenta"
      >
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Introduce tu correo electrónico para recuperar tu cuenta.
          </p>
        </div>

        <form onSubmit={handleEmailSubmit}>
          <div className="mb-6">
            <input
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none"
              placeholder="tu@email.com"
              required
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={closeAllModals}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#2a4a6f] transition-colors duration-200"
            >
              Aceptar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Código de verificación */}
      <Modal
        isOpen={recoveryStep === 'code'}
        onClose={closeAllModals}
        title="Código de recuperación"
      >
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Te enviamos un código de verificación a tu correo. Ingresa el código para continuar.
          </p>
        </div>

        <form onSubmit={handleCodeSubmit}>
          <div className="mb-6">
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength="6"
              required
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setRecoveryStep('email')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Atrás
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#2a4a6f] transition-colors duration-200"
            >
              Verificar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Restablecer contraseña */}
      <Modal
        isOpen={recoveryStep === 'password'}
        onClose={closeAllModals}
        title="Restablece tu contraseña"
      >
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Introduce tu nueva contraseña para restablecerla.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none"
              placeholder="Nueva contraseña"
              minLength="8"
              required
              autoFocus
            />
          </div>

          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none"
              placeholder="Confirmar nueva contraseña"
              minLength="8"
              required
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setRecoveryStep('code')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Atrás
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#2a4a6f] transition-colors duration-200"
            >
              Restablecer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Login;