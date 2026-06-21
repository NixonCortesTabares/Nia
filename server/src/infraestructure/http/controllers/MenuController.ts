// server/src/infraestructure/http/controllers/PublicMenuController.ts

import { Request, Response } from 'express';
import { IMenuPublicoRepository } from '../../../domain/repositories/IMenuRepository';
import { ObtenerMenuPublicoUseCase } from '../../../application/menu/ObtenerMenuPublicoUseCase';

export class MenuController {
  constructor(private menuPublicoRepository: IMenuPublicoRepository) {}

  ObtenerMenuPublico = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Falta el slug del menú.',
        });
      }

      const obtenerMenuUseCase = new ObtenerMenuPublicoUseCase(
        this.menuPublicoRepository
      );

      const menu = await obtenerMenuUseCase.execute(slug);

      if (!menu) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Menú no encontrado.',
        });
      }

      return res.status(200).json({
        ok: true,
        menu,
      });
    } catch (error) {
      console.error('Error obteniendo menú público:', error);

      return res.status(500).json({
        ok: false,
        mensaje: 'Error interno obteniendo el menú.',
      });
    }
  };
}