import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import UIProvider from './context/UIProvider';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home/Home';
import SobreNosotros from './pages/SobreNosotros/SobreNosotros';
import Contactanos from './pages/Contactanos/Contactanos';
import Registro from './pages/Auth/Registro';
import Login from './pages/Auth/Login';
import Cuestionario from './pages/Cuestionario/Cuestionario';
import MetodosEstudio from './pages/MetodosEstudio/MetodosEstudio';
import MetodoPomodoro from './pages/MetodosEstudio/MetodoPomodoro';
import MetodoFeynman from './pages/MetodosEstudio/MetodoFeynman';
import MetodoCornell from './pages/MetodosEstudio/MetodoCornell';
import MetodoFlashcards from './pages/MetodosEstudio/MetodoFlashcards';
import TutorialFeynman from './pages/TutorialFeynman/TutorialFeynman';
import IniciarPomodoro from './pages/iniciarPomodoro/IniciarPomodoro';
import IniciarFeynman from './pages/IniciarFeynman/IniciarFeynman';
import IniciarCornell from './pages/IniciarCornell/IniciarCornell';
import ListaNotasCornell from './pages/CornellNotes/ListaNotasCornell';
import IniciarFlashcards from './pages/IniciarFlashcards/IniciarFlashcards';
import MisFlashcards from './pages/MisFlashcards/MisFlashcards';
import Seguimiento from './pages/Seguimiento/Seguimiento';
import Calendario from './pages/Calendario/Calendario';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <Routes>
            {/* Páginas con cabecera y pie */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/sobre-nosotros" element={<SobreNosotros />} />
              <Route path="/contactanos" element={<Contactanos />} />
              <Route path="/metodos-estudio" element={<MetodosEstudio />} />
              <Route path="/metodo/pomodoro" element={<MetodoPomodoro />} />
              <Route path="/metodo/feynman" element={<MetodoFeynman />} />
              <Route path="/metodo/cornell" element={<MetodoCornell />} />
              <Route path="/metodo/flashcards" element={<MetodoFlashcards />} />
              <Route path="/tutorial/feynman" element={<TutorialFeynman />} />

              {/* Requieren sesión */}
              <Route element={<ProtectedRoute />}>
                <Route path="/iniciar-pomodoro" element={<IniciarPomodoro />} />
                <Route path="/iniciar/feynman" element={<IniciarFeynman />} />
                <Route path="/iniciar/cornell" element={<IniciarCornell />} />
                <Route path="/iniciar/cornell/:noteId" element={<IniciarCornell />} />
                <Route path="/metodo/cornell/list" element={<ListaNotasCornell />} />
                <Route path="/iniciar/flashcards" element={<IniciarFlashcards />} />
                <Route path="/mis-flashcards" element={<MisFlashcards />} />
                <Route path="/seguimiento" element={<Seguimiento />} />
                <Route path="/calendario" element={<Calendario />} />
              </Route>
            </Route>

            {/* Pantallas completas sin cabecera */}
            <Route path="/registro" element={<Registro />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/cuestionario" element={<Cuestionario />} />
            </Route>

            <Route path="/Seguimiento" element={<Navigate to="/seguimiento" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
