import React, { useState } from 'react';
import { FileCheck, Printer, Download, X } from 'lucide-react';
import { formatCLP, formatDate } from '../../utils/formatters';
import { printDocumentDirectly } from '../../utils/printDocument';

// Agrupador ordenado de gastos por categoría con subtotales
export const groupExpensesByCategory = (expensesList) => {
  const map = {};
  (expensesList || []).forEach(exp => {
    let cat = exp.category;
    if (exp.fundSource === 'fondo_reserva') {
      cat = 'Fondo de Reserva (Art. 14)';
    } else if (!cat || !cat.trim()) {
      cat = 'Gastos Operacionales Generales';
    }
    if (!map[cat]) {
      map[cat] = {
        name: cat,
        expenses: [],
        total: 0,
        paidTotal: 0,
        unbackedCount: 0,
        unapprovedCount: 0
      };
    }
    const amt = parseFloat(exp.amount) || 0;
    map[cat].expenses.push(exp);
    map[cat].total += amt;
    if (exp.status === 'pagado') {
      map[cat].paidTotal += amt;
    }
    if (!exp.receiptUrl && !exp.hasReceipt) {
      map[cat].unbackedCount += 1;
    }
    if (!exp.committeeApproved) {
      map[cat].unapprovedCount += 1;
    }
  });

  return Object.values(map);
};

export const ExpenseReportModal = ({
  isOpen,
  onClose,
  community,
  onExportCSV
}) => {
  const [expenseReportTemplate, setExpenseReportTemplate] = useState('ejecutivo'); // 'ejecutivo' | 'clasico' | 'moderno'

  if (!isOpen || !community) return null;

  const allExpenses = community.expenses || [];
  const totalOrdinary = allExpenses
    .filter(e => e.fundSource !== 'fondo_reserva')
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const totalReserve = allExpenses
    .filter(e => e.fundSource === 'fondo_reserva')
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const totalPaid = allExpenses
    .filter(e => e.status === 'pagado')
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const grandTotal = totalOrdinary + totalReserve;

  // Desglose por Art. 6°
  const catMap = {};
  allExpenses.forEach(e => {
    const cat = e.fundSource === 'fondo_reserva' ? 'Fondo Común de Reserva (Art. 14)' : e.category;
    if (!catMap[cat]) catMap[cat] = { amount: 0, count: 0, isReserve: e.fundSource === 'fondo_reserva' };
    catMap[cat].amount += parseFloat(e.amount) || 0;
    catMap[cat].count += 1;
  });

  const reportGroupedExpenses = groupExpensesByCategory(allExpenses);

  const downloadHtmlDocument = (elementId, filename = 'Rendicion_Gastos_ARANPRO.html') => {
    const elem = document.getElementById(elementId);
    if (!elem) return;
    const contentHtml = elem.innerHTML.replace(/src="\/brand\//g, `src="${window.location.origin}/brand/`);
    const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: letter portrait; margin: 6mm 8mm; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #fff; color: #0f172a; }
    .no-print { display: none !important; }
    table { width: 100%; border-collapse: collapse; }
    .print-fit-page { max-height: 260mm; overflow: hidden; page-break-inside: avoid; padding: 14px 18px; }
  </style>
</head>
<body>
  ${contentHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    const headers = [
      'ID_Gasto', 'Categoria', 'Origen_Fondo', 'Proveedor', 'RUT_Proveedor',
      'Tipo_Documento', 'Numero_Folio', 'Fecha_Emision', 'Monto_CLP',
      'Estado_Pago', 'Fecha_Pago', 'N_Transferencia_o_Ref', 'Metodo_Pago',
      'Visado_Comite', 'Es_Fijo_Recurrente', 'Tiene_Respaldo', 'Glosa_Detalle'
    ];
    const rows = allExpenses.map(e => [
      `"${e.id || ''}"`,
      `"${e.category || ''}"`,
      `"${e.fundSource === 'fondo_reserva' ? 'Fondo de Reserva' : 'Gasto Ordinario'}"`,
      `"${(e.provider || '').replace(/"/g, '""')}"`,
      `"${e.providerRut || ''}"`,
      `"${e.documentType || ''}"`,
      `"${e.documentNumber || ''}"`,
      `"${e.date || ''}"`,
      parseFloat(e.amount) || 0,
      `"${e.status === 'pagado' ? 'Pagado' : 'Pendiente'}"`,
      `"${e.paymentDate || ''}"`,
      `"${e.paymentReference || ''}"`,
      `"${e.paymentMethod || ''}"`,
      `"${e.committeeApproved ? 'Visado' : 'Pendiente'}"`,
      `"${e.isRecurring ? 'Fijo' : 'Variable'}"`,
      `"${e.receiptUrl || e.hasReceipt ? 'Con Respaldo' : 'Sin Respaldo'}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rendicion_Gastos_${community.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cleanComm = community.name.replace(/\s+/g, '_');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/85 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D4B895] flex flex-col h-[94vh] max-h-[94vh]">
        {/* Header de la Ventana con Selector de Formato */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-5 py-3.5 bg-[#0F3D2E] text-white border-b border-[#D4B895]/30 shrink-0 gap-3">
          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-2 bg-white/10 rounded-xl text-[#D4B895] border border-[#D4B895]/40 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                Informe Oficial de Rendición de Gastos Comunes
              </h3>
              <p className="text-[11px] text-[#D4B895]">
                {community.name} • 1 Página Legal Ley N° 21.442
              </p>
            </div>
          </div>

          {/* Selector de Plantilla / Formato */}
          <div className="flex items-center bg-black/30 p-1 rounded-xl text-xs border border-white/10 shrink-0 self-start md:self-auto overflow-x-auto max-w-full">
            <span className="text-[10px] uppercase font-bold text-[#D4B895] px-2 hidden lg:inline">Plantilla:</span>
            <button
              type="button"
              onClick={() => setExpenseReportTemplate('ejecutivo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                expenseReportTemplate === 'ejecutivo'
                  ? 'bg-[#D4B895] text-[#0F3D2E] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
              title="Formato Ejecutivo Oficial ARANPRO con tarjetas de balance y desglose Art. 6°"
            >
              🏛️ Ejecutivo AP
            </button>
            <button
              type="button"
              onClick={() => setExpenseReportTemplate('clasico')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                expenseReportTemplate === 'clasico'
                  ? 'bg-[#D4B895] text-[#0F3D2E] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
              title="Formato Clásico Contable (Kastor / Edifito) con balance bancario tabular de auditoría"
            >
              📊 Clásico Contable
            </button>
            <button
              type="button"
              onClick={() => setExpenseReportTemplate('moderno')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                expenseReportTemplate === 'moderno'
                  ? 'bg-[#D4B895] text-[#0F3D2E] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
              title="Formato Moderno Vecinal (ComunidadFeliz) con acento visual para copropietarios"
            >
              🌟 Moderno Vecinal
            </button>
          </div>

          {/* Botones de Acción Superiores con Espaciado Cómodo */}
          <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={() => printDocumentDirectly('expense-rendition-printable-doc', `Rendicion_Gastos_${cleanComm}_${expenseReportTemplate}`, { fitPage: true })}
              className="px-4 py-2 bg-[#D4B895] hover:bg-[#c3a47e] text-[#0F3D2E] font-black text-xs rounded-xl flex items-center space-x-2 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="Imprimir documento oficial o guardar en PDF (Exactamente 1 Página)"
            >
              <Printer className="w-4 h-4 shrink-0 text-[#0F3D2E]" />
              <span className="font-black">Imprimir PDF (1 Pág)</span>
            </button>
            <button
              type="button"
              onClick={() => downloadHtmlDocument('expense-rendition-printable-doc', `Rendicion_Gastos_${cleanComm}_${expenseReportTemplate}.html`)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs flex items-center transition-all cursor-pointer shrink-0"
              title="Descargar respaldo HTML"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-1 cursor-pointer shrink-0"
              title="Cerrar ventana (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Documento Imprimible */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100 flex justify-center">
          <div 
            id="expense-rendition-printable-doc"
            className="bg-white w-full max-w-3xl rounded-2xl shadow-md border border-slate-200 text-slate-800 font-sans p-5 sm:p-7 space-y-3.5 print-fit-page"
          >
            {/* ======================================================== */}
            {/* FORMATO 1: 🏛️ EJECUTIVO AP (OFICIAL ARANPRO) */}
            {/* ======================================================== */}
            {expenseReportTemplate === 'ejecutivo' && (
              <div className="space-y-3">
                {/* Membrete Oficial */}
                <div className="flex items-center justify-between border-b-2 border-[#0F3D2E] pb-2.5">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="/brand/ARANPRO_logo_horizontal_transparente_trimmed.png" 
                      alt="ARANPRO Gestión Inmobiliaria" 
                      className="h-9 sm:h-10 w-auto object-contain"
                    />
                    <div className="border-l border-slate-300 pl-3 hidden sm:block">
                      <div className="text-[10px] font-black text-[#0F3D2E] uppercase tracking-wider">
                        Gestión Inmobiliaria Integral
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        RUT: 76.999.888-1 • Reg. MINVU N° 44.201
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-black text-slate-900 text-sm leading-tight">{community.name}</div>
                    <div className="text-slate-600 text-[10px]">{community.address || 'Dirección del Condominio'}</div>
                    <div className="text-[9.5px] font-mono text-[#0F3D2E] font-bold">
                      Fecha Rendición: {formatDate(new Date().toISOString().split('T')[0])}
                    </div>
                  </div>
                </div>

                {/* Título y Marco Legal */}
                <div className="text-center py-0.5 space-y-0.5">
                  <h2 className="text-xs sm:text-sm font-black text-[#0F3D2E] uppercase tracking-wide">
                    Informe Oficial de Rendición de Gastos y Respaldos Contables
                  </h2>
                  <p className="text-[10px] text-slate-600 max-w-2xl mx-auto leading-tight">
                    Conforme al <strong>Artículo 6°, 13°, 14° y 18° de la Ley N° 21.442</strong> de Copropiedad Inmobiliaria. Detalle consolidado de egresos ordinarios y extraordinarios ejecutados en el período.
                  </p>
                </div>

                {/* Resumen Ejecutivo de Egresos (4 KPIs Compactos) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Gastos Ordinarios</span>
                    <span className="text-sm font-black text-slate-900 block">{formatCLP(totalOrdinary)}</span>
                    <span className="text-[8.5px] text-emerald-700 font-semibold">Base de prorrateo mensual</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Cargo Fondo Reserva</span>
                    <span className="text-sm font-black text-amber-800 block">{formatCLP(totalReserve)}</span>
                    <span className="text-[8.5px] text-slate-500 font-semibold">Art. 14 Ley 21.442</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Total Egresos Pagados</span>
                    <span className="text-sm font-black text-emerald-700 block">{formatCLP(totalPaid)}</span>
                    <span className="text-[8.5px] text-slate-500 font-semibold">Transferidos / Concluidos</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0F3D2E]/5 border border-[#0F3D2E]/20">
                    <span className="text-[9px] text-[#0F3D2E] uppercase font-bold block">Total Rendición</span>
                    <span className="text-sm font-black text-[#0F3D2E] block">{formatCLP(grandTotal)}</span>
                    <span className="text-[8.5px] text-slate-500 font-semibold">{allExpenses.length} comprobantes</span>
                  </div>
                </div>

                {/* Tabla 1: Desglose por Categoría Legal (Art. 6°) */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0F3D2E] flex items-center">
                    <span className="w-1.5 h-2.5 bg-[#0F3D2E] rounded-xs mr-1.5 inline-block" />
                    1. Clasificación Legal de Gastos (Art. 6° Ley N° 21.442)
                  </div>
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-[#F5F4EF] text-[#0F3D2E] font-bold text-[9px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-2.5 py-1">Categoría Legal</th>
                        <th className="px-2 py-1 text-center">N° Comprobantes</th>
                        <th className="px-2.5 py-1 text-right">Subtotal ($ CLP)</th>
                        <th className="px-2.5 py-1 text-right">% del Gasto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10px]">
                      {Object.entries(catMap).map(([cat, data]) => {
                        const pct = totalOrdinary > 0 && !data.isReserve
                          ? ((data.amount / totalOrdinary) * 100).toFixed(1) + '%'
                          : (data.isReserve ? 'F. Reserva' : '0%');
                        return (
                          <tr key={cat}>
                            <td className="px-2.5 py-1 font-semibold text-slate-800">{cat}</td>
                            <td className="px-2 py-1 text-center text-slate-600">{data.count}</td>
                            <td className="px-2.5 py-1 text-right font-bold text-slate-900">{formatCLP(data.amount)}</td>
                            <td className="px-2.5 py-1 text-right font-mono text-slate-600">{pct}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50 font-black text-slate-900 border-t border-slate-300">
                        <td className="px-2.5 py-1 text-[9.5px]">TOTAL RENDICIÓN MENSUAL</td>
                        <td className="px-2 py-1 text-center text-[9.5px]">{allExpenses.length}</td>
                        <td className="px-2.5 py-1 text-right text-[#0F3D2E] text-[10px]">{formatCLP(grandTotal)}</td>
                        <td className="px-2.5 py-1 text-right font-mono text-[9.5px]">100.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tabla 2: Nómina Detallada de Documentos y Egresos */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0F3D2E] flex items-center">
                    <span className="w-1.5 h-2.5 bg-[#0F3D2E] rounded-xs mr-1.5 inline-block" />
                    2. Nómina Detallada de Facturas, Boletas y Comprobantes de Pago
                  </div>
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-[#F5F4EF] text-[#0F3D2E] font-bold text-[9px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-2 py-1">Fecha</th>
                        <th className="px-2 py-1">Proveedor / Beneficiario</th>
                        <th className="px-2 py-1">Tipo y N° Doc</th>
                        <th className="px-2 py-1">Glosa Resumida</th>
                        <th className="px-2 py-1 text-center">Estado</th>
                        <th className="px-2 py-1 text-right">Monto CLP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[9.5px]">
                      {reportGroupedExpenses.map(group => (
                        <React.Fragment key={`pdf-ej-grp-${group.name}`}>
                          <tr className="bg-[#0F3D2E]/10 border-t-2 border-b border-[#0F3D2E]/30 font-bold">
                            <td colSpan={4} className="px-2 py-1 text-[9px] uppercase font-black text-[#0F3D2E] tracking-wider">
                              📁 {group.name.toUpperCase()} ({group.expenses.length} {group.expenses.length === 1 ? 'COMPROBANTE' : 'COMPROBANTES'})
                            </td>
                            <td colSpan={2} className="px-2 py-1 text-right font-black text-[9.5px] text-[#0F3D2E]">
                              Subtotal {group.name.split('(')[0].trim()}: {formatCLP(group.total)}
                            </td>
                          </tr>
                          {group.expenses.map((exp, idx) => (
                            <tr key={exp.id || idx} className="hover:bg-slate-50/70">
                              <td className="px-2 py-1 whitespace-nowrap text-slate-600 font-mono text-[9px]">
                                {exp.date}
                              </td>
                              <td className="px-2 py-1 max-w-[130px]">
                                <div className="font-bold text-slate-800 truncate" title={exp.provider}>{exp.provider}</div>
                                <div className="text-[8.5px] font-mono text-slate-500">{exp.providerRut || 'S/RUT'}</div>
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap">
                                <span className="font-semibold text-slate-700">{exp.documentNumber || 'S/N'}</span>
                                <div className="text-[8.5px] text-slate-400">{exp.documentType}</div>
                              </td>
                              <td className="px-2 py-1 max-w-[180px] text-slate-700">
                                <div className="truncate" title={exp.description}>{exp.description}</div>
                                {exp.fundSource === 'fondo_reserva' && (
                                  <span className="text-[8.5px] font-bold text-amber-800 block">[F. Reserva]</span>
                                )}
                              </td>
                              <td className="px-2 py-1 text-center whitespace-nowrap">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                  exp.status === 'pagado' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                                }`}>
                                  {exp.status === 'pagado' ? 'PAGADO' : 'POR PAGAR'}
                                </span>
                              </td>
                              <td className="px-2 py-1 text-right font-black text-slate-900 whitespace-nowrap font-mono">
                                {formatCLP(exp.amount)}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                      <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                        <td colSpan={5} className="px-2 py-1 text-right uppercase text-[9px]">TOTAL CONSOLIDADO RENDICIÓN MENSUAL:</td>
                        <td className="px-2 py-1 text-right font-black text-[10px] text-[#0F3D2E] font-mono">{formatCLP(grandTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Certificaciones Legales y Cumplimiento Laboral Art. 18 */}
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[9px] text-slate-600 space-y-0.5 leading-tight">
                  <p>
                    <strong>• Art. 18° Ley N° 21.442:</strong> La administración acredita que las cotizaciones previsionales, de salud y cesantía del personal se encuentran declaradas y pagadas mediante Previred.
                  </p>
                  <p>
                    <strong>• Arts. 13° y 14° Ley N° 21.442:</strong> Facturas electrónicas SII y comprobantes bancarios de egreso se encuentran custodiados digitalmente para inspección del Comité y copropietarios.
                  </p>
                </div>

                {/* Bloque de Firmas Formales con Espacio Adecuado */}
                <div className="pt-6 pb-2 grid grid-cols-3 gap-6 text-center text-[9.5px]">
                  <div className="flex flex-col items-center">
                    <div className="h-20 print:h-16 w-full flex items-center justify-center mb-2">
                      <div className="w-full max-w-[125px] h-14 print:h-12 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-[8.5px] text-slate-400 bg-slate-50/50">
                        <span className="font-bold text-slate-500">Firma y Timbre</span>
                        <span className="text-[7.5px] text-slate-400">Administración</span>
                      </div>
                    </div>
                    <div className="w-full border-t-2 border-slate-500 pt-1.5 space-y-0.5">
                      <div className="font-black text-slate-900">ARANPRO GESTIÓN</div>
                      <div className="text-[8.5px] text-slate-600">Administrador de Copropiedad</div>
                      <div className="text-[8px] font-mono text-slate-400">Reg. MINVU N° 44.201</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-20 print:h-16 w-full flex items-center justify-center mb-2">
                      <div className="w-full max-w-[125px] h-14 print:h-12 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-[8.5px] text-slate-400 bg-slate-50/50">
                        <span className="font-bold text-slate-500">Firma y Timbre</span>
                        <span className="text-[7.5px] text-slate-400">Presidente Comité</span>
                      </div>
                    </div>
                    <div className="w-full border-t-2 border-slate-500 pt-1.5 space-y-0.5">
                      <div className="font-black text-slate-900">Presidente(a) Comité</div>
                      <div className="text-[8.5px] text-slate-600">Comité de Administración</div>
                      <div className="text-[8px] text-slate-400">Ley N° 21.442</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-20 print:h-16 w-full flex items-center justify-center mb-2">
                      <div className="w-full max-w-[125px] h-14 print:h-12 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-[8.5px] text-slate-400 bg-slate-50/50">
                        <span className="font-bold text-slate-500">Firma y Timbre</span>
                        <span className="text-[7.5px] text-slate-400">Revisor Cuentas</span>
                      </div>
                    </div>
                    <div className="w-full border-t-2 border-slate-500 pt-1.5 space-y-0.5">
                      <div className="font-black text-slate-900">Tesorero(a) Comité</div>
                      <div className="text-[8.5px] text-slate-600">Revisión de Cuentas</div>
                      <div className="text-[8px] text-slate-400">Visación Conforme</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* FORMATO 2: 📊 CLÁSICO CONTABLE (KASTOR / EDIFITO) */}
            {/* ======================================================== */}
            {expenseReportTemplate === 'clasico' && (
              <div className="space-y-3 font-sans text-slate-900">
                {/* Encabezado Clásico Centrado de Auditoría */}
                <div className="text-center border-b-2 border-slate-800 pb-2">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <img 
                      src="/brand/ARANPRO_isotipo_trimmed.png" 
                      alt="AP" 
                      className="h-7 w-auto object-contain"
                    />
                    <span className="text-xs font-black text-slate-900 tracking-wider uppercase">
                      ARANPRO GESTIÓN INMOBILIARIA • CONTROL Y AUDITORÍA CONTABLE
                    </span>
                  </div>
                  <h1 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    ESTADO DE RENDICIÓN MENSUAL DE CUENTAS Y EGRESOS DE OPERACIÓN
                  </h1>
                  <p className="text-[9.5px] font-mono text-slate-600 mt-0.5">
                    COMUNIDAD: <strong>{community.name.toUpperCase()}</strong> | RUT COMUNIDAD: {community.rut || '76.123.456-7'} | PERÍODO: {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase()}
                  </p>
                </div>

                {/* Cuadro de Conciliación Bancaria y Fuentes de Financiamiento */}
                <div className="border border-slate-300 rounded-sm bg-slate-50 text-[9px]">
                  <div className="bg-slate-200 px-2.5 py-1 font-bold text-slate-800 uppercase text-[8.5px] border-b border-slate-300 tracking-wider">
                    I. CUADRO DE CONCILIACIÓN FINANCIERA Y FUENTES DE FINANCIAMIENTO
                  </div>
                  <div className="grid grid-cols-4 divide-x divide-slate-300 text-center py-1.5">
                    <div>
                      <span className="text-[8px] text-slate-600 font-bold block uppercase">G. Operacionales Ordinarios</span>
                      <span className="font-mono font-bold text-[11px] text-slate-900">{formatCLP(totalOrdinary)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-600 font-bold block uppercase">Cargos Fondo Reserva</span>
                      <span className="font-mono font-bold text-[11px] text-amber-900">{formatCLP(totalReserve)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-600 font-bold block uppercase">Egresos Pagados Efectivos</span>
                      <span className="font-mono font-bold text-[11px] text-emerald-800">{formatCLP(totalPaid)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-600 font-bold block uppercase">Total Rendido al Período</span>
                      <span className="font-mono font-black text-[11px] text-[#0F3D2E]">{formatCLP(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Tabla Libro Diario de Egresos Contables */}
                <div>
                  <div className="bg-slate-800 text-white px-2 py-1 font-bold text-[8.5px] uppercase tracking-wider flex justify-between">
                    <span>II. LIBRO DIARIO DE EGRESOS Y FACTURAS DEL PERÍODO</span>
                    <span>LEY 21.442 ART. 6° & ART. 14°</span>
                  </div>
                  <table className="w-full text-left border-collapse border border-slate-300 text-[9px]">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <tr>
                        <th className="px-1.5 py-1 border-r border-slate-300 text-center">N°</th>
                        <th className="px-2 py-1 border-r border-slate-300">Fecha</th>
                        <th className="px-2 py-1 border-r border-slate-300">Tipo / Folio</th>
                        <th className="px-2 py-1 border-r border-slate-300">Beneficiario / Proveedor</th>
                        <th className="px-2 py-1 border-r border-slate-300">Glosa Contable</th>
                        <th className="px-1.5 py-1 border-r border-slate-300 text-center">Estado</th>
                        <th className="px-2 py-1 text-right">Subtotal ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reportGroupedExpenses.map(group => (
                        <React.Fragment key={`pdf-clasico-grp-${group.name}`}>
                          <tr className="bg-slate-200/90 font-bold text-slate-900 border-t-2 border-b border-slate-300">
                            <td colSpan={5} className="px-2 py-1 uppercase text-[8.5px] font-black tracking-wider">
                              RUBRO: {group.name.toUpperCase()} ({group.expenses.length} {group.expenses.length === 1 ? 'ÍTEM' : 'ÍTEMS'})
                            </td>
                            <td colSpan={2} className="px-2 py-1 text-right font-mono font-black text-[9px] text-slate-900">
                              SUBTOTAL RUBRO: {formatCLP(group.total)}
                            </td>
                          </tr>
                          {group.expenses.map((exp, idx) => (
                            <tr key={exp.id || idx} className="hover:bg-slate-50">
                              <td className="px-1.5 py-1 border-r border-slate-200 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="px-2 py-1 border-r border-slate-200 font-mono whitespace-nowrap text-slate-700">{exp.date}</td>
                              <td className="px-2 py-1 border-r border-slate-200 font-mono whitespace-nowrap text-slate-800 font-semibold">
                                {exp.documentType} #{exp.documentNumber || 'S/N'}
                              </td>
                              <td className="px-2 py-1 border-r border-slate-200 text-slate-800">
                                <span className="font-bold">{exp.provider}</span>
                                {exp.providerRut && <span className="font-mono text-[8px] text-slate-500 block">{exp.providerRut}</span>}
                              </td>
                              <td className="px-2 py-1 border-r border-slate-200 text-slate-700">
                                <div className="truncate max-w-[210px]">{exp.description}</div>
                                {exp.fundSource === 'fondo_reserva' && (
                                  <span className="text-[8px] font-bold text-amber-800">[Fondo Reserva]</span>
                                )}
                              </td>
                              <td className="px-1.5 py-1 border-r border-slate-200 text-center whitespace-nowrap">
                                <span className={`px-1 py-0.5 text-[8px] font-bold rounded ${
                                  exp.status === 'pagado' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {exp.status === 'pagado' ? 'PAGADO' : 'DEVENGADO'}
                                </span>
                              </td>
                              <td className="px-2 py-1 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                {formatCLP(exp.amount)}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                      <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                        <td colSpan="6" className="px-2 py-1 text-right uppercase text-[9px]">TOTAL CONSOLIDADO RENDICIÓN:</td>
                        <td className="px-2 py-1 text-right font-mono text-[10px] text-slate-900 font-bold">{formatCLP(grandTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Certificación y Declaración Jurada */}
                <div className="border border-slate-300 p-2 bg-slate-50 text-[8.5px] text-slate-700 leading-tight space-y-0.5">
                  <div className="font-bold uppercase text-slate-900 text-[8px]">III. DECLARACIÓN JURADA DE CUMPLIMIENTO LEGAL:</div>
                  <div>
                    Se certifica que el personal dependiente cuenta con imposiciones previsionales canceladas en conformidad al Art. 18° de la Ley 21.442 mediante planillas Previred certificadas. Los documentos tributarios cuentan con validación electrónica ante el Servicio de Impuestos Internos (SII).
                  </div>
                </div>

                {/* Firmas de Auditoría con Espacio Adecuado */}
                <div className="pt-6 pb-2 grid grid-cols-3 gap-6 text-center text-[9px]">
                  <div className="flex flex-col items-center">
                    <div className="h-20 print:h-16 w-full flex items-center justify-center mb-2">
                      <div className="w-full max-w-[125px] h-14 print:h-12 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center text-[8px] text-slate-500 bg-slate-50/50">
                        <span className="font-bold">Firma y Timbre</span>
                        <span className="text-[7px]">Auditoría / Adm.</span>
                      </div>
                    </div>
                    <div className="w-full border-t-2 border-slate-700 pt-1.5 space-y-0.5">
                      <div className="font-bold text-slate-900">ARANPRO GESTIÓN INMOBILIARIA</div>
                      <div className="text-[8px] text-slate-600">Administrador • Reg. MINVU N° 44.201</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-20 print:h-16 w-full flex items-center justify-center mb-2">
                      <div className="w-full max-w-[125px] h-14 print:h-12 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center text-[8px] text-slate-500 bg-slate-50/50">
                        <span className="font-bold">Firma y Timbre</span>
                        <span className="text-[7px]">Rep. Legal</span>
                      </div>
                    </div>
                    <div className="w-full border-t-2 border-slate-700 pt-1.5 space-y-0.5">
                      <div className="font-bold text-slate-900">COMITÉ DE ADMINISTRACIÓN</div>
                      <div className="text-[8px] text-slate-600">Presidente / Representante Legal</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-20 print:h-16 w-full flex items-center justify-center mb-2">
                      <div className="w-full max-w-[125px] h-14 print:h-12 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center text-[8px] text-slate-500 bg-slate-50/50">
                        <span className="font-bold">Firma y Timbre</span>
                        <span className="text-[7px]">Revisión Conforme</span>
                      </div>
                    </div>
                    <div className="w-full border-t-2 border-slate-700 pt-1.5 space-y-0.5">
                      <div className="font-bold text-slate-900">COMISIÓN REVISORA DE CUENTAS</div>
                      <div className="text-[8px] text-slate-600">Revisión y Visación Conforme</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* FORMATO 3: 🌟 MODERNO VECINAL (COMUNIDADFELIZ) */}
            {/* ======================================================== */}
            {expenseReportTemplate === 'moderno' && (
              <div className="space-y-3 font-sans">
                {/* Banner Superior Verde Bosque con Isotipo AP y Dorado */}
                <div className="bg-[#0F3D2E] text-white p-2.5 rounded-xl border-b-2 border-[#D4B895] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img 
                      src="/brand/ARANPRO_isotipo_trimmed.png" 
                      alt="AP" 
                      className="h-8 w-auto brightness-0 invert object-contain"
                    />
                    <div>
                      <h1 className="text-xs font-black tracking-wide text-white uppercase">
                        Rendición Mensual de Gastos para la Comunidad
                      </h1>
                      <p className="text-[9.5px] text-[#D4B895]">
                        {community.name} • Cuentas Claras y Transparentes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-white/70 block uppercase font-bold">Mes de Rendición</span>
                    <span className="text-[10px] font-black text-[#D4B895]">
                      {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* 3 Destacados Clave para el Vecino */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-[#F5F4EF] border border-[#D4B895]/50">
                    <span className="text-[8.5px] uppercase font-bold text-slate-600 block">Total Invertido en la Comunidad</span>
                    <span className="text-xs font-black text-[#0F3D2E] block">{formatCLP(grandTotal)}</span>
                    <span className="text-[8px] text-slate-500 font-semibold">{allExpenses.length} comprobantes respaldados</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F5F4EF] border border-[#D4B895]/50">
                    <span className="text-[8.5px] uppercase font-bold text-slate-600 block">Gasto Promedio por Unidad</span>
                    <span className="text-xs font-black text-[#0F3D2E] block">
                      {formatCLP(Math.round(grandTotal / (community.units?.length || 1)))}
                    </span>
                    <span className="text-[8px] text-slate-500 font-semibold">{community.units?.length || 0} departamentos / casas</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F5F4EF] border border-[#D4B895]/50">
                    <span className="text-[8.5px] uppercase font-bold text-slate-600 block">Fondo de Reserva Protegido</span>
                    <span className="text-xs font-black text-amber-800 block">{formatCLP(totalReserve)}</span>
                    <span className="text-[8px] text-slate-500 font-semibold">Art. 14 Ley 21.442</span>
                  </div>
                </div>

                {/* Distribución Gráfica Visual de Gastos */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[9.5px] font-bold text-[#0F3D2E] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>¿En qué se usaron los fondos de nuestro condominio este mes?</span>
                    <span className="text-[8px] text-slate-500 font-normal">Clasificación Ley N° 21.442</span>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(catMap).map(([cat, data]) => {
                      const pctNumber = grandTotal > 0 ? (data.amount / grandTotal) * 100 : 0;
                      return (
                        <div key={cat} className="space-y-0.5">
                          <div className="flex justify-between text-[8.5px]">
                            <span className="font-semibold text-slate-700">{cat}</span>
                            <span className="font-bold text-slate-900">{formatCLP(data.amount)} ({pctNumber.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${data.isReserve ? 'bg-amber-600' : 'bg-[#0F3D2E]'}`}
                              style={{ width: `${Math.min(100, Math.max(3, pctNumber))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tabla Amigable para Vecinos */}
                <div>
                  <div className="text-[9.5px] font-bold text-[#0F3D2E] uppercase tracking-wider mb-1">
                    Detalle de Pagos y Comprobantes para Revisión de los Vecinos
                  </div>
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-[#0F3D2E]/10 text-[#0F3D2E] font-bold text-[8.5px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-2 py-1">Fecha</th>
                        <th className="px-2 py-1">Proveedor / Servicio</th>
                        <th className="px-2 py-1">¿En qué se gastó?</th>
                        <th className="px-2 py-1">N° Comprobante</th>
                        <th className="px-2 py-1 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[9px]">
                      {reportGroupedExpenses.map(group => (
                        <React.Fragment key={`pdf-mod-grp-${group.name}`}>
                          <tr className="bg-[#0F3D2E]/10 border-t border-b border-[#0F3D2E]/25 text-[#0F3D2E] font-bold">
                            <td colSpan={3} className="px-2 py-1 text-[8.5px] uppercase font-black tracking-wider">
                              📁 {group.name} ({group.expenses.length} {group.expenses.length === 1 ? 'pago' : 'pagos'})
                            </td>
                            <td colSpan={2} className="px-2 py-1 text-right font-black text-[9px] text-[#0F3D2E]">
                              Subtotal: {formatCLP(group.total)}
                            </td>
                          </tr>
                          {group.expenses.map((exp, idx) => (
                            <tr key={exp.id || idx}>
                              <td className="px-2 py-1 whitespace-nowrap text-slate-600 font-mono">{exp.date}</td>
                              <td className="px-2 py-1 font-bold text-slate-800">{exp.provider}</td>
                              <td className="px-2 py-1 text-slate-700">
                                <span className="truncate max-w-[220px] block">{exp.description}</span>
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-slate-600 font-mono">
                                {exp.documentType} {exp.documentNumber || 'S/N'}
                              </td>
                              <td className="px-2 py-1 text-right font-black text-slate-900 whitespace-nowrap font-mono">
                                {formatCLP(exp.amount)}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                      <tr className="bg-[#F5F4EF] font-black text-[#0F3D2E] border-t-2 border-[#D4B895]">
                        <td colSpan={4} className="px-2 py-1 text-right uppercase text-[9px]">TOTAL GASTOS DEL MES:</td>
                        <td className="px-2 py-1 text-right font-black text-[9.5px] font-mono">{formatCLP(grandTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Sello de Confianza y Firmas Vecinales con Espacio Adecuado */}
                <div className="pt-6 pb-2 grid grid-cols-2 gap-10 text-center text-[9.5px]">
                  <div className="flex flex-col items-center">
                    <div className="h-20 print:h-16 w-full flex items-center justify-center mb-2">
                      <div className="w-full max-w-[150px] h-14 print:h-12 border-2 border-dashed border-[#0F3D2E]/30 rounded-xl flex flex-col items-center justify-center text-[9px] text-[#0F3D2E]/70 bg-emerald-50/30">
                        <span className="font-bold">Firma y Timbre</span>
                        <span className="text-[7.5px]">Administración ARANPRO</span>
                      </div>
                    </div>
                    <div className="w-full border-t-2 border-[#0F3D2E] pt-1.5 space-y-0.5">
                      <div className="font-bold text-[#0F3D2E]">ARANPRO GESTIÓN INMOBILIARIA</div>
                      <div className="text-[8.5px] text-slate-600">Administración Responsable • Reg. MINVU N° 44.201</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-20 print:h-16 w-full flex items-center justify-center mb-2">
                      <div className="w-full max-w-[150px] h-14 print:h-12 border-2 border-dashed border-[#0F3D2E]/30 rounded-xl flex flex-col items-center justify-center text-[9px] text-[#0F3D2E]/70 bg-emerald-50/30">
                        <span className="font-bold">Firma y Timbre</span>
                        <span className="text-[7.5px]">Comité Copropietarios</span>
                      </div>
                    </div>
                    <div className="w-full border-t-2 border-[#0F3D2E] pt-1.5 space-y-0.5">
                      <div className="font-bold text-slate-900">COMITÉ DE COPROPIETARIOS</div>
                      <div className="text-[8.5px] text-slate-600">Representación de la Comunidad • Ley N° 21.442</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Docked */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200 shrink-0 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-colors cursor-pointer"
          >
            ← Cerrar Rendición
          </button>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              CSV / Excel
            </button>
            <button
              type="button"
              onClick={() => printDocumentDirectly('expense-rendition-printable-doc', `Rendicion_Gastos_${cleanComm}_${expenseReportTemplate}`, { fitPage: true })}
              className="px-4 py-2 bg-[#0F3D2E] hover:bg-[#0A291F] text-white border border-[#D4B895] font-black rounded-xl flex items-center shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-[#D4B895]" />
              🖨️ Imprimir / Guardar PDF (1 Pág)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
