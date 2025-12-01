import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/focushive', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/focushive', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/focushive', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/focushive', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com/focushive', label: 'YouTube' },
    { icon: Github, href: 'https://github.com/focushive', label: 'GitHub' },
  ];

  const footerLinks = [
    {
      title: 'Contacto',
      links: [
        { name: 'focushiveconsultas@gmail.com', href: 'mailto:focushiveconsultas@gmail.com' },
        { name: 'focushivesupport@gmail.com', href: 'mailto:focushivesupport@gmail.com' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Política y Términos', href: '/politica-terminos' },
        { name: 'Privacidad', href: '/privacidad' },
      ],
    },
  ];

  return (
    <footer className="bg-[#1e3a5f] text-white">
      <div className="container-custom py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#1e3a5f] font-bold text-xl">F</span>
              </div>
              <span className="text-xl font-bold font-display">FocusHive</span>
            </div>
            <p className="text-blue-200 text-sm">
              La única app que personaliza tu método de estudio y te motiva en comunidad.
            </p>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-blue-200 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media Icons */}
        <div className="border-t border-[#2a4a6f] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-blue-200 text-sm">
              © {currentYear} FocusHive. Todos los derechos reservados.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#2a4a6f] rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 transform hover:scale-110"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;