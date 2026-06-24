import { Request, Response } from 'express';
import { EnviarMensajeManualUseCase } from '../../../application/mensajes/EnviarMensajeManualUseCase';
import { ListarMensajesConversacionUseCase } from '../../../application/mensajes/ListarMensajesConversacionUseCase';
import { IClienteRepository } from '../../../domain/repositories/IClienteRepository';
import { IConversacionRepository } from '../../../domain/repositories/IConversacionRepository';
import { IMensajeRepository } from '../../../domain/repositories/IMensajeRepository';
import { INegocioRepository } from '../../../domain/repositories/INegocioRepository';
import { Mensaje } from '../../../domain/entities/Mensaje';

function mapMensajeResponse(mensaje: Mensaje) {
  return {
    id: mensaje.id,
    conversacionId: mensaje.conversacionId,
    origen: mensaje.rol,
    contenido: mensaje.contenido,
    creadoEn: mensaje.enviadoEn,
  };
}

export class MensajeController {
  constructor(
    private conversacionRepository: IConversacionRepository,
    private mensajeRepository: IMensajeRepository,
    private negocioRepository: INegocioRepository,
    private clienteRepository: IClienteRepository
  ) {}

  ListarPorConversacion = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const { conversacionId } = req.params;

      if (!conversacionId) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Campo conversacionId en la url faltante.',
        });
      }

      const useCase = new ListarMensajesConversacionUseCase(
        this.conversacionRepository,
        this.mensajeRepository
      );

      const mensajes = await useCase.execute(conversacionId, req.user.negocioId);

      if (!mensajes) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Conversación no encontrada.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Mensajes obtenidos.',
        mensajes: mensajes.map(mapMensajeResponse),
      });
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);

      return res.status(500).json({
        ok: false,
        mensaje:
          error instanceof Error
            ? error.message
            : 'Error interno obteniendo mensajes.',
      });
    }
  };

  EnviarManual = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const { conversacionId } = req.params;
      const contenido = typeof req.body.contenido === 'string'
        ? req.body.contenido
        : '';

      if (!conversacionId) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Campo conversacionId en la url faltante.',
        });
      }

      if (!contenido.trim()) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El contenido del mensaje es obligatorio.',
        });
      }

      const useCase = new EnviarMensajeManualUseCase(
        this.conversacionRepository,
        this.mensajeRepository,
        this.negocioRepository,
        this.clienteRepository
      );

      const mensaje = await useCase.execute({
        conversacionId,
        negocioId: req.user.negocioId,
        contenido,
      });

      if (!mensaje) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Conversación no encontrada.',
        });
      }

      return res.status(201).json({
        ok: true,
        mensaje: 'Mensaje enviado.',
        resultado: mapMensajeResponse(mensaje),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Primero debes tomar el control de la conversación.'
      ) {
        return res.status(400).json({
          ok: false,
          mensaje: error.message,
        });
      }

      console.error('Error enviando mensaje manual:', error);

      return res.status(500).json({
        ok: false,
        mensaje:
          error instanceof Error
            ? error.message
            : 'Error interno enviando mensaje manual.',
      });
    }
  };
}
