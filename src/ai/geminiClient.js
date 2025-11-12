// Cliente simple para Google Gemini (AI Studio) usando fetch sin interferir con axios
// Requiere VITE_GEMINI_API_KEY en el entorno.
import { GEMINI_API_KEY, GEMINI_MODEL } from "../config/constants";

// Prompt de sistema para que devuelva JSON con la intención Y una respuesta en lenguaje natural
const SYSTEM_INTENT_PROMPT = `Eres un asistente inteligente de una boutique. Entiendes consultas sobre ventas y productos.
Responde con JSON válido que incluya:
1. "intent": el objeto con la acción a realizar (o null si es solo conversación)
2. "message": una respuesta amigable en lenguaje natural

Formato:
{
  "intent": {
    "accion": "reporte" | "exportar" | "pronostico" | null,
    "recurso": "resumen" | "ventas_por_dia" | "top_productos" | "mix_pago" | "stock_bajo" | "pronostico_ventas" | null,
    "params": {
      "dias": number?,
      "metric": "unidades" | "monto"?,
      "umbral": number?,
      "formato": "pdf" | "excel"?,
      "order": "asc" | "desc"?,
      "categoria": string?,
      "exclude": string?,
      "start": "YYYY-MM-DD"?,
      "end": "YYYY-MM-DD"?,
      "year": number?,
      "month": number?,
      "season": string?,
      "fecha": "YYYY-MM-DD"?
    }
  },
  "message": "Tu respuesta amigable en español"
}

IMPORTANTE:
- Si el usuario solo saluda ("hola", "buenos días", etc.) o hace preguntas generales SIN pedir datos específicos, usa intent: null y responde solo con message de forma conversacional
- Si el usuario pide datos o reportes, entonces sí genera un intent válido

Reglas para el intent (solo si el usuario pide datos):
- "más vendido", "más popular", "top producto" -> recurso="top_productos", metric="unidades", order="desc"
- "menos vendido", "menos popular", "peor producto" -> recurso="top_productos", metric="unidades", order="asc"
- "ropa más vendida", "prenda más vendida" -> recurso="top_productos", metric="unidades", order="desc"
- "ropa menos vendida", "prenda menos vendida" -> recurso="top_productos", metric="unidades", order="asc"
- "del día de hoy", "hoy", "del día" -> params.start y params.end con la fecha actual (usa la fecha del contexto)
- "de ayer", "ayer" -> params.start y params.end con la fecha de ayer (usa la fecha del contexto)
- "últimos N días" -> params.dias=N
- "este mes" -> params.month con el mes actual, params.year con el año actual (usa los valores del contexto)
- "mes pasado" -> params.month con el mes pasado, params.year con el año actual
- "por monto" o "por dinero" -> metric="monto"
- "ventas por día" o "ventas diarias" -> recurso="ventas_por_dia"
- "exportar pdf" o "exportar excel" -> accion="exportar", formato correspondiente
- "mix de pago" -> recurso="mix_pago"
- "stock bajo" -> recurso="stock_bajo"
- "pronóstico", "qué se venderá", "qué productos se venderán", "predecir ventas" -> accion="pronostico", recurso="pronostico_ventas", params.fecha con la fecha objetivo (si no se menciona, usar mañana)

Para el message:
- Si es saludo: Responde de forma amigable y pregunta en qué puedes ayudar
- Si es consulta de datos: Explica qué vas a hacer de forma natural
- Ejemplos de saludos: "¡Hola! ¿En qué puedo ayudarte hoy con la boutique?", "Buenos días, ¿qué información necesitas?"
- Ejemplos de consultas: "Voy a buscar los productos más vendidos del día de hoy por unidades.", "Te mostraré un resumen general de las ventas."

Defaults: dias=30, metric="unidades", umbral=5, order="desc"`;

export async function geminiIntentFromText(text) {
  console.log("[Gemini] 🚀 Iniciando llamada a Gemini con:", text.substring(0, 50));
  if (!GEMINI_API_KEY) {
    console.error("[Gemini] ❌ No hay API key");
    throw new Error("Falta VITE_GEMINI_API_KEY");
  }
  console.log("[Gemini] ✅ API key encontrada");
  
  // Lista de modelos válidos (noviembre 2025) - todos usan v1beta
  // Solo modelos actuales, sin fallbacks obsoletos
  const modelosValidos = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash-exp", "gemini-2.0-pro-exp"];
  
  // Usar el modelo configurado si es válido, sino usar gemini-2.5-flash por defecto
  const modeloPrincipal = modelosValidos.includes(GEMINI_MODEL) ? GEMINI_MODEL : "gemini-2.5-flash";
  
  // Lista de modelos a intentar (solo válidos, sin obsoletos)
  const modelosAIntentar = [
    { nombre: modeloPrincipal, version: "v1beta" },
    { nombre: "gemini-2.5-flash", version: "v1beta" },
    { nombre: "gemini-2.5-pro", version: "v1beta" }
  ].filter((m, i, arr) => arr.findIndex(x => x.nombre === m.nombre) === i); // eliminar duplicados
  
  // Calcular fecha actual para el contexto
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  const fmtDate = (d) => d.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const fechaContexto = `\nFecha actual: ${fmtDate(hoy)} (YYYY-MM-DD)\nFecha de ayer: ${fmtDate(ayer)} (YYYY-MM-DD)\nMes actual: ${hoy.getMonth() + 1}\nAño actual: ${hoy.getFullYear()}\n`;
  
  const promptCompleto = SYSTEM_INTENT_PROMPT + fechaContexto + "\nUsuario: " + String(text || "").slice(0, 300);
  
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: promptCompleto
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.0, // Más determinista
      topK: 1,
      topP: 0.95,
      maxOutputTokens: 2000, // Aumentado para dar espacio a thoughts + JSON
    },
  };
  
  // Intentar con cada modelo hasta que uno funcione
  let lastError = null;
  for (const modeloInfo of modelosAIntentar) {
    const { nombre: modelo, version: apiVersion } = modeloInfo;
    let intentExitoso = null;
    let errorEnEsteModelo = null;
    
    try {
      const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelo}:generateContent?key=${GEMINI_API_KEY}`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errTxt = await res.text().catch(() => "");
        // Si es 404, intentar con el siguiente modelo
        if (res.status === 404) {
          console.warn(`[Gemini] Modelo ${modelo} no disponible (404), intentando siguiente...`);
          errorEnEsteModelo = new Error(`Modelo ${modelo} no disponible`);
        } else {
          // Otros errores, lanzar inmediatamente
          console.error(`[Gemini] Error HTTP con ${modelo}:`, res.status, errTxt);
          throw new Error(`Gemini error ${res.status}: ${errTxt}`);
        }
      } else {
        const data = await res.json();
        
        // Extraer texto de la respuesta (múltiples formas de acceso)
        let textResp = "";
        try {
          // Verificar finishReason y estructura
          if (data?.candidates?.[0]) {
            const candidate = data.candidates[0];
            if (candidate.finishReason === "SAFETY") {
              errorEnEsteModelo = new Error("Respuesta bloqueada por seguridad");
              continue;
            }
            // Si MAX_TOKENS y no hay parts, la respuesta está vacía
            if (candidate.finishReason === "MAX_TOKENS" && !candidate.content?.parts) {
              errorEnEsteModelo = new Error("Respuesta truncada sin contenido");
              continue;
            }
          }
          
          // Forma 1: candidates[0].content.parts[0].text (más común)
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            textResp = data.candidates[0].content.parts[0].text;
          }
          // Forma 2: Si hay múltiples parts, unirlos
          else if (data?.candidates?.[0]?.content?.parts) {
            textResp = data.candidates[0].content.parts
              .map((p) => p?.text || "")
              .filter(Boolean)
              .join(" ");
          }
          // Forma 3: Si content es directamente texto
          else if (data?.candidates?.[0]?.content) {
            const content = data.candidates[0].content;
            // Si content tiene role, ignorarlo y buscar parts
            if (content.role && content.parts) {
              textResp = content.parts
                .map((p) => p?.text || "")
                .filter(Boolean)
                .join(" ");
            } else if (typeof content === "string") {
              textResp = content;
            } else if (content.text) {
              textResp = content.text;
            } else {
              // No usar JSON.stringify si solo tiene role
              if (Object.keys(content).length === 1 && content.role) {
                textResp = "";
              } else {
                textResp = JSON.stringify(content);
              }
            }
          }
          // Forma 4: Fallback - buscar cualquier texto en la estructura
          else if (data?.candidates?.[0]) {
            const candidate = data.candidates[0];
            textResp = candidate.text || candidate.output || "";
            // No usar JSON.stringify si solo tiene role
            if (!textResp && candidate.role && Object.keys(candidate).length === 1) {
              textResp = "";
            } else if (!textResp) {
              textResp = JSON.stringify(candidate);
            }
          }
          
        } catch (e) {
          // Error silencioso
        }
        
        if (!textResp || textResp.trim() === "") {
          errorEnEsteModelo = new Error("Gemini no devolvió texto");
        } else {
          // Limpiar y parsear JSON
          let jsonStr = textResp.trim();
          // Remover markdown code blocks si existen
          jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
          // Si empieza con { y termina con }, es JSON válido
          if (!jsonStr.startsWith("{") || !jsonStr.endsWith("}")) {
            // Intentar extraer JSON del texto
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              jsonStr = jsonMatch[0];
            } else {
              errorEnEsteModelo = new Error("No se encontró JSON en la respuesta");
            }
          }
          
          if (!errorEnEsteModelo) {
            try {
              const parsed = JSON.parse(jsonStr);
              // Si tiene el nuevo formato con intent y message
              if (parsed.intent !== undefined) {
                intentExitoso = {
                  intent: parsed.intent, // Puede ser null si es solo conversación
                  message: parsed.message || ""
                };
              } else if (parsed.accion || parsed.recurso) {
                // Formato viejo, mantener compatibilidad
                intentExitoso = {
                  intent: parsed,
                  message: ""
                };
              } else {
                errorEnEsteModelo = new Error("Formato de respuesta inválido");
              }
            } catch (parseError) {
              errorEnEsteModelo = new Error("JSON inválido en respuesta de Gemini");
            }
          }
        }
      }
    } catch (e) {
      // Error de red o parseo
      if (e.message && !e.message.includes("404") && !e.message.includes("no disponible")) {
        console.error(`[Gemini] Error con ${modelo}:`, e.message);
      }
      errorEnEsteModelo = e;
    }
    
    // Si este modelo funcionó, retornar inmediatamente
    if (intentExitoso) {
      console.log(`[Gemini] ✅ Éxito con ${modelo}, retornando:`, intentExitoso);
      return intentExitoso;
    }
    
    // Si hubo error, guardarlo y continuar con siguiente modelo
    if (errorEnEsteModelo) {
      lastError = errorEnEsteModelo;
    }
  }
  
  // Si llegamos aquí, todos los modelos fallaron
  console.log("[Gemini] ❌ Todos los modelos fallaron. Último error:", lastError?.message);
  throw lastError || new Error("Todos los modelos de Gemini fallaron");
}

// Parser por reglas (fallback local) - casos de uso comunes expandidos
export function localIntentFromText(text) {
  const t = String(text || "").toLowerCase();
  const tNoAcc = t.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // sin acentos
  
  // Lista de casos de uso comunes documentados
  // 1. "exportar pdf" / "descargar pdf" / "guardar reporte pdf"
  // 2. "exportar excel" / "descargar excel" / "guardar reporte excel"
  // 3. "ventas por día 30" / "ventas últimos 15 días" / "ventas diarias"
  // 4. "producto más vendido" / "top productos" / "ropa más vendida" / "prenda más vendida"
  // 5. "producto menos vendido" / "peor producto" / "ropa menos vendida"
  // 6. "productos más vendidos por monto" / "top por dinero" / "mayor ingreso"
  // 7. "productos arriba de 200 bs" / "productos sobre 100 bolivianos" / "ventas mayores a X"
  // 8. "productos abajo de 50 bs" / "productos menos de 30 bolivianos"
  // 9. "mix de pago" / "tipos de pago" / "formas de pago"
  // 10. "stock bajo" / "productos con poco stock" / "inventario bajo umbral 5"
  // 11. "ventas de hoy" / "ventas del día" / "cuánto vendimos hoy"
  // 12. "ventas de ayer" / "qué vendimos ayer"
  // 13. "ventas de esta semana" / "ventas últimos 7 días"
  // 14. "ventas del mes" / "ventas este mes" / "ventas mes actual"
  // 15. "ventas del mes pasado" / "ventas del anterior mes"
  // 16. "ventas del año" / "ventas de 2024" / "ventas del 2025"
  // 17. "productos de verano" / "ropa de invierno" / "prendas de otoño"
  // 18. "productos de enero" / "ventas de diciembre" / "top de marzo"
  // 19. "top productos aparte del pantalón chino" / "sin camisa formal" / "excepto jean"
  // 20. "resumen de ventas" / "resumen general" / "cuánto vendimos en total"
  // Meses y estaciones
  const meses = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  };
  const estaciones = { otono: "otono", otoño: "otono", invierno: "invierno", primavera: "primavera", verano: "verano" };
  // Utilitario: rango relativo
  const today = new Date();
  const fmt = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };
  const range = {};
  // hasta ayer / hasta hoy
  if (t.includes("hasta ayer") || tNoAcc.includes("hasta ayer")) {
    const d = new Date(today); d.setDate(d.getDate() - 1);
    range.end = fmt(d);
  } else if (t.includes("hasta hoy") || tNoAcc.includes("hasta hoy")) {
    range.end = fmt(today);
  }
  // últimos N días
  const mDias = t.match(/ultimos\s+(\d+)\s+d[ií]as/) || tNoAcc.match(/ultimos\s+(\d+)\s+dias/);
  if (mDias) {
    const n = parseInt(mDias[1], 10);
    const d = new Date(today); d.setDate(d.getDate() - n);
    range.start = fmt(d);
    range.end = range.end || fmt(today);
  }
  // este mes / mes pasado
  if (t.includes("este mes") || tNoAcc.includes("este mes")) {
    const d1 = new Date(today.getFullYear(), today.getMonth(), 1);
    range.start = fmt(d1); range.end = fmt(today);
  } else if (t.includes("mes pasado") || tNoAcc.includes("mes pasado")) {
    const firstPrev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastPrev = new Date(today.getFullYear(), today.getMonth(), 0);
    range.start = fmt(firstPrev); range.end = fmt(lastPrev);
  }
  // exportar - con soporte para filtros de fecha y tipo de reporte
  if (t.includes("export") || t.includes("descargar") || t.includes("guardar") || t.includes("generar") || tNoAcc.includes("exportar") || tNoAcc.includes("descargar")) {
    const formato = (t.includes("excel") || t.includes("xlsx") || t.includes("csv") || tNoAcc.includes("excel")) ? "excel" : "pdf";
    const params = { formato };
    
    // Detectar tipo de reporte a exportar
    let recurso = "resumen"; // por defecto
    if (t.includes("top producto") || tNoAcc.includes("top producto") || t.includes("mas vendid") || tNoAcc.includes("mas vendid")) {
      recurso = "top_productos";
      params.metric = t.includes("monto") || tNoAcc.includes("monto") ? "monto" : "unidades";
    } else if (t.includes("ventas por dia") || tNoAcc.includes("ventas por dia")) {
      recurso = "ventas_por_dia";
      const m = t.match(/(\d+)\s*(días|dias)/) || tNoAcc.match(/(\d+)\s*dias/);
      if (m) params.dias = parseInt(m[1], 10);
    } else if (t.includes("mix") || tNoAcc.includes("mix")) {
      recurso = "mix_pago";
    } else if (t.includes("stock") || tNoAcc.includes("stock")) {
      recurso = "stock_bajo";
      const m = t.match(/umbral\s*(\d+)/) || tNoAcc.match(/umbral\s*(\d+)/);
      if (m) params.umbral = parseInt(m[1], 10);
    }
    
    // Aplicar filtros de fecha si existen
    if (range.start || range.end) {
      Object.assign(params, range);
    }
    
    // Detectar fechas específicas: "de fecha a fecha", "desde X hasta Y"
    const desdeMatch = t.match(/desde\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/) || t.match(/desde\s+(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    const hastaMatch = t.match(/hasta\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/) || t.match(/hasta\s+(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    const deAMatch = t.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+a\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/) || t.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+a\s+(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    
    if (deAMatch) {
      // Formato: DD/MM/YYYY a DD/MM/YYYY o YYYY-MM-DD a YYYY-MM-DD
      const parts = deAMatch;
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        params.start = `${parts[1]}-${String(parts[2]).padStart(2, "0")}-${String(parts[3]).padStart(2, "0")}`;
        params.end = `${parts[4]}-${String(parts[5]).padStart(2, "0")}-${String(parts[6]).padStart(2, "0")}`;
      } else {
        // DD/MM/YYYY
        params.start = `${parts[3]}-${String(parts[2]).padStart(2, "0")}-${String(parts[1]).padStart(2, "0")}`;
        params.end = `${parts[6]}-${String(parts[5]).padStart(2, "0")}-${String(parts[4]).padStart(2, "0")}`;
      }
    } else {
      if (desdeMatch) {
        const parts = desdeMatch;
        if (parts[0].length === 4) {
          params.start = `${parts[1]}-${String(parts[2]).padStart(2, "0")}-${String(parts[3]).padStart(2, "0")}`;
        } else {
          params.start = `${parts[3]}-${String(parts[2]).padStart(2, "0")}-${String(parts[1]).padStart(2, "0")}`;
        }
      }
      if (hastaMatch) {
        const parts = hastaMatch;
        if (parts[0].length === 4) {
          params.end = `${parts[1]}-${String(parts[2]).padStart(2, "0")}-${String(parts[3]).padStart(2, "0")}`;
        } else {
          params.end = `${parts[3]}-${String(parts[2]).padStart(2, "0")}-${String(parts[1]).padStart(2, "0")}`;
        }
      }
    }
    
    return { accion: "exportar", recurso, params };
  }
  // ventas por dia
  if (t.includes("ventas por día") || t.includes("ventas por dia") || tNoAcc.includes("ventas por dia")) {
    const m = t.match(/(\d+)\s*(días|dias)/) || tNoAcc.match(/(\d+)\s*dias/);
    const dias = m ? parseInt(m[1], 10) : 30;
    return { accion: "reporte", recurso: "ventas_por_dia", params: { dias } };
  }
  // top productos
  const isTop =
    t.includes("producto más vendido") ||
    t.includes("productos más vendidos") ||
    t.includes("top productos") ||
    t.includes("ropa más vendida") ||
    t.includes("prenda más vendida") ||
    tNoAcc.includes("producto mas vendido") ||
    tNoAcc.includes("productos mas vendidos") ||
    tNoAcc.includes("ropa mas vendida") ||
    tNoAcc.includes("prenda mas vendida") ||
    tNoAcc.includes("mas vendido") ||
    tNoAcc.includes("mas vendida") ||
    tNoAcc.includes("mas popular") ||
    tNoAcc.includes("mas comprado");
  if (isTop) {
    const metric = t.includes("monto") || tNoAcc.includes("monto") ? "monto" : "unidades";
    const params = { metric };
    
    // Filtros temporales específicos
    // "hoy" / "del día"
    if (t.includes("hoy") || t.includes("del día") || t.includes("del dia") || tNoAcc.includes("hoy")) {
      params.start = fmt(today);
      params.end = fmt(today);
    }
    // "ayer"
    else if (t.includes("ayer") || tNoAcc.includes("ayer")) {
      const d = new Date(today); d.setDate(d.getDate() - 1);
      params.start = fmt(d);
      params.end = fmt(d);
    }
    // Si ya hay range (últimos N días, hasta ayer, etc), aplicarlo
    else if (range.start || range.end) {
      Object.assign(params, range);
    }
    
    // estación
    for (const est of Object.keys(estaciones)) {
      if (t.includes(est) || tNoAcc.includes(est)) {
        params.season = estaciones[est];
        break;
      }
    }
    // año explícito
    const y = t.match(/\b(20\d{2})\b/);
    if (y) params.year = parseInt(y[1], 10);
    // mes por nombre
    for (const nombre of Object.keys(meses)) {
      if (t.includes(nombre) || tNoAcc.includes(nombre)) {
        params.month = meses[nombre];
        break;
      }
    }
    return { accion: "reporte", recurso: "top_productos", params };
  }
  // menos vendido (orden ascendente)
  const isLeast = t.includes("menos vendid") || tNoAcc.includes("menos vendid") || tNoAcc.includes("peor vendid") || tNoAcc.includes("menos popular");
  if (isLeast) {
    const params = { metric: "unidades", order: "asc", ...range };
    return { accion: "reporte", recurso: "top_productos", params };
  }
  // excluir/aparte de/sin/que no sea <producto>
  const exclTriggers = ["aparte del", "aparte de", "excepto", "sin", "que no sea"];
  for (const trig of exclTriggers) {
    const idx = t.indexOf(trig);
    if (idx !== -1) {
      const name = t
        .slice(idx + trig.length)
        .replace(/^\s+/, "")
        .replace(/[.,;:!?]+$/, "")
        .trim();
      if (name) {
        return { accion: "reporte", recurso: "top_productos", params: { metric: "unidades", exclude: name, ...range } };
      }
    }
  }
  // mix de pago
  if (t.includes("mix de pago") || (t.includes("tipo de pago") && t.includes("reporte")) || tNoAcc.includes("mix de pago")) {
    return { accion: "reporte", recurso: "mix_pago", params: {} };
  }
  // stock bajo / poco stock / inventario bajo
  if (t.includes("stock bajo") || tNoAcc.includes("stock bajo") || t.includes("poco stock") || t.includes("inventario bajo")) {
    const m = t.match(/umbral\s*(\d+)/) || tNoAcc.match(/umbral\s*(\d+)/);
    const umbral = m ? parseInt(m[1], 10) : 5;
    return { accion: "reporte", recurso: "stock_bajo", params: { umbral } };
  }
  
  // ventas de hoy / ventas del día / cuánto vendimos hoy
  if (t.includes("ventas de hoy") || t.includes("ventas del día") || t.includes("cuanto vendimos hoy") || tNoAcc.includes("vendimos hoy") || tNoAcc.includes("ventas de hoy")) {
    const hoyStr = fmt(today);
    return { accion: "reporte", recurso: "ventas_por_dia", params: { start: hoyStr, end: hoyStr } };
  }
  
  // ventas de ayer / qué vendimos ayer
  if (t.includes("ventas de ayer") || t.includes("vendimos ayer") || tNoAcc.includes("que vendimos ayer") || tNoAcc.includes("ventas de ayer")) {
    const d = new Date(today); d.setDate(d.getDate() - 1);
    const ayerStr = fmt(d);
    return { accion: "reporte", recurso: "ventas_por_dia", params: { start: ayerStr, end: ayerStr } };
  }
  
  // ventas de esta semana / últimos 7 días
  if (t.includes("esta semana") || t.includes("semana actual") || tNoAcc.includes("ultimos 7 dias")) {
    return { accion: "reporte", recurso: "ventas_por_dia", params: { dias: 7 } };
  }
  
  // ventas del año / año actual / ventas de 2024
  const yearMatch = t.match(/\b(20\d{2})\b/);
  if ((t.includes("del año") || t.includes("año actual") || yearMatch) && !isTop && !isLeast) {
    const year = yearMatch ? parseInt(yearMatch[1], 10) : today.getFullYear();
    return { accion: "reporte", recurso: "top_productos", params: { year, metric: "unidades" } };
  }
  
  // productos arriba de X bs / sobre X bolivianos / mayores a X
  // Detectar "por unidad" de forma más robusta (puede estar antes o después del número)
  const tienePorUnidad = /\bpor\s+unidad\b/i.test(t) || /\bpor\s+unidad\b/i.test(tNoAcc) || /\bunidad\b.*\b(arriba|sobre|mayor|abajo|menos|menor)\b/i.test(t) || /\b(arriba|sobre|mayor|abajo|menos|menor)\b.*\bunidad\b/i.test(t);
  
  const arribaMatch = t.match(/arriba\s+de\s+(\d+)/) || t.match(/sobre\s+(\d+)/) || t.match(/mayores?\s+a\s+(\d+)/) || t.match(/>\s*(\d+)/) || t.match(/(\d+)\s*bs?\s*(arriba|sobre|mayor)/);
  if (arribaMatch) {
    const valor = parseInt(arribaMatch[1], 10);
    // Si dice "por unidad", filtrar por precio unitario, no por monto total
    if (tienePorUnidad) {
      const params = { metric: "unidades", min_precio_unitario: valor, ...range };
      return { accion: "reporte", recurso: "top_productos", params };
    }
    // Si no dice "por unidad", filtrar por monto total
    const params = { metric: "monto", min_monto: valor, ...range };
    return { accion: "reporte", recurso: "top_productos", params };
  }
  
  // productos abajo de X bs / menos de X bolivianos / menores a X
  const abajoMatch = t.match(/abajo\s+de\s+(\d+)/) || t.match(/menos\s+de\s+(\d+)/) || t.match(/menores?\s+a\s+(\d+)/) || t.match(/<\s*(\d+)/) || t.match(/(\d+)\s*bs?\s*(abajo|menos|menor)/);
  if (abajoMatch) {
    const valor = parseInt(abajoMatch[1], 10);
    // Si dice "por unidad", filtrar por precio unitario
    if (tienePorUnidad) {
      const params = { metric: "unidades", max_precio_unitario: valor, ...range };
      return { accion: "reporte", recurso: "top_productos", params };
    }
    // Si no dice "por unidad", filtrar por monto total
    const params = { metric: "monto", max_monto: valor, ...range };
    return { accion: "reporte", recurso: "top_productos", params };
  }
  
  // pronóstico de ventas / qué se venderá / predecir ventas
  if (t.includes("pronostico") || t.includes("pronóstico") || t.includes("que se vendera") || t.includes("predecir") || tNoAcc.includes("que se vendera") || tNoAcc.includes("predecir")) {
    // Intentar extraer fecha si se menciona
    const fechaMatch = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/) || t.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    let fechaParam = null;
    if (fechaMatch) {
      if (fechaMatch[0].includes('/')) {
        // Formato DD/MM/YYYY
        const d = new Date(`${fechaMatch[3]}-${fechaMatch[2]}-${fechaMatch[1]}`);
        fechaParam = fmt(d);
      } else {
        // Formato YYYY-MM-DD
        fechaParam = fechaMatch[0];
      }
    }
    return { accion: "pronostico", recurso: "pronostico_ventas", params: { fecha: fechaParam } };
  }
  
  // resumen general / cuánto vendimos en total / total de ventas
  if (t.includes("resumen") || t.includes("total de ventas") || t.includes("cuanto vendimos en total") || tNoAcc.includes("resumen general")) {
    return { accion: "reporte", recurso: "resumen", params: {} };
  }
  
  return { accion: "reporte", recurso: "resumen", params: {} };
}


