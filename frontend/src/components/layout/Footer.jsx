import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6';

const Footer = () => (
  <footer className="bg-primary text-background relative z-30">
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center gap-6 md:flex-row md:justify-between md:items-start">
      
      {/* Redes sociales */}
      <div className="flex space-x-4">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
        >
          <FaFacebookF className="text-tertiary" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
        >
          <FaInstagram className="text-tertiary" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
        >
          <FaXTwitter className="text-tertiary" />
        </a>
      </div>

      {/* Nombre centrado con decoración */}
      <div className="w-full md:w-auto flex flex-col items-center">
        <div className="flex items-center justify-center">
          <span className="hidden md:inline-block w-8 h-px bg-white/40 mr-4" />
          <h3 className="text-lg font-bold font-serif tracking-wide">Ana Quero</h3>
          <span className="hidden md:inline-block w-8 h-px bg-white/40 ml-4" />
        </div>
      </div>

      {/* Contacto */}
      <div className="text-center md:text-right">
        <h3 className="text-base font-semibold mb-1">Información de contacto</h3>
        <p className="text-sm">anaquero1411@gmail.com</p>
      </div>
    </div>
  </footer>
);

export default Footer;
