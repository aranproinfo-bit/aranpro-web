import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { DOMAIN_CONFIG } from '../../config/domains';
import { AranproLogo } from '../common/MauranLogo';
import { LegalAspectsModal } from '../common/LegalAspectsModal';
import { Phone, Mail, MapPin, ShieldCheck, FileCheck, ArrowRight, Scale, Lock, Shield } from 'lucide-react';

export const Footer = ({ setCurrentView, setSelectedCommunitySlug, onOpenCertificates }) => {
  const { companySettings, communities } = useCommunity();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState('terminos');

  const openLegalModal = (tab = 'terminos') => {
    setLegalInitialTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <footer className="bg-[#0F3D2E] text-[#F5F4EF] border-t border-[#D4B895]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#D4B895]/20">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <AranproLogo variant="negative" size="lg" />
            
            <p className="text-xs sm:text-sm text-[#D4B895] italic font-medium">
              "{companySettings.slogan || 'Comunidades bien gestionadas, mayor tranquilidad'}"
            </p>

            <p className="text-xs sm:text-sm text-[#F5F4EF]/85 max-w-sm leading-relaxed">
              Gestión integral de comunidades y condominios dirigida por <strong>John Andrés Arancibia Maureira</strong>, acreditado por CGAI Chile (Socio N° 13-563) y AGACECH. Cumplimiento riguroso de la Ley N° 21.442 y plataforma web propia para cada comunidad.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#D4B895] bg-[#0A291F] border border-[#D4B895]/30 rounded-xl px-3.5 py-2 w-fit">
              <ShieldCheck className="w-4 h-4 text-[#D4B895] shrink-0" />
              <span>Transparencia total • Presencia continua en terreno</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-[#D4B895] uppercase tracking-wider mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => { setCurrentView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-[#F5F4EF]/80 hover:text-[#D4B895] transition-colors"
                >
                  Inicio
                </button>
              </li>
              <li>
                <a href="#sobre-mi" className="text-[#F5F4EF]/80 hover:text-[#D4B895] transition-colors">
                  Sobre Mí & Credenciales
                </a>
              </li>
              <li>
                <a href="#certificaciones" className="text-[#F5F4EF]/80 hover:text-[#D4B895] transition-colors">
                  Certificaciones Oficiales
                </a>
              </li>
              <li>
                <button
                  onClick={() => { setCurrentView('faq'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-[#F5F4EF]/80 hover:text-[#D4B895] transition-colors"
                >
                  Preguntas Frecuentes
                </button>
              </li>
              <li>
                <a
                  href={DOMAIN_CONFIG.APP_URL}
                  className="text-[#F5F4EF]/80 hover:text-[#D4B895] transition-colors flex items-center"
                >
                  <span>Portal Vecinos (App PWA)</span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => { if (onOpenCertificates) onOpenCertificates(); }}
                  className="text-[#F5F4EF]/80 hover:text-[#D4B895] transition-colors"
                >
                  Certificados de Residencia
                </button>
              </li>
              <li className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => openLegalModal('terminos')}
                  className="text-xs text-[#D4B895] hover:underline flex items-center gap-1.5 font-semibold cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Términos y Propiedad Intelectual</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegalModal('privacidad')}
                  className="text-xs text-[#F5F4EF]/70 hover:text-[#D4B895] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Privacidad y Datos (Ley 19.628)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegalModal('ley21442')}
                  className="text-xs text-[#F5F4EF]/70 hover:text-[#D4B895] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Cumplimiento Ley 21.442 & RNAC</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Communities List */}
          <div>
            <h4 className="text-xs font-bold text-[#D4B895] uppercase tracking-wider mb-4">
              Comunidades ARANPRO
            </h4>
            <ul className="space-y-2 text-sm">
              {communities.map((c) => (
                <li key={c.id}>
                  <a
                    href={DOMAIN_CONFIG.getResidentLoginUrl(c.slug)}
                    className="text-[#F5F4EF]/80 hover:text-[#D4B895] transition-colors flex items-center text-xs group"
                  >
                    <ArrowRight className="w-3 h-3 mr-1 text-[#D4B895] group-hover:translate-x-0.5 transition-transform" />
                    {c.name}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href={DOMAIN_CONFIG.APP_URL}
                  className="text-xs text-[#D4B895] hover:underline inline-flex items-center gap-1"
                >
                  Ver todas las comunidades en la App →
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-[#D4B895] uppercase tracking-wider mb-4">
              Contacto Directo
            </h4>
            <div className="space-y-3 text-sm text-[#F5F4EF]/85">
              <div className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-[#D4B895] mt-0.5 shrink-0" />
                <span>{companySettings.phone}</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-[#D4B895] mt-0.5 shrink-0" />
                <span className="break-all">{companySettings.email}</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#D4B895] mt-0.5 shrink-0" />
                <span>{companySettings.region}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-[#F5F4EF]/75 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} ARANPRO • Gestión Integral. Todos los derechos reservados.
            </p>
            <span className="hidden sm:inline text-white/30">•</span>
            <button
              type="button"
              onClick={() => openLegalModal('terminos')}
              className="text-[#D4B895] hover:underline font-medium cursor-pointer"
            >
              Aviso Legal & Términos de Uso
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center text-[#F5F4EF]/85">
              <FileCheck className="w-3.5 h-3.5 mr-1.5 text-[#D4B895]" />
              Conforme a Ley 21.442 de Copropiedad Inmobiliaria
            </span>
            <a
              href="https://redenlace.cl/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#F5F4EF]/75 hover:text-white transition-colors text-xs group"
              title="Visitar Red-Enlace Soluciones Digitales"
            >
              <img
                src="/red-enlace-logo.png"
                alt="Logo Red-Enlace"
                width={20}
                height={20}
                className="h-4 w-auto opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
              />
              <span>Desarrollado por Red-Enlace Soluciones Digitales</span>
            </a>
          </div>
        </div>
      </div>

      {/* Modal Legal Interactivo */}
      <LegalAspectsModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalInitialTab}
      />
    </footer>
  );
};
