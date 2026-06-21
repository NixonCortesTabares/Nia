import { Request, Response } from 'express';
import { IExtraRepository } from '../../../domain/repositories/IExtraRepository';
import { ICategoriaRepository } from '../../../domain/repositories/ICategoriaRepository';
import { ICategoriaExtraRepository } from '../../../domain/repositories/ICategoriaExtraRepository';

import { ListarExtrasUseCase } from '../../../application/menu/ListarExtrasUseCase';
import { BuscarExtraPorIdUseCase } from '../../../application/menu/BuscarExtraPorIdUseCase';
import { CrearExtraUseCase } from '../../../application/menu/CrearExtraUseCase';
import { ActualizarExtraUseCase } from '../../../application/menu/ActualizarExtraUseCase';
import { DesactivarExtraUseCase } from '../../../application/menu/DesactivarExtraUseCase';

import { ListarExtrasPorCategoriaUseCase } from '../../../application/menu/ListarExtrasPorCategoriaUseCase';
import { AsignarExtraACategoriaUseCase } from '../../../application/menu/AsignarExtraACategoriaUseCase';
import { QuitarExtraDeCategoriaUseCase } from '../../../application/menu/QuitarExtraDeCategoriaUseCase';

export class ExtraController {
  constructor(
    private extraRepository: IExtraRepository,
    private categoriaRepository: ICategoriaRepository,
    private categoriaExtraRepository: ICategoriaExtraRepository
  ) {}

  ObtenerExtrasPorNegocio = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const listarExtrasUseCase = new ListarExtrasUseCase(
        this.extraRepository
      );

      const extras = await listarExtrasUseCase.execute(req.user.negocioId);

      return res.status(200).json({
        ok: true,
        mensaje: 'Extras obtenidos exitosamente.',
        extras,
      });
    } catch (error) {
      console.error('Error obteniendo extras:', error);

      return res.status(500).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.',
      });
    }
  };

  MostrarInfoExtra = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Falta el id del extra.',
        });
      }

      const buscarExtraUseCase = new BuscarExtraPorIdUseCase(
        this.extraRepository
      );

      const extra = await buscarExtraUseCase.execute(id, req.user.negocioId);

      if (!extra) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Extra no encontrado.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Extra obtenido exitosamente.',
        extra,
      });
    } catch (error) {
      console.error('Error obteniendo extra:', error);

      return res.status(500).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.',
      });
    }
  };

  CrearExtra = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const crearExtraUseCase = new CrearExtraUseCase(this.extraRepository);

      const extra = await crearExtraUseCase.execute({
        negocioId: req.user.negocioId,
        nombre: req.body.nombre,
        valor: req.body.valor,
      });

      return res.status(201).json({
        ok: true,
        mensaje: 'Extra creado exitosamente.',
        extra,
      });
    } catch (error) {
      console.error('Error creando extra:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error creando el extra.',
      });
    }
  };

  ActualizarExtra = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Falta el id del extra.',
        });
      }

      const camposPermitidos = ['nombre', 'valor', 'activo'];

      const tieneCampoValido = camposPermitidos.some(
        (campo) => req.body[campo] !== undefined
      );

      if (!tieneCampoValido) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se enviaron campos válidos para actualizar.',
        });
      }

      const actualizarExtraUseCase = new ActualizarExtraUseCase(
        this.extraRepository
      );

      const extra = await actualizarExtraUseCase.execute({
        id,
        negocioId: req.user.negocioId,
        data: {
          nombre: req.body.nombre,
          valor: req.body.valor,
          activo: req.body.activo,
        },
      });

      if (!extra) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Extra no encontrado.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Extra actualizado exitosamente.',
        extra,
      });
    } catch (error) {
      console.error('Error actualizando extra:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error actualizando el extra.',
      });
    }
  };

  DesactivarExtra = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Falta el id del extra.',
        });
      }

      const desactivarExtraUseCase = new DesactivarExtraUseCase(
        this.extraRepository
      );

      const extra = await desactivarExtraUseCase.execute({
        id,
        negocioId: req.user.negocioId,
      });

      if (!extra) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Extra no encontrado.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Extra desactivado exitosamente.',
        extra,
      });
    } catch (error) {
      console.error('Error desactivando extra:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error desactivando el extra.',
      });
    }
  };

  ObtenerExtrasPorCategoria = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const { categoriaId } = req.params;

      if (!categoriaId) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Falta el id de la categoría.',
        });
      }

      const listarExtrasPorCategoriaUseCase =
        new ListarExtrasPorCategoriaUseCase(
          this.extraRepository
        );

      const extras = await listarExtrasPorCategoriaUseCase.execute(categoriaId, req.user.negocioId);

      return res.status(200).json({
        ok: true,
        mensaje: 'Extras de la categoría obtenidos exitosamente.',
        extras,
      });
    } catch (error) {
      console.error('Error obteniendo extras por categoría:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error obteniendo extras por categoría.',
      });
    }
  };

  AsignarExtraACategoria = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const { categoriaId, extraId } = req.params;

      if (!categoriaId || !extraId) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Falta categoriaId o extraId.',
        });
      }

      const asignarExtraUseCase = new AsignarExtraACategoriaUseCase(
        this.categoriaExtraRepository,
        this.categoriaRepository,
        this.extraRepository
      );

      const relacion = await asignarExtraUseCase.execute({
        negocioId: req.user.negocioId,
        categoriaId,
        extraId,
      });

      return res.status(201).json({
        ok: true,
        mensaje: 'Extra asignado a la categoría exitosamente.',
        relacion,
      });
    } catch (error) {
      console.error('Error asignando extra a categoría:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error asignando extra a categoría.',
      });
    }
  };

  QuitarExtraDeCategoria = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const { categoriaId, extraId } = req.params;

      if (!categoriaId || !extraId) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Falta categoriaId o extraId.',
        });
      }

      const quitarExtraUseCase = new QuitarExtraDeCategoriaUseCase(
        this.categoriaExtraRepository
      );

      const relacion = await quitarExtraUseCase.execute(extraId, req.user.negocioId, categoriaId);

      if (!relacion) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Relación categoría-extra no encontrada.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Extra quitado de la categoría exitosamente.',
        relacion,
      });
    } catch (error) {
      console.error('Error quitando extra de categoría:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error quitando extra de categoría.',
      });
    }
  };
}