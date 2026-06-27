export type which = "saludo" | "despedida" | "agente";

export function clasificarMensaje(mensaje: string): which {
  const texto = normalizarTexto(mensaje);

  if (!texto) {
    return "agente";
  }

  /*
    Regla principal:
    Si hay intención de negocio, SIEMPRE va al agente.
    Esto evita que mensajes como:
    "hola cita", "q tal quiero cita", "como vas tienen corte"
    sean tratados como saludos simples.
  */
  if (tieneIntencionDeNegocio(texto)) {
    return "agente";
  }

  /*
    Si NO hay intención de negocio,
    revisamos si es saludo/social simple.
  */
  if (esSaludoOSocialSimple(texto)) {
    return "saludo";
  }

  /*
    Si NO hay intención de negocio,
    revisamos si es despedida simple.
  */
  if (esDespedidaSimple(texto)) {
    return "despedida";
  }

  return "agente";
}

export function responderMensajePredefinido(mensaje: which): string | null {
  const rtaSaludos = [
    "¡Hola! A la orden",
    "¡Buenas! ¿A su servicio?",
    "Hola, ¿Como estás? A la orden",
    "Buenas, ¿Que deseas pedir hoy?",
  ];

  const rtaDespedidas = [
    "Con gusto. Cualquier cosa me escribes.",
    "A la orden. Que tengas buen día.",
    "Hasta luego, un gusto atenderte.",
  ];

  if (mensaje === "saludo") {
    return rtaSaludos[Math.floor(Math.random() * rtaSaludos.length)];
  }

  if (mensaje === "despedida") {
    return rtaDespedidas[Math.floor(Math.random() * rtaDespedidas.length)];
  }

  return null;
}

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function esSaludoOSocialSimple(texto: string): boolean {
  const saludosYFrasesSociales = [
    "hola",
    "holaa",
    "holaaa",
    "buenas",
    "buenos dias",
    "buenas tardes",
    "buenas noches",
    "hey",
    "hi",
    "hello",
    "que tal",
    "q tal",
    "como estas",
    "como esta",
    "como vas",
    "como va",
    "como le va",
  ];

  if (saludosYFrasesSociales.includes(texto)) {
    return true;
  }

  return esSaludoConRuido(texto);
}

function esDespedidaSimple(texto: string): boolean {
  const despedidas = [
    "chao",
    "chau",
    "bye",
    "hasta luego",
    "nos vemos",
    "hablamos luego",
    "que le vaya bien",
    "se cuida"
  ];

  if (despedidas.includes(texto)) {
    return true;
  }

  return esDespedidaConRuido(texto);
}

function tieneIntencionDeNegocio(texto: string): boolean {
  const palabras = texto.split(" ");

  const intenciones = [
    "precio",
    "precios",
    "cuanto",
    "vale",
    "costo",
    "cuesta",
    "hamburguesa",
    "perro caliente",
    "picada",
    "papas locas",
    "comida",
    "domicilio",
    "disponibilidad",
    "hora",
    "manana",
    "hoy",
    "cancelar",
    "cancela",
    "modificar",
    "cambiar",
    "quiero",     // intención directa
    "necesito",   // intención directa
  ];

  const palabrasSociales = [
    "hola",
    "holaa",
    "holaaa",
    "buenas",
    "buenos",
    "dias",
    "tardes",
    "noches",
    "hey",
    "hi",
    "hello",
    "que",
    "q",
    "tal",
    "como",
    "estas",
    "esta",
    "vas",
    "va",
    "le",
    "todo",
    "bien",
    "gracias",
    "chao",
    "chau",
    "bye",
  ];

  for (const palabra of palabras) {
    if (palabrasSociales.includes(palabra)) {
      continue;
    }

    for (const intencion of intenciones) {
      if (esCoincidenciaIntencion(palabra, intencion)) {
        return true;
      }
    }
  }

  return false;
}

function esCoincidenciaIntencion(palabra: string, intencion: string): boolean {
  if (palabra === intencion) {
    return true;
  }

  /*
    Evitamos fuzzy matching con palabras muy cortas,
    porque aumenta mucho los falsos positivos.
  */
  if (palabra.length < 4 || intencion.length < 4) {
    return false;
  }

  const distancia = damerauLevenshtein(palabra, intencion);

  /*
    Para palabras cortas como "cita", "hora", "pelo",
    permitimos máximo 1 error.
    Ejemplos:
    "citaa" -> "cita"
    "ciat"  -> "cita"
  */
  if (intencion.length <= 5) {
    return distancia <= 1;
  }

  /*
    Para palabras más largas, permitimos hasta 2 errores.
    Ejemplos:
    "agndar" -> "agendar"
    "servico" -> "servicio"
  */
  return distancia <= 2;
}

function esSaludoConRuido(texto: string): boolean {
  const palabras = texto.split(" ");

  if (palabras.length !== 2) {
    return false;
  }

  const [primera, segunda] = palabras;

  const saludosBase = ["hola", "buenas", "hey", "hi", "hello"];

  /*
    Permite casos como:
    "buenas s"
    "hola a"
    "hey y"

    Pero NO permite:
    "hola cita"
    "buenas precio"
    porque esas palabras tienen más de una letra
    y además serían detectadas como intención de negocio antes.
  */
  return saludosBase.includes(primera) && segunda.length === 1;
}

function esDespedidaConRuido(texto: string): boolean {
  const palabras = texto.split(" ");

  if (palabras.length !== 2) {
    return false;
  }

  const [primera, segunda] = palabras;

  const despedidasBase = ["chao", "chau", "bye"];

  return despedidasBase.includes(primera) && segunda.length === 1;
}

function damerauLevenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;

  const dp: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0)
  );

  for (let i = 0; i < rows; i++) {
    dp[i][0] = i;
  }

  for (let j = 0; j < cols; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + costo
      );

      /*
        Soporte para letras intercambiadas:
        "ciat" se parece a "cita"
      */
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }

  return dp[a.length][b.length];
}