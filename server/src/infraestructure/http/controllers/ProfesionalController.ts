import { Request, Response } from 'express';
import { ActualizarProfesionalUseCase } from '../../../application/profesionales/ActualizarProfesionalUseCase';
import { CrearProfesionalUseCase } from '../../../application/profesionales/CrearProfesionalUseCase';
import { DesactivarProfesionalUseCase } from '../../../application/profesionales/DesactivarProfesionalUseCase';
import { ListarProfesionalesUseCase } from '../../../application/profesionales/ListarProfesionalesUseCase';
import { ObtenerProfesionalUseCase } from '../../../application/profesionales/ObtenerProfesionalUseCase';
import { ProfesionalRepository } from '../../repositories/ProfesionalRepository';

export class ProfesionalController {
  async crear(req: Request, res: Response): Promise<void> {
    try {
      const profesionalRepository = new ProfesionalRepository();
      const crearProfesionalUseCase = new CrearProfesionalUseCase(profesionalRepository);

      if (!req.user) {
        res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const resultado = await crearProfesionalUseCase.execute({
        ...req.body,
        negocioId: req.user.negocioId,
      });

       if(!resultado){
        res.status(404).json({ok: false, message:"No se pudo crear el profesional"})
      }


      res.status(201).json({ ok: true, data: resultado });
    } catch (error) {
      res.status(400).json({
        ok: false,
        message: (error as Error).message,
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const profesionalRepository = new ProfesionalRepository();
      const listarProfesionalesUseCase = new ListarProfesionalesUseCase(profesionalRepository);

      if (!req.user) {
        res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const resultado = await listarProfesionalesUseCase.execute(req.user.negocioId);
      
      
      res.status(200).json({ ok: true, data: resultado });
    } catch (error) {
      res.status(400).json({
        ok: false,
        message: (error as Error).message,
      });
    }
  }

  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const profesionalRepository = new ProfesionalRepository();
      const obtenerProfesionalUseCase = new ObtenerProfesionalUseCase(profesionalRepository);

      if (!req.user) {
        res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const resultado = await obtenerProfesionalUseCase.execute({
        id: req.params.id,
        negocioId: req.user.negocioId,
      });

       if(!resultado){
        res.status(404).json({ok: false, message:"Profesional no encontrado"})
      }

      res.status(200).json({ ok: true, data: resultado });
    } catch (error) {
      res.status(400).json({
        ok: false,
        message: (error as Error).message,
      });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const profesionalRepository = new ProfesionalRepository();
      const actualizarProfesionalUseCase = new ActualizarProfesionalUseCase(profesionalRepository);

      if (!req.user) {
        res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const resultado = await actualizarProfesionalUseCase.execute({
        id: req.params.id,
        negocioId: req.user.negocioId,
        data: req.body,
      });

      if(!resultado){
        res.status(404).json({ok: false, message:"Profesional no encontrado"})
      }

      res.status(200).json({ ok: true, data: resultado });
    } catch (error) {
      res.status(400).json({
        ok: false,
        message: (error as Error).message,
      });
    }
  }

  async desactivar(req: Request, res: Response): Promise<void> {
    try {
      const profesionalRepository = new ProfesionalRepository();
      const desactivarProfesionalUseCase = new DesactivarProfesionalUseCase(profesionalRepository);

      if (!req.user) {
        res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const resultado = await desactivarProfesionalUseCase.execute({
        id: req.params.id,
        negocioId: req.user.negocioId,
      });

      res.status(200).json({ ok: true, data: resultado });
    } catch (error) {
      res.status(400).json({
        ok: false,
        message: (error as Error).message,
      });
    }
  }
}
