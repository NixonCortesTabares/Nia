import pool from "../../config/db";
import {
  CrearHorarioAtencionDTO,
  HorarioAtencion,
  ActualizarHorarioAtencionDTO,
} from "../../domain/entities/HorarioAtencion";
import { IHorarioAtencionRepository } from "../../domain/repositories/IHorarioAtencionRepository";

interface HorarioAtencionRow {
  id: string;
  negocio_id: string;
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
  activo: boolean;
}

function mapHorarioAtencion(row: HorarioAtencionRow): HorarioAtencion {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    diaSemana: Number(row.dia_semana),
    horaApertura: row.hora_apertura.slice(0, 5),
    horaCierre: row.hora_cierre.slice(0, 5),
    activo: row.activo,
  };
}

export class HorarioAtencionRepository implements IHorarioAtencionRepository {
  async crear(data: CrearHorarioAtencionDTO): Promise<HorarioAtencion | null> {
    const result = await pool.query<HorarioAtencionRow>(
      `
      INSERT INTO horarios_atencion (
        negocio_id,
        dia_semana,
        hora_apertura,
        hora_cierre,
        activo
      )
      VALUES ($1, $2, $3::time, $4::time, $5)
      RETURNING
        id,
        negocio_id,
        dia_semana,
        hora_apertura,
        hora_cierre,
        activo;
      `,
      [
        data.negocioId,
        data.diaSemana,
        data.horaApertura,
        data.horaCierre,
        data.activo ?? true,
      ]
    );

    const horario = result.rows[0];

    if (!horario) {
      return null;
    }

    return mapHorarioAtencion(horario);
  }

  async actualizar(
    id: string,
    negocioId: string,
    data: ActualizarHorarioAtencionDTO
  ): Promise<HorarioAtencion | null> {
    const result = await pool.query<HorarioAtencionRow>(
      `
      UPDATE horarios_atencion
      SET
        dia_semana = COALESCE($3::integer, dia_semana),
        hora_apertura = COALESCE($4::time, hora_apertura),
        hora_cierre = COALESCE($5::time, hora_cierre),
        activo = COALESCE($6::boolean, activo)
      WHERE id = $1
        AND negocio_id = $2
      RETURNING
        id,
        negocio_id,
        dia_semana,
        hora_apertura,
        hora_cierre,
        activo;
      `,
      [
        id,
        negocioId,
        data.diaSemana ?? null,
        data.horaApertura ?? null,
        data.horaCierre ?? null,
        data.activo ?? null,
      ]
    );

    const horario = result.rows[0];

    if (!horario) {
      return null;
    }

    return mapHorarioAtencion(horario);
  }

  async buscarPorNegocio(negocioId: string): Promise<HorarioAtencion[]> {
    const result = await pool.query<HorarioAtencionRow>(
      `
      SELECT
        id,
        negocio_id,
        dia_semana,
        hora_apertura,
        hora_cierre,
        activo
      FROM horarios_atencion
      WHERE negocio_id = $1
      ORDER BY dia_semana ASC, hora_apertura ASC;
      `,
      [negocioId]
    );

    return result.rows.map(mapHorarioAtencion);
  }

  async buscarPorId(
    id: string,
    negocioId: string
  ): Promise<HorarioAtencion | null> {
    const result = await pool.query<HorarioAtencionRow>(
      `
      SELECT
        id,
        negocio_id,
        dia_semana,
        hora_apertura,
        hora_cierre,
        activo
      FROM horarios_atencion
      WHERE id = $1
        AND negocio_id = $2;
      `,
      [id, negocioId]
    );

    const horario = result.rows[0];

    if (!horario) {
      return null;
    }

    return mapHorarioAtencion(horario);
  }

  async eliminar(id: string, negocioId: string): Promise<boolean> {
    const result = await pool.query(
      `
      DELETE FROM horarios_atencion
      WHERE id = $1
        AND negocio_id = $2;
      `,
      [id, negocioId]
    );

    return (result.rowCount ?? 0) > 0;
  }
}