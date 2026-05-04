import pool from '../../config/db';
import { Cliente, CrearClienteDTO } from '../../domain/entities/Cliente';
import { IClienteRepository } from '../../domain/repositories/IClienteRepository';

interface ClienteRow {
  id: string;
  negocio_id: string;
  nombre: string | null;
  telefono: string;
  primera_visita: Date | null;
  ultima_visita: Date | null;
  total_visitas: number;
  activo: boolean;
  creado_en: Date;
}

function mapCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    nombre: row.nombre ?? undefined,
    telefono: row.telefono,
    primeraVisita: row.primera_visita ?? undefined,
    ultimaVisita: row.ultima_visita ?? undefined,
    totalVisitas: row.total_visitas,
    activo: row.activo,
    creadoEn: row.creado_en,
  };
}

export class ClienteRepository implements IClienteRepository {
  async crear(data: CrearClienteDTO): Promise<Cliente> {
    const result = await pool.query<ClienteRow>(
      `INSERT INTO clientes (negocio_id, telefono, nombre)
       VALUES ($1, $2, $3)
       RETURNING id, negocio_id, nombre, telefono, primera_visita, ultima_visita, total_visitas, activo, creado_en`,
      [data.negocioId, data.telefono, data.nombre ?? null]
    );

    return mapCliente(result.rows[0]);
  }

  async buscarPorTelefono(negocioId: string, telefono: string): Promise<Cliente | null> {
    const result = await pool.query<ClienteRow>(
      `SELECT id, negocio_id, nombre, telefono, primera_visita, ultima_visita, total_visitas, activo, creado_en
       FROM clientes
       WHERE negocio_id = $1 AND telefono = $2`,
      [negocioId, telefono]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapCliente(result.rows[0]);
  }

  async buscarPorId(id: string): Promise<Cliente | null> {
    const result = await pool.query<ClienteRow>(
      `SELECT id, negocio_id, nombre, telefono, primera_visita, ultima_visita, total_visitas, activo, creado_en
       FROM clientes
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapCliente(result.rows[0]);
  }

  async buscarEnRiesgo(negocioId: string): Promise<Cliente[]> {
    const result = await pool.query<ClienteRow>(
      `SELECT id, negocio_id, nombre, telefono, primera_visita, ultima_visita, total_visitas, activo, creado_en
       FROM clientes
       WHERE negocio_id = $1
         AND activo = true
         AND ultima_visita IS NOT NULL
         AND ultima_visita <= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY ultima_visita ASC`,
      [negocioId]
    );

    return result.rows.map(mapCliente);
  }

  async buscarInactivosDesdeFecha(negocioId: string, desde: Date): Promise<Cliente[]> {
    const result = await pool.query<ClienteRow>(
      `SELECT id, negocio_id, nombre, telefono, primera_visita, ultima_visita, total_visitas, activo, creado_en
       FROM clientes
       WHERE negocio_id = $1
         AND activo = true
         AND (ultima_visita IS NULL OR ultima_visita < $2)
       ORDER BY ultima_visita ASC NULLS FIRST`,
      [negocioId, desde]
    );

    return result.rows.map(mapCliente);
  }

  async actualizarUltimaVisita(id: string): Promise<void> {
    await pool.query(
      `UPDATE clientes
       SET primera_visita = COALESCE(primera_visita, CURRENT_DATE),
           ultima_visita = CURRENT_DATE,
           total_visitas = total_visitas + 1
       WHERE id = $1`,
      [id]
    );
  }
}
