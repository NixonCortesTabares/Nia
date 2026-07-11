import pool from "../../config/db";
import { EliminarFotosNegocioDTO, FotosNegocio } from "../../domain/entities/FotosNegocio";
import { IFotosNegocioRepository } from "../../domain/repositories/IFotosNegocioRepository";

interface FotosNegocioRow{
    id: string;
    negocio_id: string;
    link_foto: string
}

function mapFotosNegocio(row: FotosNegocioRow): FotosNegocio {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    linkFoto: row.link_foto
};
}

export class FotosNegocioRepository implements IFotosNegocioRepository{
    async eliminar(data: EliminarFotosNegocioDTO): Promise<void> {
        const result = await pool.query<{ok: boolean}>(
            `DELETE FROM fotos_negocio WHERE link_foto = $1 AND negocio_id = $2;`,[data.linkFoto, data.negocioId]
        );
    }
    async obtener(negocioId: string): Promise<FotosNegocio[]> {
        const result = await pool.query<FotosNegocioRow>(
            `SELECT * FROM fotos_negocio WHERE negocio_id = $1`, [negocioId]
        );

        return result.rows.map(mapFotosNegocio);
    }
    
}