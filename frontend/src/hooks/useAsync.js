import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Ejecuta una función asíncrona al montar (y al cambiar `deps`) manejando carga y error.
 * Devuelve { data, loading, error, reload, setData }.
 */
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;

  const run = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error?.message || 'Error inesperado' });
      return null;
    }
  }, []);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((updater) => {
    setState((current) => ({
      ...current,
      data: typeof updater === 'function' ? updater(current.data) : updater,
    }));
  }, []);

  return { ...state, reload: run, setData };
}
