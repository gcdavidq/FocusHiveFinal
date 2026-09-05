import { describe, expect, it } from 'vitest';
import { normalizeApiError, tokenStorage } from './api';

describe('normalizeApiError', () => {
  it('aplana los errores de validación de FastAPI (422)', () => {
    const error = normalizeApiError({
      response: {
        status: 422,
        data: {
          detail: [
            { loc: ['body', 'password'], msg: 'Value error, La contraseña debe contener al menos un número' },
            { loc: ['body', 'email'], msg: 'value is not a valid email address' },
          ],
        },
      },
    });
    expect(error.status).toBe(422);
    expect(error.message).toContain('password: La contraseña debe contener al menos un número');
    expect(error.message).toContain('email: value is not a valid email address');
  });

  it('usa el detail plano cuando es texto', () => {
    const error = normalizeApiError({ response: { status: 401, data: { detail: 'Credenciales incorrectas' } } });
    expect(error.status).toBe(401);
    expect(error.message).toBe('Credenciales incorrectas');
  });

  it('describe la falta de conexión cuando no hay respuesta', () => {
    const error = normalizeApiError({ request: {} });
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/No se pudo conectar/);
  });
});

describe('tokenStorage', () => {
  it('guarda, lee y limpia el token y el usuario', () => {
    tokenStorage.setToken('abc');
    tokenStorage.setUser({ username: 'ana' });
    expect(tokenStorage.getToken()).toBe('abc');
    expect(tokenStorage.getUser()).toEqual({ username: 'ana' });
    tokenStorage.clear();
    expect(tokenStorage.getToken()).toBeNull();
    expect(tokenStorage.getUser()).toBeNull();
  });

  it('el motivo de cierre de sesión se consume una sola vez', () => {
    tokenStorage.setAuthReason('expired');
    expect(tokenStorage.takeAuthReason()).toBe('expired');
    expect(tokenStorage.takeAuthReason()).toBeNull();
  });
});
