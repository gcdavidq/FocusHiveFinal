import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
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
import IniciarFeynman from './pages/IniciarFeynman/IniciarFeynman';
import IniciarCornell from './pages/IniciarCornell/IniciarCornell';
import IniciarFlashcards from './pages/IniciarFlashcards/IniciarFlashcards';
import Seguimiento from './pages/Seguimiento/Seguimiento';
import Calendario from './pages/Calendario/Calendario';
import MisFlashcards from './pages/MisFlashcards/MisFlashcards';
// Importar el nuevo componente de lista
import ListaNotasCornell from './pages/CornellNotes/ListaNotasCornell';
// 🚨 IMPORTACIÓN DEL NUEVO COMPONENTE POMODORO
import IniciarPomodoro from './pages/iniciarPomodoro/IniciarPomodoro';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas con Layout (Header + Footer) */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/sobre-nosotros" element={<Layout><SobreNosotros /></Layout>} />
        <Route path="/contactanos" element={<Layout><Contactanos /></Layout>} />
        <Route path="/metodos-estudio" element={<Layout><MetodosEstudio /></Layout>} />
        <Route path="/metodo/pomodoro" element={<Layout><MetodoPomodoro /></Layout>} />
        
        {/* 🚨 RUTA DEL TEMPORIZADOR POMODORO */}
        {/* Esta ruta es a la que apunta el botón "Iniciar temporizador Pomodoro" */}
        <Route path="/iniciar-pomodoro" element={<Layout><IniciarPomodoro /></Layout>} />
        
        <Route path="/metodo/feynman" element={<Layout><MetodoFeynman /></Layout>} />
        
        {/* Rutas de Cornell */}
        <Route path="/metodo/cornell" element={<Layout><MetodoCornell /></Layout>} />
        {/* NUEVA RUTA DE LISTADO DE NOTAS */}
        <Route path="/metodo/cornell/list" element={<Layout><ListaNotasCornell /></Layout>} />
        
        <Route path="/metodo/flashcards" element={<Layout><MetodoFlashcards /></Layout>} />
        <Route path="/tutorial/feynman" element={<Layout><TutorialFeynman /></Layout>} />
        <Route path="/iniciar/feynman" element={<Layout><IniciarFeynman /></Layout>} />
        <Route path="/iniciar/cornell" element={<Layout><IniciarCornell /></Layout>} />
        <Route path="/iniciar/cornell/:noteId" element={<Layout><IniciarCornell /></Layout>} />
        <Route path="/iniciar/flashcards" element={<Layout><IniciarFlashcards /></Layout>} />
        <Route path="/seguimiento" element={<Layout><Seguimiento /></Layout>} />
        <Route path="/calendario" element={<Layout><Calendario /></Layout>} />
        <Route path="/mis-flashcards" element={<Layout><MisFlashcards /></Layout>} />
        
        {/* Rutas de autenticación sin Layout */}
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        
        {/* Ruta del cuestionario sin Layout */}
        <Route path="/cuestionario" element={<Cuestionario />} />
      </Routes>
    </Router>
  );
}

export default App;