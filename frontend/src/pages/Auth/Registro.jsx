import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const inputClass = (hasError) =>
  `block w-full pl-12 pr-12 py-3 border-2 ${hasError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f] focus:ring-opacity-20 transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`;

function Field({ id, label, icon, error, children }) {
  const Icon = icon;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        {children}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export default function Registro() {
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirm_password: '' });
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
    if (!formData.email) newErrors.email = 'El correo electrónico es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El correo electrónico no es válido';

    if (!formData.username) newErrors.username = 'El nombre de usuario es requerido';
    else if (formData.username.length < 3) newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    else if (formData.username.length > 45) newErrors.username = 'El usuario no puede exceder 45 caracteres';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Solo letras, números y guion bajo (_)';

    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = 'Debe contener mayúscula, minúscula y número';

    if (!formData.confirm_password) newErrors.confirm_password = 'Confirma tu contraseña';
    else if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
      });
      // Iniciamos sesión automáticamente y llevamos al usuario al diagnóstico.
      try {
        await login({ username: formData.username.trim(), password: formData.password });
        navigate('/cuestionario', { replace: true });
      } catch {
        navigate('/login', { state: { message: 'Tu cuenta fue creada. Inicia sesión para continuar.' } });
      }
    } catch (error) {
      const message = (error.message || 'Error al crear la cuenta').toLowerCase();
      if (message.includes('username') || message.includes('usuario')) {
        setErrors((prev) => ({ ...prev, username: error.message }));
      } else if (message.includes('email') || message.includes('correo')) {
        setErrors((prev) => ({ ...prev, email: error.message }));
      } else {
        setApiError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const eyeButton = (visible, toggle) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute inset-y-0 right-0 pr-4 flex items-center"
      disabled={isSubmitting}
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {visible ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-6xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full" />
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">¡Comienza tu aventura con FocusHive!</h2>
                <div className="my-8">
                  <div className="w-64 h-64 mx-auto bg-white bg-opacity-10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="w-32 h-32 text-white opacity-80" strokeWidth={1} />
                  </div>
                </div>
                <p className="text-lg text-blue-100 mb-4">Personaliza tu método de estudio</p>
                <p className="text-sm text-blue-200">En 2 minutos sabrás qué técnica se adapta mejor a ti</p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto">
                <Link to="/" className="text-sm text-gray-500 hover:text-[#1e3a5f] mb-6 inline-block">
                  ← Volver al inicio
                </Link>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Registrarse gratis</h3>
                <p className="text-gray-600 mb-8">Crea tu cuenta y comienza a aprender mejor</p>

                {apiError && (
                  <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3" role="alert">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Error al registrar</p>
                      <p className="text-sm text-red-600 mt-1">{apiError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <Field id="email" label="Correo electrónico" icon={Mail} error={errors.email}>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} disabled={isSubmitting} className={inputClass(errors.email)} placeholder="tu@email.com" autoComplete="email" />
                  </Field>

                  <Field id="username" label="Nombre de usuario" icon={User} error={errors.username}>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} disabled={isSubmitting} className={inputClass(errors.username)} placeholder="tu_usuario" autoComplete="username" />
                  </Field>

                  <Field id="password" label="Contraseña" icon={Lock} error={errors.password}>
                    <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} disabled={isSubmitting} className={inputClass(errors.password)} placeholder="••••••••" autoComplete="new-password" />
                    {eyeButton(showPassword, () => setShowPassword((s) => !s))}
                  </Field>
                  <p className="-mt-4 text-xs text-gray-500">Mínimo 8 caracteres, una mayúscula, una minúscula y un número</p>

                  <Field id="confirm_password" label="Confirmar contraseña" icon={Lock} error={errors.confirm_password}>
                    <input type={showConfirmPassword ? 'text' : 'password'} id="confirm_password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} disabled={isSubmitting} className={inputClass(errors.confirm_password)} placeholder="••••••••" autoComplete="new-password" />
                    {eyeButton(showConfirmPassword, () => setShowConfirmPassword((s) => !s))}
                  </Field>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#2a4a6f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creando cuenta...</span>
                      </>
                    ) : (
                      <span>Crear cuenta</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-[#1e3a5f] font-semibold hover:text-[#2a4a6f] transition-colors duration-200">
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
}
