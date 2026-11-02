import React, { useState, useMemo } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { formatDate, formatRut } from '../../utils/formatters';
import { printDocumentDirectly } from '../../utils/printDocument';
import {
  ClipboardList, Users, Calendar, Clock, CheckCircle2, AlertCircle,
  Plus, Printer, Search, Filter, Shield, FileText, Check,
  MessageCircle, Trash2, Edit3, AlertTriangle, UserCheck,
  BadgeCheck, X, Bell, ChevronRight, Sparkles, CheckSquare,
  Smartphone, Share2, ArrowRight
} from 'lucide-react';

export const CommitteeMeetingsAndLogModule = ({
  currentCommunity,
  activeSubTab = 'reuniones',
  onSubTabChange
}) => {
  const {
    companySettings,
    addCommitteeMeeting,
    updateCommitteeMeeting,
    deleteCommitteeMeeting,
    addCommitteeNovedad,
    updateCommitteeNovedad,
    deleteCommitteeNovedad,
    addCommitteeTask,
    toggleCommitteeTaskStatus,
    deleteCommitteeTask,
    toggleUnitCommittee
  } = useCommunity();

  // Control de sub-vista activa ('reuniones' | 'novedades' | 'tareas' | 'directorio')
  const [internalTab, setInternalTab] = useState(activeSubTab || 'reuniones');
  const currentTab = onSubTabChange ? activeSubTab : internalTab;
  const setTab = onSubTabChange || setInternalTab;

  // Estados de Reuniones
  const meetings = useMemo(() => currentCommunity?.committeeMeetings || [], [currentCommunity]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(() => meetings[0]?.id || null);
  const selectedMeeting = useMemo(() => {
    return meetings.find(m => m.id === selectedMeetingId) || meetings[0] || null;
  }, [meetings, selectedMeetingId]);

  // Modal Nueva Reunión
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [newMeetingForm, setNewMeetingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '19:30 hrs',
    type: 'Sesión Ordinaria Mensual de Coordinación',
    modality: 'Mixta (Presencial + Google Meet)',
    place: 'Sala Multiuso / Telemática',
    presidentName: 'Carlos Morales Rojas',
    presidentRut: '15.428.312-4',
    secretaryName: 'Marcela Castillo Gómez',
    secretaryRut: '13.784.512-8',
    agendaTopics: [
      '1. Revisión de cuentas y conciliación bancaria del período',
      '2. Estado de mantenciones preventivas y certificaciones técnicas (Art. 40)',
      '3. Cobranza y gestión de morosidad (Art. 27° Ley 21.442)'
    ],
    agreements: [
      'Se aprueba la rendición de cuentas del mes anterior sin observaciones.'
    ],
    tasks: [],
    notes: 'Acta aprobada y suscrita por los miembros del Comité y la Administración ARANPRO.'
  });
  const [newTopicInput, setNewTopicInput] = useState('');
  const [newAgreementInput, setNewAgreementInput] = useState('');
  const [newTaskInput, setNewTaskInput] = useState({ title: '', assignee: 'Administración ARANPRO', dueDate: '', priority: 'MEDIA' });

  // Estados de Novedades
  const novedades = useMemo(() => currentCommunity?.committeeNovedades || [], [currentCommunity]);
  const [novedadFilterCategory, setNovedadFilterCategory] = useState('ALL');
  const [novedadFilterPriority, setNovedadFilterPriority] = useState('ALL');
  const [novedadSearchQuery, setNovedadSearchQuery] = useState('');
  const [showNewNovedadModal, setShowNewNovedadModal] = useState(false);
  const [newNovedadForm, setNewNovedadForm] = useState({
    title: '',
    category: 'Mantención & Accesos',
    priority: 'ALTA',
    reportedBy: 'Administración ARANPRO',
    description: '',
    elevatedToMeeting: false
  });
  const [whatsAppNovedadesCopied, setWhatsAppNovedadesCopied] = useState(false);

  // Estados de Tareas
  const tasks = useMemo(() => currentCommunity?.committeeTasks || [], [currentCommunity]);
  const [taskFilterStatus, setTaskFilterStatus] = useState('ALL');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskStandalone, setNewTaskStandalone] = useState({
    title: '',
    assignee: 'Administración ARANPRO',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'MEDIA',
    notes: ''
  });

  // Miembros del Comité Vigente
  const committeeMembers = useMemo(() => {
    return (currentCommunity?.units || [])
      .filter(u => u.isCommittee)
      .map(u => ({
        unitNumber: u.number,
        tower: u.tower,
        name: u.ownerName || 'Copropietario',
        rut: u.ownerRut || '',
        phone: u.ownerPhone || '',
        email: u.ownerEmail || '',
        role: u.committeeRole || 'Miembro del Comité',
        isUpToDate: !u.pendingDebt || u.pendingDebt <= 0
      }));
  }, [currentCommunity]);

  // Contadores KPIs
  const pendingTasksCount = tasks.filter(t => t.status !== 'CUMPLIDA').length;
  const urgentTasksCount = tasks.filter(t => t.status !== 'CUMPLIDA' && t.priority === 'URGENTE').length;
  const activeNovedadesCount = novedades.filter(n => n.status !== 'RESUELTO').length;

  // Filtrado de Novedades
  const filteredNovedades = useMemo(() => {
    return novedades.filter(n => {
      if (novedadFilterCategory !== 'ALL' && n.category !== novedadFilterCategory) return false;
      if (novedadFilterPriority !== 'ALL' && n.priority !== novedadFilterPriority) return false;
      if (novedadSearchQuery.trim()) {
        const q = novedadSearchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [novedades, novedadFilterCategory, novedadFilterPriority, novedadSearchQuery]);

  // Filtrado de Tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (taskFilterStatus === 'PENDIENTES' && t.status === 'CUMPLIDA') return false;
      if (taskFilterStatus === 'CUMPLIDAS' && t.status !== 'CUMPLIDA') return false;
      return true;
    });
  }, [tasks, taskFilterStatus]);

  // --- Función de Impresión Oficial del Acta de Reunión de Comité ---
  const handlePrintCommitteeMinute = (minute) => {
    if (!minute) return;

    const brandName = companySettings?.brandName || 'ARANPRO';
    const primaryColor = companySettings?.colors?.primary || '#0F3D2E';
    const accentGold = companySettings?.colors?.accent || '#D4B895';
    const subtitle = companySettings?.subtitle || 'Gestión Integral de Condominios y Comunidades';
    const communityName = currentCommunity?.name || 'Condominio';
    const currentYear = new Date().getFullYear();

    const attendeesHtml = (minute.attendees || []).map(att => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 7px 10px; font-weight: bold; color: #1E293B;">${att.name}</td>
        <td style="padding: 7px 10px; color: ${primaryColor}; font-weight: 600;">${att.role}</td>
        <td style="padding: 7px 10px; color: #475569;">${att.unit || 'Casa'}</td>
        <td style="padding: 7px 10px; font-family: monospace; color: #334155;">${att.rut ? formatRut(att.rut) : '—'}</td>
        <td style="padding: 7px 10px; text-align: center;">
          <span style="background: #ECFDF5; color: #065F46; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; border: 1px solid #A7F3D0;">
            ${att.status || 'PRESENTE'}
          </span>
        </td>
      </tr>
    `).join('');

    const topicsHtml = (minute.agendaTopics || []).map((t, idx) => `
      <div style="margin-bottom: 8px; padding-left: 12px; border-left: 3px solid ${accentGold}; font-size: 11.5px; color: #334155; line-height: 1.45;">
        ${t}
      </div>
    `).join('');

    const agreementsHtml = (minute.agreements || []).map((agr, idx) => `
      <div style="margin-bottom: 10px; padding: 8px 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
        <div style="font-weight: bold; color: ${primaryColor}; font-size: 11px; margin-bottom: 3px;">
          Acuerdo N° ${idx + 1}
        </div>
        <div style="font-size: 11.5px; color: #1E293B; line-height: 1.45;">
          ${agr}
        </div>
      </div>
    `).join('');

    const tasksHtml = (minute.tasks || []).map(task => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 7px 10px; font-weight: 600; color: #1E293B;">${task.title}</td>
        <td style="padding: 7px 10px; color: #475569;">${task.assignee}</td>
        <td style="padding: 7px 10px; color: #1E293B; font-weight: bold;">${task.dueDate ? formatDate(task.dueDate) : '—'}</td>
        <td style="padding: 7px 10px; text-align: center;">
          <span style="background: ${task.status === 'CUMPLIDA' ? '#ECFDF5' : '#FEF3C7'}; color: ${task.status === 'CUMPLIDA' ? '#065F46' : '#92400E'}; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold;">
            ${task.status}
          </span>
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Acta_Sesion_Comite_${minute.folio || 'FOLIO'}_${communityName.replace(/\s+/g, '_')}_${minute.date}.pdf</title>
        <style>
          @page { size: letter; margin: 15mm 15mm 15mm 15mm; }
          body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 0; font-size: 11px; line-height: 1.4; }
          .header-table { width: 100%; border-bottom: 2.5px solid ${primaryColor}; padding-bottom: 12px; margin-bottom: 14px; }
          .brand-title { font-size: 20px; font-weight: 900; color: ${primaryColor}; letter-spacing: -0.5px; margin: 0; }
          .brand-sub { font-size: 10px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
          .doc-badge { background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; padding: 8px 12px; text-align: right; }
          .kpi-row { display: table; width: 100%; table-layout: fixed; margin-bottom: 16px; border-spacing: 6px; }
          .kpi-cell { display: table-cell; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; vertical-align: middle; }
          .kpi-label { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; }
          .kpi-value { font-size: 13px; font-weight: 900; color: ${primaryColor}; margin-top: 2px; }
          .section-title { font-size: 11.5px; font-weight: 900; text-transform: uppercase; color: ${primaryColor}; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-top: 14px; margin-bottom: 8px; letter-spacing: 0.3px; display: flex; align-items: center; }
          table.data-table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 12px; }
          table.data-table th { background: #F1F5F9; color: #334155; font-size: 9.5px; font-weight: 800; text-transform: uppercase; padding: 6px 10px; border-bottom: 1.5px solid #CBD5E1; text-align: left; }
          .signatures-table { width: 100%; margin-top: 35px; page-break-inside: avoid; }
          .sig-box { width: 33%; text-align: center; vertical-align: top; padding: 0 10px; }
          .sig-line { border-top: 1.5px solid #334155; margin-bottom: 5px; margin-top: 40px; }
          .footer-note { margin-top: 25px; padding-top: 8px; border-top: 1px dashed #CBD5E1; font-size: 8.5px; color: #64748B; text-align: justify; line-height: 1.35; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="vertical-align: middle;">
              <h1 class="brand-title">${brandName}</h1>
              <div class="brand-sub">${subtitle}</div>
              <div style="font-size: 11px; font-weight: bold; color: ${primaryColor}; margin-top: 4px;">
                Condominio: ${communityName}
              </div>
            </td>
            <td style="vertical-align: middle; text-align: right;">
              <div class="doc-badge">
                <div style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase;">Libro Oficial de Reuniones</div>
                <div style="font-size: 14px; font-weight: 900; color: ${primaryColor};">${minute.folio}</div>
                <div style="font-size: 9.5px; color: #334155; font-weight: 600; margin-top: 2px;">
                  Ley N° 21.442 • Arts. 17° y 20°
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- 4 KPIS SUPERIORES -->
        <div class="kpi-row">
          <div class="kpi-cell">
            <div class="kpi-label">Fecha y Hora</div>
            <div class="kpi-value">${formatDate(minute.date)} • ${minute.time}</div>
          </div>
          <div class="kpi-cell">
            <div class="kpi-label">Tipo de Sesión</div>
            <div class="kpi-value" style="font-size: 11px;">${minute.type}</div>
          </div>
          <div class="kpi-cell">
            <div class="kpi-label">Modalidad & Lugar</div>
            <div class="kpi-value" style="font-size: 10.5px;">${minute.modality}</div>
          </div>
          <div class="kpi-cell">
            <div class="kpi-label">Asistencia del Comité</div>
            <div class="kpi-value">${(minute.attendees || []).length} Integrantes</div>
          </div>
        </div>

        <!-- ASISTENTES -->
        <div class="section-title">1. Asistentes a la Sesión (Comité & Administración)</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Cargo / Representación</th>
              <th>Vivienda</th>
              <th>RUT</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${attendeesHtml}
          </tbody>
        </table>

        <!-- TABLA DE TEMAS TRATADOS -->
        <div class="section-title">2. Tabla de Temas Tratados en la Sesión</div>
        <div style="margin-bottom: 12px;">
          ${topicsHtml}
        </div>

        <!-- ACUERDOS ADOPTADOS -->
        <div class="section-title">3. Acuerdos y Resoluciones Aprobadas por el Comité (Art. 17°)</div>
        <div style="margin-bottom: 12px;">
          ${agreementsHtml}
        </div>

        <!-- COMPROMISOS Y TAREAS -->
        ${(minute.tasks && minute.tasks.length > 0) ? `
          <div class="section-title">4. Compromisos y Tareas Asignadas (Plan de Acción)</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Tarea / Compromiso</th>
                <th>Responsable</th>
                <th>Fecha Límite</th>
                <th style="text-align: center;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${tasksHtml}
            </tbody>
          </table>
        ` : ''}

        <!-- CONSTANCIA Y FIRMAS -->
        <div style="margin-top: 14px; font-size: 10px; color: #475569; font-style: italic;">
          ${minute.notes || 'Habiéndose tratado todos los puntos de la tabla y no habiendo más materias que abordar, se levanta la sesión extendiéndose la presente acta debidamente foliada en el Libro Oficial de Actas del Comité de Administración.'}
        </div>

        <table class="signatures-table">
          <tr>
            <td class="sig-box">
              <div class="sig-line"></div>
              <div style="font-weight: bold; color: #0F172A; font-size: 10.5px;">${minute.presidentName || 'Carlos Morales Rojas'}</div>
              <div style="color: #64748B; font-size: 9px; font-weight: 600;">Presidente del Comité</div>
              <div style="font-family: monospace; font-size: 8.5px; color: #64748B;">RUT: ${minute.presidentRut ? formatRut(minute.presidentRut) : '—'}</div>
            </td>
            <td class="sig-box">
              <div class="sig-line"></div>
              <div style="font-weight: bold; color: #0F172A; font-size: 10.5px;">${minute.secretaryName || 'Marcela Castillo Gómez'}</div>
              <div style="color: #64748B; font-size: 9px; font-weight: 600;">Secretaria / Tesorera</div>
              <div style="font-family: monospace; font-size: 8.5px; color: #64748B;">RUT: ${minute.secretaryRut ? formatRut(minute.secretaryRut) : '—'}</div>
            </td>
            <td class="sig-box">
              <div class="sig-line"></div>
              <div style="font-weight: bold; color: #0F172A; font-size: 10.5px;">${minute.adminName || 'Administración ARANPRO'}</div>
              <div style="color: #64748B; font-size: 9px; font-weight: 600;">Administrador Titular (RNAC)</div>
              <div style="font-family: monospace; font-size: 8.5px; color: #64748B;">RUT: ${minute.adminRut ? formatRut(minute.adminRut) : '76.999.888-1'}</div>
            </td>
          </tr>
        </table>

        <div class="footer-note">
          <strong>FUNDAMENTO LEGAL LEY N° 21.442 SOBRE COPROPIEDAD INMOBILIARIA:</strong> De conformidad a los Artículos 17° y 20° de la Ley N° 21.442, los acuerdos adoptados por el Comité de Administración en el ejercicio de sus facultades legales y reglamentarias son obligatorios para todos los copropietarios y residentes. Este documento constituye copia fiel del Acta Oficial de Reunión de Comité, debidamente registrada y foliada en los sistemas de la Administración ${brandName}.
        </div>
      </body>
      </html>
    `;

    const dynamicTitle = `Acta_Sesion_Comite_${minute.folio || 'FOLIO'}_${communityName.replace(/\s+/g, '_')}_${minute.date}.pdf`;
    printDocumentDirectly(htmlContent, dynamicTitle);
  };

  // --- Función de Copiar Resumen para WhatsApp del Comité ---
  const handleCopyWhatsAppSummary = () => {
    const communityName = currentCommunity?.name || 'Condominio';
    const activeTasks = tasks.filter(t => t.status !== 'CUMPLIDA');

    let text = `📋 *RESUMEN DE GESTIÓN & NOVEDADES CON EL COMITÉ*\n`;
    text += `🏢 *${communityName.toUpperCase()}*\n`;
    text += `📅 _Fecha: ${formatDate(new Date().toISOString().split('T')[0])}_\n`;
    text += `⚖️ _Administración ARANPRO • Gestión Integral_\n\n`;

    text += `🔔 *NOVEDADES RECIENTES:*\n`;
    novedades.slice(0, 4).forEach((n, idx) => {
      const icon = n.priority === 'URGENTE' ? '🚨' : n.priority === 'ALTA' ? '⚠️' : 'ℹ️';
      text += `${icon} *${n.title}* (${formatDate(n.date)})\n   _${n.description}_\n\n`;
    });

    text += `⏳ *COMPROMISOS & TAREAS EN CURSO (${activeTasks.length}):*\n`;
    activeTasks.slice(0, 4).forEach(t => {
      text += `▫️ *${t.title}* | Asignado: ${t.assignee} | Vence: ${t.dueDate ? formatDate(t.dueDate) : 'Pronto'}\n`;
    });

    if (meetings.length > 0) {
      text += `\n📖 *ÚLTIMA SESIÓN OFICIAL:*\n`;
      text += `Folio ${meetings[0].folio} (${formatDate(meetings[0].date)}) - ${meetings[0].agreements.length} acuerdos registrados en el Libro Oficial.\n`;
    }

    text += `\n_Para revisar las actas completas y bitácora ingrese al Portal de Administración ARANPRO._`;

    navigator.clipboard.writeText(text);
    setWhatsAppNovedadesCopied(true);
    setTimeout(() => setWhatsAppNovedadesCopied(false), 2500);
  };

  // Guardar Nueva Reunión
  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if (!newMeetingForm.date || newMeetingForm.agendaTopics.length === 0) return;

    const attendeesList = [
      { name: newMeetingForm.presidentName, role: 'Presidente del Comité', unit: 'Casa 1', rut: newMeetingForm.presidentRut, status: 'PRESENTE' },
      { name: newMeetingForm.secretaryName, role: 'Secretaria / Tesorera', unit: 'Casa 4', rut: newMeetingForm.secretaryRut, status: 'PRESENTE' },
      { name: 'Claudia Herrera Soto', role: 'Vocal Comité', unit: 'Casa 7', rut: '14.225.890-3', status: 'PRESENTE' },
      { name: 'Administración ARANPRO', role: 'Administrador Titular (RNAC N° 48.912)', unit: 'Administración', rut: '76.999.888-1', status: 'PRESENTE' }
    ];

    addCommitteeMeeting(currentCommunity.id, {
      ...newMeetingForm,
      attendees: attendeesList
    });

    setShowNewMeetingModal(false);
  };

  // Guardar Nueva Novedad
  const handleCreateNovedad = (e) => {
    e.preventDefault();
    if (!newNovedadForm.title || !newNovedadForm.description) return;

    addCommitteeNovedad(currentCommunity.id, newNovedadForm);
    setShowNewNovedadModal(false);
    setNewNovedadForm({
      title: '',
      category: 'Mantención & Accesos',
      priority: 'ALTA',
      reportedBy: 'Administración ARANPRO',
      description: '',
      elevatedToMeeting: false
    });
  };

  // Guardar Nueva Tarea Independiente
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskStandalone.title) return;

    addCommitteeTask(currentCommunity.id, newTaskStandalone);
    setShowNewTaskModal(false);
    setNewTaskStandalone({
      title: '',
      assignee: 'Administración ARANPRO',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'MEDIA',
      notes: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. BARRA SUPERIOR EJECUTIVA DEL COMITÉ DE ADMINISTRACIÓN */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-2.5 bg-gradient-to-br from-[#0F3D2E] to-[#14533d] text-white rounded-2xl shadow-xs shrink-0">
            <ClipboardList className="w-5 h-5 text-[#D4B895]" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-base font-black text-slate-900 tracking-tight whitespace-nowrap">
                Comité de Administración: Reuniones & Novedades
              </h3>
              <span className="text-[10px] font-bold bg-[#0F3D2E]/10 text-[#0F3D2E] px-2 py-0.5 rounded-full border border-[#0F3D2E]/20 uppercase">
                Ley N° 21.442 • Arts. 17° y 20°
              </span>
              <span className="text-[9.5px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-md hidden sm:inline-block">
                {currentCommunity?.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Libro oficial de sesiones ordinarias y extraordinarias, actas foliadas con acuerdos, bitácora de novedades y compromisos
            </p>
          </div>
        </div>

        {/* Acciones principales rápidas a la derecha */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowNewMeetingModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-[#0F3D2E] to-[#14533d] hover:from-[#0A291F] hover:to-[#0F3D2E] text-[#D4B895] border border-[#D4B895] font-black text-xs rounded-xl flex items-center shadow-xs transition-all cursor-pointer"
            title="Registrar una nueva reunión de comité con tabla, acuerdos y tareas"
          >
            <Plus className="w-4 h-4 mr-1 text-[#D4B895]" />
            + Nueva Sesión de Comité
          </button>

          <button
            type="button"
            onClick={() => setShowNewNovedadModal(true)}
            className="px-3 py-2 bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs rounded-xl flex items-center shadow-xs transition-colors cursor-pointer"
            title="Anotar una novedad o evento urgente para conocimiento del comité"
          >
            <Bell className="w-3.5 h-3.5 mr-1 text-[#D4B895]" />
            + Registrar Novedad
          </button>

          <button
            type="button"
            onClick={handleCopyWhatsAppSummary}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center shadow-xs transition-colors cursor-pointer"
            title="Copiar reporte ejecutivo para pegar en el grupo de WhatsApp del Comité"
          >
            {whatsAppNovedadesCopied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span className="font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>WhatsApp Comité</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. KPIS EJECUTIVOS DEL COMITÉ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="p-2.5 bg-[#0F3D2E]/10 rounded-xl text-[#0F3D2E]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sesiones Realizadas</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{meetings.length} actas</div>
            <div className="text-[9.5px] text-slate-400">Libro foliado oficial</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${pendingTasksCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tareas & Compromisos</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {pendingTasksCount} pendientes
            </div>
            <div className="text-[9.5px] text-amber-700 font-bold">
              {urgentTasksCount > 0 ? `${urgentTasksCount} urgentes con plazo` : 'Al día'}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Novedades Activas</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{activeNovedadesCount} eventos</div>
            <div className="text-[9.5px] text-slate-400">Bitácora de gestión</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Comité Vigente</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{committeeMembers.length} miembros</div>
            <div className="text-[9.5px] text-emerald-700 font-bold">100% cuotas al día</div>
          </div>
        </div>
      </div>

      {/* 3. SELECTOR DE SUB-PESTAÑAS (INTERNO) */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTab('reuniones')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            currentTab === 'reuniones'
              ? 'bg-[#0F3D2E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>1. Libro Oficial de Reuniones</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            currentTab === 'reuniones' ? 'bg-[#D4B895] text-[#0F3D2E]' : 'bg-slate-100 text-slate-600'
          }`}>
            {meetings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('novedades')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            currentTab === 'novedades'
              ? 'bg-[#0F3D2E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>2. Registro de Novedades & Bitácora</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            currentTab === 'novedades' ? 'bg-[#D4B895] text-[#0F3D2E]' : 'bg-slate-100 text-slate-600'
          }`}>
            {novedades.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('tareas')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            currentTab === 'tareas'
              ? 'bg-[#0F3D2E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>3. Compromisos & Tareas</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            currentTab === 'tareas' ? 'bg-[#D4B895] text-[#0F3D2E]' : 'bg-slate-100 text-slate-600'
          }`}>
            {pendingTasksCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('directorio')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            currentTab === 'directorio'
              ? 'bg-[#0F3D2E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>4. Miembros del Comité (Art. 17°)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            currentTab === 'directorio' ? 'bg-[#D4B895] text-[#0F3D2E]' : 'bg-slate-100 text-slate-600'
          }`}>
            {committeeMembers.length}
          </span>
        </button>
      </div>

      {/* --- VISTA 1: LIBRO OFICIAL DE REUNIONES DE COMITÉ --- */}
      {currentTab === 'reuniones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Columna Izquierda: Índice de Actas Foliadas */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Sesiones Registradas ({meetings.length})
              </span>
              <button
                type="button"
                onClick={() => setShowNewMeetingModal(true)}
                className="text-[11px] font-bold text-[#0F3D2E] hover:underline flex items-center cursor-pointer"
              >
                <Plus className="w-3 h-3 mr-0.5" /> Nueva Sesión
              </button>
            </div>

            <div className="space-y-2">
              {meetings.map(m => {
                const isSelected = selectedMeeting?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMeetingId(m.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F3D2E]/5 border-[#0F3D2E] shadow-2xs ring-1 ring-[#0F3D2E]/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-[#0F3D2E]">{m.folio}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {m.status}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">{m.type}</div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1.5">
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-slate-400" />{formatDate(m.date)}</span>
                      <span>•</span>
                      <span>{m.agreements?.length || 0} acuerdos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Detalle del Acta Foliada Seleccionada */}
          <div className="lg:col-span-8">
            {selectedMeeting ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-5">
                {/* Cabecera del Acta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-[#0F3D2E] bg-[#0F3D2E]/10 px-2 py-0.5 rounded-md">
                        {selectedMeeting.folio}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {selectedMeeting.status}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 mt-1.5">{selectedMeeting.type}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(selectedMeeting.date)} • {selectedMeeting.time} • {selectedMeeting.modality}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePrintCommitteeMinute(selectedMeeting)}
                    className="px-3.5 py-2 bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs rounded-xl flex items-center shadow-xs transition-colors cursor-pointer shrink-0"
                    title="Imprimir Acta Oficial Foliada con membrete formal ARANPRO y firmas"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5 text-[#D4B895]" />
                    Imprimir Acta Oficial (PDF)
                  </button>
                </div>

                {/* Asistentes a la Sesión */}
                <div>
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-[#0F3D2E]" /> Asistentes del Comité y Administración
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedMeeting.attendees || []).map((att, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{att.name}</div>
                          <div className="text-[11px] text-[#0F3D2E] font-semibold">{att.role} ({att.unit})</div>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {att.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabla de Temas Tratados */}
                <div>
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-[#0F3D2E]" /> Temas Tratados en la Tabla
                  </h5>
                  <div className="space-y-1.5">
                    {(selectedMeeting.agendaTopics || []).map((top, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start space-x-2">
                        <span className="font-bold text-[#0F3D2E]">•</span>
                        <span>{top}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acuerdos y Resoluciones Aprobadas */}
                <div>
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Acuerdos Aprobados por el Comité (Art. 17°)
                  </h5>
                  <div className="space-y-2">
                    {(selectedMeeting.agreements || []).map((agr, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-slate-900">
                        <div className="font-bold text-emerald-900 mb-0.5">Acuerdo N° {idx + 1}:</div>
                        <div>{agr}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tareas Asignadas */}
                {selectedMeeting.tasks && selectedMeeting.tasks.length > 0 && (
                  <div>
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-700" /> Compromisos y Tareas Derivadas
                    </h5>
                    <div className="space-y-1.5">
                      {selectedMeeting.tasks.map((task, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{task.title}</div>
                            <div className="text-[10px] text-slate-500">Asignado: {task.assignee} • Vence: {task.dueDate ? formatDate(task.dueDate) : 'Pronto'}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.status === 'CUMPLIDA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No hay actas de sesión registradas todavía. Haz clic en "+ Nueva Sesión de Comité" para crear la primera.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- VISTA 2: REGISTRO DE NOVEDADES & BITÁCORA --- */}
      {currentTab === 'novedades' && (
        <div className="space-y-4">
          {/* Barra de Filtros de Novedades */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar en novedades..."
                  value={novedadSearchQuery}
                  onChange={(e) => setNovedadSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-48 focus:outline-none focus:border-[#0F3D2E]"
                />
              </div>

              <select
                value={novedadFilterCategory}
                onChange={(e) => setNovedadFilterCategory(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
              >
                <option value="ALL">Todas las Categorías</option>
                <option value="Mantención & Accesos">Mantención & Accesos</option>
                <option value="Finanzas & Cobranza">Finanzas & Cobranza</option>
                <option value="Seguridad & Convivencia">Seguridad & Convivencia</option>
                <option value="Servicios Básicos">Servicios Básicos</option>
              </select>

              <select
                value={novedadFilterPriority}
                onChange={(e) => setNovedadFilterPriority(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
              >
                <option value="ALL">Todas las Prioridades</option>
                <option value="URGENTE">Urgente</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="INFORMATIVA">Informativa</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-bold shrink-0">
              Mostrando {filteredNovedades.length} de {novedades.length} eventos
            </div>
          </div>

          {/* Lista de Tarjetas de Novedades */}
          <div className="space-y-2.5">
            {filteredNovedades.map((nov) => {
              const priorityColors = {
                URGENTE: 'bg-rose-100 text-rose-800 border-rose-200',
                ALTA: 'bg-amber-100 text-amber-800 border-amber-200',
                MEDIA: 'bg-blue-100 text-blue-800 border-blue-200',
                INFORMATIVA: 'bg-slate-100 text-slate-700 border-slate-200'
              };

              return (
                <div key={nov.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${priorityColors[nov.priority] || priorityColors.MEDIA}`}>
                        {nov.priority}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {nov.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(nov.date)} • {nov.time}
                      </span>
                      {nov.elevatedToMeeting && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          📌 Elevada a Próxima Sesión
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {nov.status !== 'RESUELTO' ? (
                        <button
                          type="button"
                          onClick={() => updateCommitteeNovedad(currentCommunity.id, nov.id, { status: 'RESUELTO' })}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg border border-emerald-300 transition-colors cursor-pointer"
                        >
                          ✓ Marcar Resuelto
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ Resuelto
                        </span>
                      )}

                      {!nov.elevatedToMeeting && (
                        <button
                          type="button"
                          onClick={() => updateCommitteeNovedad(currentCommunity.id, nov.id, { elevatedToMeeting: true })}
                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[10px] rounded-lg border border-purple-300 transition-colors cursor-pointer"
                          title="Incorporar este tema a la tabla de la próxima reunión del comité"
                        >
                          + Elevar a Reunión
                        </button>
                      )}
                    </div>
                  </div>

                  <h5 className="text-sm font-black text-slate-900">{nov.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{nov.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10.5px] text-slate-400">
                    <span>Reportado por: <strong>{nov.reportedBy}</strong></span>
                    <span>Notificado al Comité: <strong className="text-emerald-700">Sí (Registrado)</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- VISTA 3: COMPROMISOS & TAREAS --- */}
      {currentTab === 'tareas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setTaskFilterStatus('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  taskFilterStatus === 'ALL' ? 'bg-[#0F3D2E] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todas ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilterStatus('PENDIENTES')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  taskFilterStatus === 'PENDIENTES' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pendientes ({pendingTasksCount})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilterStatus('CUMPLIDAS')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  taskFilterStatus === 'CUMPLIDAS' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cumplidas ({tasks.length - pendingTasksCount})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowNewTaskModal(true)}
              className="px-3 py-1.5 bg-[#0F3D2E] hover:bg-[#0A291F] text-white font-bold text-xs rounded-xl flex items-center shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-[#D4B895]" /> + Nueva Tarea
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'CUMPLIDA';
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCompleted ? 'bg-slate-50/70 border-slate-200 opacity-75' : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <button
                        type="button"
                        onClick={() => toggleCommitteeTaskStatus(currentCommunity.id, task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                          isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-[#0F3D2E]'
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div>
                        <h5 className={`text-xs font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Responsable: <strong className="text-slate-700">{task.assignee}</strong>
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      task.priority === 'URGENTE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-400">
                      Vence: <strong className={task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted ? 'text-rose-600' : 'text-slate-700'}>
                        {task.dueDate ? formatDate(task.dueDate) : 'Sin plazo'}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCommitteeTaskStatus(currentCommunity.id, task.id)}
                      className="text-[10px] font-bold text-[#0F3D2E] hover:underline cursor-pointer"
                    >
                      {isCompleted ? 'Reabrir Tarea' : 'Completar →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- VISTA 4: DIRECTORIO DE MIEMBROS DEL COMITÉ --- */}
      {currentTab === 'directorio' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start space-x-3">
            <Shield className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <div className="font-bold">Requisito Legal Art. 17° Ley N° 21.442:</div>
              <p className="mt-0.5 leading-relaxed text-emerald-900">
                Para ser miembro del Comité de Administración se requiere ser copropietario o su cónyuge/conviviente civil debidamente facultado, y <strong>encontrarse al día en el pago de los gastos comunes</strong>. El mandato tiene una duración de hasta tres años, prorrogable automáticamente si no se celebra nueva asamblea.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {committeeMembers.map((m, idx) => (
              <div key={idx} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F3D2E] to-[#14533d] text-white flex items-center justify-center font-bold text-xs">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900">{m.name}</h5>
                      <span className="text-[10px] font-bold text-[#0F3D2E] bg-[#0F3D2E]/10 px-1.5 py-0.2 rounded-md">
                        {m.role}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {m.tower ? `${m.tower} - ${m.unitNumber}` : `Casa ${m.unitNumber}`}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">RUT:</span>
                    <span className="font-mono font-bold">{m.rut ? formatRut(m.rut) : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Teléfono:</span>
                    <span className="font-bold">{m.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Correo:</span>
                    <span className="font-bold truncate max-w-[170px]">{m.email || '—'}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Estado Gastos:</span>
                    <span className="font-bold text-emerald-700 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Al Día (Hábil)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL 1: REGISTRAR NUEVA REUNIÓN DE COMITÉ --- */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#0F3D2E] text-white rounded-xl">
                  <Calendar className="w-5 h-5 text-[#D4B895]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Nueva Sesión del Comité de Administración</h3>
                  <p className="text-xs text-slate-500">Genera el acta oficial foliada según la Ley N° 21.442 Art. 17° y 20°</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewMeetingModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Sesión</label>
                  <input
                    type="date"
                    required
                    value={newMeetingForm.date}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, date: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora</label>
                  <input
                    type="text"
                    required
                    value={newMeetingForm.time}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, time: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl"
                    placeholder="19:30 hrs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Modalidad</label>
                  <select
                    value={newMeetingForm.modality}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, modality: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Mixta (Presencial + Google Meet)">Mixta (Presencial + Meet)</option>
                    <option value="Presencial (Sala de Reuniones)">Presencial</option>
                    <option value="Telemática (Google Meet / Zoom)">Telemática</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Sesión</label>
                <input
                  type="text"
                  required
                  value={newMeetingForm.type}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, type: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-xl"
                  placeholder="Sesión Ordinaria Mensual de Coordinación"
                />
              </div>

              {/* Temas Tratados */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Tabla de Temas a Tratar</label>
                <div className="space-y-1.5">
                  {newMeetingForm.agendaTopics.map((top, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <span>{top}</span>
                      <button
                        type="button"
                        onClick={() => setNewMeetingForm({
                          ...newMeetingForm,
                          agendaTopics: newMeetingForm.agendaTopics.filter((_, i) => i !== idx)
                        })}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    placeholder="Escribir nuevo tema de la tabla..."
                    className="flex-1 text-xs p-2 border border-slate-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newTopicInput.trim()) return;
                      setNewMeetingForm({
                        ...newMeetingForm,
                        agendaTopics: [...newMeetingForm.agendaTopics, newTopicInput.trim()]
                      });
                      setNewTopicInput('');
                    }}
                    className="px-3 py-2 bg-[#0F3D2E] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {/* Acuerdos Tomados */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Acuerdos Formales del Comité (Art. 17°)</label>
                <div className="space-y-1.5">
                  {newMeetingForm.agreements.map((agr, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs">
                      <span>{agr}</span>
                      <button
                        type="button"
                        onClick={() => setNewMeetingForm({
                          ...newMeetingForm,
                          agreements: newMeetingForm.agreements.filter((_, i) => i !== idx)
                        })}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newAgreementInput}
                    onChange={(e) => setNewAgreementInput(e.target.value)}
                    placeholder="Escribir acuerdo aprobado por unanimidad o mayoría..."
                    className="flex-1 text-xs p-2 border border-slate-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAgreementInput.trim()) return;
                      setNewMeetingForm({
                        ...newMeetingForm,
                        agreements: [...newMeetingForm.agreements, newAgreementInput.trim()]
                      });
                      setNewAgreementInput('');
                    }}
                    className="px-3 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewMeetingModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F3D2E] hover:bg-[#0A291F] text-[#D4B895] border border-[#D4B895] font-black text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar & Follar Acta Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REGISTRAR NUEVA NOVEDAD --- */}
      {showNewNovedadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Registrar Novedad en la Bitácora</h3>
                  <p className="text-xs text-slate-500">Para conocimiento directo del Comité de Administración</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewNovedadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNovedad} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título de la Novedad / Evento</label>
                <input
                  type="text"
                  required
                  value={newNovedadForm.title}
                  onChange={(e) => setNewNovedadForm({ ...newNovedadForm, title: e.target.value })}
                  placeholder="Ej: Calibración de fotoceldas del portón completada"
                  className="w-full text-xs p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={newNovedadForm.category}
                    onChange={(e) => setNewNovedadForm({ ...newNovedadForm, category: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Mantención & Accesos">Mantención & Accesos</option>
                    <option value="Finanzas & Cobranza">Finanzas & Cobranza</option>
                    <option value="Seguridad & Convivencia">Seguridad & Convivencia</option>
                    <option value="Servicios Básicos">Servicios Básicos</option>
                    <option value="Administrativo General">Administrativo General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={newNovedadForm.priority}
                    onChange={(e) => setNewNovedadForm({ ...newNovedadForm, priority: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="URGENTE">Urgente</option>
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Media</option>
                    <option value="INFORMATIVA">Informativa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detalle de la Novedad y Acciones Realizadas</label>
                <textarea
                  required
                  rows={3}
                  value={newNovedadForm.description}
                  onChange={(e) => setNewNovedadForm({ ...newNovedadForm, description: e.target.value })}
                  placeholder="Detallar lo ocurrido y las medidas tomadas por la administración..."
                  className="w-full text-xs p-2 border border-slate-300 rounded-xl resize-none"
                />
              </div>

              <label className="flex items-center space-x-2 text-xs text-slate-700 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNovedadForm.elevatedToMeeting}
                  onChange={(e) => setNewNovedadForm({ ...newNovedadForm, elevatedToMeeting: e.target.checked })}
                  className="rounded border-slate-300 text-[#0F3D2E]"
                />
                <span>Elevar automáticamente a tema para la próxima Sesión de Comité</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewNovedadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F3D2E] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Registrar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: REGISTRAR NUEVA TAREA / COMPROMISO --- */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Nuevo Compromiso / Tarea</h3>
                  <p className="text-xs text-slate-500">Seguimiento de acuerdos del comité</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título de la Tarea</label>
                <input
                  type="text"
                  required
                  value={newTaskStandalone.title}
                  onChange={(e) => setNewTaskStandalone({ ...newTaskStandalone, title: e.target.value })}
                  placeholder="Ej: Solicitar 3 cotizaciones para pintura de estacionamientos"
                  className="w-full text-xs p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Responsable</label>
                  <input
                    type="text"
                    required
                    value={newTaskStandalone.assignee}
                    onChange={(e) => setNewTaskStandalone({ ...newTaskStandalone, assignee: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    required
                    value={newTaskStandalone.dueDate}
                    onChange={(e) => setNewTaskStandalone({ ...newTaskStandalone, dueDate: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad</label>
                <select
                  value={newTaskStandalone.priority}
                  onChange={(e) => setNewTaskStandalone({ ...newTaskStandalone, priority: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="URGENTE">Urgente</option>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Media</option>
                  <option value="BAJA">Baja</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F3D2E] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
