import React, { useEffect, useState } from "react";
import { submitApplication, getWebsiteNotice, getWebsiteProducts } from "../services/authService";
import logoImg from "../assets/logo.jpeg";
import estoperaImg from "../assets/estopera.png";
import tapavalvulaImg from "../assets/tapa_valvula.png";
import oringImg from "../assets/oring.png";
import sellovalvulaImg from "../assets/sello_valvula.png";
import collarinImg from "../assets/collarin.png";
import "./Website.css";

const NAV_LINKS = [
  { label: "Inicio", href: "#home", icon: "home" },
  { label: "Información", href: "#about", icon: "info" },
  { label: "Capacidades", href: "#capabilities", icon: "engineering" },
  { label: "Productos", href: "#products", icon: "precision_manufacturing" },
  { label: "Carreras", href: "#careers", icon: "groups" },
  { label: "Contacto", href: "#contact", icon: "mail" },
];

const DRAWER_LINKS = [
  { label: "Inicio", href: "#home", icon: "home" },
  { label: "Información", href: "#about", icon: "info" },
  { label: "Capacidades", href: "#capabilities", icon: "engineering" },
  { label: "Productos", href: "#products", icon: "precision_manufacturing" },
  { label: "Carreras", href: "#careers", icon: "groups" },
  { label: "Contacto", href: "#contact", icon: "mail" },
];

function Website() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [headerElevated, setHeaderElevated] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [specsModalOpen, setSpecsModalOpen] = useState(false);
  const [providersModalOpen, setProvidersModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [postulationSuccess, setPostulationSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Estado para los avisos del administrador
  const [notice, setNotice] = useState({
    enabled: false,
    note: "Cargando aviso...",
    name: "loading",
  });

  // Estado para los productos del catálogo web
  const [products, setProducts] = useState([]);

  // Estados para el formulario de postulación
  const [jobFormData, setJobFormData] = useState({
    name: "",
    lastname: "",
    ci_type: "V-",
    ci_number: "",
    email: "",
    phone_prefix: "0414",
    phone_number: "",
    birth_date: "",
  });
  const [jobCvFile, setJobCvFile] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });

  useEffect(() => {
    // Configuración dinámica del favicon y título de la página
    document.title = "Sealing Products C.A.";
    const link =
      document.querySelector("link[rel~='icon']") ||
      document.createElement("link");
    link.rel = "icon";
    link.href = logoImg;
    document.getElementsByTagName("head")[0].appendChild(link);

    // Función para cargar el aviso
    const fetchNotice = async () => {
      try {
        const currentNotice = await getWebsiteNotice();
        setNotice(currentNotice);
      } catch (error) {
        setNotice({
          enabled: false,
          note: "No se pudo cargar el aviso.",
          name: "error",
        });
      }
    };

    fetchNotice(); // Carga inicial al entrar

    // Cargar productos del catálogo
    getWebsiteProducts().then(setProducts);
  }, []);

  useEffect(() => {
    const handleScroll = () => setHeaderElevated(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      drawerOpen ||
      contactModalOpen ||
      specsModalOpen ||
      providersModalOpen ||
      privacyModalOpen ||
      catalogModalOpen ||
      locationModalOpen ||
      jobModalOpen
        ? "hidden"
        : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [
    drawerOpen,
    contactModalOpen,
    specsModalOpen,
    providersModalOpen,
    privacyModalOpen,
    catalogModalOpen,
    locationModalOpen,
    jobModalOpen,
  ]);

  const handleNavLinkClick = (e, href) => {
    if (href === "#contact") {
      e.preventDefault();
      setContactModalOpen(true);
    }
    setDrawerOpen(false);
  };

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    // Validación: ci_number solo números
    if (name === 'ci_number') {
      const cleaned = value.replace(/[^0-9]/g, '');
      setJobFormData((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }
    // Validación: phone_number solo números
    if (name === 'phone_number') {
      const cleaned = value.replace(/[^0-9]/g, '');
      setJobFormData((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }
    setJobFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleJobFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorModal({ open: true, title: 'Formato inválido', message: 'Solo se permiten archivos en formato PDF.' });
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorModal({ open: true, title: 'Archivo muy grande', message: 'El archivo no debe exceder 5MB.' });
        e.target.value = '';
        return;
      }
      setJobCvFile(file);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setJobLoading(true);
    try {
      // Construir FormData para enviar archivos
      const formData = new FormData();
      formData.append('name', jobFormData.name);
      formData.append('lastname', jobFormData.lastname);
      formData.append('ci', `${jobFormData.ci_type}${jobFormData.ci_number}`);
      formData.append('email', jobFormData.email);
      formData.append('phone', `${jobFormData.phone_prefix}-${jobFormData.phone_number}`);
      formData.append('birth_date', jobFormData.birth_date);
      formData.append('rol', notice.name !== 'none' ? notice.name : '');
      if (jobCvFile) {
        formData.append('cv', jobCvFile);
      }

      await submitApplication(formData);
      setPostulationSuccess(true);
      // Limpiar formulario
      setJobFormData({
        name: "", lastname: "", ci_type: "V-", ci_number: "", email: "",
        phone_prefix: "0414", phone_number: "", birth_date: ""
      });
      setJobCvFile(null);
    } catch (error) {
      setErrorModal({ open: true, title: 'Error al enviar', message: `Error al enviar postulación: ${error.message}` });
    } finally {
      setJobLoading(false);
    }
  };

  return (
    <div className={`website-page ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Estilos para el Modo Oscuro - Inyectados para no alterar el CSS original */}
      <style>{`
        html { scroll-behavior: smooth; }

        /* Ajuste para el modo claro: Contorno para el botón principal */
        .hero-button--primary {
          border: 1px solid #d32f2f !important;
        }

        .topbar__link {
          transition: all 0.3s ease !important;
          display: inline-block;
        }
        .topbar__nav .topbar__link:hover {
          background-color: #a8000c !important; /* Mantiene el fondo rojo */
          color: #ffffff !important;           /* Letra blanca en hover */
          transform: translateY(-2px);
        }
        .dark-mode .topbar__nav .topbar__link:hover {
          background-color: #a8000c !important; /* Mantiene el fondo azul en modo oscuro */
          color: #ffffff !important;           /* Letra blanca en hover */
        }

        .dark-mode {
          background-color: #0f172a;
          color: #e2e8f0;
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        .dark-mode .topbar { background-color: rgba(15, 23, 42, 0.95); border-bottom: 1px solid #1e293b; }
        .dark-mode .topbar__link, .dark-mode .topbar__brand { color: #f8fafc; }
        .dark-mode .topbar--scrolled { background-color: #1e293b; }
        .dark-mode .drawer { background-color: #1e293b; color: white; }
        .dark-mode .drawer__link { color: #cbd5e1; }
        .dark-mode .drawer__link:hover { background-color: #38bdf8 !important; color: #ffffff !important; }
        .dark-mode .hero-section__gradient {
          background: linear-gradient(to top, #0f172a 0%, rgba(15, 23, 42, 0.8) 50%, transparent 100%);
        }
        .dark-mode .about-section,
        .dark-mode .capabilities-section,
        .dark-mode .products-section { background-color: #0f172a; }
        .dark-mode .product-card,
        .dark-mode .capability-card--accent {
          background-color: #1e293b;
          border: 1px solid #334155;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }

        /* Estilos para la nueva sección de postulación */
        .join-us-section { padding: 6rem 0; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
        .dark-mode .join-us-section { background-color: #0f172a; border-color: #1e293b; }
        .join-us-grid { display: grid; grid-template-columns: 1fr; gap: 4rem; align-items: center; justify-items: center; }
        @media (max-width: 968px) {
          .join-us-grid { grid-template-columns: 1fr; gap: 3rem; }
          .join-us-content { text-align: center; }
        }
        .join-us-form-card {
          background: white; padding: 2.5rem; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;
        }
        .dark-mode .product-card h4, .dark-mode .capability-card__title, .dark-mode .section-heading { color: #f8fafc; }
        .dark-mode .section-text, .dark-mode .hero-copy, .dark-mode .capability-card__text { color: #94a3b8; }

        /* Unificación del bloque de estadísticas con el color del Footer Oscuro */
        .dark-mode .stats-section { background-color: #020617; border-top: 1px solid #1e293b; border-bottom: 1px solid #1e293b; }
        .dark-mode .stats-card {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .dark-mode .stats-value { color: #38bdf8 !important; }
        .dark-mode .stats-label { color: #94a3b8 !important; }

        .dark-mode .site-footer { background-color: #020617; border-top: 1px solid #1e293b; }
        .dark-mode .footer-bottom { border-top: 1px solid #1e293b; color: #64748b; }
        .dark-mode .contact-modal { background-color: #1e293b; color: white; }
        .dark-mode .contact-value { color: #38bdf8; }

        /* Delineado claro para botones en modo oscuro */
        .dark-mode .hero-button--secondary { border: 1px solid #f8fafc !important; color: #f8fafc; }
        .dark-mode .hero-button--primary { border: 1px solid #38bdf8; }
        .dark-mode .topbar__menu-button { border: 1px solid rgba(248, 250, 252, 0.2); color: #f8fafc; }
        .dark-mode .capability-card__link {
          border: 1px solid rgba(56, 189, 248, 0.4);
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        /* Resalte dinámico del botón de cambio de tema */
        .theme-toggle {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 !important;
          width: 42px;
          height: 42px;
        }
        .theme-toggle .material-symbols-outlined {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #1e293b;
        }
        .dark-mode .theme-toggle .material-symbols-outlined {
          color: #f8fafc;
          filter: drop-shadow(0 0 1px rgba(248, 250, 252, 0.8));
        }
        .theme-toggle:hover .material-symbols-outlined {
          filter: drop-shadow(0 0 1px #1e293b); /* Contorno oscuro que sigue la silueta */
          transform: scale(1.15) rotate(15deg);
        }
        .dark-mode .theme-toggle:hover .material-symbols-outlined {
          color: #f8fafc;
          filter: drop-shadow(0 0 2px #f8fafc); /* Contorno claro para la luna */
        }

        /* Estilos para el formulario de postulación */
        .job-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .job-form__field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          text-align: left;
        }
        .job-form__field label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #5d5e61;
        }
        .job-form__field input, .job-form__field select {
          padding: 0.75rem;
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #926f6a;
          border-radius: 8px;
          background: #ffffff;
          color: #191c1d;
        }
        .dark-mode .job-form__field label { color: #94a3b8; }
        .dark-mode .job-form__field input, .dark-mode .job-form__field select {
          background-color: #0f172a;
          border-color: #334155;
          color: #f8fafc;
        }
        .job-submit-btn { margin-top: 0.5rem; width: 100%; border: none; }

        /* Ajuste responsive para filas de formulario (Nombre/Apellido) */
        .job-form__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 480px) {
          .job-form__row {
            grid-template-columns: 1fr;
          }
        }

        /* Estilos para el Modal de Especificaciones Técnicas */
        .specs-modal {
          max-width: 850px !important;
          width: 95% !important;
          max-height: 90vh; /* Limitamos la altura al 90% de la pantalla */
          display: flex;
          flex-direction: column;
          padding: 2.5rem !important;
        }
        .specs-modal-section { margin-bottom: 2rem; text-align: left; }
        .specs-modal-section h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #d32f2f;
          margin-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 0.5rem;
        }
        .dark-mode .specs-modal-section h4 { border-color: #334155; }

        /* Contenedor interno con scroll propio */
        .specs-scroll-area {
          overflow-y: auto;
          padding-right: 1rem;
          margin-right: -1rem; /* Compensa el padding para que el scroll pegue al borde */
        }

        /* Personalización del scrollbar interno para que se vea moderno */
        .specs-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .specs-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .specs-scroll-area::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark-mode .specs-scroll-area::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .specs-table-container { overflow-x: auto; margin-top: 1rem; }
        .specs-mini-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .specs-mini-table th {
          background: #f8fafc;
          padding: 0.8rem;
          text-align: left;
          color: #475569;
        }
        .dark-mode .specs-mini-table th { background: #0f172a; color: #94a3b8; }
        .specs-mini-table td {
          padding: 0.8rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .dark-mode .specs-mini-table td { border-color: #334155; }

        .cert-highlight {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 1rem;
          border-radius: 8px;
          color: #166534;
        }
        .dark-mode .cert-highlight { background: #064e3b; border-color: #065f46; color: #ecfdf5; }

        /* Estilos para el Modal de Catálogo (Más grande) */
        .catalog-modal {
          max-width: 1100px !important;
          width: 95% !important;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          padding: 2.5rem !important;
        }
        .catalog-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          padding: 1rem 0;
          justify-content: center;
          align-items: flex-start;
        }
        .catalog-item {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          width: calc((100% - 4rem) / 3);
        }
        @media (max-width: 767px) {
          .catalog-item { width: 100%; }
        }
        .dark-mode .catalog-item {
          background: #1e293b;
          border-color: #334155;
        }
        .catalog-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .catalog-item__img {
          width: 100%;
          height: 180px;
          object-fit: contain;
          background-color: transparent;
          border-bottom: 1px solid #f1f5f9;
        }
        .dark-mode .catalog-item__img { border-color: #334155; }
        .catalog-item__info { padding: 1.5rem; text-align: left; }
        .catalog-item__title { font-size: 1.2rem; font-weight: 700; color: #d32f2f; margin-bottom: 0.5rem; }
        .catalog-item__desc { font-size: 0.9rem; color: #64748b; line-height: 1.5; }
        .dark-mode .catalog-item__desc { color: #94a3b8; }

        /* Estilos para el Modal de Proveedores */
        .providers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .provider-item {
          background: #f8fafc;
          padding: 1.2rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          font-weight: 600;
          color: #334155;
          transition: all 0.3s ease;
        }
        .provider-item:hover {
          border-color: #d32f2f;
          background: #fffafa;
          transform: translateY(-2px);
        }
        .dark-mode .provider-item {
          background: #1e293b;
          border-color: #334155;
          color: #f8fafc;
        }
        .dark-mode .provider-item:hover {
          border-color: #38bdf8;
          background: #0f172a;
        }

        /* Estilos para el Modal de Mapa */
        .map-container {
          width: 100%;
          height: 400px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          margin-top: 1rem;
        }
        .dark-mode .map-container {
          border-color: #334155;
        }

        /* Suavizado general */
        .website-page, .topbar, .stats-card, .product-card, .drawer, .site-footer, .hero-button {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>

      <header className={`topbar ${headerElevated ? "topbar--scrolled" : ""}`}>
        <div className="topbar__brand-group">
          {/* El interruptor de tema ahora está aquí, reemplazando al menú */}
          <button
            className="topbar__icon-button theme-toggle"
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={
              isDarkMode ? "Activar modo claro" : "Activar modo oscuro"
            }
          >
            <span className="material-symbols-outlined">
              {isDarkMode ? "dark_mode" : "light_mode"}
            </span>
          </button>
          <h1 className="topbar__brand">Sealing Products C.A.</h1>
        </div>

        <nav className="topbar__nav">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              className="topbar__link topbar__link--with-icon"
              href={link.href}
              onClick={(e) => handleNavLinkClick(e, link.href)}
            >
              <span className="material-symbols-outlined topbar__link-icon">
                {link.icon}
              </span>
              <span className="topbar__link-label">{link.label}</span>
            </a>
          ))}
        </nav>
      </header>

      <div
        className={`drawer-overlay ${drawerOpen ? "drawer-overlay--visible" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside className={`drawer ${drawerOpen ? "drawer--open" : ""}`}>
        <div className="drawer__header">
          <div>
            <p className="drawer__eyebrow">Industrial Solutions</p>
          </div>
          <button
            className="drawer__close"
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="drawer__nav">
          {DRAWER_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="drawer__link"
              onClick={(e) => handleNavLinkClick(e, item.href)}
            >
              <span className="material-symbols-outlined drawer__link-icon">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <main className="hero-section" id="home">
        <img
          className="hero-section__image"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe1B--b1mroFL-zPTJPwgDKaaZ9eFj0v59jZN-ORhbdotfSJ7J0fEhzYRmMn0kDgo8_DTRGB3SKtoGQ6xGuXesh542pxc2L7pTS5efx-XkpunP4xyWZdI_vZ5sKqoCTNQjVyNm995-Nyr_aaVzfOxWf2uENAR7ZwzcwSdE3nvh-msUxdzLEtDy_m_CrwHKl1VJU17DxU35ByRs9Iz3qDnVlwlBD1my2WY1qORaJy2KC4kx2swR82zgaNdQovXsX8Qu6geton1Fqj0"
          alt="Instalación industrial de alta tecnología"
        />
        <div className="hero-section__gradient" />
        <div className="hero-section__content">
          <span className="hero-badge">Est. 1995</span>
          <h2 className="hero-title">Líderes en Sellado Industrial</h2>
          <p className="hero-copy">
            Fabricación de empaquetaduras de motor y tapa válvulas con precisión
            milimétrica bajo los más altos estándares internacionales de
            calidad.
          </p>
          <div className="hero-actions">
            <button
              className="hero-button hero-button--primary"
              type="button"
              onClick={() => setCatalogModalOpen(true)}
            >
              Explorar Catálogo
            </button>
            <a
              href="#careers"
              className="hero-button hero-button--secondary"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Postular Puesto
            </a>
          </div>
        </div>
      </main>

      <section className="stats-section">
        <div className="section-inner">
          <div className="stats-grid">
            <article className="stats-card">
              <p className="stats-value">28+</p>
              <p className="stats-label">Años de Experiencia</p>
            </article>
            <article className="stats-card">
              <p className="stats-value">500k+</p>
              <p className="stats-label">Piezas Fabricadas</p>
            </article>
            <article className="stats-card">
              <p className="stats-value">ISO 9001</p>
              <p className="stats-label">Certificación Activa</p>
            </article>
            <article className="stats-card">
              <p className="stats-value">100%</p>
              <p className="stats-label">Precisión Garantizada</p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="section-inner about-grid">
          <div className="about-image-wrapper">
            <span className="decorative-circle" aria-hidden="true" />
            <img
              className="about-image"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy56S-3rFq9bNdszjdGqeHiWGaa9XWsK3ymeC-3BYgLICY3odniQ4vhkfB5R70XKFc2ZIyY3GmOZUpXuWWWox3zoYgL2UcbTxKJCdgU0WboBlAQXdc8UaeXA9Ve83C7A5bm8q0xndTKV9to7fYGadpZBKULiWdd136HEqPA3CL_BsG5oFBhIYeitF5YCj0KE3m99G24OQDeKdji6-wb46K2AfN5FsItPw70xguYaifu-n56CCVCOhRx73JJM3nBlhkqWDG0e0jBcA"
              alt="Detalle de empaquetadura de alta precisión"
            />
            <div className="about-icon-card">
              <span className="material-symbols-outlined about-icon">
                engineering
              </span>
            </div>
          </div>

          <div className="about-copy">
            <p className="eyebrow">Excelencia en Cada Fibra</p>
            <h3 className="section-heading">Quiénes Somos</h3>
            <p className="section-text">
              Desde 1995, Sealing Products C.A. ha establecido el estándar de
              oro en la manufactura de componentes de sellado industrial.
              Nuestra trayectoria se define por una búsqueda incansable de la
              perfección técnica y la fiabilidad.
            </p>
            <p className="section-text">
              Nos especializamos en la creación de empaquetaduras de motor y
              tapa válvulas que operan en las condiciones más exigentes.
              Utilizando maquinaria de última generación y procesos certificados
              internacionalmente, garantizamos que cada producto que sale de
              nuestra planta cumpla con las tolerancias más estrictas del
              mercado.
            </p>
            <div className="about-features">
              <div className="feature-item">
                <span className="material-symbols-outlined feature-icon">
                  check_circle
                </span>
                <div>
                  <p className="feature-title">Precisión Milimétrica</p>
                  <p className="feature-text">
                    Tolerancias ajustadas a planos originales.
                  </p>
                </div>
              </div>
              <div className="feature-item">
                <span className="material-symbols-outlined feature-icon">
                  language
                </span>
                <div>
                  <p className="feature-title">Estándar Global</p>
                  <p className="feature-text">
                    Materiales certificados internacionalmente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="capabilities-section" id="capabilities">
        <div className="section-inner">
          <div className="capabilities-intro">
            <h3 className="section-heading">Capacidades Técnicas</h3>
            <p className="section-subtitle">
              Soportando la industria con ingeniería de alto nivel y materiales
              de vanguardia.
            </p>
          </div>

          <div className="capabilities-grid">
            <div className="capability-card capability-card--large">
              <img
                className="capability-card__image"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwFflX12890QNf0evuesvWKckqBbJLaUbYzqWPVTgViI1qmJQHXDhR_MPyMhlOIHmEMbzKn1NFQz5QHJIyxs4OE98AG9WX0c97R4TyfQptkhl6F17haEaqRRxv2_O5_zwy1bz6I4IkOK0cNoR-X7bKReSOTykCw9M0KRShWKkXo7uX609_8LznFAFWCndVGGV2CE8-N-IXC3fpYKLaO4DkEkwdKGxBMuQfuDz3Xk1qSCJwruNCkPvTdnXs5b2Wqmadu0eXuJ0Upn4"
                alt="Capacidad industrial moderna"
              />
              <div className="capability-card__content">
                <h4 className="capability-card__title">
                  Ingeniería de Reversa
                </h4>
                <p className="capability-card__text">
                  Capacidad de replicar componentes críticos con exactitud OEM
                  para equipos descontinuados o especializados.
                </p>
              </div>
            </div>

            <div className="capability-card capability-card--small capability-card--accent">
              <span className="material-symbols-outlined capability-card__icon-large">
                biotech
              </span>
              <h4 className="capability-card__title">Laboratorio Propio</h4>
              <p className="capability-card__text">
                Pruebas de estrés térmico y químico en cada lote.
              </p>
            </div>

            <div className="capability-card capability-card--small capability-card--accent">
              <span className="material-symbols-outlined capability-card__icon-large">
                local_shipping
              </span>
              <h4 className="capability-card__title">Distribución Nacional</h4>
              <p className="capability-card__text">
                Logística integrada para despachos a nivel nacional en tiempo
                récord.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="products-section" id="products">
        <div className="section-inner">
          <div className="products-header">
            <h3 className="section-heading">Productos Destacados</h3>
            <p className="section-subtitle">
              Descubra nuestras soluciones de sellado industrial diseñadas para
              altas exigencias.
            </p>
          </div>

          <div className="products-grid">
            {products.length > 0 ? (
              products.sort((a, b) => a.display_order - b.display_order).map((product) => (
                <article className="product-card" key={product.id}>
                  <img
                    className="product-card__image"
                    src={product.image_url}
                    alt={product.name}
                    onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f1f5f9" width="400" height="300"/><text fill="%2394a3b8" font-family="sans-serif" font-size="18" text-anchor="middle" x="200" y="155">Sin imagen</text></svg>'; }}
                  />
                  <div>
                    <h4>{product.name}</h4>
                    <p>{product.description}</p>
                  </div>
                </article>
              ))
            ) : (
              <>
                <article className="product-card">
                  <img className="product-card__image" src={estoperaImg} alt="Estopera industrial" />
                  <div><h4>Estoperas</h4><p>Sellos robustos para retenes de ejes y bombas, con durabilidad industrial.</p></div>
                </article>
                <article className="product-card">
                  <img className="product-card__image" src={tapavalvulaImg} alt="Sello de válvula" />
                  <div><h4>Sellos de Válvulas</h4><p>Empaquetaduras de alta precisión para tapas de válvula y espacios críticos.</p></div>
                </article>
                <article className="product-card">
                  <img className="product-card__image" src={oringImg} alt="Oring industrial" />
                  <div><h4>Oring</h4><p>Juntas tóricas resistentes a altas temperaturas y fluidos agresivos.</p></div>
                </article>
                <article className="product-card">
                  <img className="product-card__image" src={sellovalvulaImg} alt="Tapa válvulas" />
                  <div><h4>Tapa Válvulas</h4><p>Empaquetaduras y sellos para tapas de válvula con ajuste perfecto.</p></div>
                </article>
                <article className="product-card">
                  <img className="product-card__image" src={collarinImg} alt="Collarines" />
                  <div><h4>Collarines</h4><p>Componentes de sello para retenes y guías de cojinete con acabado preciso.</p></div>
                </article>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="join-us-section" id="careers">
        <div className="section-inner">
          <div className="join-us-grid">
            <div className="join-us-content">
              <p className="eyebrow">Carreras en Sealing Products</p>
              <h2 className="section-heading">
                Únete a nuestro equipo de expertos
              </h2>
              <p
                className="section-text"
                style={{ fontSize: "1.1rem", marginBottom: "2rem" }}
              >
                Estamos en la búsqueda constante de profesionales apasionados
                por la precisión y la excelencia industrial. Si quieres ser
                parte de una empresa con más de 30 años de trayectoria
                fabricando soluciones de sellado de alta gama, esta es tu
                oportunidad.
              </p>

              <div
                className="cert-highlight"
                style={{
                  marginTop: "2rem",
                  textAlign: "left",
                  borderLeft: "5px solid #d32f2f",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    marginBottom: "0.8rem",
                    color: "#d32f2f",
                  }}
                >
                  <span className="material-symbols-outlined">campaign</span>
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {notice.name &&
                    notice.name !== "none" &&
                    notice.name !== "loading"
                      ? notice.name
                      : "Aviso de Reclutamiento"}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.6",
                    margin: 0,
                    fontWeight: "500",
                    color: isDarkMode ? "#e2e8f0" : "#334155",
                  }}
                >
                  {notice.note || "Cargando aviso..."}
                </p>
              </div>

              {/* Botón dinámico: Solo aparece si el ID no es 1 (Aviso de "No hay vacantes") */}
              {notice.id && Number(notice.id) !== 1 && (
                <button
                  className="hero-button hero-button--primary"
                  style={{
                    marginTop: "1.5rem",
                    width: "fit-content",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    boxShadow: "0 10px 15px -3px rgba(211, 47, 47, 0.2)",
                  }}
                  onClick={() => setJobModalOpen(true)}
                >
                  <span className="material-symbols-outlined">how_to_reg</span>
                  Aplicar a postulación
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h4 className="footer-title">Sealing Products C.A.</h4>
            <p className="footer-copy">
              Comprometidos con la durabilidad de su maquinaria desde hace más
              de tres décadas. Calidad que sella el éxito.
            </p>
            <div className="footer-social">
              <a className="footer-social-link" href="#" aria-label="Compartir">
                <span className="material-symbols-outlined">share</span>
              </a>
              <a
                className="footer-social-link"
                href="#location"
                aria-label="Ubicación"
                onClick={(e) => {
                  e.preventDefault();
                  setLocationModalOpen(true);
                }}
              >
                <span className="material-symbols-outlined">location_on</span>
              </a>
            </div>
          </div>

          <div className="footer-links-grid">
            <div>
              <h5 className="footer-section-title">Recursos</h5>
              <nav className="footer-links">
                <a
                  href="#specs"
                  onClick={(e) => {
                    e.preventDefault();
                    setSpecsModalOpen(true);
                  }}
                >
                  Especificaciones técnicas
                </a>
                <a
                  href="#providers"
                  onClick={(e) => {
                    e.preventDefault();
                    setProvidersModalOpen(true);
                  }}
                >
                  Proveedores
                </a>
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    setPrivacyModalOpen(true);
                  }}
                >
                  Políticas de privacidad
                </a>
              </nav>
            </div>
            <div>
              <h5 className="footer-section-title">Contacto</h5>
              <p className="footer-contact">
                Zona Industrial Paramillo, Complejo Fabilosa, Galpón 1 , San
                Cristóbal, Táchira, Venezuela
                <br />
                ventas@sealingproducts.com
                <br />
                +58 (212) 555-0123
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Sealing Products C.A.</p>
          <p
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              fontSize: "0.75rem",
              opacity: 0.8,
              lineHeight: "1.4",
            }}
          >
            Aclaración legal: Esta página <strong>NO ES OFICIAL</strong>. Se
            trata exclusivamente de un proyecto universitario con fines
            académicos inspirado en la empresa Sealing Products C.A.
          </p>
        </div>
      </footer>

      {/* Modal de Contacto */}
      {contactModalOpen && (
        <div
          className="contact-overlay"
          onClick={() => setContactModalOpen(false)}
        >
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="contact-close"
              onClick={() => setContactModalOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="contact-title">Datos de Contacto</h3>
            <div className="contact-info-list">
              <div className="contact-item">
                <span className="material-symbols-outlined">location_on</span>
                <div>
                  <p className="contact-label">Ubicación</p>
                  <p className="contact-value">Tachira, Venezuela</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="material-symbols-outlined">mail</span>
                <div>
                  <p className="contact-label">Correo de contacto</p>
                  <p className="contact-value">ventas@sealingproducts.com</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="material-symbols-outlined">call</span>
                <div>
                  <p className="contact-label">Teléfono de contacto</p>
                  <p className="contact-value">+58 (212) 555-0123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Especificaciones Técnicas (Overlay) */}
      {specsModalOpen && (
        <div
          className="contact-overlay"
          onClick={() => setSpecsModalOpen(false)}
        >
          <div
            className="contact-modal specs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="contact-close"
              onClick={() => setSpecsModalOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="contact-title" style={{ marginBottom: "2rem" }}>
              Ficha Técnica Corporativa
            </h3>

            <div className="specs-scroll-area">
              <div className="specs-modal-section">
                <h4>
                  <span className="material-symbols-outlined">verified</span>{" "}
                  Certificación de Calidad
                </h4>
                <div className="cert-highlight">
                  <strong>ISO 9001:2015 Certificada</strong>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      marginTop: "0.5rem",
                      margin: 0,
                    }}
                  >
                    Nuestro Sistema de Gestión de Calidad cubre el diseño,
                    fabricación y comercialización de sellos mecánicos,
                    garantizando trazabilidad total desde la materia prima.
                  </p>
                </div>
              </div>

              <div className="specs-modal-section">
                <h4>
                  <span className="material-symbols-outlined">straighten</span>{" "}
                  Tolerancias de Fabricación
                </h4>
                <div className="specs-table-container">
                  <table className="specs-mini-table">
                    <thead>
                      <tr>
                        <th>Parámetro</th>
                        <th>Estándar</th>
                        <th>Tolerancia</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Diámetro Interno</td>
                        <td>ISO 3601</td>
                        <td>± 0.05 mm</td>
                      </tr>
                      <tr>
                        <td>Dureza de Material</td>
                        <td>ASTM D2240</td>
                        <td>± 5 Shore A</td>
                      </tr>
                      <tr>
                        <td>Rugosidad (Ra)</td>
                        <td>ISO 4287</td>
                        <td>0.8 μm máx.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="specs-modal-section">
                <h4>
                  <span className="material-symbols-outlined">science</span>{" "}
                  Materiales Disponibles
                </h4>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
                  Trabajamos con compuestos elastoméricos de alto desempeño:{" "}
                  <strong>Nitrilo (NBR) No Asbestico</strong> para aceites,
                  <strong>Viton (FKM)</strong> para altas temperaturas y
                  químicos, y <strong>Silicona (VMQ)</strong> para grado
                  alimenticio.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Proveedores (Overlay) */}
      {providersModalOpen && (
        <div
          className="contact-overlay"
          onClick={() => setProvidersModalOpen(false)}
        >
          <div
            className="contact-modal specs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="contact-close"
              onClick={() => setProvidersModalOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="contact-title" style={{ marginBottom: "2rem" }}>
              Nuestra Red de Proveedores
            </h3>

            <div className="specs-scroll-area">
              <div className="specs-modal-section">
                <h4>
                  <span className="material-symbols-outlined">handshake</span>{" "}
                  Aliados Nacionales
                </h4>
                <p
                  style={{
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                    marginBottom: "1.5rem",
                  }}
                >
                  Mantenemos alianzas estratégicas con las distribuidoras y
                  marcas más prestigiosas del país para garantizar que nuestras
                  soluciones de sellado industrial mantengan los más altos
                  estándares de calidad y disponibilidad.
                </p>

                <div className="providers-grid">
                  <div className="provider-item">
                    <span
                      className="material-symbols-outlined"
                      style={{ marginRight: "0.8rem", color: "#d32f2f" }}
                    >
                      business
                    </span>
                    Representaciones insa c.a.
                  </div>
                  <div className="provider-item">
                    <span
                      className="material-symbols-outlined"
                      style={{ marginRight: "0.8rem", color: "#d32f2f" }}
                    >
                      business
                    </span>
                    Representaciones ITALVE 90 c.a.
                  </div>
                  <div className="provider-item">
                    <span
                      className="material-symbols-outlined"
                      style={{ marginRight: "0.8rem", color: "#d32f2f" }}
                    >
                      business
                    </span>
                    ATM Maturin c.a.
                  </div>
                  <div className="provider-item">
                    <span
                      className="material-symbols-outlined"
                      style={{ marginRight: "0.8rem", color: "#d32f2f" }}
                    >
                      business
                    </span>
                    Import convi c.a.
                  </div>
                </div>
              </div>

              <div className="specs-modal-section">
                <h4>
                  <span className="material-symbols-outlined">
                    verified_user
                  </span>{" "}
                  Calidad de Suministro
                </h4>
                <p style={{ fontSize: "0.9rem" }}>
                  Todos nuestros proveedores pasan por un riguroso proceso de
                  auditoría técnica, asegurando que los insumos y materias
                  primas cumplan con las especificaciones de ingeniería
                  requeridas por <strong>Sealing Products C.A.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Políticas de Privacidad (Overlay) */}
      {privacyModalOpen && (
        <div
          className="contact-overlay"
          onClick={() => setPrivacyModalOpen(false)}
        >
          <div
            className="contact-modal specs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="contact-close"
              onClick={() => setPrivacyModalOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="contact-title" style={{ marginBottom: "2rem" }}>
              Políticas de Privacidad
            </h3>

            <div className="specs-scroll-area">
              <div className="specs-modal-section">
                <h4>
                  <span className="material-symbols-outlined">security</span>{" "}
                  Protección de Datos
                </h4>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                  En <strong>Sealing Products C.A.</strong>, la seguridad de su
                  información es nuestra prioridad. Los datos recolectados a
                  través de nuestro sitio web son utilizados exclusivamente para
                  la gestión de solicitudes comerciales, procesos de
                  reclutamiento y mejora de la experiencia del usuario.
                </p>
                <ul
                  style={{
                    fontSize: "0.9rem",
                    paddingLeft: "1.2rem",
                    marginTop: "1rem",
                    color: isDarkMode ? "#94a3b8" : "#475569",
                  }}
                >
                  <li>
                    No vendemos ni compartimos su información personal con
                    terceros.
                  </li>
                  <li>
                    Implementamos protocolos de seguridad digital para proteger
                    su identidad.
                  </li>
                  <li>
                    Usted puede solicitar la eliminación de sus datos en
                    cualquier momento.
                  </li>
                </ul>
              </div>

              <div className="specs-modal-section">
                <h4>
                  <span className="material-symbols-outlined">
                    visibility_off
                  </span>{" "}
                  Confidencialidad Industrial
                </h4>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                  Entendemos el valor de su propiedad intelectual. Toda
                  información técnica, planos o muestras suministradas para la
                  fabricación de piezas especiales se maneja bajo estrictos
                  acuerdos de confidencialidad y secreto industrial.
                </p>
              </div>

              <div className="specs-modal-section">
                <h4>
                  <span className="material-symbols-outlined">gavel</span>{" "}
                  Consentimiento
                </h4>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                  Al utilizar nuestros servicios de contacto o postulación,
                  usted acepta el tratamiento de sus datos bajo estos términos.
                  Para cualquier consulta legal, puede escribirnos a{" "}
                  <strong>ventas@sealingproducts.com</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Catálogo (Explorar Catálogo) */}
      {catalogModalOpen && (
        <div
          className="contact-overlay"
          onClick={() => setCatalogModalOpen(false)}
        >
          <div
            className="contact-modal catalog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="contact-close"
              onClick={() => setCatalogModalOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="contact-title" style={{ marginBottom: "1.5rem" }}>
              Portafolio de Productos Destacados
            </h3>
            <p
              style={{
                marginBottom: "2rem",
                color: isDarkMode ? "#94a3b8" : "#64748b",
              }}
            >
              Soluciones de ingeniería diseñadas para garantizar la estanqueidad
              y eficiencia de su maquinaria industrial.
            </p>

            <div className="specs-scroll-area">
              <div className="catalog-grid">
                {products.length > 0 ? (
                  products.sort((a, b) => a.display_order - b.display_order).map((product) => (
                    <article className="catalog-item" key={product.id}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="catalog-item__img"
                        onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f1f5f9" width="400" height="300"/><text fill="%2394a3b8" font-family="sans-serif" font-size="18" text-anchor="middle" x="200" y="155">Sin imagen</text></svg>'; }}
                      />
                      <div className="catalog-item__info">
                        <h4 className="catalog-item__title">{product.name}</h4>
                        <p className="catalog-item__desc">{product.description}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <>
                    <article className="catalog-item">
                      <img src={estoperaImg} alt="Estopera" className="catalog-item__img" />
                      <div className="catalog-item__info"><h4 className="catalog-item__title">Estoperas</h4><p className="catalog-item__desc">Sellos robustos para retenes de ejes y bombas, fabricados en nitrilo de alta resistencia.</p></div>
                    </article>
                    <article className="catalog-item">
                      <img src={tapavalvulaImg} alt="Sello de válvula" className="catalog-item__img" />
                      <div className="catalog-item__info"><h4 className="catalog-item__title">Sellos de Válvulas</h4><p className="catalog-item__desc">Empaquetaduras de precisión para tapas de válvula con resistencia térmica superior.</p></div>
                    </article>
                    <article className="catalog-item">
                      <img src={oringImg} alt="Oring" className="catalog-item__img" />
                      <div className="catalog-item__info"><h4 className="catalog-item__title">Orings</h4><p className="catalog-item__desc">Juntas tóricas de Vitón y Silicona para aplicaciones químicas y de alta presión.</p></div>
                    </article>
                    <article className="catalog-item">
                      <img src={sellovalvulaImg} alt="Tapa Válvulas" className="catalog-item__img" />
                      <div className="catalog-item__info"><h4 className="catalog-item__title">Tapa Válvulas</h4><p className="catalog-item__desc">Empaquetaduras con ajuste OEM diseñadas para prevenir fugas de aceite en el motor.</p></div>
                    </article>
                    <article className="catalog-item">
                      <img src={collarinImg} alt="Collarín" className="catalog-item__img" />
                      <div className="catalog-item__info"><h4 className="catalog-item__title">Collarines</h4><p className="catalog-item__desc">Sellos hidráulicos especializados para vástagos y pistones de alta fricción.</p></div>
                    </article>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ubicación (Google Maps) */}
      {locationModalOpen && (
        <div
          className="contact-overlay"
          onClick={() => setLocationModalOpen(false)}
        >
          <div
            className="contact-modal"
            style={{ maxWidth: "800px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="contact-close"
              onClick={() => setLocationModalOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="contact-title">Nuestra Ubicación</h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: isDarkMode ? "#94a3b8" : "#64748b",
                marginBottom: "1rem",
              }}
            >
              Zona Industrial Paramillo, Complejo Fabilosa, Galpón 1, San
              Cristóbal.
            </p>

            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.2705!2d-72.2173!3d7.7712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6669938883737b%3A0x6b6d5f7f8f8f8f8f!2sZona%20Industrial%20Paramillo!5e0!3m2!1ses!2sve!4v1716912345678!5m2!1ses!2sve"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa Sealing Products"
              ></iframe>
            </div>

            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <a
                href="https://maps.app.goo.gl/yjrD4SUJbYG9yHNk8"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-button hero-button--primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  justifyContent: "center",
                }}
              >
                <span className="material-symbols-outlined">directions</span>
                ¿Cómo llegar?
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Postulación */}
      {jobModalOpen && (
        <div
          className="contact-overlay"
          onClick={() => {
            setJobModalOpen(false);
            setPostulationSuccess(false);
          }}
        >
          <div
            className="contact-modal"
            style={{ maxWidth: "500px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="contact-close"
              onClick={() => {
                setJobModalOpen(false);
                setPostulationSuccess(false);
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {postulationSuccess ? (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "4.5rem",
                    color: "#10b981",
                    marginBottom: "1rem",
                  }}
                >
                  check_circle
                </span>
                <h3
                  className="catalog-item__title"
                  style={{ fontSize: "1.5rem" }}
                >
                  ¡Postulación Enviada!
                </h3>
                <p className="section-text" style={{ margin: "1rem 0 2rem" }}>
                  Hemos recibido tus datos con éxito. Nuestro equipo de recursos
                  humanos evaluará tu perfil y te contactará pronto.
                </p>
                <button
                  className="hero-button hero-button--primary"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setJobModalOpen(false);
                    setPostulationSuccess(false);
                  }}
                >
                  Cerrar ventana
                </button>
              </div>
            ) : (
              <>
                <h3
                  className="contact-title"
                  style={{ marginBottom: "0.5rem" }}
                >
                  Formulario de Selección
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#64748b",
                    marginBottom: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  Complete sus datos para postularse a la vacante actual.
                </p>
                <form className="job-form" onSubmit={handleJobSubmit}>
                  <div className="job-form__row">
                    <div className="job-form__field">
                      <label>Nombre</label>
                      <input
                        type="text"
                        name="name"
                        value={jobFormData.name}
                        onChange={handleJobChange}
                        placeholder="Nombre"
                        required
                      />
                    </div>
                    <div className="job-form__field">
                      <label>Apellido</label>
                      <input
                        type="text"
                        name="lastname"
                        value={jobFormData.lastname}
                        onChange={handleJobChange}
                        placeholder="Apellido"
                        required
                      />
                    </div>
                  </div>
                  <div className="job-form__field">
                    <label>Cédula de Identidad</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        name="ci_type"
                        value={jobFormData.ci_type}
                        onChange={handleJobChange}
                        style={{
                          width: '80px', textAlign: 'center', fontWeight: 'bold',
                          padding: '0.75rem', border: '1px solid #926f6a', borderRadius: '8px',
                          backgroundColor: '#fff', color: '#191c1d', fontSize: '0.95rem',
                        }}
                      >
                        <option value="V-">V-</option>
                        <option value="E-">E-</option>
                      </select>
                      <input
                        type="text"
                        name="ci_number"
                        value={jobFormData.ci_number}
                        onChange={handleJobChange}
                        placeholder="Solo números"
                        style={{
                          flex: 1, padding: '0.75rem', border: '1px solid #926f6a',
                          borderRadius: '8px', fontSize: '0.95rem',
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div className="job-form__field">
                    <label>Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={jobFormData.email}
                      onChange={handleJobChange}
                      placeholder="ejemplo@correo.com"
                      required
                    />
                  </div>
                  <div className="job-form__field">
                    <label>Teléfono</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        name="phone_prefix"
                        value={jobFormData.phone_prefix}
                        onChange={handleJobChange}
                        style={{
                          width: '100px', textAlign: 'center', fontWeight: 'bold',
                          padding: '0.75rem', border: '1px solid #926f6a', borderRadius: '8px',
                          backgroundColor: '#fff', color: '#191c1d', fontSize: '0.95rem',
                        }}
                      >
                        <option value="0412">0412</option>
                        <option value="0414">0414</option>
                        <option value="0416">0416</option>
                        <option value="0422">0422</option>
                        <option value="0424">0424</option>
                        <option value="0426">0426</option>
                      </select>
                      <input
                        type="text"
                        name="phone_number"
                        value={jobFormData.phone_number}
                        onChange={handleJobChange}
                        placeholder="0000000"
                        style={{
                          flex: 1, padding: '0.75rem', border: '1px solid #926f6a',
                          borderRadius: '8px', fontSize: '0.95rem',
                        }}
                      />
                    </div>
                  </div>
                  <div className="job-form__field">
                    <label>Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={jobFormData.birth_date}
                      onChange={handleJobChange}
                    />
                  </div>
                  <div className="job-form__field">
                    <label>Cargo de interés</label>
                    <input
                      type="text"
                      name="rol"
                      value={notice.name !== 'none' ? notice.name : ''}
                      readOnly
                      style={{
                        padding: '0.75rem', width: '100%', boxSizing: 'border-box',
                        border: '1px solid #926f6a', borderRadius: '8px',
                        background: '#f3f4f5', color: '#191c1d', fontWeight: '600',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                  <div className="job-form__field">
                    <label>Currículum Vitae (PDF, máx. 5MB)</label>
                    <input
                      type="file"
                      name="cv"
                      accept=".pdf"
                      onChange={handleJobFileChange}
                      style={{
                        padding: "0.75rem",
                        border: "1px solid #926f6a",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        width: "100%",
                        backgroundColor: "#fff",
                        color: "#191c1d",
                        cursor: "pointer",
                      }}
                    />
                    {jobCvFile && (
                      <span style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px' }}>
                        Archivo seleccionado: {jobCvFile.name}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="hero-button hero-button--primary job-submit-btn"
                    disabled={jobLoading}
                    style={{ marginTop: "1rem" }}
                  >
                    {jobLoading ? "Procesando..." : "Enviar mi postulación"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {/* Modal de Error */}
      {errorModal.open && (
        <div
          className="contact-overlay"
          onClick={() => setErrorModal({ open: false, title: '', message: '' })}
          style={{ zIndex: 9999 }}
        >
          <div
            className="contact-modal"
            style={{ maxWidth: '420px', width: '90%', textAlign: 'center', padding: '2.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1rem', display: 'block' }}
            >
              error
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
              {errorModal.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {errorModal.message}
            </p>
            <button
              className="hero-button hero-button--primary"
              style={{ width: '100%' }}
              onClick={() => setErrorModal({ open: false, title: '', message: '' })}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Website;
