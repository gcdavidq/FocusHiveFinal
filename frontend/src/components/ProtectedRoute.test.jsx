import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../context/auth-context';

function renderWithAuth(authValue) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/seguimiento']}>
        <Routes>
          <Route path="/login" element={<p>Pantalla de login</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/seguimiento" element={<p>Contenido privado</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirige al login cuando no hay sesión', () => {
    renderWithAuth({ isAuthenticated: false, initializing: false });
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('muestra el contenido cuando hay sesión', () => {
    renderWithAuth({ isAuthenticated: true, initializing: false });
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('muestra un estado de carga mientras se valida la sesión guardada', () => {
    renderWithAuth({ isAuthenticated: true, initializing: true, login: vi.fn() });
    expect(screen.getByText(/Cargando tu sesión/)).toBeInTheDocument();
  });
});
