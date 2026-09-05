import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

const REPO_URL = import.meta.env.VITE_REPO_URL;

const SECTIONS = [
  {
    title: 'Explora',
    links: [
      { name: 'Métodos de estudio', href: '/metodos-estudio' },
      { name: 'Cuestionario diagnóstico', href: '/cuestionario' },
      { name: 'Tutorial Feynman', href: '/tutorial/feynman' },
    ],
  },
  {
    title: 'Proyecto',
    links: [
      { name: 'Sobre nosotros', href: '/sobre-nosotros' },
      { name: 'Contáctanos', href: '/contactanos' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1e3a5f] text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#1e3a5f] font-bold text-xl">F</span>
              </div>
              <span className="text-xl font-bold font-display">FocusHive</span>
            </div>
            <p className="text-blue-200 text-sm">
              Descubre tu método de estudio ideal con un diagnóstico personalizado y practica Pomodoro, Feynman,
              Cornell y Flashcards registrando tu progreso.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#2a4a6f] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-blue-200 text-sm">© {year} FocusHive · Proyecto académico de código abierto.</p>
          {REPO_URL && (
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm"
            >
              <Github className="w-5 h-5" />
              Ver código en GitHub
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
