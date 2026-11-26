// Configuración Oficial y Estratégica de Dominios y Subdominios de ARANPRO
// Separa Sitio Comercial (aranpro.cl), Panel de Administración (admin.aranpro.cl)
// y Portal de Copropietarios/Vecinos (residentes.aranpro.cl), manteniendo
// compatibilidad universal con portaladministracion.aranpro.cl.

const UNIVERSAL_APP_URL = 'https://portaladministracion.aranpro.cl';
const ADMIN_DEDICATED_URL = 'https://admin.aranpro.cl';
const RESIDENT_DEDICATED_URL = 'https://residentes.aranpro.cl';

export function getSubdomainMode(hostnameInput) {
  const host = (
    hostnameInput ||
    (typeof window !== 'undefined' ? window.location.hostname : '') ||
    ''
  ).toLowerCase();

  if (host.startsWith('admin.') || host.startsWith('oficina.') || host.startsWith('gestion.')) {
    return 'admin';
  }
  if (
    host.startsWith('residentes.') ||
    host.startsWith('vecinos.') ||
    host.startsWith('comunidad.') ||
    host.startsWith('copropietarios.') ||
    host.startsWith('micasa.')
  ) {
    return 'resident';
  }
  return 'universal';
}

function areDedicatedSubdomainsEnabled() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEDICATED_SUBDOMAINS === 'true') {
    return true;
  }
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('aranpro_dedicated_subdomains') === 'true';
    } catch {
      return false;
    }
  }
  return false;
}

export const DOMAIN_CONFIG = {
  COMMERCIAL_WEB_URL: 'https://aranpro.cl',
  APP_URL: UNIVERSAL_APP_URL,
  ADMIN_URL: ADMIN_DEDICATED_URL,
  RESIDENT_URL: RESIDENT_DEDICATED_URL,
  getSubdomainMode,
  getResidentLoginUrl: (communitySlug = '') => {
    const base = areDedicatedSubdomainsEnabled() ? RESIDENT_DEDICATED_URL : UNIVERSAL_APP_URL;
    return communitySlug ? `${base}?c=${encodeURIComponent(communitySlug)}` : base;
  },
  getAdminLoginUrl: () => {
    return areDedicatedSubdomainsEnabled()
      ? ADMIN_DEDICATED_URL
      : `${UNIVERSAL_APP_URL}?role=admin`;
  }
};
