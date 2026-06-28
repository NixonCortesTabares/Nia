import { Request, Response } from 'express';
import { INegocioRepository } from '../../../domain/repositories/INegocioRepository';
import { ObtenerNegocioPorIdUseCase } from '../../../application/negocios/ObtenerNegocioPorIdUseCase';
import { ActualizarNegocioUseCase } from '../../../application/negocios/ActualizarNegocioUseCase';
//import { ActualizarMenuNegocioUseCase } from '../../../application/negocios/ActualizarMenuNegocioUseCase';

export class NegocioController {
  constructor(private negocioRepository: INegocioRepository) { }

  ObtenerMiNegocio = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const obtenerNegocioUseCase = new ObtenerNegocioPorIdUseCase(
        this.negocioRepository
      );

      const negocio = await obtenerNegocioUseCase.execute(req.user.negocioId);

      if (negocio === null) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Negocio no encontrado.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Negocio obtenido exitosamente.',
        negocio,
      });
    } catch (error) {
      console.error('Error obteniendo negocio:', error);

      return res.status(500).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.',
      });
    }
  };

  ActualizarMiNegocio = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const camposPermitidos = [
        'nombre',
        'telefono',
        'direccion',
        'ciudad',
        'activo',
        'costo_domicilio',
        'menu_link'
      ];

      const tieneCampoValido = camposPermitidos.some(
        (campo) => req.body[campo] !== undefined
      );

      if (!tieneCampoValido) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se enviaron campos válidos para actualizar.',
        });
      }

      const actualizarNegocioUseCase = new ActualizarNegocioUseCase(
        this.negocioRepository
      );

      const negocio = await actualizarNegocioUseCase.execute(req.user.negocioId, {
        nombre: req.body.nombre,
        ciudad: req.body.ciudad,
        direccion: req.body.direccion,
        costo_domicilio: req.body.costo_domicilio,
        menu_link: req.body.menu_link
      });

      if (!negocio) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Negocio no encontrado.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Negocio actualizado exitosamente.',
        negocio,
      });
    } catch (error) {
      console.error('Error actualizando negocio:', error);

      return res.status(500).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.',
      });
    }
  };

 /* ActualizarConfigMenu = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const camposPermitidos = [
        'slugMenu',
        'menuActivo',
        'logoUrl',
        'bannerUrl',
        'colorPrincipal',
        'colorSecundario',
        'colorFondo',
        'colorTexto',
      ];

      const tieneCampoValido = camposPermitidos.some(
        (campo) => req.body[campo] !== undefined
      );

      if (!tieneCampoValido) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se enviaron campos válidos para actualizar el menú.',
        });
      }

      const actualizarMenuUseCase = new ActualizarMenuNegocioUseCase(
        this.negocioRepository
      );

      const negocio = await actualizarMenuUseCase.execute({
        negocioId: req.user.negocioId,
        data: {
          slugMenu: req.body.slugMenu,
          menuActivo: req.body.menuActivo,
          logoUrl: req.body.logoUrl,
          bannerUrl: req.body.bannerUrl,
          colorPrincipal: req.body.colorPrincipal,
          colorSecundario: req.body.colorSecundario,
          colorFondo: req.body.colorFondo,
          colorTexto: req.body.colorTexto,
        },
      });

      if (!negocio) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Negocio no encontrado.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Configuración del menú actualizada exitosamente.',
        negocio,
      });
    } catch (error) {
      console.error('Error actualizando configuración del menú:', error);

      return res.status(500).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.',
      });
    }
  };*/
}