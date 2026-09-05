import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/** Envoltorio con cabecera y pie para las páginas públicas y de la app. */
export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
