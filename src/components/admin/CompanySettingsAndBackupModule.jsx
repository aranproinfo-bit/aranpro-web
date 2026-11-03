import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { formatDate, formatRut, formatCLP } from '../../utils/formatters';
import { printDocumentDirectly, downloadHtmlDocument } from '../../utils/printDocument';
import { AranproConfirmModal } from '../common/AranproConfirmModal';
import {
  Building2, UserCheck, ShieldCheck, Award, FileText, CheckCircle2,
  AlertTriangle, Printer, Download, Share2, Search, Filter, Plus,
  X, ExternalLink, Clock, DollarSign, AlertCircle, Trash2, Eye,
  Send, Home, Briefcase, Copy, Sparkles, Check, Key, Shield,
  HardHat, BookOpen, FileCheck, Upload, RefreshCw, PenTool,
  HelpCircle, Settings, Smartphone, Layers, CheckSquare, MessageCircle,
  Paperclip, FileUp
} from 'lucide-react';

export const CompanySettingsAndBackupModule = ({ currentCommunity }) => {
  const {
    communities = [],
    certificates = [],
    companySettings = {},
    setCompanySettings
  } = useCommunity();

  // Sub-pestaña activa tipo ECP ('empresa' | 'firma' | 'acreditacion' | 'postulaciones' | 'respaldos' | 'sobre_app')
  const [activeSubTab, setActiveSubTab] = useState('empresa');

  // Estado del formulario de Empresa & Representante Legal
  const [empresaForm, setEmpresaForm] = useState({
    brandName: companySettings?.brandName || 'ARANPRO',
    provisionalName: companySettings?.provisionalName || 'ARANPRO • Gestión Integral de Condominios',
    companyRut: companySettings?.companyRut || '76.999.888-1',
    address: companySettings?.address || 'Av. Cuatro Esquinas 1520, Of. 402',
    city: companySettings?.city || 'La Serena, Coquimbo',
    country: 'Chile',
    phone: companySettings?.phone || '+56 9 5811 8504',
    email: companySettings?.email || 'contacto@aranpro.cl',
    website: companySettings?.website || 'https://aranpro.cl',
    // Representante Legal / Firmante
    adminName: companySettings?.adminName || 'John Andrés Arancibia Maureira',
    adminRut: companySettings?.adminRut || '14.882.140-K',
    adminRole: companySettings?.adminRole || 'Administrador Titular & Representante Legal',
    rnacNumber: companySettings?.rnacNumber || '48.912',
    rnacCategory: companySettings?.rnacCategory || 'Persona Natural (Vigente)',
    // Perfil para licitaciones y cartas
    specialty: companySettings?.profileLicitacion?.specialty || 'Administración Integral de Condominios, Mantención Técnica e Infraestructura Edilicia',
    startYear: companySettings?.profileLicitacion?.startYear || '2019',
    presentationText: companySettings?.profileLicitacion?.presentationText ||
      'ARANPRO ofrece servicios profesionales de administración bajo la Ley N° 21.442 de Copropiedad Inmobiliaria. Nuestra gran ventaja competitiva radica en la formación técnica y constructiva de nuestro equipo (Técnico en Construcción y estudios avanzados en Construcción Civil), lo que nos permite auditar, fiscalizar y supervisar con criterio experto obras de mantención, salas de bombas, cubiertas, filtraciones y contratos de proveedores, garantizando la preservación y plusvalía del patrimonio comunitario.'
  });

  // Estado para la Firma Digital Manuscrita (Canvas y Subida)
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#0F3D2E'); // Default Verde Bosque ARANPRO
  const [penWidth, setPenWidth] = useState(2.5);
  const [signatureImage, setSignatureImage] = useState(companySettings?.signatureDataUrl || '');
  const [hasCanvasDrawn, setHasCanvasDrawn] = useState(false);

  // Estados de Formación Técnica y Acreditaciones (Técnico en Construcción / Construcción Civil)
  const [academicRecords, setAcademicRecords] = useState(companySettings?.academicBackground || [
    {
      id: 'acad-1',
      title: 'Técnico en Construcción (Titulado)',
      institution: 'Instituto Profesional AIEP / Santo Tomás',
      category: 'Título Técnico Profesional',
      status: 'Titulado',
      year: '2018',
      relevance: 'Inspección técnica de obras, análisis de fallas constructivas, cubicación de mantenciones, control de calidad y supervisión de contratistas en terreno.',
      fileName: 'Certificado_Titulo_Tecnico_Construccion.pdf',
      fileType: 'application/pdf',
      fileData: null,
      fileSize: '1.2 MB',
      uploadDate: '2024-01-10',
      includeInProposal: true
    },
    {
      id: 'acad-2',
      title: 'Construcción Civil (Estudios en Curso)',
      institution: 'Universidad / Instituto Profesional',
      category: 'Formación Superior / Universitaria',
      status: 'En curso (Nivel Superior)',
      year: '2024 - Presente',
      relevance: 'Gestión integral de proyectos de edificación, patologías del hormigón, redes hidráulicas y sanitarias, impermeabilizaciones complejas y planes de mantenimiento preventivo.',
      fileName: 'Certificado_Alumno_Regular_Construccion_Civil.pdf',
      fileType: 'application/pdf',
      fileData: null,
      fileSize: '840 KB',
      uploadDate: '2026-03-01',
      includeInProposal: true
    },
    {
      id: 'acad-3',
      title: 'Curso Oficial de Administración de Copropiedades (Ley 21.442)',
      institution: 'Learning Group / OTEC Acreditada Sence',
      category: 'Certificación Minvu Ley 21.442',
      status: 'Aprobado y Certificado',
      year: '2022',
      relevance: 'Habilitación oficial obligatoria para inscripción y ejercicio profesional en el Registro Nacional de Administradores Minvu (RNAC).',
      fileName: 'Certificado_Aprobacion_Curso_Ley_21442.pdf',
      fileType: 'application/pdf',
      fileData: null,
      fileSize: '1.5 MB',
      uploadDate: '2024-02-15',
      includeInProposal: true
    }
  ]);

  // Lista de Documentos de Acreditación
  const [accreditationDocs, setAccreditationDocs] = useState(companySettings?.accreditationFiles || [
    { id: 'acc-1', name: 'Certificado de Inscripción RNAC Minvu (Folio 48.912)', category: 'Minvu Ley 21.442', status: 'Vigente ★★★', date: '2025-01-15' },
    { id: 'acc-2', name: 'Certificado de Título Técnico en Construcción', category: 'Título Profesional', status: 'Acreditado', date: '2018-12-20' },
    { id: 'acc-3', name: 'Certificado de Alumno Regular - Construcción Civil', category: 'Formación Superior', status: 'Activo 2026', date: '2026-03-10' },
    { id: 'acc-4', name: 'Certificado de Antecedentes para Fines Especiales', category: 'Registro Civil', status: 'Intachable', date: '2026-01-05' }
  ]);

  // Solicitud de Cartas de Referencia a Miembros de Comités Actuales
  const [committeeReferences, setCommitteeReferences] = useState(companySettings?.committeeReferenceRequests || [
    {
      id: 'ref-1',
      communityName: 'Condominio Los Cerezos',
      contactName: 'Carlos Morales Rojas',
      role: 'Presidente del Comité',
      phone: '+56988776655',
      status: 'Recomendación Favorable Otorgada',
      quote: 'Excelente gestión técnica y contable. ARANPRO resolvió en menos de 2 meses problemas históricos de bombas hidroneumáticas y morosidad que la administración anterior no pudo solucionar.'
    },
    {
      id: 'ref-2',
      communityName: 'Condominio Los Cerezos',
      contactName: 'Marcela Castillo Gómez',
      role: 'Tesorera del Comité',
      phone: '+56977665544',
      status: 'Recomendación Favorable Otorgada',
      quote: 'La plataforma digital ha traído una transparencia total. Cada factura y boleta del mes está visible en línea para los copropietarios.'
    }
  ]);

  // Estados de Seguridad & PIN
  const [adminPin, setAdminPin] = useState(companySettings?.adminPin || 'admin123');
  const [showPin, setShowPin] = useState(false);

  // Estados de Notificación / Modales
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [copiedLicitacionFeedback, setCopiedLicitacionFeedback] = useState(false);
  const [previewProposalModal, setPreviewProposalModal] = useState(false);
  const [previewDossierModal, setPreviewDossierModal] = useState(false);
  const [showUploadDiplomaModal, setShowUploadDiplomaModal] = useState(false);
  const [editingDiplomaId, setEditingDiplomaId] = useState(null);
  const [activeDiplomaPreview, setActiveDiplomaPreview] = useState(null);

  const initialNewDiplomaState = {
    title: '',
    institution: '',
    category: 'Título Técnico Profesional',
    status: 'Titulado',
    year: new Date().getFullYear().toString(),
    relevance: '',
    fileName: '',
    fileType: '',
    fileData: null,
    fileSize: '',
    includeInProposal: true
  };

  const [newDiplomaForm, setNewDiplomaForm] = useState(initialNewDiplomaState);

  // Configuración de Destinatario y Condominio a Postular (Carta de Presentación & Dossier)
  const [proposalConfig, setProposalConfig] = useState({
    targetCondo: companySettings?.lastProposalConfig?.targetCondo || '',
    targetRecipient: companySettings?.lastProposalConfig?.targetRecipient || 'Señores Miembros del Comité de Administración',
    targetCity: companySettings?.lastProposalConfig?.targetCity || 'La Serena, Región de Coquimbo',
    proposalDate: companySettings?.lastProposalConfig?.proposalDate || new Date().toISOString().split('T')[0],
    leaveRecipientBlank: companySettings?.lastProposalConfig?.leaveRecipientBlank || false
  });

  // Estado del modal corporativo de confirmación (reemplazo de window.confirm)
  const [modalDialog, setModalDialog] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    isAlert: false,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const closeConfirmModal = () => {
    setModalDialog(prev => ({ ...prev, isOpen: false }));
  };

  const showAlert = (title, message, type = 'warning') => {
    setModalDialog({
      isOpen: true,
      type,
      title,
      message,
      confirmText: 'Entendido',
      isAlert: true,
      onConfirm: closeConfirmModal,
      onCancel: closeConfirmModal
    });
  };

  const showConfirm = ({ title, message, type = 'warning', confirmText = 'Aceptar', cancelText = 'Cancelar', onConfirm }) => {
    setModalDialog({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      cancelText,
      isAlert: false,
      onConfirm: () => {
        closeConfirmModal();
        if (onConfirm) onConfirm();
      },
      onCancel: closeConfirmModal
    });
  };

  // Cálculo de estadísticas consolidadas rescatadas del sistema para postulación
  const portfolioStats = useMemo(() => {
    const totalComms = communities.length || 1;
    const totalUnits = communities.reduce((acc, c) => acc + (c.units?.length || 0), 0) || 16;
    const totalIssuedCerts = certificates.filter(c => c.status === 'EMITIDO').length || 6;
    const yearsExp = Math.max(1, new Date().getFullYear() - (parseInt(empresaForm.startYear) || 2019));
    return { totalComms, totalUnits, totalIssuedCerts, yearsExp };
  }, [communities, certificates, empresaForm.startYear]);

  // --- LÓGICA DEL CANVAS DE DIBUJO DE FIRMA DIGITAL ---
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasCanvasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureImage(dataUrl);
    }
  };

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage('');
    setHasCanvasDrawn(false);
  };

  const handleUploadSignatureFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setSignatureImage(result);
        setHasCanvasDrawn(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar configuración completa en context / localStorage
  const handleSaveAllSettings = (e) => {
    if (e) e.preventDefault();

    const updatedSettings = {
      ...companySettings,
      brandName: empresaForm.brandName,
      provisionalName: empresaForm.provisionalName,
      companyRut: empresaForm.companyRut,
      address: empresaForm.address,
      city: empresaForm.city,
      phone: empresaForm.phone,
      email: empresaForm.email,
      website: empresaForm.website,
      adminName: empresaForm.adminName,
      adminRut: empresaForm.adminRut,
      adminRole: empresaForm.adminRole,
      rnacNumber: empresaForm.rnacNumber,
      rnacCategory: empresaForm.rnacCategory,
      adminPin: adminPin,
      signatureDataUrl: signatureImage,
      profileLicitacion: {
        specialty: empresaForm.specialty,
        startYear: empresaForm.startYear,
        presentationText: empresaForm.presentationText
      },
      academicBackground: academicRecords,
      accreditationFiles: accreditationDocs,
      committeeReferenceRequests: committeeReferences,
      lastProposalConfig: proposalConfig
    };

    setCompanySettings(updatedSettings);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
  };

  // Sugerir presentación maestra con IA desde historial
  const handleSuggestPresentationFromHistory = () => {
    const suggested = `ARANPRO es una empresa de gestión y administración profesional de condominios con ${portfolioStats.yearsExp} años de trayectoria en la Región de Coquimbo. A la fecha administramos ${portfolioStats.totalComms} comunidad(es) con más de ${portfolioStats.totalUnits} unidades habitacionales. Nuestro valor diferenciador único radica en el perfil técnico en construcción de nuestro administrador titular, combinando sólida fiscalización de contratos de mantención, auditoría preventiva de bombas y ascensores, junto a un portal web exclusivo que otorga transparencia 100% en las cuentas y cobros mensuales.`;
    setEmpresaForm(prev => ({ ...prev, presentationText: suggested }));
  };

  // Solicitar carta de recomendación al Presidente del Comité vía WhatsApp
  const handleRequestReferenceWhatsApp = (ref) => {
    const phoneClean = (ref.phone || '').replace(/[^0-9]/g, '');
    const msg = `*SOLICITUD DE CARTA DE REFERENCIA • ADMINISTRACIÓN ARANPRO*\n` +
      `Estimado(a) *${ref.contactName}* (${ref.role} de *${ref.communityName}*),\n\n` +
      `Junto con saludarle cordialmente, nos encontramos participando en un proceso de licitación para la administración de una nueva comunidad habitacional en la región.\n\n` +
      `Con el propósito de acreditar nuestra trayectoria y satisfacción de los copropietarios, le agradeceríamos enormemente si pudiéramos contar con una breve carta de recomendación o constancia de conformidad de su gestión como Comité.\n\n` +
      `Agradecemos desde ya su constante apoyo y confianza en nuestro trabajo profesional.\n\n` +
      `Atentamente,\n*${empresaForm.adminName}*\nAdministrador Titular (RNAC Minvu N° ${empresaForm.rnacNumber})`;

    const url = phoneClean ? `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Imprimir Carta de Postulación en PDF Carta
  const handlePrintProposal = () => {
    printDocumentDirectly('printable-commercial-proposal', `Propuesta_Administracion_ARANPRO_${new Date().getFullYear()}`, {
      pageSize: 'letter portrait',
      fitPage: false,
      margin: '8mm 10mm 8mm 10mm'
    });
  };

  // Imprimir Dossier Integral de Licitación (Carta + Ficha Técnica Constructiva + Diplomas + Cartas Recomendación)
  const handlePrintDossier = () => {
    printDocumentDirectly('printable-full-dossier', `Dossier_Integral_Licitacion_ARANPRO_${new Date().getFullYear()}`, {
      pageSize: 'letter portrait',
      fitPage: false,
      margin: '8mm 10mm 8mm 10mm'
    });
  };

  // Manejo de Archivo de Diploma (PDF o Imagen en Data URL)
  const handleDiplomaFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showAlert('Archivo demasiado grande', 'El archivo no debe exceder los 8 MB para garantizar el respaldo ágil en el sistema.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        const sizeStr = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        setNewDiplomaForm(prev => ({
          ...prev,
          fileName: file.name,
          fileType: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          fileData: dataUrl,
          fileSize: sizeStr
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar / Actualizar Diploma o Certificado de Curso
  const handleSaveDiploma = (e) => {
    if (e) e.preventDefault();
    if (!newDiplomaForm.title.trim() || !newDiplomaForm.institution.trim()) {
      showAlert('Campos Obligatorios', 'Por favor ingresa al menos el Nombre del Título/Curso y la Institución emisora.', 'warning');
      return;
    }

    if (editingDiplomaId) {
      setAcademicRecords(prev => prev.map(item => {
        if (item.id === editingDiplomaId) {
          return {
            ...item,
            title: newDiplomaForm.title.trim(),
            institution: newDiplomaForm.institution.trim(),
            category: newDiplomaForm.category,
            status: newDiplomaForm.status,
            year: newDiplomaForm.year.trim() || new Date().getFullYear().toString(),
            relevance: newDiplomaForm.relevance.trim() || 'Aporte técnico para la supervisión y mantenimiento de instalaciones.',
            fileName: newDiplomaForm.fileName || item.fileName || 'Diploma_Acreditado.pdf',
            fileType: newDiplomaForm.fileType || item.fileType || 'application/pdf',
            fileData: newDiplomaForm.fileData !== undefined ? newDiplomaForm.fileData : item.fileData,
            fileSize: newDiplomaForm.fileSize || item.fileSize || '1.1 MB',
            includeInProposal: newDiplomaForm.includeInProposal !== false
          };
        }
        return item;
      }));
      showAlert('✓ Certificado Actualizado', 'El registro y respaldo del diploma se actualizaron correctamente.', 'success');
    } else {
      const newRecord = {
        id: `acad-${Date.now()}`,
        title: newDiplomaForm.title.trim(),
        institution: newDiplomaForm.institution.trim(),
        category: newDiplomaForm.category,
        status: newDiplomaForm.status,
        year: newDiplomaForm.year.trim() || new Date().getFullYear().toString(),
        relevance: newDiplomaForm.relevance.trim() || 'Aporte técnico fundamental para la inspección y mantenimiento de las instalaciones comunes.',
        fileName: newDiplomaForm.fileName || 'Diploma_Acreditado.pdf',
        fileType: newDiplomaForm.fileType || 'application/pdf',
        fileData: newDiplomaForm.fileData || null,
        fileSize: newDiplomaForm.fileSize || '980 KB',
        uploadDate: new Date().toISOString().split('T')[0],
        includeInProposal: newDiplomaForm.includeInProposal !== false
      };
      setAcademicRecords(prev => [newRecord, ...prev]);
      showAlert('✓ Diploma / Curso Guardado', 'El respaldo digital ha sido incorporado y custodiado en el sistema con éxito.', 'success');
    }

    setShowUploadDiplomaModal(false);
    setEditingDiplomaId(null);
    setNewDiplomaForm(initialNewDiplomaState);
  };

  // Abrir Modal para Editar Diploma Existente
  const handleEditDiploma = (item) => {
    setEditingDiplomaId(item.id);
    setNewDiplomaForm({
      title: item.title,
      institution: item.institution,
      category: item.category || 'Título Técnico Profesional',
      status: item.status || 'Titulado',
      year: item.year || '',
      relevance: item.relevance || '',
      fileName: item.fileName || '',
      fileType: item.fileType || '',
      fileData: item.fileData || null,
      fileSize: item.fileSize || '',
      includeInProposal: item.includeInProposal !== false
    });
    setShowUploadDiplomaModal(true);
  };

  // Eliminar Diploma con Diálogo Corporativo Seguro
  const handleDeleteDiploma = (item) => {
    showConfirm({
      title: '¿Eliminar Diploma o Acreditación?',
      message: `¿Estás seguro de eliminar "${item.title}"?\n\nSe desvinculará el archivo de respaldo y ya no se adjuntará al dossier de licitación.`,
      type: 'danger',
      confirmText: 'Sí, Eliminar Registro',
      cancelText: 'Conservar',
      onConfirm: () => {
        setAcademicRecords(prev => prev.filter(r => r.id !== item.id));
        showAlert('Registro Eliminado', 'El diploma ha sido quitado de los registros de la empresa.', 'info');
      }
    });
  };

  // Alternar Inclusión en el Dossier de Postulación
  const handleToggleIncludeInProposal = (id) => {
    setAcademicRecords(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, includeInProposal: !item.includeInProposal };
      }
      return item;
    }));
  };

  // Descargar Archivo de Respaldo Original del Diploma
  const handleDownloadDiplomaFile = (item) => {
    if (item.fileData) {
      const link = document.createElement('a');
      link.href = item.fileData;
      link.download = item.fileName || `${item.title.replace(/\s+/g, '_')}_ARANPRO.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      printDocumentDirectly('diploma-certificate-preview-card', `Acreditacion_${item.title.replace(/\s+/g, '_')}_ARANPRO`, {
        pageSize: 'letter portrait',
        fitPage: false,
        margin: '10mm'
      });
    }
  };

  // Menú de Navegación Lateral (Estilo ECP)
  const navSubItems = [
    { id: 'empresa', label: 'Empresa & Representante', icon: Building2, desc: 'Datos de facturación, RUT y representante legal' },
    { id: 'firma', label: 'Firma Digital & Timbre', icon: PenTool, desc: 'Firma manuscrita en canvas y vista previa PDF' },
    { id: 'acreditacion', label: 'Acreditaciones & Perfil Técnico', icon: HardHat, desc: 'Técnico en Construcción, RNAC Minvu y diplomas' },
    { id: 'postulaciones', label: 'Postulaciones & Dossier', icon: Briefcase, desc: 'Carta de presentación, cartas de recomendación y licitación' },
    { id: 'respaldos', label: 'Respaldos & Seguridad', icon: Key, desc: 'Backup integral JSON, PIN maestro y restauración' },
    { id: 'sobre_app', label: 'Sobre la Plataforma', icon: BookOpen, desc: 'Ley N° 21.442, versión y soporte técnico' }
  ];

  return (
    <div className="w-full space-y-6">
      {/* 1. CABECERA CORPORATIVA ARANPRO */}
      <div className="bg-gradient-to-r from-[#0F3D2E] via-[#144D3A] to-[#0A291F] text-white p-6 md:p-8 rounded-3xl shadow-lg border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4B895]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4B895]/20 text-[#D4B895] border border-[#D4B895]/30">
                <Settings className="w-3.5 h-3.5 text-[#D4B895]" />
                CENTRO DE CONFIGURACIÓN & EMPRESA • LEY 21.442
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                {empresaForm.provisionalName}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              Configuración Corporativa & Licitaciones
            </h2>
            <p className="text-xs md:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Gestión centralizada de datos de la empresa, firma digital manuscrita, acreditaciones técnicas en construcción,
              generación de cartas de postulación a nuevos condominios y respaldos de seguridad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSaveAllSettings}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4B895] to-[#C2A37D] text-[#0F3D2E] font-bold text-sm shadow-md hover:brightness-105 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 text-[#0F3D2E]" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {saveFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✓ Configuración, firma digital y acreditaciones guardadas exitosamente en toda la plataforma.</span>
        </div>
      )}

      {/* 2. LAYOUT TIPO ECP: NAVEGACIÓN LATERAL IZQUIERDA + CONTENIDO A LA DERECHA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL DE NAVEGACIÓN LATERAL (COL 4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-3 shadow-xs space-y-1.5">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Módulos de Configuración
            </span>
            <p className="text-xs font-black text-slate-900 mt-0.5">Centro de Control ARANPRO</p>
          </div>

          {navSubItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all ${
                  isActive
                    ? 'bg-[#0F3D2E] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-[#D4B895] text-[#0F3D2E]' : 'bg-slate-100 text-slate-600'}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {item.label}
                  </div>
                  <div className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* PANEL DE CONTENIDO (COL 8) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">

          {/* ==================== SUB-PESTAÑA 1: EMPRESA & REPRESENTANTE LEGAL ==================== */}
          {activeSubTab === 'empresa' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold text-[#D4B895] uppercase tracking-wider block">
                  Identidad Comercial & Jurídica
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Datos de la Empresa y Representante Legal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta información aparece en las colillas de cobro, contratos, presupuestos y certificados oficiales.
                </p>
              </div>

              {/* DATOS DE LA EMPRESA */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0F3D2E]" />
                  Datos de la Empresa / Razón Social
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Razón Social / Nombre Comercial *
                    </label>
                    <input
                      type="text"
                      value={empresaForm.provisionalName}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, provisionalName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      RUT de la Empresa *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={empresaForm.companyRut}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, companyRut: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ RUT Válido
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Dirección Comercial
                    </label>
                    <input
                      type="text"
                      value={empresaForm.address}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Ciudad / Comuna
                    </label>
                    <input
                      type="text"
                      value={empresaForm.city}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Teléfono / WhatsApp 24/7
                    </label>
                    <input
                      type="tel"
                      value={empresaForm.phone}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Correo Oficial de Contacto
                    </label>
                    <input
                      type="email"
                      value={empresaForm.email}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Sitio Web Oficial
                    </label>
                    <input
                      type="url"
                      value={empresaForm.website}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, website: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                </div>
              </div>

              {/* REPRESENTANTE LEGAL / FIRMANTE */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#0F3D2E]" />
                  Representante Legal & Administrador Titular
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={empresaForm.adminName}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, adminName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      RUT del Representante *
                    </label>
                    <input
                      type="text"
                      value={empresaForm.adminRut}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, adminRut: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cargo / Rol en Contratos
                    </label>
                    <input
                      type="text"
                      value={empresaForm.adminRole}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, adminRole: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Registro Nacional Minvu (RNAC N°) *
                    </label>
                    <input
                      type="text"
                      value={empresaForm.rnacNumber}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, rnacNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#0F3D2E] focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Categoría en el Registro Minvu
                    </label>
                    <input
                      type="text"
                      value={empresaForm.rnacCategory}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, rnacCategory: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                </div>
              </div>

              {/* PERFIL PARA LICITACIONES Y CARTAS */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4B895]" />
                    Perfil Maestro para Licitaciones y Postulaciones
                  </h4>
                  <button
                    type="button"
                    onClick={handleSuggestPresentationFromHistory}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-[11px] font-bold transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    ✨ Sugerir desde mi historial
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Rubro o Especialidad Principal
                    </label>
                    <input
                      type="text"
                      value={empresaForm.specialty}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, specialty: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Año de Inicio de Actividades
                    </label>
                    <input
                      type="number"
                      value={empresaForm.startYear}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, startYear: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Presentación Estándar de la Empresa
                  </label>
                  <textarea
                    rows={4}
                    value={empresaForm.presentationText}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, presentationText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    placeholder="Describe experiencia, especialidades técnicas en construcción, forma de trabajo y fortalezas comprobables..."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAllSettings}
                  className="px-6 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-[#D4B895]" />
                  Guardar Datos de la Empresa
                </button>
              </div>
            </div>
          )}

          {/* ==================== SUB-PESTAÑA 2: FIRMA DIGITAL & TIMBRE ==================== */}
          {activeSubTab === 'firma' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold text-[#D4B895] uppercase tracking-wider block">
                  Fe Pública & Validez Notarial
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Firma Digital Manuscrita & Timbre Oficial
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tu firma manuscrita aparecerá al pie de cada certificado notarial, colilla de gastos comunes y acta de asamblea.
                  Dibújala directamente aquí con mouse o trackpad, o sube una imagen transparente.
                </p>
              </div>

              {/* CONTROLES DE COLOR Y GROSOR */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Color del Trazo:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { color: '#0F3D2E', label: 'Verde ARANPRO' },
                      { color: '#0f172a', label: 'Negro Notarial' },
                      { color: '#1e3a8a', label: 'Azul Marino' },
                      { color: '#b91c1c', label: 'Rojo' }
                    ].map(c => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setPenColor(c.color)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          penColor === c.color ? 'scale-110 border-slate-900 shadow-xs' : 'border-white'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Grosor:</span>
                  <div className="flex items-center gap-1">
                    {[1.5, 2.5, 4.0].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setPenWidth(w)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                          penWidth === w ? 'bg-[#0F3D2E] text-white border-[#0F3D2E]' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {w === 1.5 ? 'Fino' : w === 2.5 ? 'Medio' : 'Grueso'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    Subir Firma (PNG)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadSignatureFile}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={clearSignatureCanvas}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 transition-all"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* CANVAS DE DIBUJO INTERACTIVO */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Área de Firma Manuscrita (Dibuja con el mouse, trackpad o lápiz táctil)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-white p-2 flex items-center justify-center relative overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full max-w-xl h-48 cursor-crosshair touch-none bg-transparent"
                  />
                  {!hasCanvasDrawn && !signatureImage && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs font-medium">
                      ✍️ Dibuja tu firma en este recuadro...
                    </div>
                  )}
                </div>
              </div>

              {/* VISTA PREVIA EN PDF (ESTILO ECP) */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Vista Previa en Documentos Oficiales (PDF Carta)
                </span>
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-center space-y-3">
                  <div className="h-24 flex items-end justify-center">
                    {signatureImage ? (
                      <img
                        src={signatureImage}
                        alt="Firma Manuscrita"
                        className="max-h-20 max-w-xs object-contain mx-auto"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin firma configurada</span>
                    )}
                  </div>
                  <div className="border-t-2 border-slate-400 pt-2 space-y-0.5">
                    <p className="font-black text-xs text-slate-900">{empresaForm.adminName}</p>
                    <p className="text-[10px] text-slate-600 font-mono">RUT: {empresaForm.adminRut}</p>
                    <p className="text-[10px] text-[#0F3D2E] font-semibold">
                      {empresaForm.adminRole} (RNAC Minvu N° {empresaForm.rnacNumber})
                    </p>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block pt-1">
                      Firma Autorizada • Ley N° 21.442
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAllSettings}
                  className="px-6 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-[#D4B895]" />
                  Guardar Firma Digital
                </button>
              </div>
            </div>
          )}

          {/* ==================== SUB-PESTAÑA 3: ACREDITACIONES & PERFIL TÉCNICO ==================== */}
          {activeSubTab === 'acreditacion' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#D4B895] uppercase tracking-wider block">
                    Ventaja Competitiva Diferencial
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Diplomas, Títulos & Respaldo Técnico en Construcción
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Custodia y respaldo digital de títulos profesionales, certificaciones Minvu y cursos para certificar tu experiencia y adjuntarlos a licitaciones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDiplomaId(null);
                    setNewDiplomaForm(initialNewDiplomaState);
                    setShowUploadDiplomaModal(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0F3D2E] to-[#165540] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 text-[#D4B895]" />
                  Subir Diploma o Curso
                </button>
              </div>

              {/* BANNER INFORMATIVO DE VALOR CONSTRUCTIVO */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-amber-50/30 border border-emerald-200/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#0F3D2E] text-[#D4B895] shrink-0 mt-0.5">
                  <HardHat className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-900">
                    Ventaja Técnica Exclusiva: Formación Constructiva al Servicio del Condominio
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Ser <strong>Técnico en Construcción</strong> y encontrarse cursando estudios superiores de <strong>Construcción Civil</strong> es un activo de incalculable valor para una comunidad:
                    permite auditar con autoridad salas de bombas, cubiertas, filtraciones y fiscalizar a contratistas externos evitando sobrecostos y presupuestos inflados.
                  </p>
                </div>
              </div>

              {/* LISTADO DE DIPLOMAS, TÍTULOS Y CURSOS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#0F3D2E]" />
                    Títulos y Certificaciones Custodiadas ({academicRecords.length})
                  </h4>
                  <span className="text-[10px] font-bold text-[#0F3D2E] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Respaldos Digitales Activos
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {academicRecords.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#D4B895] transition-all space-y-3 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-sm text-slate-900">{item.title}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status.includes('Titulado')
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status.includes('curso')
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {item.status}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              {item.category || 'Acreditación Técnica'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {item.institution} • {item.year}
                          </p>
                        </div>

                        {/* ACCIONES DEL DIPLOMA */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveDiplomaPreview(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                            title="Ver documento o constancia digital"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>Ver</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadDiplomaFile(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1"
                            title="Descargar archivo original"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Descargar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditDiploma(item)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            title="Editar información"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDiploma(item)}
                            className="p-1.5 rounded-xl text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition-all"
                            title="Eliminar diploma"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* APORTE TÉCNICO A LA ADMINISTRACIÓN */}
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                        <strong className="text-[#0F3D2E]">Aporte Práctico a la Gestión:</strong> {item.relevance}
                      </p>

                      {/* ARCHIVO ADJUNTO & TOGGLE PARA LICITACIÓN */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <Paperclip className="w-3.5 h-3.5 text-[#0F3D2E]" />
                          <span>{item.fileName || 'Documento_Respaldado.pdf'}</span>
                          <span className="text-slate-400">({item.fileSize || 'Digital'})</span>
                          {item.fileData && (
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[9.5px]">
                              ✓ Archivo Cargado
                            </span>
                          )}
                        </div>

                        {/* TOGGLE INCLUIR EN LICITACIONES */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.includeInProposal !== false}
                            onChange={() => handleToggleIncludeInProposal(item.id)}
                            className="w-4 h-4 rounded text-[#0F3D2E] focus:ring-[#0F3D2E] border-slate-300"
                          />
                          <span className={`text-xs font-bold ${item.includeInProposal !== false ? 'text-[#0F3D2E]' : 'text-slate-400'}`}>
                            {item.includeInProposal !== false ? '✓ Adjuntar a Dossier de Licitación' : 'Omitir en Dossier'}
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOCUMENTOS Y RESPALDOS LEGALES DE ACREDITACIÓN */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#0F3D2E]" />
                  Acreditaciones Institucionales y Antecedentes Legales
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {accreditationDocs.map(doc => (
                    <div key={doc.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">{doc.category}</span>
                        <h5 className="font-bold text-xs text-slate-900">{doc.name}</h5>
                        <p className="text-[10px] text-slate-500">Expedido: {formatDate(doc.date)}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAllSettings}
                  className="px-6 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-[#D4B895]" />
                  Guardar Perfil y Diplomas
                </button>
              </div>
            </div>
          )}

          {/* ==================== SUB-PESTAÑA 4: POSTULACIONES & DOSSIER DE LICITACIÓN ==================== */}
          {activeSubTab === 'postulaciones' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold text-[#D4B895] uppercase tracking-wider block">
                  Crecimiento & Nuevos Contratos
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Dossier de Postulación & Licitaciones de Condominios
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Genera cartas de presentación formal, propuestas comerciales y dossier con estadísticas reales y diplomas
                  rescatados del software para postular a la administración de nuevos condominios y edificios.
                </p>
              </div>

              {/* RESUMEN DE EXPERIENCIA RESCATADA DEL SOFTWARE */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Trayectoria</span>
                  <span className="text-xl font-black text-[#0F3D2E]">{portfolioStats.yearsExp} Años</span>
                  <span className="text-[9px] text-slate-500 block">Desde {empresaForm.startYear}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Comunidades</span>
                  <span className="text-xl font-black text-slate-900">{portfolioStats.totalComms} Activa(s)</span>
                  <span className="text-[9px] text-slate-500 block">Bajo custodia integral</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Unidades Gestionadas</span>
                  <span className="text-xl font-black text-slate-900">{portfolioStats.totalUnits} Casas/Deptos</span>
                  <span className="text-[9px] text-slate-500 block">En nómina central</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Fe Pública</span>
                  <span className="text-xl font-black text-[#0F3D2E]">{portfolioStats.totalIssuedCerts} Certs</span>
                  <span className="text-[9px] text-slate-500 block">Emitidos formalmente</span>
                </div>
              </div>

              {/* CONFIGURACIÓN Y PERSONALIZACIÓN DE DESTINATARIO DE LA CARTA / DOSSIER */}
              <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
                      <PenTool className="w-4 h-4 text-[#0F3D2E]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Personalización de la Carta & Destinatario a Postular
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Ingresa los datos del condominio y a quién se dirige la carta (comité, presidente, directiva) o déjalo en blanco.
                      </p>
                    </div>
                  </div>
                  {proposalConfig.targetCondo || (!proposalConfig.leaveRecipientBlank && proposalConfig.targetRecipient) ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                      ✓ Carta Personalizada
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
                      Carta Abierta / En Blanco
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campo 1: Condominio a Postular */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Condominio o Edificio al que Postulas
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Condominio Mirador de San Joaquín (o dejar vacío)"
                      value={proposalConfig.targetCondo}
                      onChange={(e) => setProposalConfig({ ...proposalConfig, targetCondo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                    <p className="text-[10.5px] text-slate-400">
                      Se incorporará automáticamente en el membrete y en el texto formal de presentación.
                    </p>
                  </div>

                  {/* Campo 2: Ciudad / Comuna */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Ciudad / Comuna de la Postulación
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: La Serena, Coquimbo, Ovalle"
                      value={proposalConfig.targetCity}
                      onChange={(e) => setProposalConfig({ ...proposalConfig, targetCity: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                    <p className="text-[10.5px] text-slate-400">
                      Aparece junto a la fecha oficial de la propuesta.
                    </p>
                  </div>
                </div>

                {/* Campo 3: A quién se dirige la carta (Destinatario) */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      A la atención de / Destinatario de la Carta:
                    </label>
                    <button
                      type="button"
                      onClick={() => setProposalConfig({ ...proposalConfig, targetRecipient: '', leaveRecipientBlank: true })}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      Limpiar / Dejar en blanco
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Escribe el destinatario o selecciona una opción rápida abajo..."
                    value={proposalConfig.leaveRecipientBlank ? '' : proposalConfig.targetRecipient}
                    disabled={proposalConfig.leaveRecipientBlank}
                    onChange={(e) => setProposalConfig({ ...proposalConfig, targetRecipient: e.target.value, leaveRecipientBlank: false })}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0F3D2E] transition-all ${
                      proposalConfig.leaveRecipientBlank
                        ? 'bg-slate-100 text-slate-400 border-dashed border-slate-300'
                        : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  />

                  {/* Botones Presets Rápidos */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Opciones Rápidas:</span>
                    {[
                      { label: 'Comité de Administración', value: 'Señores Miembros del Comité de Administración' },
                      { label: 'Presidente(a) del Comité', value: 'Señor(a) Presidente(a) del Comité de Administración' },
                      { label: 'Directiva del Condominio', value: 'Señores Miembros de la Directiva del Condominio' },
                      { label: 'Asamblea de Copropietarios', value: 'Asamblea de Copropietarios & Comité de Administración' },
                      { label: 'Comisión de Licitación', value: 'Señores Integrantes de la Comisión de Licitación' },
                      { label: 'Dejar en Blanco (Completar a mano)', value: '', isBlank: true }
                    ].map((preset) => {
                      const isSelected = preset.isBlank
                        ? proposalConfig.leaveRecipientBlank || !proposalConfig.targetRecipient
                        : !proposalConfig.leaveRecipientBlank && proposalConfig.targetRecipient === preset.value;

                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            if (preset.isBlank) {
                              setProposalConfig({ ...proposalConfig, targetRecipient: '', leaveRecipientBlank: true });
                            } else {
                              setProposalConfig({ ...proposalConfig, targetRecipient: preset.value, leaveRecipientBlank: false });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-[#0F3D2E] text-white border-[#0F3D2E] shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* OPCIONES DE GENERACIÓN DE DOSSIER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. DOSSIER INTEGRAL COMPLETO (RECOMENDADO) */}
                <div className="bg-gradient-to-br from-[#0F3D2E] to-[#164D3A] text-white p-6 rounded-3xl shadow-lg border border-emerald-900/40 space-y-4 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-[#D4B895] text-[#0F3D2E] uppercase tracking-wider">
                      ★ FORMATO LICITACIÓN COMPLETA
                    </span>
                    <h4 className="text-lg font-black tracking-tight text-white">
                      Dossier Integral de Postulación (Multi-Página)
                    </h4>
                    <p className="text-xs text-emerald-100/90 leading-relaxed">
                      Compila en un solo PDF ejecutivo: Portada oficial, Carta de Presentación, Ficha Técnica Constructiva (salas de bombas, filtraciones),
                      Diplomas seleccionados ({academicRecords.filter(r => r.includeInProposal !== false).length}), y Cartas de Referencia con testimonios.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewDossierModal(true)}
                      className="px-4 py-2.5 bg-[#D4B895] hover:bg-[#c2a37d] text-[#0F3D2E] font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-[#0F3D2E]" />
                      Ver Dossier Integral
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintDossier}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-[#D4B895]" />
                      Imprimir / PDF
                    </button>
                  </div>
                </div>

                {/* 2. CARTA SIMPLE DE 1 PÁGINA */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                      Presentación Breve
                    </span>
                    <h4 className="text-base font-black text-slate-900">
                      Carta de Presentación Simple (1 Página)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Carta formal tamaño Carta lista para imprimir o enviar por correo a administraciones o comités que solicitan una postulación rápida y concisa.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewProposalModal(true)}
                      className="px-4 py-2 bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#D4B895]" />
                      Ver Carta Simple
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintProposal}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir
                    </button>
                  </div>
                </div>
              </div>

              {/* DIPLOMAS ADJUNTOS AL DOSSIER */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#0F3D2E]" />
                    Diplomas y Cursos Marcados para el Dossier
                  </h4>
                  <span className="text-[11px] font-bold text-[#0F3D2E]">
                    {academicRecords.filter(r => r.includeInProposal !== false).length} de {academicRecords.length} adjuntos
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {academicRecords.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleIncludeInProposal(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        item.includeInProposal !== false
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      <span>{item.includeInProposal !== false ? '✓' : '+'}</span>
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SOLICITUD DE CARTAS DE RECOMENDACIÓN A COMITÉS ACTUALES */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-[#0F3D2E]" />
                    Cartas de Recomendación & Testimonios de Comités Actuales
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500">
                    Incluidas en el Dossier Integral
                  </span>
                </div>

                <div className="space-y-3">
                  {committeeReferences.map(ref => (
                    <div key={ref.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {ref.contactName} • <span className="text-[#0F3D2E]">{ref.role}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{ref.communityName} • Tel: {ref.phone}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRequestReferenceWhatsApp(ref)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <Send className="w-3 h-3" />
                          Pedir Carta por WhatsApp
                        </button>
                      </div>
                      <blockquote className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200">
                        "{ref.quote}"
                      </blockquote>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUB-PESTAÑA 5: RESPALDOS & SEGURIDAD ==================== */}
          {activeSubTab === 'respaldos' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold text-[#D4B895] uppercase tracking-wider block">
                  Seguridad & Resguardo Total
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Centro de Respaldos (Backup), Seguridad & PIN Maestro
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exporta copias de seguridad de todas las comunidades en archivo JSON, administra tu PIN maestro de acceso
                  y garantiza la continuidad operativa de la plataforma.
                </p>
              </div>

              {/* PIN MAESTRO */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">PIN Maestro de Acceso Administrativo</h4>
                    <p className="text-[11px] text-slate-500">Clave requerida para ingresar al panel de administración general.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-xs font-bold text-[#0F3D2E] hover:underline"
                  >
                    {showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                  </button>
                </div>
                <div className="flex items-center gap-3 max-w-xs">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAllSettings}
                    className="px-4 py-2 bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap"
                  >
                    Actualizar PIN
                  </button>
                </div>
              </div>

              {/* CENTRO DE RESPALDOS JSON */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#0F3D2E]" />
                  Respaldo y Recuperación de Base de Datos
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Descarga JSON */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                      Exportar Datos
                    </span>
                    <h5 className="font-bold text-sm text-slate-900">Descargar Copia de Respaldo Completa</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Genera un archivo seguro .JSON con todas las comunidades, nóminas de casas, gastos históricos, actas de asambleas y certificados foliados.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ communities, certificates, companySettings }, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", `ARANPRO_Backup_Completo_${new Date().toISOString().split('T')[0]}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                        showAlert('✓ Respaldo Descargado', 'El archivo de seguridad se ha descargado exitosamente en tu equipo.', 'success');
                      }}
                      className="w-full py-2.5 bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D4B895]" />
                      Descargar Backup Completo (.JSON)
                    </button>
                  </div>

                  {/* Restaurar JSON */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                      Restaurar Datos
                    </span>
                    <h5 className="font-bold text-sm text-slate-900">Cargar / Restaurar Copia de Respaldo</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sube un archivo .JSON de respaldo para restablecer o migrar las comunidades en este u otro computador de la empresa.
                    </p>
                    <label className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      Seleccionar Archivo JSON
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const parsed = JSON.parse(event.target?.result);
                              if (parsed.communities && Array.isArray(parsed.communities)) {
                                showConfirm({
                                  title: '¿Confirmar Restauración de Respaldo?',
                                  message: `Se detectaron ${parsed.communities.length} comunidades y ${parsed.certificates?.length || 0} certificados en el archivo.\n\n¿Desea restaurar estos datos reemplazando los actuales?`,
                                  type: 'warning',
                                  confirmText: 'Sí, Restaurar Datos',
                                  cancelText: 'Cancelar',
                                  onConfirm: () => {
                                    localStorage.setItem('condo_communities', JSON.stringify(parsed.communities));
                                    if (parsed.certificates) localStorage.setItem('condo_certificates', JSON.stringify(parsed.certificates));
                                    if (parsed.companySettings) localStorage.setItem('condo_company_settings', JSON.stringify(parsed.companySettings));
                                    showAlert('✓ Restauración Completada', 'Los datos han sido restaurados. La página se actualizará ahora.', 'success');
                                    setTimeout(() => window.location.reload(), 1500);
                                  }
                                });
                              } else {
                                showAlert('Archivo No Válido', 'El archivo seleccionado no tiene el formato de respaldo de ARANPRO.', 'danger');
                              }
                            } catch (err) {
                              showAlert('Error al Leer Archivo', 'No se pudo procesar el archivo JSON seleccionado.', 'danger');
                            }
                          };
                          reader.readAsText(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUB-PESTAÑA 6: SOBRE LA PLATAFORMA ==================== */}
          {activeSubTab === 'sobre_app' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold text-[#D4B895] uppercase tracking-wider block">
                  Información Institucional
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  ARANPRO • Suite Integral de Copropiedad Inmobiliaria
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Versión 2.4.0 • Edición Especial Conforme a la Ley N° 21.442 de Copropiedad Inmobiliaria.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">1. Marco Legal Chileno (Ley N° 21.442)</h4>
                  <p>
                    Esta plataforma ha sido desarrollada para cumplir estrictamente con los mandatos de la nueva legislación chilena:
                    asambleas telemáticas y quórums especiales (Art. 15°), fondos de reserva obligatorios (Art. 6°), rendición de cuentas documentada (Art. 20°),
                    responsabilidad real del nuevo adquirente e imputación notarial de deudas (Art. 36°) y el Libro Oficial de Novedades y Reclamos.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">2. Soporte Técnico y Garantía Operativa</h4>
                  <p>
                    Para consultas de soporte, personalizaciones de módulos o asesoría en licitaciones de comunidades:
                    contacto directo al teléfono <strong>{empresaForm.phone}</strong> o vía correo a <strong>{empresaForm.email}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==================== MODAL DE VISTA PREVIA DE CARTA DE POSTULACIÓN (PDF CARTA) ==================== */}
      {previewProposalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col relative">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#0F3D2E] text-[#D4B895] flex items-center justify-center font-bold text-sm">
                  💼
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Carta de Presentación & Propuesta de Administración
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Documento Oficial para Licitaciones y Comités de Copropietarios
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintProposal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4 text-[#D4B895]" />
                  Imprimir / Descargar PDF Oficial (Carta)
                </button>
                <button
                  onClick={() => setPreviewProposalModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* BARRA DE AJUSTE RÁPIDO DE DESTINATARIO */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-700">Condominio a Postular:</span>
                <input
                  type="text"
                  placeholder="Ej: Condominio Los Cerezos (o vacío)"
                  value={proposalConfig.targetCondo}
                  onChange={(e) => setProposalConfig({ ...proposalConfig, targetCondo: e.target.value })}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-xs w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-[#0F3D2E]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-700">Dirigido a:</span>
                <input
                  type="text"
                  placeholder="Ej: Comité / Presidente / Directiva (o vacío)"
                  value={proposalConfig.leaveRecipientBlank ? '' : proposalConfig.targetRecipient}
                  disabled={proposalConfig.leaveRecipientBlank}
                  onChange={(e) => setProposalConfig({ ...proposalConfig, targetRecipient: e.target.value, leaveRecipientBlank: false })}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-xs w-56 sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#0F3D2E]"
                />
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={proposalConfig.leaveRecipientBlank}
                    onChange={(e) => setProposalConfig({ ...proposalConfig, leaveRecipientBlank: e.target.checked, targetRecipient: e.target.checked ? '' : 'Señores Miembros del Comité de Administración' })}
                    className="w-3.5 h-3.5 rounded text-[#0F3D2E]"
                  />
                  <span>En blanco</span>
                </label>
              </div>
            </div>

            {/* CONTENEDOR DE LA CARTA IMPRIMIBLE TAMAÑO CARTA */}
            <div className="overflow-y-auto flex-1 pr-1">
              <div
                id="printable-commercial-proposal"
                className="bg-white p-8 md:p-12 border border-slate-300 rounded-2xl shadow-xs max-w-3xl mx-auto space-y-6 text-slate-900"
                style={{ minHeight: '840px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {/* Membrete Corporativo */}
                <div className="flex items-start justify-between border-b-2 border-[#0F3D2E] pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0F3D2E] text-[#D4B895] flex items-center justify-center font-black text-sm tracking-wider">
                        A
                      </div>
                      <span className="text-lg font-black tracking-tight text-[#0F3D2E]">
                        {empresaForm.provisionalName}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Administración Profesional de Condominios • RUT {empresaForm.companyRut}
                    </p>
                    <p className="text-[10px] text-slate-600 font-medium">
                      Inscripción en Registro Nacional Minvu (RNAC) N° {empresaForm.rnacNumber}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {empresaForm.email} • {empresaForm.phone} • {empresaForm.city}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block px-3 py-1 bg-[#0F3D2E]/10 text-[#0F3D2E] text-[10px] font-mono font-bold rounded-md border border-[#0F3D2E]/20">
                      PROPUESTA LICITACIÓN {new Date().getFullYear()}
                    </span>
                    <p className="text-[11px] font-bold text-slate-800">
                      Carta de Postulación Formal
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Ley N° 21.442 de Copropiedad Inmobiliaria
                    </p>
                  </div>
                </div>

                {/* Encabezado Formal Notarial */}
                <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p>
                    <strong>A:</strong>{' '}
                    {proposalConfig.leaveRecipientBlank || !proposalConfig.targetRecipient?.trim() ? (
                      <span className="font-mono text-slate-400">__________________________________________________________________</span>
                    ) : (
                      <strong className="text-slate-900">{proposalConfig.targetRecipient}</strong>
                    )}
                  </p>
                  {proposalConfig.targetCondo?.trim() ? (
                    <p>
                      <strong>Condominio / Edificio:</strong>{' '}
                      <strong className="text-[#0F3D2E] uppercase">{proposalConfig.targetCondo}</strong>
                    </p>
                  ) : (
                    proposalConfig.leaveRecipientBlank && (
                      <p>
                        <strong>Condominio / Edificio:</strong>{' '}
                        <span className="font-mono text-slate-400">__________________________________________________________</span>
                      </p>
                    )
                  )}
                  <p><strong>De:</strong> {empresaForm.adminName} — {empresaForm.adminRole}</p>
                  <p>
                    <strong>Fecha:</strong>{' '}
                    {proposalConfig.proposalDate
                      ? new Date(proposalConfig.proposalDate + 'T12:00:00').toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
                      : new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {proposalConfig.targetCity?.trim() ? ` • ${proposalConfig.targetCity}` : ` • ${empresaForm.city}`}
                  </p>
                  <p><strong>Materia:</strong> Propuesta de Servicios Profesionales de Administración Integral de Condominios</p>
                </div>

                {/* Título de la Propuesta */}
                <div className="text-center py-2">
                  <h1 className="text-lg md:text-xl font-black text-[#0F3D2E] uppercase tracking-tight">
                    Propuesta de Administración & Preservación Patrimonial
                  </h1>
                  <div className="w-20 h-1 bg-[#D4B895] mx-auto mt-2 rounded-full"></div>
                </div>

                {/* Cuerpo de la Carta */}
                <div className="text-justify text-xs md:text-sm text-slate-800 leading-relaxed space-y-3">
                  <p>
                    {proposalConfig.leaveRecipientBlank || !proposalConfig.targetRecipient?.trim()
                      ? 'Estimados señores miembros del Comité de Administración y vecinos copropietarios:'
                      : `Estimados ${proposalConfig.targetRecipient}:`}
                  </p>
                  <p>
                    Por medio de la presente, tengo el agrado de presentar a ustedes los servicios profesionales de
                    <strong> {empresaForm.provisionalName}</strong>, con el firme propósito de asumir la administración,
                    gestión operativa y resguardo patrimonial de{' '}
                    {proposalConfig.targetCondo?.trim() ? (
                      <strong>{proposalConfig.targetCondo}</strong>
                    ) : (
                      <strong>su distinguida comunidad</strong>
                    )}{' '}
                    conforme a las disposiciones de la <strong>Ley N° 21.442 de Copropiedad Inmobiliaria</strong>.
                  </p>
                  <p>
                    {empresaForm.presentationText}
                  </p>

                  {/* Fortalezas y Diferenciadores Técnicos */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <p className="font-black text-[#0F3D2E] uppercase text-[11px]">
                      NUESTRAS 4 FORTALEZAS Y VENTAJAS COMPETITIVAS:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                      <li>
                        <strong>Solvencia Técnica en Construcción:</strong> Formación como Técnico en Construcción y estudios avanzados en Construcción Civil, permitiéndonos realizar diagnósticos certeros en bombas, filtraciones, tableros eléctricos, sellos y cubiertas sin depender a ciegas de presupuestos inflados de contratistas externos.
                      </li>
                      <li>
                        <strong>Transparencia Contable 100% Digital:</strong> Implementamos para su comunidad un portal web y aplicación móvil donde cada copropietario puede auditar en vivo con 1 clic las boletas, facturas y comprobantes bancarios reales de cada gasto realizado.
                      </li>
                      <li>
                        <strong>Acreditación Minvu Ley 21.442:</strong> Administrador titular válidamente inscrito en el Registro Nacional de Administradores de Condominios del Minvu (RNAC N° {empresaForm.rnacNumber}).
                      </li>
                      <li>
                        <strong>Cobranza Asistida & Fe Notarial:</strong> Emisión formal de certificados de no deuda, convenios de pago y certificados de liquidación morosa para compraventas bajo el Art. 36° de la ley.
                      </li>
                    </ul>
                  </div>

                  <p>
                    Quedamos a su entera disposición para reunirnos de manera presencial o telemática con el Comité de Administración
                    y coordinar una inspección técnica inicial sin costo de las instalaciones comunes de su condominio.
                  </p>
                </div>

                {/* Sección de Firma Manuscrita Estampada */}
                <div className="pt-8 border-t border-slate-200 text-center space-y-2 max-w-sm mx-auto">
                  <div className="h-20 flex items-center justify-center">
                    {signatureImage ? (
                      <img src={signatureImage} alt="Firma Administrador" className="max-h-16 object-contain mx-auto" />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Firma del Representante Legal</span>
                    )}
                  </div>
                  <div className="border-t border-slate-400 pt-2">
                    <p className="font-bold text-xs text-slate-900">{empresaForm.adminName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">RUT: {empresaForm.adminRut}</p>
                    <p className="text-[10px] text-[#0F3D2E] font-semibold">
                      {empresaForm.adminRole} (RNAC Minvu N° {empresaForm.rnacNumber})
                    </p>
                    <p className="text-[9px] text-slate-500">
                      Técnico en Construcción • Construcción Civil
                    </p>
                  </div>
                </div>

                {/* Pie de Página */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <div>ARANPRO Gestión Integral • {empresaForm.website}</div>
                  <div>Contacto Directo: {empresaForm.phone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE VISTA PREVIA DEL DOSSIER INTEGRAL DE LICITACIÓN (MULTI-PÁGINA) ==================== */}
      {previewDossierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col relative">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#0F3D2E] text-[#D4B895] flex items-center justify-center font-bold text-base shadow-sm">
                  📚
                </span>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Dossier Integral de Postulación a Licitaciones de Condominios
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Compilación Ejecutiva • Carta + Ficha Constructiva + Diplomas + Referencias
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDossier}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4 text-[#D4B895]" />
                  Imprimir / Descargar Dossier PDF
                </button>
                <button
                  onClick={() => setPreviewDossierModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* BARRA DE AJUSTE RÁPIDO DE DESTINATARIO DEL DOSSIER */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-700">Condominio a Postular:</span>
                <input
                  type="text"
                  placeholder="Ej: Condominio Los Cerezos (o vacío)"
                  value={proposalConfig.targetCondo}
                  onChange={(e) => setProposalConfig({ ...proposalConfig, targetCondo: e.target.value })}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-xs w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-[#0F3D2E]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-700">Dirigido a:</span>
                <input
                  type="text"
                  placeholder="Ej: Comité / Presidente / Directiva (o vacío)"
                  value={proposalConfig.leaveRecipientBlank ? '' : proposalConfig.targetRecipient}
                  disabled={proposalConfig.leaveRecipientBlank}
                  onChange={(e) => setProposalConfig({ ...proposalConfig, targetRecipient: e.target.value, leaveRecipientBlank: false })}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-xs w-56 sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#0F3D2E]"
                />
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={proposalConfig.leaveRecipientBlank}
                    onChange={(e) => setProposalConfig({ ...proposalConfig, leaveRecipientBlank: e.target.checked, targetRecipient: e.target.checked ? '' : 'Señores Miembros del Comité de Administración' })}
                    className="w-3.5 h-3.5 rounded text-[#0F3D2E]"
                  />
                  <span>En blanco</span>
                </label>
              </div>
            </div>

            {/* CONTENEDOR DEL DOSSIER INTEGRAL IMPRIMIBLE */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-6">
              <div
                id="printable-full-dossier"
                className="bg-white p-8 md:p-12 border border-slate-300 rounded-2xl shadow-xs max-w-4xl mx-auto space-y-10 text-slate-900"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {/* SECCIÓN 1: PORTADA Y CARTA DE PRESENTACIÓN */}
                <div className="space-y-6">
                  {/* Membrete Corporativo */}
                  <div className="flex items-start justify-between border-b-2 border-[#0F3D2E] pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#0F3D2E] text-[#D4B895] flex items-center justify-center font-black text-base">
                          A
                        </div>
                        <span className="text-xl font-black tracking-tight text-[#0F3D2E]">
                          {empresaForm.provisionalName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                        Administración Profesional & Mantención de Condominios • RUT {empresaForm.companyRut}
                      </p>
                      <p className="text-[10px] text-slate-600 font-medium">
                        Registro Nacional de Administradores Minvu (RNAC) N° {empresaForm.rnacNumber}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {empresaForm.email} • {empresaForm.phone} • {empresaForm.city}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="inline-block px-3 py-1 bg-[#0F3D2E] text-[#D4B895] text-[10px] font-mono font-bold rounded-md">
                        DOSSIER OFICIAL {new Date().getFullYear()}
                      </span>
                      <p className="text-xs font-bold text-slate-800">
                        Propuesta Integral de Gestión
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Ley N° 21.442 de Copropiedad
                      </p>
                    </div>
                  </div>

                  {/* Encabezado Formal */}
                  <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p>
                      <strong>A:</strong>{' '}
                      {proposalConfig.leaveRecipientBlank || !proposalConfig.targetRecipient?.trim() ? (
                        <span className="font-mono text-slate-400">__________________________________________________________________</span>
                      ) : (
                        <strong className="text-slate-900">{proposalConfig.targetRecipient}</strong>
                      )}
                    </p>
                    {proposalConfig.targetCondo?.trim() ? (
                      <p>
                        <strong>Condominio / Edificio:</strong>{' '}
                        <strong className="text-[#0F3D2E] uppercase">{proposalConfig.targetCondo}</strong>
                      </p>
                    ) : (
                      proposalConfig.leaveRecipientBlank && (
                        <p>
                          <strong>Condominio / Edificio:</strong>{' '}
                          <span className="font-mono text-slate-400">__________________________________________________________</span>
                        </p>
                      )
                    )}
                    <p><strong>De:</strong> {empresaForm.adminName} — {empresaForm.adminRole}</p>
                    <p>
                      <strong>Fecha:</strong>{' '}
                      {proposalConfig.proposalDate
                        ? new Date(proposalConfig.proposalDate + 'T12:00:00').toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
                        : new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {proposalConfig.targetCity?.trim() ? ` • ${proposalConfig.targetCity}` : ` • ${empresaForm.city}`}
                    </p>
                    <p><strong>Materia:</strong> Postulación Integral a la Administración y Custodia Técnica del Condominio</p>
                  </div>

                  {/* Título */}
                  <div className="text-center py-2">
                    <h1 className="text-xl md:text-2xl font-black text-[#0F3D2E] uppercase tracking-tight">
                      Dossier de Presentación & Propuesta de Administración
                    </h1>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Solvencia Técnica en Construcción • Transparencia Digital • Acreditación Minvu
                    </p>
                    <div className="w-24 h-1.5 bg-[#D4B895] mx-auto mt-2 rounded-full"></div>
                  </div>

                  {/* Carta de Presentación */}
                  <div className="text-justify text-xs md:text-sm text-slate-800 leading-relaxed space-y-3">
                    <p>
                      {proposalConfig.leaveRecipientBlank || !proposalConfig.targetRecipient?.trim()
                        ? 'Estimados señores miembros del Comité de Administración y vecinos copropietarios:'
                        : `Estimados ${proposalConfig.targetRecipient}:`}
                    </p>
                    <p>
                      Junto con saludarles muy cordialmente, nos es muy grato presentar a su distinguida comunidad el dossier de postulación
                      de <strong>{empresaForm.provisionalName}</strong> para asumir la administración profesional y resguardo patrimonial de{' '}
                      {proposalConfig.targetCondo?.trim() ? (
                        <strong>{proposalConfig.targetCondo}</strong>
                      ) : (
                        <strong>su comunidad</strong>
                      )}{' '}
                      bajo las exigencias de la <strong>Ley N° 21.442 de Copropiedad Inmobiliaria</strong>.
                    </p>
                    <p>
                      {empresaForm.presentationText}
                    </p>
                  </div>
                </div>

                {/* SECCIÓN 2: FICHA TÉCNICA Y AUDITORÍA CONSTRUCTIVA */}
                <div className="pt-8 border-t-2 border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#0F3D2E] text-[#D4B895] rounded-xl font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase text-[#0F3D2E]">
                        Ficha Técnica Constructiva: Auditoría & Prevención de Daños
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        La ventaja diferencial del perfil de Técnico en Construcción y estudios en Construcción Civil
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <h5 className="font-black text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Salas de Bombas e Hidroneumáticos
                      </h5>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Verificación experta de presión de impulsión, estanques de acumulación, tableros de alternancia, sellos mecánicos y válvulas de retención sin depender de diagnósticos falsos de terceros.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <h5 className="font-black text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Cubiertas, Techumbres y Filtraciones
                      </h5>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Detección precoz del origen de filtraciones (juntas de dilatación, bajadas de aguas lluvia, membranas asfálticas), garantizando que las reparaciones sean definitivas.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <h5 className="font-black text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Fiscalización Experta de Contratistas
                      </h5>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Revisión rigurosa de especificaciones técnicas y cubicaciones de presupuestos externos, frenando sobreprecios en pinturas, pavimentos y mantención de ascensores.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <h5 className="font-black text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Portal & Aplicación Móvil 100% Transparente
                      </h5>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Cada factura, boleta, cartola bancaria y comprobante de egreso queda publicado en línea con respaldo digital para libre auditoría de los copropietarios las 24 horas.
                      </p>
                    </div>
                  </div>

                  {/* Resumen de Experiencia en Cifras */}
                  <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Trayectoria</span>
                      <strong className="text-base font-black text-[#0F3D2E]">{portfolioStats.yearsExp} Años</strong>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Comunidades</span>
                      <strong className="text-base font-black text-[#0F3D2E]">{portfolioStats.totalComms} Activa(s)</strong>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Unidades</span>
                      <strong className="text-base font-black text-[#0F3D2E]">{portfolioStats.totalUnits} Casas/Deptos</strong>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Fe Notarial</span>
                      <strong className="text-base font-black text-[#0F3D2E]">{portfolioStats.totalIssuedCerts} Certificados</strong>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 3: ANEXO DE DIPLOMAS Y ACREDITACIONES SELECCIONADAS */}
                <div className="pt-8 border-t-2 border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#0F3D2E] text-[#D4B895] rounded-xl font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase text-[#0F3D2E]">
                        Anexo de Títulos Profesionales, Diplomas & Certificaciones
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Respaldos acreditados del Administrador Titular ({empresaForm.adminName})
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {academicRecords.filter(r => r.includeInProposal !== false).map(item => (
                      <div key={item.id} className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 text-sm">{item.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F3D2E] text-[#D4B895]">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-slate-500 font-medium">
                          Institución: <strong>{item.institution}</strong> • Periodo: <strong>{item.year}</strong> • Tipo: <strong>{item.category}</strong>
                        </p>
                        <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 leading-relaxed text-[11px]">
                          <strong>Aporte Técnico:</strong> {item.relevance}
                        </p>
                        <div className="text-[10px] text-emerald-800 font-mono font-bold flex items-center gap-1.5">
                          <span>✓ Documento Acreditado y Custodiado en Plataforma Central ARANPRO</span>
                          <span>• Folio Archivo: {item.fileName || 'Diploma_Acreditado.pdf'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECCIÓN 4: CARTAS DE RECOMENDACIÓN Y FIRMAS */}
                <div className="pt-8 border-t-2 border-slate-200 space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#0F3D2E] text-[#D4B895] rounded-xl font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase text-[#0F3D2E]">
                        Referencias Comprobables de Comités de Administración
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Testimonios directos de dirigentes comunitarios que avalan nuestra gestión
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {committeeReferences.map(ref => (
                      <div key={ref.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900">{ref.contactName}</span>
                          <span className="text-[11px] font-bold text-[#0F3D2E]">{ref.role} — {ref.communityName}</span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-mono">Teléfono de Contacto: {ref.phone}</p>
                        <blockquote className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                          "{ref.quote}"
                        </blockquote>
                      </div>
                    ))}
                  </div>

                  {/* Firma Manuscrita Estampada */}
                  <div className="pt-6 border-t border-slate-200 text-center space-y-2 max-w-sm mx-auto">
                    <div className="h-20 flex items-center justify-center">
                      {signatureImage ? (
                        <img src={signatureImage} alt="Firma Administrador" className="max-h-16 object-contain mx-auto" />
                      ) : (
                        <span className="text-xs text-slate-400 italic">Firma del Representante Legal</span>
                      )}
                    </div>
                    <div className="border-t border-slate-400 pt-2">
                      <p className="font-bold text-xs text-slate-900">{empresaForm.adminName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">RUT: {empresaForm.adminRut}</p>
                      <p className="text-[10px] text-[#0F3D2E] font-semibold">
                        {empresaForm.adminRole} (RNAC Minvu N° {empresaForm.rnacNumber})
                      </p>
                      <p className="text-[9px] text-slate-500">
                        Técnico en Construcción • Construcción Civil
                      </p>
                    </div>
                  </div>

                  {/* Pie de Página */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <div>ARANPRO Gestión Integral • {empresaForm.website}</div>
                    <div>Fono Directo: {empresaForm.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL PARA SUBIR / EDITAR DIPLOMA O CURSO ==================== */}
      {showUploadDiplomaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#0F3D2E] text-[#D4B895]">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingDiplomaId ? 'Editar Diploma o Certificado' : 'Subir Respaldo de Diploma o Curso'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Acredita tu formación técnica en construcción y certificaciones para la gestión y licitaciones.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadDiplomaModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiploma} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nombre del Título / Curso / Certificación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Técnico en Construcción, Construcción Civil, Curso Ley 21.442"
                  value={newDiplomaForm.title}
                  onChange={(e) => setNewDiplomaForm({ ...newDiplomaForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Institución Otorgante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: AIEP, Universidad, Sence, Learning Group"
                    value={newDiplomaForm.institution}
                    onChange={(e) => setNewDiplomaForm({ ...newDiplomaForm, institution: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Categoría del Documento
                  </label>
                  <select
                    value={newDiplomaForm.category}
                    onChange={(e) => setNewDiplomaForm({ ...newDiplomaForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                  >
                    <option value="Título Técnico Profesional">Título Técnico Profesional</option>
                    <option value="Formación Superior / Universitaria">Formación Superior / Universitaria</option>
                    <option value="Certificación Minvu Ley 21.442">Certificación Minvu Ley 21.442</option>
                    <option value="Curso de Especialización Técnica">Curso de Especialización Técnica</option>
                    <option value="Prevención y Seguridad Edilicia">Prevención y Seguridad Edilicia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Estado de Avance
                  </label>
                  <select
                    value={newDiplomaForm.status}
                    onChange={(e) => setNewDiplomaForm({ ...newDiplomaForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                  >
                    <option value="Titulado">Titulado</option>
                    <option value="En curso (Nivel Superior)">En curso (Nivel Superior)</option>
                    <option value="Aprobado y Certificado">Aprobado y Certificado</option>
                    <option value="Egresado">Egresado</option>
                    <option value="Vigente">Vigente</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Año / Periodo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 2018 o 2024 - Presente"
                    value={newDiplomaForm.year}
                    onChange={(e) => setNewDiplomaForm({ ...newDiplomaForm, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Aporte Técnico para la Administración de Condominios
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe cómo este conocimiento técnico beneficia a la comunidad (ej: detección de filtraciones, auditoría de salas de bombas, inspección de cubiertas, supervisión de contratistas sin sobreprecios)..."
                  value={newDiplomaForm.relevance}
                  onChange={(e) => setNewDiplomaForm({ ...newDiplomaForm, relevance: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                />
              </div>

              {/* CARGA DE ARCHIVO DIGITAL (PDF / IMAGEN) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Archivo de Respaldo Digital (PDF o Imagen)
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-white hover:bg-slate-100 text-[#0F3D2E] border border-slate-300 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-xs shrink-0">
                    <FileUp className="w-4 h-4 text-[#0F3D2E]" />
                    <span>Seleccionar Archivo (PDF / JPG / PNG)</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleDiplomaFileChange}
                      className="hidden"
                    />
                  </label>

                  <div className="text-xs text-slate-500 font-mono truncate">
                    {newDiplomaForm.fileName ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {newDiplomaForm.fileName} ({newDiplomaForm.fileSize})
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Ningún archivo nuevo seleccionado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* TOGGLE DOSSIER */}
              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newDiplomaForm.includeInProposal}
                  onChange={(e) => setNewDiplomaForm({ ...newDiplomaForm, includeInProposal: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0F3D2E] focus:ring-[#0F3D2E] border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Incluir automáticamente este diploma en el Dossier de Postulación a Licitaciones
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Aparecerá en el anexo técnico del PDF para comités y asambleas.
                  </span>
                </div>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadDiplomaModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#D4B895]" />
                  <span>{editingDiplomaId ? 'Guardar Cambios' : 'Registrar y Custodiar Diploma'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE PREVISUALIZACIÓN DE DIPLOMA / CERTIFICADO ==================== */}
      {activeDiplomaPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col relative space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#0F3D2E] text-[#D4B895]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {activeDiplomaPreview.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {activeDiplomaPreview.institution} • {activeDiplomaPreview.year} • {activeDiplomaPreview.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDiplomaFile(activeDiplomaPreview)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 text-[#D4B895]" />
                  Descargar Archivo de Respaldo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDiplomaPreview(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CONTENEDOR DEL DOCUMENTO */}
            <div className="overflow-y-auto flex-1 pr-1 flex items-center justify-center min-h-[350px]">
              {activeDiplomaPreview.fileData ? (
                activeDiplomaPreview.fileType === 'application/pdf' ? (
                  <iframe
                    src={activeDiplomaPreview.fileData}
                    className="w-full h-[65vh] rounded-2xl border border-slate-200"
                    title="Visor de Diploma PDF"
                  />
                ) : (
                  <img
                    src={activeDiplomaPreview.fileData}
                    alt={activeDiplomaPreview.title}
                    className="max-h-[65vh] max-w-full object-contain rounded-2xl border border-slate-200 shadow-sm"
                  />
                )
              ) : (
                /* CREDENCIAL OFICIAL DE ACREDITACIÓN DIGITAL SI NO HAY ARCHIVO BINARIO AÚN */
                <div
                  id="diploma-certificate-preview-card"
                  className="w-full max-w-2xl bg-gradient-to-b from-white via-slate-50 to-white p-8 md:p-10 rounded-3xl border-4 border-[#0F3D2E] shadow-lg text-center space-y-5 relative"
                >
                  <div className="absolute top-4 right-4 text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Acreditación Verificada
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#D4B895] uppercase tracking-widest block">
                      ARANPRO • GESTIÓN & MANTENCIÓN INTEGRAL DE CONDOMINIOS
                    </span>
                    <h2 className="text-xl font-black text-[#0F3D2E] tracking-tight uppercase">
                      Certificado de Respaldo Profesional & Competencia Técnica
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Conforme al marco legal de la Ley N° 21.442 sobre Copropiedad Inmobiliaria
                    </p>
                  </div>

                  <div className="py-4 border-y-2 border-[#D4B895]/40 space-y-2">
                    <p className="text-xs text-slate-600">
                      Se certifica que el Administrador Titular y Representante Legal:
                    </p>
                    <h3 className="text-base font-black text-slate-900">
                      {empresaForm.adminName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      RUT: {empresaForm.adminRut} • RNAC Minvu N° {empresaForm.rnacNumber}
                    </p>
                    <div className="pt-2">
                      <span className="text-xs text-slate-600">
                        Cuenta con formación y acreditación en:
                      </span>
                      <p className="text-base font-black text-[#0F3D2E] mt-0.5">
                        {activeDiplomaPreview.title}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {activeDiplomaPreview.institution} • Año {activeDiplomaPreview.year} • Estado: {activeDiplomaPreview.status}
                      </p>
                    </div>
                  </div>

                  <div className="text-left bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <strong className="text-[#0F3D2E] block">Aporte a la Administración Comunitaria:</strong>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {activeDiplomaPreview.relevance}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-left border-t border-slate-200 text-[10px] text-slate-400 font-mono">
                    <div>
                      <p className="font-bold text-slate-700">Firma Autorizada ARANPRO</p>
                      <p>Registro Central de Custodia Digital</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0F3D2E]">Fono Directo: {empresaForm.phone}</p>
                      <p>{empresaForm.city}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Archivo: <strong className="text-slate-700">{activeDiplomaPreview.fileName || 'Diploma_Acreditado.pdf'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setActiveDiplomaPreview(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN CORPORATIVO ARANPRO */}
      <AranproConfirmModal
        isOpen={modalDialog.isOpen}
        type={modalDialog.type}
        title={modalDialog.title}
        message={modalDialog.message}
        confirmText={modalDialog.confirmText}
        cancelText={modalDialog.cancelText}
        isAlert={modalDialog.isAlert}
        onConfirm={modalDialog.onConfirm}
        onCancel={modalDialog.onCancel}
      />
    </div>
  );
};
