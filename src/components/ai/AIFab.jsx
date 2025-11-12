import { useEffect, useMemo, useRef, useState } from "react";
import { geminiIntentFromText, localIntentFromText } from "../../ai/geminiClient";
import {
  exportReporteExcel,
  exportReportePDF,
  getMixPago,
  getPronosticoVentas,
  getReporteResumen,
  getStockBajo,
  getTopProductos,
  getVentasPorDia,
} from "../../api";

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z"></path>
    <path d="M19 11a7 7 0 01-14 0H3a9 9 0 0018 0h-2zM12 19v4m-4 0h8" stroke="currentColor" strokeWidth="2" fill="none"></path>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M22 2L11 13"></path>
    <path d="M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="currentColor" strokeWidth="2"></path>
  </svg>
);

export default function AIFab() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [logs, setLogs] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [lastIntent, setLastIntent] = useState(null);
  const [result, setResult] = useState(null); // { type, data }
  const [showAll, setShowAll] = useState(false);
  
  // Posición del contenedor completo (FAB + panel se mueven juntos)
  const [containerPos, setContainerPos] = useState(() => ({ x: 0, y: 0 }));
  const dragState = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0, hasMoved: false });
  const clickHandledRef = useRef(false); // Para evitar doble toggle
  const lastResultRef = useRef(null); // Para trackear el último resultado procesado
  const userClosedRef = useRef(false); // Para saber si el usuario cerró manualmente
  const recRef = useRef(null);
  const finalRef = useRef("");
  const listeningRef = useRef(false);
  const taRef = useRef(null);

  // Abrir panel automáticamente solo cuando hay un NUEVO resultado (no uno que ya existía)
  useEffect(() => {
    if (result && result !== lastResultRef.current && !userClosedRef.current) {
      lastResultRef.current = result;
      setOpen(true);
    }
  }, [result]); // Solo depende de result, no de open

  // Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => {
      listeningRef.current = true;
      setListening(true);
      try {
        if (taRef.current) {
          taRef.current.focus();
          const len = taRef.current.value.length;
          // sitúa el cursor al final para que el dictado continúe ahí
          taRef.current.setSelectionRange(len, len);
        }
      } catch {}
    };
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        let transcript = event.results[i][0].transcript.toLowerCase().trim();
        // comandos básicos
        transcript = transcript.replace(/\bcoma\b/g, ",").replace(/\bpunto\b/g, ".");
        transcript = transcript.replace(/\babrir pregunta\b/g, "¿").replace(/\bcerrar pregunta\b/g, "?");
        if (/\bborrar todo\b/.test(transcript)) {
          finalRef.current = "";
          transcript = transcript.replace(/\bborrar todo\b/g, "");
        } else if (/\bborrar\b/.test(transcript)) {
          const words = finalRef.current.trim().split(" ");
          words.pop();
          finalRef.current = words.join(" ");
          transcript = transcript.replace(/\bborrar\b/g, "");
        }
        if (event.results[i].isFinal) {
          finalRef.current += (finalRef.current ? " " : "") + transcript;
        } else {
          interim += transcript;
        }
      }
      setInterim(interim);
      setText(finalRef.current);
    };
    recognition.onerror = () => {
      // No auto-reiniciar; mantener control manual del usuario
      setListening(false);
      listeningRef.current = false;
    };
    recognition.onend = () => {
      // Fin de sesión; no auto-reiniciar para evitar múltiples clics
      setListening(false);
      listeningRef.current = false;
    };
    recRef.current = recognition;
    return () => {
      try {
        recognition.abort();
      } catch {}
    };
  }, []);

  const toggleMic = () => {
    const rec = recRef.current;
    if (!rec) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }
    if (listening) {
      // consolidar el interino antes de parar
      listeningRef.current = false;
      const combined = (finalRef.current + (interim ? " " + interim : "")).trim();
      finalRef.current = combined;
      setText(combined);
      setListening(false);
      setInterim("");
      try {
        rec.stop();
      } catch {}
      try {
        rec.abort();
      } catch {}
    } else {
      // mantener el texto actual y continuar dictado al final
      finalRef.current = (taRef.current?.value ?? text) || "";
      setInterim("");
      listeningRef.current = true; // queremos iniciar
      // solicitar permiso de micrófono explícitamente
      const ensurePerm = navigator.mediaDevices?.getUserMedia
        ? navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null)
        : Promise.resolve(null);
      ensurePerm.finally(() => {
        // Si el usuario canceló mientras pedíamos permiso, no iniciar
        if (!listeningRef.current) return;
        setListening(true);
        try {
          rec.abort();
        } catch {}
        try {
          rec.start();
          // llevar el foco al textarea
          try {
            if (taRef.current) {
              taRef.current.focus();
              const len = taRef.current.value.length;
              taRef.current.setSelectionRange(len, len);
            }
          } catch {}
        } catch (e) {
          setListening(false);
          listeningRef.current = false;
        }
      });
    }
  };

  // Drag handlers - mueven el contenedor completo (FAB + panel juntos)
  const onDragStartAny = (e) => {
    try {
      e.preventDefault();
      e.stopPropagation();
    } catch {}
    clickHandledRef.current = false; // Reset flag al inicio
    dragState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: containerPos.x,
      baseY: containerPos.y,
      hasMoved: false, // para detectar si fue drag o click
    };
    try {
      e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };
  const onDragMoveAny = (e) => {
    if (!dragState.current.active) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    // Si se movió más de 5px, es un drag
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragState.current.hasMoved = true;
    }
    setContainerPos({ x: dragState.current.baseX + dx, y: dragState.current.baseY + dy });
  };
  const onDragEndAny = (e) => {
    if (!dragState.current.active) return;
    const wasDrag = dragState.current.hasMoved;
    const wasClick = !wasDrag && !clickHandledRef.current;
    
    dragState.current.active = false;
    try {
      e.currentTarget.releasePointerCapture && e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    
    // Si NO fue un drag, fue un click - toggle el panel
    if (wasClick) {
      clickHandledRef.current = true;
      setOpen(prev => {
        const newState = !prev;
        // Si se está abriendo el panel, resetear el flag para permitir auto-abrir con nuevos resultados
        if (newState) {
          userClosedRef.current = false;
        }
        return newState;
      });
      // Reset después de un pequeño delay
      setTimeout(() => {
        clickHandledRef.current = false;
        dragState.current.hasMoved = false;
      }, 100);
    } else {
      // Si fue un drag, reset inmediato
      dragState.current.hasMoved = false;
      clickHandledRef.current = false;
    }
    
    // Si fue un drag, cancelar el click
    if (wasDrag) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  async function executeIntent(intent, originalQuery = "", geminiMessage = null) {
    const pushLog = (m) => setLogs((prev) => [{ ts: new Date().toLocaleTimeString(), m }, ...prev].slice(0, 20));
    setLastIntent(intent);
    setProcessing(true);
    setResult(null);
    const a = (intent?.accion || "").toLowerCase();
    const r = (intent?.recurso || "").toLowerCase();
    const p = intent?.params || {};
    
    // Validar que el intent sea válido
    const recursosValidos = ["resumen", "ventas_por_dia", "top_productos", "mix_pago", "stock_bajo", "pronostico_ventas"];
    const accionesValidas = ["reporte", "exportar", "pronostico"];
    
    if (!a || !accionesValidas.includes(a)) {
      setProcessing(false);
      setResult({ 
        type: "error", 
        data: { message: `Acción "${a}" no es válida. Acciones válidas: ${accionesValidas.join(", ")}` } 
      });
      return;
    }
    
    if (!r || !recursosValidos.includes(r)) {
      setProcessing(false);
      setResult({ 
        type: "error", 
        data: { message: `Recurso "${r}" no es válido. Recursos válidos: ${recursosValidos.join(", ")}` } 
      });
      return;
    }
    
    // Usar mensaje de Gemini si está disponible, sino generar uno automático
    const getMessage = () => {
      if (geminiMessage) {
        return geminiMessage;
      }
      // Fallback: generar mensaje descriptivo basado en el intent
      return generateMessage();
    };
    
    // Generar mensaje descriptivo basado en el intent (fallback)
    const generateMessage = () => {
      if (r === "top_productos") {
        const order = p.order === "asc" ? "menos vendid" : "más vendid";
        const metric = p.metric === "monto" ? "por monto" : "por unidades";
        return `Aquí están los productos ${order}os ${metric}.`;
      }
      if (r === "ventas_por_dia") {
        const dias = p.dias || 30;
        return `Ventas por día de los últimos ${dias} días.`;
      }
      if (r === "mix_pago") {
        return "Distribución de pagos por tipo (efectivo, crédito, etc.).";
      }
      if (r === "stock_bajo") {
        const umbral = p.umbral || 5;
        return `Productos con stock bajo (≤${umbral} unidades).`;
      }
      if (a === "exportar") {
        return `Generando reporte en formato ${p.formato?.toUpperCase() || "PDF"}...`;
      }
      return "Aquí tienes el resumen de ventas de la boutique.";
    };
    if (a === "exportar") {
      const formato = (p.formato || "pdf").toLowerCase();
      const recurso = r || "resumen";
      
      // Construir nombre de archivo según el tipo de reporte
      let nombreArchivo = `reporte_${recurso}`;
      if (p.start && p.end) {
        nombreArchivo += `_${p.start}_${p.end}`;
      } else if (p.start) {
        nombreArchivo += `_desde_${p.start}`;
      } else if (p.end) {
        nombreArchivo += `_hasta_${p.end}`;
      }
      if (p.dias) {
        nombreArchivo += `_${p.dias}dias`;
      }
      nombreArchivo += formato === "excel" ? ".xlsx" : ".pdf";
      
      try {
        let res;
        if (formato === "excel") {
          res = await exportReporteExcel(recurso, p);
        } else {
          res = await exportReportePDF(recurso, p);
        }
        const ctype = res.headers["content-type"] || "";
        const blob = new Blob([res.data], { type: ctype || (formato === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf") });
        const url = URL.createObjectURL(blob);
        const aEl = document.createElement("a");
        aEl.href = url;
        aEl.download = nombreArchivo;
        aEl.click();
        URL.revokeObjectURL(url);
        pushLog(`Exporté ${formato.toUpperCase()} (${recurso})`);
        setResult({ type: "export", data: { formato, recurso }, message: getMessage() });
        setProcessing(false);
        return;
      } catch (e) {
        pushLog(`Error exportando ${formato}: " + e.message`);
        setProcessing(false);
        return;
      }
    }
    // Reportes
    if (r === "ventas_por_dia") {
      const dias = parseInt(p.dias || 30, 10);
      const opts = {};
      if (p.start && p.end) {
        opts.start = p.start;
        opts.end = p.end;
      }
      const data = await getVentasPorDia(dias, opts);
      const label = p.start && p.end 
        ? `Ventas del ${p.start} al ${p.end}` 
        : `Ventas por día (${dias} días)`;
      pushLog(`${label} -> ${data.length} puntos`);
      setResult({ type: "serie", data: { dias, puntos: data }, message: getMessage() });
      setProcessing(false);
      return;
    }
    if (r === "top_productos") {
      const metric = (p.metric || "unidades").toLowerCase();
      const opts = {};
      if (p.season) opts.season = p.season;
      if (p.year) opts.year = p.year;
      if (p.month) opts.month = p.month;
      if (p.start) opts.start = p.start;
      if (p.end) opts.end = p.end;
      if (p.canal) opts.canal = p.canal;
      if (p.categoria) opts.categoria = p.categoria;
      if (p.order) opts.order = p.order;
      if (p.exclude) opts.exclude = Array.isArray(p.exclude) ? p.exclude.join(",") : p.exclude;
      if (p.min_monto) opts.min_monto = p.min_monto;
      if (p.max_monto) opts.max_monto = p.max_monto;
      if (p.min_precio_unitario) opts.min_precio_unitario = p.min_precio_unitario;
      if (p.max_precio_unitario) opts.max_precio_unitario = p.max_precio_unitario;
      
      console.log("[AI] Top Productos - Enviando params al backend:", { metric, ...opts });
      const data = await getTopProductos(20, metric, opts);
      console.log("[AI] Top Productos - Respuesta del backend:", data.length, "items");
      pushLog(`Top productos (${metric}) -> ${data.length} items`);
      setResult({
        type: "top",
        data: {
          metric,
          items: data,
          context: { season: p.season, year: p.year, month: p.month, start: p.start, end: p.end, canal: p.canal, categoria: p.categoria, order: p.order },
        },
        message: getMessage(),
      });
      setProcessing(false);
      return;
    }
    if (r === "mix_pago") {
      const data = await getMixPago();
      pushLog(`Mix pago -> ${data.length} items`);
      setResult({ type: "mix", data, message: getMessage() });
      setProcessing(false);
      return;
    }
    if (r === "stock_bajo") {
      const umbral = parseInt(p.umbral || 5, 10);
      const data = await getStockBajo(umbral, 20);
      pushLog(`Stock bajo (<=${umbral}) -> ${data.length} items`);
      setResult({ type: "stock_bajo", data: { umbral, items: data }, message: getMessage() });
      setProcessing(false);
      return;
    }
    if (a === "pronostico" || r === "pronostico_ventas") {
      const fecha = p.fecha || null;
      const data = await getPronosticoVentas(fecha);
      pushLog(`Pronóstico para ${data.fecha_pronostico} (${data.dia_semana}) -> ${data.productos.length} productos`);
      setResult({
        type: "pronostico",
        data: {
          fecha: data.fecha_pronostico,
          dia_semana: data.dia_semana,
          productos: data.productos,
          total: data.total_productos
        },
        message: getMessage(),
      });
      setProcessing(false);
      return;
    }
    // resumen por defecto
    try {
      const resumen = await getReporteResumen();
      pushLog(`Resumen -> total ${resumen.ventas?.total ?? "0"}`);
      setResult({ 
        type: "resumen", 
        data: resumen,
        message: getMessage()
      });
      setProcessing(false);
    } catch (e) {
      setProcessing(false);
      setResult({ type: "error", data: { message: e.message || "Error obteniendo resumen" } });
      throw e; // Re-lanzar para que send lo capture
    }
  }

  const send = async () => {
    const msg = (text + " " + interim).trim();
    if (!msg) return;
    
    // Limpiar estados
    setInterim("");
    setResult(null);
    setProcessing(true);
    userClosedRef.current = false; // Resetear flag para permitir auto-abrir con nuevo resultado
    
    // 1) Intentar con Gemini primero (prioridad)
    let intent = null;
    let geminiMessage = null; // Mensaje en lenguaje natural de Gemini
    let geminiFunciono = false;
    try {
      console.log("[AI] 🔵 Intentando con Gemini...");
      const geminiResponse = await geminiIntentFromText(msg);
      console.log("[AI] 🔵 Gemini devolvió:", geminiResponse);
      
      // Manejar nuevo formato {intent: {...}, message: "..."} o formato viejo directo
      if (geminiResponse.intent !== undefined) {
        intent = geminiResponse.intent; // Puede ser null si es solo conversación
        geminiMessage = geminiResponse.message || null;
      } else {
        intent = geminiResponse;
      }
      
      // Si intent es null, es solo conversación - mostrar mensaje y no ejecutar acción
      if (intent === null) {
        geminiFunciono = true;
        console.log("[AI] ✅ Gemini: Solo conversación, no ejecutar acción. Message:", geminiMessage);
        setProcessing(false);
        setResult({ 
          type: "conversacion", 
          data: {}, 
          message: geminiMessage || "¡Hola! ¿En qué puedo ayudarte?" 
        });
        return; // No ejecutar ninguna acción, solo mostrar el mensaje
      }
      
      // Validar que el intent tenga la estructura correcta
      if (intent && typeof intent === "object" && intent.recurso && intent.role !== "model") {
        geminiFunciono = true;
        console.log("[AI] ✅ Gemini funcionó correctamente. Intent:", intent, "Message:", geminiMessage);
      } else {
        console.log("[AI] ⚠️ Gemini devolvió intent inválido:", intent);
        intent = null;
        geminiMessage = null;
      }
    } catch (e) {
      // Gemini falló, continuar con parser local
      console.log("[AI] ❌ Gemini falló:", e.message);
      intent = null;
      geminiMessage = null;
    }
    
    // 2) Si Gemini no funcionó, usar parser local como fallback
    if (!geminiFunciono && (!intent || !intent.recurso)) {
      console.log("[AI] 🔄 Usando parser local como fallback");
      intent = localIntentFromText(msg);
      console.log("[AI] 🔄 Parser local devolvió:", intent);
    }
    
    // 3) Heurística: solo si Gemini no funcionó, aplicar reglas locales
    // Si Gemini funcionó, confiar en su respuesta
    if (!geminiFunciono) {
      const hint = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (hint.includes("mas vendid") || hint.includes("top producto") || hint.includes("mas popular")) {
        if (!intent) intent = {};
        intent.accion = "reporte";
        intent.recurso = "top_productos";
        if (!intent.params) intent.params = {};
        if (!intent.params.metric) intent.params.metric = "unidades";
        if (!intent.params.order) intent.params.order = "desc";
      } else if (hint.includes("menos vendid") || hint.includes("menos popular") || hint.includes("peor vendid")) {
        if (!intent) intent = {};
        intent.accion = "reporte";
        intent.recurso = "top_productos";
        if (!intent.params) intent.params = {};
        if (!intent.params.metric) intent.params.metric = "unidades";
        if (!intent.params.order) intent.params.order = "asc";
      }
    }
    
    try {
      await executeIntent(intent, msg, geminiMessage);
      setShowAll(false);
    } catch (e) {
      setLogs((prev) => [{ ts: new Date().toLocaleTimeString(), m: `Error: ${e.message || "Error ejecutando intención"}` }, ...prev]);
      setProcessing(false);
      setResult({ type: "error", data: { message: e.message || "Error ejecutando intención" } });
    }
  };


  return (
    // Contenedor que agrupa FAB + panel, se mueve como una unidad
    // Posición inicial: más arriba para no tapar el carrito (que está en bottom-6 right-6)
    <div className="fixed bottom-24 right-6 z-50" style={{ transform: `translate(${containerPos.x}px, ${containerPos.y}px)` }}>
      {/* Botón FAB arrastrable */}
      <button
        onPointerDown={onDragStartAny}
        onPointerMove={onDragMoveAny}
        onPointerUp={onDragEndAny}
        onPointerCancel={onDragEndAny}
        className="w-14 h-14 rounded-full shadow-2xl grid place-items-center cursor-grab active:cursor-grabbing"
        style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        title="IA"
        type="button"
      >
        IA
      </button>
      
      {/* Panel que aparece arriba del FAB (relativo al contenedor) */}
      {open && (
        <div
          className="absolute bottom-16 right-0 w-[360px] max-w-[90vw] bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden"
          style={{ backdropFilter: "blur(6px)" }}
        >
          <div
            className="px-4 py-3 border-b border-gray-200 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
            onPointerDown={onDragStartAny}
            onPointerMove={onDragMoveAny}
            onPointerUp={onDragEndAny}
            onPointerCancel={onDragEndAny}
          >
            <div className="font-medium flex items-center gap-2">
              Asistente IA
              {listening && (
                <span className="inline-flex items-end gap-0.5" title="Grabando">
                  <span className="w-1 h-3 bg-red-500 animate-pulse" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1 h-4 bg-red-500 animate-pulse" style={{ animationDelay: "120ms" }}></span>
                  <span className="w-1 h-5 bg-red-500 animate-pulse" style={{ animationDelay: "240ms" }}></span>
                  <span className="w-1 h-4 bg-red-500 animate-pulse" style={{ animationDelay: "360ms" }}></span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMic}
                className={`px-3 py-1 rounded-md text-sm ${listening ? "bg-red-600 text-white" : "btn-accent-outline"}`}
              >
                <span className="inline-flex items-center gap-2">
                  <MicIcon /> {listening ? "Grabando..." : "Voz"}
                </span>
              </button>
              <button
                onClick={() => {
                  userClosedRef.current = true; // Marcar que el usuario cerró manualmente
                  setOpen(false);
                }}
                className="px-3 py-1 rounded-md text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <textarea
              rows={3}
              value={text + (interim ? " " + interim : "")}
              onChange={(e) => {
                setText(e.target.value);
                setInterim("");
                finalRef.current = e.target.value;
              }}
              ref={taRef}
              placeholder='Ej.: "exportar pdf", "ventas por día 30", "producto más vendido por monto", "stock bajo umbral 5"'
              className="w-full border border-gray-300 px-3 py-2 focus-accent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <div className="flex items-center justify-end">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  send();
                }} 
                className="btn-accent px-4 py-2 inline-flex items-center gap-2" 
                disabled={processing}
                type="button"
              >
                <SendIcon /> {processing ? "Procesando..." : "Enviar"}
              </button>
            </div>
            {/* Resultado con scroll y ver más */}
            {processing && <div className="text-sm text-gray-500">Procesando…</div>}
            {!processing && result && (
              <div className="border-t border-gray-200 pt-4 mt-4 text-sm space-y-3 max-h-[50vh] min-h-[100px] overflow-y-auto pr-1" style={{ minHeight: "100px" }}>
                {result.type === "conversacion" && (
                  <div className="text-gray-700 italic">
                    {result.message}
                  </div>
                )}
                {result.type === "resumen" && (
                  <div className="space-y-2">
                    <div className="font-semibold text-base text-gray-900">📊 Resumen de ventas</div>
                    {result.message && (
                      <div className="text-sm text-gray-600 italic">{result.message}</div>
                    )}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-gray-900">Bs. {Number(result.data?.ventas?.total || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cantidad de ventas:</span>
                        <span className="font-semibold text-gray-900">{result.data?.ventas?.count || 0}</span>
                      </div>
                      {result.data?.ventas?.promedio && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Promedio:</span>
                          <span className="font-semibold text-gray-900">Bs. {Number(result.data.ventas.promedio).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    {result.data?.canales && result.data.canales.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-700 mb-2">Canales:</div>
                        <ul className="space-y-1">
                          {result.data.canales.map((c, i) => (
                            <li key={i} className="text-gray-600">
                              {c.canal}: {c.count} ventas
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.data?.tipos_pago && result.data.tipos_pago.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-700 mb-2">Tipos de pago:</div>
                        <ul className="space-y-1">
                          {result.data.tipos_pago.map((tp, i) => (
                            <li key={i} className="text-gray-600">
                              {tp.tipo_pago}: Bs. {Number(tp.total || 0).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {result.type === "serie" && (
                  <div>
                    {result.message && (
                      <div className="text-sm text-gray-600 italic mb-2">{result.message}</div>
                    )}
                    Ventas por día (últimos {result.data.dias}): {result.data.puntos.length} puntos
                  </div>
                )}
                {result.type === "top" && (
                  <div>
                    {result.message && (
                      <div className="text-sm text-gray-600 italic mb-2">{result.message}</div>
                    )}
                    <div className="font-medium">
                      Top productos ({result.data.metric}
                      {result.data.context?.season ? `, ${result.data.context.season}` : ""}
                      {result.data.context?.month ? `, mes ${result.data.context.month}` : ""}
                      {result.data.context?.year ? `, ${result.data.context.year}` : ""}
                      {result.data.context?.start ? `, desde ${result.data.context.start}` : ""}
                      {result.data.context?.end ? `, hasta ${result.data.context.end}` : ""}
                      )
                    </div>
                    {Array.isArray(result.data.items) && result.data.items.length > 0 && (
                      <div className="mb-1">
                        {(() => {
                          const top = result.data.items[0];
                          const nombre = top["producto_variante__producto__nombre"] || "—";
                          const valor = top.valor || top.unidades || top["unidades"] || 0;
                          return (
                            <span>
                              {result.data.context?.order === "asc" ? "La prenda menos vendida" : "La prenda más vendida"}
                              {result.data.context?.season ? ` en ${result.data.context.season}` : ""}
                              {result.data.context?.month ? ` (mes ${result.data.context.month})` : ""}
                              {result.data.context?.year ? ` de ${result.data.context.year}` : ""} es <b>{nombre}</b> con <b>{valor}</b> {result.data.metric === "monto" ? "Bs." : "unidades"}.
                            </span>
                          );
                        })()}
                      </div>
                    )}
                    <ul className="list-disc ml-5">
                      {(showAll ? result.data.items : result.data.items.slice(0, 20)).map((it, i) => (
                        <li key={i}>{it["producto_variante__producto__nombre"]} — {it.valor || it.unidades || it["unidades"] || ""}</li>
                      ))}
                    </ul>
                    {result.data.items.length > 20 && (
                      <button className="mt-2 text-xs link-accent" onClick={() => setShowAll((v) => !v)}>
                        {showAll ? "Ver menos" : `Ver todos (${result.data.items.length})`}
                      </button>
                    )}
                  </div>
                )}
                {result.type === "mix" && (
                  <div>
                    {result.message && (
                      <div className="text-sm text-gray-600 italic mb-2">{result.message}</div>
                    )}
                    <div className="font-medium">Mix de pago</div>
                    {Array.isArray(result.data) && result.data.length > 0 && (
                      <div className="mb-1">
                        {(() => {
                          const top = [...result.data].sort((a,b) => (b.total||0) - (a.total||0))[0];
                          return <span>Predomina <b>{top.tipo_pago}</b> con Bs. {Number(top.total||0).toFixed(2)}.</span>;
                        })()}
                      </div>
                    )}
                    <ul className="list-disc ml-5">
                      {result.data.map((it, i) => (
                        <li key={i}>{it.tipo_pago}: Bs. {Number(it.total || 0).toFixed(2)} ({it.count})</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.type === "stock_bajo" && (
                  <div>
                    {result.message && (
                      <div className="text-sm text-gray-600 italic mb-2">{result.message}</div>
                    )}
                    <div className="font-medium">Stock bajo (≤{result.data.umbral})</div>
                    <div className="mb-1">Hay {result.data.items.length} productos con bajo stock.</div>
                    <ul className="list-disc ml-5">
                      {(showAll ? result.data.items : result.data.items.slice(0, 20)).map((it, i) => (
                        <li key={i}>{it["producto_variante__producto__nombre"]} — {it.total_unidades} u.</li>
                      ))}
                    </ul>
                    {result.data.items.length > 20 && (
                      <button className="mt-2 text-xs link-accent" onClick={() => setShowAll((v) => !v)}>
                        {showAll ? "Ver menos" : `Ver todos (${result.data.items.length})`}
                      </button>
                    )}
                  </div>
                )}
                {result.type === "pronostico" && (
                  <div>
                    {result.message && (
                      <div className="text-sm text-gray-600 italic mb-2">{result.message}</div>
                    )}
                    <div className="font-medium">
                      📈 Pronóstico de ventas para {result.data.fecha} ({result.data.dia_semana})
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Basado en datos históricos del mismo día de la semana
                    </div>
                    {Array.isArray(result.data.productos) && result.data.productos.length > 0 ? (
                      <>
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <div className="text-sm font-semibold mb-2">Productos que probablemente se venderán:</div>
                          <ul className="space-y-2">
                            {(showAll ? result.data.productos : result.data.productos.slice(0, 10)).map((prod, i) => (
                              <li key={i} className="flex items-center justify-between text-sm">
                                <span className="font-medium">{prod.producto_nombre}</span>
                                <div className="text-right">
                                  <span className="font-semibold">{prod.estimacion_unidades} unidades</span>
                                  <span className="text-xs text-gray-500 ml-2">({prod.confianza}% confianza)</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {result.data.productos.length > 10 && (
                          <button className="mt-2 text-xs link-accent" onClick={() => setShowAll((v) => !v)}>
                            {showAll ? "Ver menos" : `Ver todos (${result.data.productos.length})`}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        No hay suficientes datos históricos para generar un pronóstico para esta fecha.
                      </div>
                    )}
                  </div>
                )}
                {result.type === "export" && (
                  <div>
                    {result.message && (
                      <div className="text-sm text-gray-600 italic mb-2">{result.message}</div>
                    )}
                    <div>Descarga iniciada ({result.data.formato.toUpperCase()}).</div>
                  </div>
                )}
                {result.type === "error" && (
                  <div className="text-red-600">
                    <div className="font-medium">Error</div>
                    <div>{result.data?.message || "Error desconocido"}</div>
                  </div>
                )}
              </div>
            )}
            <div className="max-h-40 overflow-auto border-t border-gray-100 pt-2 text-sm">
              {logs.map((l, idx) => (
                <div key={idx} className="py-1 text-gray-700">
                  <span className="text-gray-400 mr-2">{l.ts}</span>
                  {l.m}
                </div>
              ))}
              {logs.length === 0 && <div className="text-gray-400">Sin registros todavía.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


