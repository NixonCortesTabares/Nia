import { Request, Response } from 'express';
import { ICategoriaRepository } from '../../../domain/repositories/ICategoriaRepository';

import { ListarCategoriasUseCase } from '../../../application/menu/ListarCategoriasUseCase';
//import { BuscarCategoriaPorIdUseCase } from '../../../application/menu/BuscarCategoriaPorIdUseCase';
import { CrearCategoriaUseCase } from '../../../application/menu/CrearCategoriaUseCase';
import { ActualizarCategoriaUseCase } from '../../../application/menu/ActualizarCategoriaUseCase';
import { DesactivarCategoriaUseCase } from '../../../application/menu/DesactivarCategoriaUseCase';
import { BuscarInfoExtrasDeCategoriaUseCase } from '../../../application/menu/BuscarInfoExtrasDeCategoriaUseCase';

export class CategoriaController {
  constructor(private categoriaRepository: ICategoriaRepository) {}

  ObtenerCategoriasPorNegocio = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const listarCategoriasUseCase = new ListarCategoriasUseCase(
        this.categoriaRepository
      );

      const categorias = await listarCategoriasUseCase.execute(
        req.user.negocioId
      );

      return res.status(200).json({
        ok: true,
        mensaje: 'Categorías obtenidas exitosamente.',
        categorias,
      });
    } catch (error) {
      console.error('Error obteniendo categorías:', error);

      return res.status(500).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.',
      });
    }
  };

  MostrarInfoCategoria = async (req: Request, res: Response) => {
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
          mensaje: 'Falta el id de la categoría.',
        });
      }

      const buscarInfExtCatUseCase = new BuscarInfoExtrasDeCategoriaUseCase(
        this.categoriaRepository
      );

      const categoria = await buscarInfExtCatUseCase.execute(
        id, 
        req.user.negocioId
      );

      if (!categoria) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Categoría no encontrada.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Categoría obtenida exitosamente.',
        categoria,
      });
    } catch (error) {
      console.error('Error obteniendo categoría:', error);

      return res.status(500).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.',
      });
    }
  };

  CrearCategoria = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const crearCategoriaUseCase = new CrearCategoriaUseCase(
        this.categoriaRepository
      );

      const categoria = await crearCategoriaUseCase.execute({
        negocioId: req.user.negocioId,
        nombre: req.body.nombre,
      });

      return res.status(201).json({
        ok: true,
        mensaje: 'Categoría creada exitosamente.',
        categoria,
      });
    } catch (error) {
      console.error('Error creando categoría:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error creando la categoría.',
      });
    }
  };

  ActualizarCategoria = async (req: Request, res: Response) => {
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
          mensaje: 'Falta el id de la categoría.',
        });
      }

      const camposPermitidos = ['nombre', 'activo'];

      const tieneCampoValido = camposPermitidos.some(
        (campo) => req.body[campo] !== undefined
      );

      if (!tieneCampoValido) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se enviaron campos válidos para actualizar.',
        });
      }

      const actualizarCategoriaUseCase = new ActualizarCategoriaUseCase(
        this.categoriaRepository
      );

      const categoria = await actualizarCategoriaUseCase.execute({
        id,
        negocioId: req.user.negocioId,
        data: {
          nombre: req.body.nombre,
          activo: req.body.activo,
        },
      });

      if (!categoria) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Categoría no encontrada.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Categoría actualizada exitosamente.',
        categoria,
      });
    } catch (error) {
      console.error('Error actualizando categoría:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error actualizando la categoría.',
      });
    }
  };

  DesactivarCategoria = async (req: Request, res: Response) => {
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
          mensaje: 'Falta el id de la categoría.',
        });
      }

      const desactivarCategoriaUseCase = new DesactivarCategoriaUseCase(
        this.categoriaRepository
      );

      const categoria = await desactivarCategoriaUseCase.execute({
        id,
        negocioId: req.user.negocioId,
      });

      if (!categoria) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Categoría no encontrada.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Categoría desactivada exitosamente.',
        categoria,
      });
    } catch (error) {
      console.error('Error desactivando categoría:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error desactivando la categoría.',
      });
    }
  };

  ActivarCategoria = async (req:Request, res:Response) => {
    try{
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
          mensaje: 'Falta el id de la categoría.',
        });
      }

       const actualizarCategoriaUseCase = new ActualizarCategoriaUseCase(
        this.categoriaRepository
      );

      const categoria = await actualizarCategoriaUseCase.execute({
        id,
        negocioId: req.user.negocioId,
        data: {
          activo: true
        },
      });

      if (!categoria) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Categoría no encontrada.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Categoría activada exitosamente.',
        categoria,
      });
    }
    catch(error){
        console.error('Error desactivando categoría:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error activando la categoría.',
      });
    }
  }
}