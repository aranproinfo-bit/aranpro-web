import React, { useState, useMemo } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { formatDate, formatRut, formatCLP } from '../../utils/formatters';
import { printDocumentDirectly, downloadHtmlDocument } from '../../utils/printDocument';
import {
  ShieldCheck, FileText, CheckCircle2, AlertTriangle, Printer,
  Download, Share2, Search, Filter, Plus, X, ExternalLink,
  Clock, UserCheck, Building2, Calendar, DollarSign, AlertCircle,
  Trash2, Eye, Send, Home, Briefcase, Award, Check
} from 'lucide-react';

export const OfficialCertificatesModule = ({ currentCommunity }) => {
  const {
    certificates = [],
    requestCertificate,
    updateCertificateStatus,
    deleteCertificate,
    companySettings,
    getUnitFinancials
  } = useCommunity();

  // Estados de filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Estados de modales
  const [showNewModal, setShowNewModal] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);

  // Estado del formulario de emisión directa
  const [formData, setFormData] = useState({
    type: 'Certificado de Gastos Comunes al Día (No Deuda)',
    unitNumber: '',
    applicantName: '',
    rut: '',
    email: '',
    phone: '',
    purpose: '',
    notes: '',
    status: 'EMITIDO'
  });

  // Filtrar los certificados correspondientes a la comunidad actual o generales
  const communityCertificates = useMemo(() => {
    return certificates.filter(c => {
      if (!currentCommunity) return true;
      if (!c.communityName) return true;
      return c.communityName.toLowerCase().trim() === currentCommunity.name.toLowerCase().trim();
    });
  }, [certificates, currentCommunity]);

  // Auditoría financiera de unidades de la comunidad actual
  const financialAuditMap = useMemo(() => {
    if (!currentCommunity?.units) return {};
    const map = {};
    currentCommunity.units.forEach(u => {
      const fin = getUnitFinancials ? getUnitFinancials(u) : { pendingDebt: 0, isFullyPaid: true };
      map[u.number.toString()] = {
        unit: u,
        pendingDebt: fin.pendingDebt || 0,
        isFullyPaid: fin.pendingDebt === 0,
        owner: u.owner,
        rut: u.rut,
        email: u.email,
        phone: u.phone
      };
    });
    return map;
  }, [currentCommunity, getUnitFinancials]);

  // Cálculos de KPIs
  const stats = useMemo(() => {
    const total = communityCertificates.length;
    const pending = communityCertificates.filter(c => c.status === 'SOLICITADO').length;
    const issued = communityCertificates.filter(c => c.status === 'EMITIDO').length;

    // Unidades al día en la comunidad
    const totalUnits = currentCommunity?.units?.length || 0;
    const upToDateUnits = Object.values(financialAuditMap).filter(u => u.isFullyPaid).length;
    const upToDatePercent = totalUnits > 0 ? Math.round((upToDateUnits / totalUnits) * 100) : 100;

    // Trámites notariales y bancarios
    const notarialCount = communityCertificates.filter(c => 
      (c.purpose || '').toLowerCase().includes('notar') ||
      (c.purpose || '').toLowerCase().includes('cbr') ||
      (c.purpose || '').toLowerCase().includes('banco') ||
      (c.purpose || '').toLowerCase().includes('crédito') ||
      (c.purpose || '').toLowerCase().includes('compraventa') ||
      c.type.includes('No Deuda')
    ).length;

    return { total, pending, issued, upToDateUnits, totalUnits, upToDatePercent, notarialCount };
  }, [communityCertificates, currentCommunity, financialAuditMap]);

  // Filtrado reactivo de la tabla
  const filteredCertificates = useMemo(() => {
    return communityCertificates.filter(cert => {
      const matchesSearch =
        (cert.applicantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.rut || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.unitNumber || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.folio || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.purpose || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || cert.type === filterType;
      const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [communityCertificates, searchTerm, filterType, filterStatus]);

  // Tipos oficiales de certificados según Ley 21.442
  const CERTIFICATE_TYPES = [
    {
      id: 'Certificado de Gastos Comunes al Día (No Deuda)',
      label: 'Certificado de Gastos Comunes al Día (No Deuda)',
      legalRef: 'Ley N° 21.442 • Arts. 17°, 20° y 36°',
      useCase: 'Compraventas notariales, CBR, bancos, estudios de títulos',
      requiresNoDebt: true
    },
    {
      id: 'Certificado de Residencia y Domicilio',
      label: 'Certificado de Residencia y Domicilio',
      legalRef: 'Ley N° 21.442 • Art. 17° inc. 2 (Registro de Copropietarios)',
      useCase: 'Bancos, Dirección de Tránsito, trámites escolares y subsidios',
      requiresNoDebt: false
    },
    {
      id: 'Certificado de Vigencia de Miembro del Comité',
      label: 'Certificado de Vigencia de Miembro del Comité de Administración',
      legalRef: 'Ley N° 21.442 • Art. 17°',
      useCase: 'Apertura/firma cuentas corrientes bancarias, SII, juzgados',
      requiresNoDebt: false
    },
    {
      id: 'Certificado de Buena Convivencia y No Infracciones',
      label: 'Certificado de Buena Convivencia y No Infracciones Reglamentarias',
      legalRef: 'Ley N° 21.442 • Título IV y Reglamento de Copropiedad',
      useCase: 'Arrendamientos, mediación vecinal y antecedentes comunitarios',
      requiresNoDebt: false
    }
  ];

  // Sincronizar datos al seleccionar unidad en el modal
  const handleSelectUnit = (unitNum) => {
    const audit = financialAuditMap[unitNum];
    if (audit) {
      setFormData(prev => ({
        ...prev,
        unitNumber: unitNum,
        applicantName: audit.owner || prev.applicantName,
        rut: audit.rut || prev.rut,
        email: audit.email || prev.email,
        phone: audit.phone || prev.phone
      }));
    } else {
      setFormData(prev => ({ ...prev, unitNumber: unitNum }));
    }
  };

  // Crear o emitir nuevo certificado
  const handleCreateCertificate = (e) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.unitNumber) {
      alert('Por favor ingrese el nombre del solicitante y el número de casa/unidad.');
      return;
    }

    const audit = financialAuditMap[formData.unitNumber];
    const debtAmount = audit ? audit.pendingDebt : 0;

    // Validación preventiva de no deuda
    if (formData.type.includes('No Deuda') && debtAmount > 0) {
      const confirmForce = window.confirm(
        `⚠️ ADVERTENCIA LEGAL (Ley 21.442 • Art. 20°):\n\nLa Casa ${formData.unitNumber} registra una deuda activa de $${debtAmount.toLocaleString('es-CL')} en gastos comunes.\n\n¿Desea emitir el certificado de todos modos consignando expresamente la deuda?`
      );
      if (!confirmForce) return;
    }

    const year = new Date().getFullYear();
    const nextFolioNumber = communityCertificates.length + 1;
    const folio = `CERT-${year}-${String(nextFolioNumber).padStart(3, '0')}`;
    const verificationCode = `VRF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newCert = requestCertificate({
      communityName: currentCommunity?.name || 'Condominio',
      applicantName: formData.applicantName.trim(),
      rut: formData.rut.trim(),
      unitNumber: formData.unitNumber.toString(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      type: formData.type,
      purpose: formData.purpose.trim() || 'Trámite Notarial / Bancario',
      date: new Date().toISOString().split('T')[0],
      status: formData.status,
      folio,
      verificationCode,
      debtAmount,
      notes: formData.notes.trim(),
      issuedBy: `${companySettings?.adminName || 'Administración ARANPRO'} (RNAC N° ${companySettings?.rnacNumber || '48.912'})`
    });

    setShowNewModal(false);
    setFormData({
      type: 'Certificado de Gastos Comunes al Día (No Deuda)',
      unitNumber: '',
      applicantName: '',
      rut: '',
      email: '',
      phone: '',
      purpose: '',
      notes: '',
      status: 'EMITIDO'
    });

    // Abrir vista previa directa
    if (newCert) {
      setPreviewCert(newCert);
    }
  };

  // Envío por WhatsApp con mensaje formal timbrado
  const handleSendWhatsApp = (cert) => {
    const phoneClean = (cert.phone || '').replace(/[^0-9]/g, '');
    const communityName = cert.communityName || currentCommunity?.name || 'Comunidad';
    const msg = `*ADMINISTRACIÓN ARANPRO • CERTIFICADO OFICIAL*\n` +
      `Estimado(a) *${cert.applicantName}*,\n\n` +
      `Cumplimos con informar la emisión de su documento oficial:\n\n` +
      `📄 *Tipo:* ${cert.type}\n` +
      `🏠 *Unidad:* Casa / Depto ${cert.unitNumber} — ${communityName}\n` +
      `🔖 *Folio Oficial:* ${cert.folio || cert.id}\n` +
      `🔑 *Cód. Verificación:* ${cert.verificationCode || 'VRF-OK'}\n` +
      `📅 *Fecha de Emisión:* ${formatDate(cert.date)}\n` +
      `🏛️ *Finalidad:* ${cert.purpose || 'Trámite Notarial / Bancario'}\n` +
      `⚖️ *Base Legal:* Ley N° 21.442 • Arts. 17°, 20° y 36°\n` +
      `🏢 *Emitido por:* ${companySettings?.companyName || 'ARANPRO SpA'} (RNAC N° ${companySettings?.rnacNumber || '48.912'})\n\n` +
      `Su certificado ya cuenta con timbre digital y se encuentra validado para presentación notarial, bancaria o municipal.`;

    const url = phoneClean ? `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Impresión directa Carta vía printDocumentDirectly
  const handlePrintCertificate = (cert) => {
    const filename = `Certificado_${(cert.folio || cert.id)}_${(cert.applicantName || 'vecino').replace(/\s+/g, '_')}`;
    printDocumentDirectly('printable-official-certificate', filename, {
      pageSize: 'letter portrait',
      fitPage: true,
      margin: '8mm 10mm 8mm 10mm'
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. CABECERA CORPORATIVA ARANPRO */}
      <div className="bg-gradient-to-r from-[#0F3D2E] via-[#144D3A] to-[#0A291F] text-white p-6 md:p-8 rounded-3xl shadow-lg border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4B895]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4B895]/20 text-[#D4B895] border border-[#D4B895]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4B895]" />
                LEY N° 21.442 • ARTS. 17°, 20° Y 36°
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                {currentCommunity?.name || 'Condominio'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              Certificados & Acreditaciones Comunitarias
            </h2>
            <p className="text-xs md:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Emisión de certificados oficiales con membrete formal ARANPRO, timbre digital notarial,
              auditoría financiera de deuda en vivo y entrega instantánea por WhatsApp o PDF Carta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4B895] to-[#C2A37D] text-[#0F3D2E] font-bold text-sm shadow-md hover:brightness-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 text-[#0F3D2E]" />
              + Emitir Certificado Inmediato
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPIS Y AUDITORÍA EN TIEMPO REAL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Solicitudes pendientes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#D4B895]/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Solicitudes Pendientes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.pending}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            {stats.pending > 0 ? 'Esperando firma y validación' : 'Todo al día'}
          </p>
        </div>

        {/* KPI 2: Certificados emitidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Certificados Emitidos
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F3D2E]">{stats.issued}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Con folio y timbre digital
          </p>
        </div>

        {/* KPI 3: Unidades al día auditadas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Unidades al Día (Auditoría)
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.upToDatePercent}% <span className="text-xs font-semibold text-slate-400">({stats.upToDateUnits}/{stats.totalUnits})</span>
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            Aptas para certificar No Deuda
          </p>
        </div>

        {/* KPI 4: Trámites Notariales y Bancarios */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#0F3D2E]/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Trámites Notariales / CBR
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.notarialCount}</div>
          <p className="text-[11px] text-purple-700 font-medium mt-1">
            Fines legales y escrituración
          </p>
        </div>
      </div>

      {/* 3. BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por solicitante, RUT, casa o folio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Filtro por Tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
          >
            <option value="all">Todos los Tipos de Certificados</option>
            {CERTIFICATE_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          {/* Filtro por Estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
          >
            <option value="all">Todos los Estados</option>
            <option value="SOLICITADO">Pendientes (Solicitado)</option>
            <option value="EMITIDO">Emitidos (Válidos)</option>
          </select>
        </div>
      </div>

      {/* 4. TABLA CORPORATIVA DE CERTIFICADOS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F3D2E]/5 border-b border-slate-200 text-[#0F3D2E] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Folio & Estado</th>
                <th className="px-5 py-3.5">Unidad & Solicitante</th>
                <th className="px-5 py-3.5">Tipo de Certificado</th>
                <th className="px-5 py-3.5">Finalidad / Trámite</th>
                <th className="px-5 py-3.5">Fecha</th>
                <th className="px-5 py-3.5 text-center">Solvencia (Art. 20°)</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600">No se encontraron certificados</p>
                    <p className="text-xs text-slate-400 mt-1">Utilice el botón superior para emitir un certificado oficial.</p>
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => {
                  const audit = financialAuditMap[cert.unitNumber];
                  const hasDebt = audit && audit.pendingDebt > 0;
                  const isNoDebtCert = cert.type.includes('No Deuda');

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Folio & Estado */}
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {cert.folio || cert.id}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cert.status === 'EMITIDO'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {cert.status === 'EMITIDO' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )}
                            {cert.status}
                          </span>
                          {cert.verificationCode && (
                            <span className="text-[10px] font-mono text-slate-400 font-medium">
                              {cert.verificationCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Unidad & Solicitante */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono">
                            Casa {cert.unitNumber}
                          </span>
                          <span className="truncate max-w-[170px]">{cert.applicantName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {formatRut(cert.rut)}
                        </div>
                        {cert.email && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[190px]">
                            {cert.email}
                          </div>
                        )}
                      </td>

                      {/* Tipo de Certificado */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-bold text-[#0F3D2E] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#D4B895] shrink-0" />
                          <span>{cert.type}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {cert.type.includes('No Deuda') ? 'Ley 21.442 • Arts. 17°, 20° y 36°' : 'Ley 21.442 • Copropiedad Inmobiliaria'}
                        </div>
                      </td>

                      {/* Finalidad */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="text-slate-700 font-medium line-clamp-2">
                          {cert.purpose || 'Trámite Notarial / Bancario'}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {formatDate(cert.date)}
                      </td>

                      {/* Solvencia (Art. 20°) */}
                      <td className="px-5 py-4 text-center">
                        {audit ? (
                          hasDebt ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={`Deuda registrada: $${audit.pendingDebt.toLocaleString('es-CL')}`}>
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Debe ${audit.pendingDebt.toLocaleString('es-CL')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Al Día (Sin deuda)
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No auditada</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Validar y emitir si está solicitado */}
                          {cert.status !== 'EMITIDO' && (
                            <button
                              onClick={() => {
                                updateCertificateStatus(cert.id, 'EMITIDO', {
                                  issuedBy: `${companySettings?.adminName || 'Administración ARANPRO'} (RNAC N° 48.912)`
                                });
                              }}
                              className="px-2.5 py-1.5 bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                              title="Aprobar y Emitir Certificado"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Validar
                            </button>
                          )}

                          {/* Ver / Imprimir PDF */}
                          <button
                            onClick={() => setPreviewCert(cert)}
                            className="p-1.5 bg-slate-100 hover:bg-[#0F3D2E] hover:text-white text-slate-700 rounded-xl transition-all"
                            title="Vista Previa e Impresión Notarial PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Enviar WhatsApp */}
                          <button
                            onClick={() => handleSendWhatsApp(cert)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-xl transition-all"
                            title="Enviar por WhatsApp al Solicitante"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar del registro el certificado ${cert.folio || cert.id}?`)) {
                                deleteCertificate(cert.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Eliminar del Registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL DE EMISIÓN ASISTIDA / DIRECTA */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowNewModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0F3D2E]/10 text-[#0F3D2E] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#0F3D2E]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#D4B895] uppercase tracking-wider">
                  Ley N° 21.442 • Fe Pública Inmobiliaria
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Emitir Certificado Inmediato
                </h3>
              </div>
            </div>

            <form onSubmit={handleCreateCertificate} className="space-y-4">
              {/* Tipo de Certificado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Certificado Oficial
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                >
                  {CERTIFICATE_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {CERTIFICATE_TYPES.find(t => t.id === formData.type)?.useCase}
                </p>
              </div>

              {/* Selector de Unidad y Auditoría en vivo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Unidad / Casa del Condominio
                  </label>
                  {formData.unitNumber && financialAuditMap[formData.unitNumber] && (
                    financialAuditMap[formData.unitNumber].isFullyPaid ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✅ Unidad al Día (Sin Deuda)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        ⚠️ Registra Deuda de ${financialAuditMap[formData.unitNumber].pendingDebt.toLocaleString('es-CL')}
                      </span>
                    )
                  )}
                </div>

                <select
                  value={formData.unitNumber}
                  onChange={(e) => handleSelectUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                  required
                >
                  <option value="">-- Seleccione Casa o Departamento --</option>
                  {(currentCommunity?.units || []).map(u => {
                    const fin = financialAuditMap[u.number];
                    return (
                      <option key={u.id} value={u.number}>
                        Casa {u.number} — {u.owner} {fin?.pendingDebt > 0 ? `(Deuda: $${fin.pendingDebt.toLocaleString('es-CL')})` : '(Al Día)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Advertencia preventiva si tiene deuda y es cert no deuda */}
              {formData.type.includes('No Deuda') && formData.unitNumber && financialAuditMap[formData.unitNumber]?.pendingDebt > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    Advertencia Ley N° 21.442 • Art. 20°
                  </div>
                  <p className="leading-relaxed">
                    La Casa {formData.unitNumber} mantiene una deuda activa de <strong>${financialAuditMap[formData.unitNumber].pendingDebt.toLocaleString('es-CL')}</strong>.
                    Para fines notariales y de compraventa, el certificado debe reflejar fehacientemente este saldo deudor.
                  </p>
                </div>
              )}

              {/* Datos del Solicitante */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre del Solicitante / Titular
                  </label>
                  <input
                    type="text"
                    value={formData.applicantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicantName: e.target.value }))}
                    placeholder="Ej: Carlos Morales Rojas"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    RUT del Solicitante
                  </label>
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
                    placeholder="12.345.678-9"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                    required
                  />
                </div>
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="nombre@correo.cl"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+56 9 8765 4321"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                  />
                </div>
              </div>

              {/* Finalidad / Trámite Requerido */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Finalidad / Entidad Receptora
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="Ej: Notaría de La Serena / Estudio de Título Compraventa / Banco de Chile"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                />
              </div>

              {/* Observaciones Legales Adicionales */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notas / Observaciones del Certificado (Opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="Observaciones de liquidación o antecedentes de la asamblea..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-[#D4B895]" />
                  Emitir y Generar Documento Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL DE VISTA PREVIA E IMPRESIÓN OFICIAL NOTARIAL (TAMAÑO CARTA) */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col relative">
            {/* Barra de Acciones del Documento */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#0F3D2E] text-white flex items-center justify-center font-bold text-sm">
                  ⚖️
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Vista Notarial de Certificado Oficial
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {previewCert.folio || previewCert.id} • {previewCert.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintCertificate(previewCert)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs shadow-xs transition-all"
                >
                  <Printer className="w-4 h-4 text-[#D4B895]" />
                  Imprimir / PDF Oficial (Carta)
                </button>

                <button
                  onClick={() => handleSendWhatsApp(previewCert)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  WhatsApp
                </button>

                <button
                  onClick={() => downloadHtmlDocument('printable-official-certificate', `Certificado_${previewCert.folio || previewCert.id}.html`)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs transition-all"
                  title="Descargar copia HTML"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPreviewCert(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CONTENEDOR DEL DOCUMENTO CARTA IMPRIMIBLE */}
            <div className="overflow-y-auto flex-1 pr-1">
              <div
                id="printable-official-certificate"
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
                        {companySettings?.companyName || 'ARANPRO GESTIÓN INMOBILIARIA'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Administración Profesional de Condominios • RUT {companySettings?.companyRut || '76.999.888-1'}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      Registro Nacional de Administradores Minvu (RNAC) N° {companySettings?.rnacNumber || '48.912'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {companySettings?.email || 'contacto@aranpro.cl'} • {companySettings?.phone || '+56 9 8765 4321'}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block px-3 py-1 bg-[#0F3D2E]/10 text-[#0F3D2E] text-[10px] font-mono font-bold rounded-md border border-[#0F3D2E]/20">
                      FOLIO: {previewCert.folio || previewCert.id}
                    </span>
                    <p className="text-[11px] font-bold text-slate-800">
                      {previewCert.communityName || currentCommunity?.name || 'Condominio'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      RUT Comunidad: {currentCommunity?.rut || '65.123.456-7'}
                    </p>
                    <p className="text-[10px] text-slate-500 max-w-xs">
                      {currentCommunity?.address || 'La Serena, Región de Coquimbo'}
                    </p>
                  </div>
                </div>

                {/* Título Principal Notarial */}
                <div className="text-center py-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4B895]">
                    REPÚBLICA DE CHILE • LEY N° 21.442 DE COPROPIEDAD INMOBILIARIA
                  </span>
                  <h1 className="text-xl md:text-2xl font-black text-[#0F3D2E] uppercase mt-1 tracking-tight">
                    {previewCert.type}
                  </h1>
                  <div className="w-24 h-1 bg-[#D4B895] mx-auto mt-2 rounded-full"></div>
                </div>

                {/* Individualización de la Unidad y Solicitante */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Inmueble / Unidad</span>
                    <span className="font-bold text-slate-900 text-sm">Casa / Depto {previewCert.unitNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Titular / Solicitante</span>
                    <span className="font-bold text-slate-900">{previewCert.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">RUT Titular</span>
                    <span className="font-mono font-semibold text-slate-800">{formatRut(previewCert.rut)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Fecha de Expedición</span>
                    <span className="font-semibold text-slate-800">{formatDate(previewCert.date)}</span>
                  </div>
                </div>

                {/* Cuerpo Legal Formal Certificatorio */}
                <div className="text-justify text-xs md:text-sm text-slate-800 leading-relaxed space-y-4">
                  <p>
                    La Administración de la Comunidad <strong>"{previewCert.communityName || currentCommunity?.name}"</strong>,
                    en uso de las atribuciones legales que le confieren los <strong>Artículos 17°, 20° y 36° de la Ley N° 21.442</strong> sobre
                    Copropiedad Inmobiliaria y el respectivo Reglamento de Copropiedad:
                  </p>

                  <div className="p-4 bg-[#0F3D2E]/5 rounded-xl border-l-4 border-[#0F3D2E] space-y-2">
                    <p className="font-black text-[#0F3D2E] uppercase tracking-wide text-xs">
                      DECLARA Y CERTIFICA SOLEMNEMENTE:
                    </p>

                    {previewCert.type.includes('No Deuda') && (
                      <p>
                        Que revisados los registros contables, la cuenta bancaria de la comunidad y la última liquidación de gastos comunes
                        aprobada, el inmueble correspondiente a la <strong>Casa / Departamento N° {previewCert.unitNumber}</strong>, de propiedad o
                        ocupación de don(a) <strong>{previewCert.applicantName}</strong> (RUT {formatRut(previewCert.rut)}),
                        {previewCert.debtAmount > 0 ? (
                          <span className="text-rose-700 font-bold">
                            {' '}mantiene una deuda acumulada por concepto de gastos comunes ordinarios de ${previewCert.debtAmount.toLocaleString('es-CL')}, encontrándose en proceso de regularización.
                          </span>
                        ) : (
                          <span className="text-[#0F3D2E] font-bold">
                            {' '}se encuentra ÍNTEGRAMENTE AL DÍA en el pago de los gastos comunes ordinarios, gastos comunes extraordinarios y fondo de reserva devengados a la fecha, no registrando multas, intereses ni saldos deudores pendientes de cobro conforme a la Ley N° 21.442.
                          </span>
                        )}
                      </p>
                    )}

                    {previewCert.type.includes('Residencia') && (
                      <p>
                        Que conforme al <strong>Registro Oficial de Copropietarios y Residentes</strong> establecido en el Artículo 17° inciso 2
                        de la Ley N° 21.442, don(a) <strong>{previewCert.applicantName}</strong> (RUT {formatRut(previewCert.rut)}) mantiene
                        domicilio real y residencia habitual y continua en la <strong>Casa / Departamento N° {previewCert.unitNumber}</strong> de este condominio,
                        habitando en dicho predio en calidad de copropietario(a) u ocupante legítimo(a).
                      </p>
                    )}

                    {previewCert.type.includes('Comité') && (
                      <p>
                        Que de conformidad con el Artículo 17° de la Ley N° 21.442 y el acta de Asamblea General de Copropietarios debidamente protocolizada,
                        don(a) <strong>{previewCert.applicantName}</strong> (RUT {formatRut(previewCert.rut)}) es <strong>MIEMBRO TITULAR Y ACTIVO DEL COMITÉ DE ADMINISTRACIÓN</strong> de
                        la presente copropiedad, encontrándose plenamente habilitado(a) para suscribir documentos oficiales, gestionar cuentas bancarias
                        y representar a la comunidad ante instituciones públicas y privadas.
                      </p>
                    )}

                    {previewCert.type.includes('Buena Convivencia') && (
                      <p>
                        Que revisado el Libro Oficial de Sugerencias y Reclamos y el registro de sanciones de la copropiedad,
                        los residentes de la <strong>Casa / Departamento N° {previewCert.unitNumber}</strong> han mantenido una conducta intachable,
                        observando fielmente las normas de convivencia vecinal y el Reglamento Interno, no registrando a la fecha
                        sanciones ni multas ejecutoriadas por ruidos molestos u otras faltas reglamentarias.
                      </p>
                    )}
                  </div>

                  <p>
                    El presente certificado se expide a solicitud de la parte interesada para ser presentado ante:
                    <strong> {previewCert.purpose || 'Notaría, Conservador de Bienes Raíces o Instituciones Financieras'}</strong>.
                  </p>

                  {previewCert.notes && (
                    <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      Nota adicional: {previewCert.notes}
                    </p>
                  )}

                  <p className="text-[11px] text-slate-500">
                    <strong>Vigencia Legal:</strong> Este certificado tiene una validez de treinta (30) días corridos a contar de su fecha de emisión,
                    conforme a las prácticas registrales, bancarias y notariales de la República de Chile.
                  </p>
                </div>

                {/* Sección de Firmas y Timbre Notarial */}
                <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 items-end">
                  {/* Firma de la Administración */}
                  <div className="text-center space-y-2">
                    <div className="h-16 flex items-center justify-center">
                      {/* Timbre Digital Simulado */}
                      <div className="border-2 border-dashed border-[#0F3D2E] rounded-full w-28 h-16 flex flex-col items-center justify-center p-1 bg-[#0F3D2E]/5">
                        <span className="text-[7px] font-black text-[#0F3D2E] uppercase">TIMBRE DIGITAL</span>
                        <span className="text-[9px] font-bold text-[#0F3D2E]">ARANPRO SpA</span>
                        <span className="text-[7px] text-[#0F3D2E]">RNAC N° 48.912</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-400 pt-1.5">
                      <p className="font-bold text-xs text-slate-900">
                        {companySettings?.adminName || 'ADMINISTRACIÓN ARANPRO'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        RUT Administrador: {companySettings?.adminRut || '14.882.140-K'}
                      </p>
                      <p className="text-[9px] text-[#0F3D2E] font-semibold">
                        Administrador Legal de la Copropiedad (RNAC Minvu N° {companySettings?.rnacNumber || '48.912'})
                      </p>
                    </div>
                  </div>

                  {/* Ratificación Comité */}
                  <div className="text-center space-y-2">
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[11px] text-slate-400 italic">Ratificación Comité de Administración</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1.5">
                      <p className="font-bold text-xs text-slate-900">
                        COMITÉ DE ADMINISTRACIÓN
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {previewCert.communityName || currentCommunity?.name || 'Condominio'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold">
                        Presidente(a) / Representante Legal (Art. 17° Ley 21.442)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pie de Página de Validación con Cód. de Verificación */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <div>
                    Verificación en línea: aranpro.cl/verificar • Cód: {previewCert.verificationCode || 'VRF-OK'}
                  </div>
                  <div>
                    Pág 1 de 1 • Sistema Oficial ARANPRO Ley 21.442
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
