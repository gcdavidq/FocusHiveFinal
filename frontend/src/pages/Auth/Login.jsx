import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, User, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { tokenStorage } from '../../services/api';

const inputClass = (hasError) =>
  `block w-full pl-12 pr-12 py-3 border-2 ${hasError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const registroExitoso = location.state?.message;
  const redirectTo = location.state?.from;
  const [expiredNotice, setExpiredNotice] = useState(() => tokenStorage.takeAuthReason() === 'expired');
  const [showSuccessMessage, setShowSuccessMessage] = useState(Boolean(registroExitoso));

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'El usuario es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');
    setShowSuccessMessage(false);
    setExpiredNotice(false);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const user = await login({ username: formData.username.trim(), password: formData.password });
      if (!user.diagnostic_completed) {
        navigate('/cuestionario', { replace: true });
      } else {
        navigate(redirectTo || '/seguimiento', { replace: true });
      }
    } catch (error) {
      if (error.status === 401) {
        setApiError('Usuario o contraseña incorrectos. Verifica tus datos.');
        setFormData((prev) => ({ ...prev, password: '' }));
      } else {
        setApiError(error.message || 'Error al iniciar sesión');
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
            {/* Panel ilustrativo */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full" />
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">¡Bienvenido a FocusHive!</h2>
                <div className="my-8">
                  <div className="w-64 h-64 mx-auto bg-white bg-opacity-10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                    <User className="w-32 h-32 text-white opacity-80" strokeWidth={1} />
                  </div>
                </div>
                <p className="text-lg text-blue-100 mb-4">Continúa tu viaje de aprendizaje</p>
                <p className="text-sm text-blue-200">Accede a tu método personalizado y a tu progreso</p>
              </div>
            </div>

            {/* Formulario */}
            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto">
                <Link to="/" className="text-sm text-gray-500 hover:text-[#1e3a5f] mb-6 inline-block">
                  ← Volver al inicio
                </Link>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Iniciar sesión</h3>
                <p className="text-gray-600 mb-8">Ingresa con tu usuario o tu correo electrónico</p>

                {showSuccessMessage && registroExitoso && (
                  <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800">¡Registro exitoso!</p>
                      <p className="text-sm text-green-600 mt-1">{registroExitoso}</p>
                    </div>
                    <button onClick={() => setShowSuccessMessage(false)} className="text-green-400 hover:text-green-600" aria-label="Cerrar">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {expiredNotice && (
                  <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">Tu sesión expiró. Inicia sesión nuevamente para continuar.</p>
                  </div>
                )}

                {apiError && (
                  <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3" role="alert">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Error al iniciar sesión</p>
                      <p className="text-sm text-red-600 mt-1">{apiError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                      Usuario o correo
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
                        className={inputClass(errors.username)}
                        placeholder="tu_usuario o tu@email.com"
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
                        className={inputClass(errors.password)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((show) => !show)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        disabled={isSubmitting}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.password}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#2a4a6f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Iniciando sesión...</span>
                      </>
                    ) : (
                      <span>Iniciar sesión</span>
                    )}
                  </button>
                </form>

                <p className="mt-4 text-xs text-gray-500 text-center">
                  ¿Olvidaste tu contraseña? La recuperación por correo no está disponible en esta versión del proyecto.
                </p>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    ¿Aún no tienes una cuenta?{' '}
                    <Link to="/registro" className="text-[#1e3a5f] font-semibold hover:text-[#2a4a6f] transition-colors duration-200">
                      Crea tu cuenta
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
}
