import { useCallback, useEffect, useMemo, useState } from 'react';
import { AUTH_EVENT, authAPI, tokenStorage } from '../services/api';
import { AuthContext } from './auth-context';

/**
 * Mantiene la sesión del usuario: token en localStorage, datos del usuario en memoria
 * y sincronización con el backend al cargar la app o cuando el token expira.
 */
export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStorage.getToken());
  const [user, setUser] = useState(() => tokenStorage.getUser());
  const [initializing, setInitializing] = useState(() => Boolean(tokenStorage.getToken()));

  // Al cargar con un token guardado, refrescamos el usuario desde la API.
  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }
    let cancelled = false;
    authAPI
      .getMe()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        tokenStorage.setUser(me);
      })
      .catch(() => {
        /* el interceptor ya limpió la sesión si el token era inválido */
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
    // Solo en el montaje inicial: los cambios posteriores de token pasan por login/logout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El interceptor de la API avisa cuando el backend rechaza el token.
  useEffect(() => {
    const handleExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener(AUTH_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EVENT, handleExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authAPI.login(credentials);
    tokenStorage.setToken(response.access_token);
    tokenStorage.setUser(response.user);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback((payload) => authAPI.register(payload), []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      /* si el token ya expiró, igual cerramos sesión localmente */
    } finally {
      tokenStorage.clear();
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authAPI.getMe();
    setUser(me);
    tokenStorage.setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      initializing,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, initializing, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
