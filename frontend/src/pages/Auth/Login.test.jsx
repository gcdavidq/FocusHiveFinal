import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { AuthContext } from '../../context/auth-context';

function renderLogin(login = vi.fn()) {
  render(
    <AuthContext.Provider value={{ login, isAuthenticated: false, initializing: false }}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return login;
}

describe('Login', () => {
  it('valida los campos vacíos antes de llamar a la API', () => {
    const login = renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(screen.getByText('El usuario es requerido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('muestra un mensaje claro cuando las credenciales son incorrectas', async () => {
    const failure = Object.assign(new Error('Credenciales incorrectas'), { status: 401 });
    const login = renderLogin(vi.fn().mockRejectedValue(failure));

    fireEvent.change(screen.getByLabelText(/usuario o correo/i), { target: { value: 'ana' } });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'Secreta123' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => expect(screen.getByText(/Usuario o contraseña incorrectos/)).toBeInTheDocument());
    expect(login).toHaveBeenCalledWith({ username: 'ana', password: 'Secreta123' });
  });
});
