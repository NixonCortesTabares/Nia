import { Request, Response } from 'express';
import { ActualizarHorarioAtencionUseCase } from '../../../application/negocios/ActualizarHorarioAtencionUseCase';
import { BuscarHorarioAtencionPorIdUseCase } from '../../../application/negocios/BuscarHorarioAtencionPorIdUseCase';
import { CrearHorarioAtencionUseCase } from '../../../application/negocios/CrearHorarioAtencionUseCase';
import { EliminarHorarioAtencionUseCase } from '../../../application/negocios/EliminarHorarioAtencionUseCase';
import { ListarHorariosAtencionUseCase } from '../../../application/negocios/ListarHorariosAtencionUseCase';
import { IHorarioAtencionRepository } from '../../../domain/repositories/IHorarioAtencionRepository';

export class HorarioAtencionController {
  constructor(private horarioRepository: IHorarioAtencionRepository) {}

  ObtenerHorariosPorNegocio = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const listarHorariosUseCase = new ListarHorariosAtencionUseCase(
        this.horarioRepository
      );

      const horarios = await listarHorariosUseCase.execute(req.user.negocioId);

      return res.status(200).json({
        ok: true,
        mensaje: 'Horarios de atencion obtenidos exitosamente.',
        horarios,
      });
    } catch (error) {
      console.error('Error obteniendo horarios de atencion:', error);

      return res.status(500).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.',
      });
    }
  };

  MostrarInfoHorario = async (req: Request, res: Response) => {
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
          mensaje: 'Falta el id del horario de atencion.',
        });
      }

      const buscarHorarioUseCase = new BuscarHorarioAtencionPorIdUseCase(
        this.horarioRepository
      );

      const horario = await buscarHorarioUseCase.execute(id, req.user.negocioId);

      if (!horario) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Horario de atencion no encontrado.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Horario de atencion obtenido exitosamente.',
        horario,
      });
    } catch (error) {
      console.error('Error obteniendo horario de atencion:', error);

      return res.status(500).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.',
      });
    }
  };

  CrearHorario = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const crearHorarioUseCase = new CrearHorarioAtencionUseCase(
        this.horarioRepository
      );

      const horario = await crearHorarioUseCase.execute({
        negocioId: req.user.negocioId,
        diaSemana: req.body.diaSemana,
        horaApertura: req.body.horaApertura,
        horaCierre: req.body.horaCierre,
        activo: req.body.activo,
      });

      return res.status(201).json({
        ok: true,
        mensaje: 'Horario de atencion creado exitosamente.',
        horario,
      });
    } catch (error) {
      console.error('Error creando horario de atencion:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error creando el horario de atencion.',
      });
    }
  };

  ActualizarHorario = async (req: Request, res: Response) => {
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
          mensaje: 'Falta el id del horario de atencion.',
        });
      }

      const camposPermitidos = [
        'diaSemana',
        'horaApertura',
        'horaCierre',
        'activo',
      ];

      const tieneCampoValido = camposPermitidos.some(
        (campo) => req.body[campo] !== undefined
      );

      if (!tieneCampoValido) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se enviaron campos validos para actualizar.',
        });
      }

      const actualizarHorarioUseCase = new ActualizarHorarioAtencionUseCase(
        this.horarioRepository
      );

      const horario = await actualizarHorarioUseCase.execute({
        id,
        negocioId: req.user.negocioId,
        data: {
          diaSemana: req.body.diaSemana,
          horaApertura: req.body.horaApertura,
          horaCierre: req.body.horaCierre,
          activo: req.body.activo,
        },
      });

      if (!horario) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Horario de atencion no encontrado.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Horario de atencion actualizado exitosamente.',
        horario,
      });
    } catch (error) {
      console.error('Error actualizando horario de atencion:', error);

      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error actualizando el horario de atencion.',
      });
    }
  };

  EliminarHorario = async (req: Request, res: Response) => {
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
          mensaje: 'Falta el id del horario de atencion.',
        });
      }

      const eliminarHorarioUseCase = new EliminarHorarioAtencionUseCase(
        this.horarioRepository
      );

      const eliminado = await eliminarHorarioUseCase.execute(
        id,
        req.user.negocioId
      );

      if (!eliminado) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Horario de atencion no encontrado.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Horario de atencion eliminado exitosamente.',
      });
    } catch (error) {
      console.error('Error eliminando horario de atencion:', error);

      return res.status(500).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.',
      });
    }
  };
}
