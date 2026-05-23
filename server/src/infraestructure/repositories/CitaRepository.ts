import pool from '../../config/db';
import { Cita, CrearCitaDTO, ActualizarCitaDTO } from '../../domain/entities/Cita';
import {
  CitaActivaConDuracionDTO,
  CitaClienteDTO,
  ICitaRepository,
} from '../../domain/repositories/ICitaRepository';

interface CitaRow {
  id: string;
  negocio_id: string;
  cliente_id: string;
  conversacion_id: string | null;
  servicio_id: string;
  profesional_id: string | null;
  fecha: Date;
  hora: string;
  estado: Cita['estado'];
  notas: string | null;
  creado_en: Date;
}

function mapCita(row: CitaRow): Cita {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    clienteId: row.cliente_id,
    conversacionId: row.conversacion_id ?? undefined,
    servicioId: row.servicio_id,
    profesionalId: row.profesional_id ?? undefined,
    fecha: row.fecha,
    hora: row.hora,
    estado: row.estado,
    notas: row.notas ?? undefined,
    creadoEn: row.creado_en,
  };
}

export class CitaRepository implements ICitaRepository {
  async buscarPorCliente(clienteId: string, negocioId: string): Promise<CitaClienteDTO[]> {
    const result = await pool.query<CitaClienteDTO>(
      `SELECT 
              c.id,
              s.nombre AS servicio_nombre,
              c.fecha,
              c.hora,
              c.estado,
              c.notas
            FROM citas c
            INNER JOIN servicios_catalogo s 
              ON c.servicio_id = s.id
            WHERE c.cliente_id = $1
              AND c.negocio_id = $2
              AND c.estado IN ('pendiente', 'confirmada')
            ORDER BY c.fecha ASC, c.hora ASC;`,
      [clienteId, negocioId]
    );

    return result.rows;
  }

  async buscarActivasConDuracionPorFecha(
    negocioId: string,
    fecha: string | Date,
    ignorarCitaId?: string
  ): Promise<CitaActivaConDuracionDTO[]> {
    const result = await pool.query<CitaActivaConDuracionDTO>(
      `SELECT
              c.id,
              c.fecha,
              c.hora,
              s.duracion_minutos
            FROM citas c
            INNER JOIN servicios_catalogo s
              ON c.servicio_id = s.id
            WHERE c.negocio_id = $1
              AND c.fecha = $2
              AND c.estado IN ('pendiente', 'confirmada')
              AND ($3::uuid IS NULL OR c.id <> $3::uuid)
            ORDER BY c.hora ASC`,
      [negocioId, fecha, ignorarCitaId ?? null]
    );

    return result.rows;
  }
  async crear(data: CrearCitaDTO): Promise<Cita> {
    const result = await pool.query<CitaRow>(
      `INSERT INTO citas (negocio_id, cliente_id, servicio_id, profesional_id, conversacion_id, fecha, hora, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, negocio_id, cliente_id, conversacion_id, servicio_id, profesional_id, fecha, hora, estado, notas, creado_en`,
      [
        data.negocioId,
        data.clienteId,
        data.servicioId,
        data.profesionalId ?? null,
        data.conversacionId ?? null,
        data.fecha,
        data.hora,
        data.notas ?? null,
      ]
    );

    return mapCita(result.rows[0]);
  }

  async buscarPorId(id: string): Promise<Cita | null> {
    const result = await pool.query<CitaRow>(
      `SELECT id, negocio_id, cliente_id, conversacion_id, servicio_id, profesional_id, fecha, hora, estado, notas, creado_en
       FROM citas
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapCita(result.rows[0]);
  }

  async buscarPorNegocio(negocioId: string): Promise<Cita[]> {
    const result = await pool.query<CitaRow>(
      `SELECT id, negocio_id, cliente_id, conversacion_id, servicio_id, profesional_id, fecha, hora, estado, notas, creado_en
       FROM citas
       WHERE negocio_id = $1
       ORDER BY fecha DESC, hora DESC`,
      [negocioId]
    );

    return result.rows.map(mapCita);
  }

  async buscarPorNegocioYPeriodo(negocioId: string, desde: Date, hasta: Date): Promise<Cita[]> {
    const result = await pool.query<CitaRow>(
      `SELECT id, negocio_id, cliente_id, conversacion_id, servicio_id, profesional_id, fecha, hora, estado, notas, creado_en
       FROM citas
       WHERE negocio_id = $1
         AND fecha BETWEEN $2 AND $3
       ORDER BY fecha ASC, hora ASC`,
      [negocioId, desde, hasta]
    );

    return result.rows.map(mapCita);
  }

  async buscarHorasOcupadas(negocioId: string, fecha: Date): Promise<string[]> {
    const result = await pool.query<{ hora: string }>(
      `SELECT hora
       FROM citas
       WHERE negocio_id = $1
         AND fecha = $2
         AND estado IN ('pendiente', 'confirmada')
       ORDER BY hora ASC`,
      [negocioId, fecha]
    );

    return result.rows.map((row) => row.hora);
  }

  async actualizar(id: string, data: ActualizarCitaDTO): Promise<Cita | null> {
    const result = await pool.query<CitaRow>(
      `UPDATE citas
       SET servicio_id = COALESCE($2, servicio_id),
           profesional_id = COALESCE($3, profesional_id),
           conversacion_id = COALESCE($4, conversacion_id),
           fecha = COALESCE($5, fecha),
           hora = COALESCE($6, hora),
           estado = COALESCE($7, estado),
           notas = COALESCE($8, notas)
       WHERE id = $1
       RETURNING id, negocio_id, cliente_id, conversacion_id, servicio_id, profesional_id, fecha, hora, estado, notas, creado_en`,
      [
        id,
        data.servicioId ?? null,
        data.profesionalId ?? null,
        data.conversacionId ?? null,
        data.fecha ?? null,
        data.hora ?? null,
        data.estado ?? null,
        data.notas ?? null,
      ]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapCita(result.rows[0]);
  }
}
