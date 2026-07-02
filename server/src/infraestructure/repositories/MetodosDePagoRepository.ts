import pool from "../../config/db";
import {
  GuardarMetodosPagoDTO,
  MetodosDePago,
} from "../../domain/entities/MetodosDePago";
import { IMetodosDePagoRepository } from "../../domain/repositories/IMetodosDePagoRepository";

interface MetodosDePagoRow {
  negocio_id: string;
  efectivo: boolean;
  nequi_num: string | null;
  bancolombia_num: string | null;
  daviplata_num: string | null;
  llave_breb: string | null;
}

function mapMetodosDePago(row: MetodosDePagoRow): MetodosDePago {
  return {
    negocioId: row.negocio_id,
    efectivo: row.efectivo,
    nequiNum: row.nequi_num,
    bancolombiaNum: row.bancolombia_num,
    daviplataNum: row.daviplata_num,
    llaveBreb: row.llave_breb,
  };
}

export class MetodosDePagoRepository implements IMetodosDePagoRepository {
  async obtener(negocioId: string): Promise<MetodosDePago | null> {
    const result = await pool.query<MetodosDePagoRow>(
      `
      SELECT
        negocio_id,
        efectivo,
        nequi_num,
        bancolombia_num,
        daviplata_num,
        llave_breb
      FROM metodos_de_pago
      WHERE negocio_id = $1;
      `,
      [negocioId]
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return mapMetodosDePago(row);
  }

  async guardar(
    negocioId: string,
    data: GuardarMetodosPagoDTO
  ): Promise<MetodosDePago | null> {
    const result = await pool.query<MetodosDePagoRow>(
      `
      INSERT INTO metodos_de_pago (
        negocio_id,
        efectivo,
        nequi_num,
        bancolombia_num,
        daviplata_num,
        llave_breb
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (negocio_id)
      DO UPDATE SET
        efectivo = EXCLUDED.efectivo,
        nequi_num = EXCLUDED.nequi_num,
        bancolombia_num = EXCLUDED.bancolombia_num,
        daviplata_num = EXCLUDED.daviplata_num,
        llave_breb = EXCLUDED.llave_breb
      RETURNING
        negocio_id,
        efectivo,
        nequi_num,
        bancolombia_num,
        daviplata_num,
        llave_breb;
      `,
      [
        negocioId,
        data.efectivo ?? true,
        data.nequiNum ?? null,
        data.bancolombiaNum ?? null,
        data.daviplataNum ?? null,
        data.llaveBreb ?? null,
      ]
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return mapMetodosDePago(row);
  }
}