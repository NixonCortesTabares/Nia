export function construirTextoMetodosTransf(metodosPago: {
  nequiNum: string | null;
  bancolombiaNum: string | null;
  daviplataNum: string | null;
  llaveBreb: string | null;
} | null): string {
  if (!metodosPago) {
    return "";
  }

  const lineas: string[] = [];

  if (metodosPago.nequiNum) {
    lineas.push(`Nequi: ${metodosPago.nequiNum}`);
  }

  if (metodosPago.bancolombiaNum) {
    lineas.push(`Bancolombia: ${metodosPago.bancolombiaNum}`);
  }

  if (metodosPago.daviplataNum) {
    lineas.push(`Daviplata: ${metodosPago.daviplataNum}`);
  }

  if (metodosPago.llaveBreb) {
    lineas.push(`Llave Bre-B: ${metodosPago.llaveBreb}`);
  }

  if (lineas.length === 0) {
    return "";
  }

  return `
Datos para transferencia:
${lineas.join("\n")}
`.trim();
}