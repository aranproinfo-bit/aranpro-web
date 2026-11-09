import React, { useState, useEffect } from 'react';
import { CommunityProvider, useCommunity } from './context/CommunityContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/public/LandingPage';
import { CommunitiesSelector } from './components/public/CommunitiesSelector';
import { FaqSection } from './components/public/FaqSection';
import { CertificateModal } from './components/public/CertificateModal';
import { ResidentLogin } from './components/resident/ResidentLogin';
import { ResidentPortal } from './components/resident/ResidentPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ReceiptViewerModal } from './components/common/ReceiptViewerModal';
import './App.css';

function MainApp() {
  const { currentUser, communities } = useCommunity();
  
  // Navigation states: 'landing' | 'communities-selector' | 'resident-login' | 'resident' | 'admin'
  const [currentView, setCurrentView] = useState('landing');
  const [selectedCommunitySlug, setSelectedCommunitySlug] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  // Leer parámetro ?c=slug o ?demo=... de la URL (para accesos directos desde QR o WhatsApp)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const commSlug = urlParams.get('c');
    const demoParam = urlParams.get('demo');

    if (demoParam) {
      setSelectedCommunitySlug(commSlug || communities[0]?.slug);
      setCurrentView('resident-login');
      return;
    }

    if (commSlug) {
      setSelectedCommunitySlug(commSlug);
      // Si el usuario ya está autenticado en esta comunidad, ir a 'resident', sino a 'resident-login'
      if (currentUser?.role === 'resident' && currentUser.communitySlug === commSlug) {
        setCurrentView('resident');
      } else {
        setCurrentView('resident-login');
      }
    }
  }, [currentUser, communities]);

  // Si el usuario se loguea como residente
  const handleResidentLoginSuccess = () => {
    setCurrentView('resident');
  };

  // Al seleccionar una comunidad desde el directorio público
  const handleSelectCommunity = (slug) => {
    setSelectedCommunitySlug(slug);
    if (currentUser?.role === 'resident' && currentUser.communitySlug === slug) {
      setCurrentView('resident');
    } else {
      setCurrentView('resident-login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAppMode = currentView === 'admin' || currentView === 'resident';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4EF] text-[#0F3D2E]">
      {/* Top Navigation (Solo en páginas informativas de la web pública) */}
      {!isAppMode && (
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedCommunitySlug={selectedCommunitySlug}
          setSelectedCommunitySlug={setSelectedCommunitySlug}
          onOpenCertificates={() => setShowCertModal(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onSelectCommunity={handleSelectCommunity}
            onOpenCertificates={() => setShowCertModal(true)}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'communities-selector' && (
          <CommunitiesSelector
            onSelectCommunity={handleSelectCommunity}
          />
        )}

        {currentView === 'faq' && (
          <FaqSection
            onBack={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoContact={() => {
              setCurrentView('landing');
              setTimeout(() => {
                document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
              }, 120);
            }}
          />
        )}

        {currentView === 'resident-login' && (
          <ResidentLogin
            communitySlug={selectedCommunitySlug || communities[0]?.slug}
            onBack={() => setCurrentView('communities-selector')}
            onSuccess={handleResidentLoginSuccess}
          />
        )}

        {currentView === 'resident' && (
          <ResidentPortal
            onBack={() => setCurrentView('landing')}
            onOpenCertificates={() => setShowCertModal(true)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onBackToWeb={() => setCurrentView('landing')}
            onSelectCommunityView={(slug) => {
              setSelectedCommunitySlug(slug);
              setCurrentView('resident-login');
            }}
          />
        )}
      </main>

      {/* Footer (Solo en páginas informativas de la web pública) */}
      {!isAppMode && (
        <Footer
          setCurrentView={setCurrentView}
          setSelectedCommunitySlug={setSelectedCommunitySlug}
          onOpenCertificates={() => setShowCertModal(true)}
        />
      )}


      {/* Modales Globales */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
      />

      <ReceiptViewerModal />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F4EF] p-4 text-[#0F3D2E]">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl font-black">
              ⚠️
            </div>
            <h2 className="text-lg font-black text-slate-900">Se produjo un problema al cargar esta vista</h2>
            <p className="text-xs text-slate-600">
              {this.state.error?.message || 'Error inesperado en la interfaz.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <CommunityProvider>
        <MainApp />
      </CommunityProvider>
    </ErrorBoundary>
  );
}
