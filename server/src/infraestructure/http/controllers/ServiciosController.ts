import { Request, Response } from 'express';
import { ActualizarServicioUseCase } from '../../../application/servicios/ActualizarServicioUseCase';
import { CrearServicioUseCase } from '../../../application/servicios/CrearServicioUseCase';
import { DesactivarServicioUseCase } from '../../../application/servicios/DesactivarServicioUseCase';
import { ListarServiciosUseCase } from '../../../application/servicios/ListarServiciosUseCase';
import { ObtenerServicioUseCase } from '../../../application/servicios/ObtenerServicioUseCase';
import { ServicioRepository } from '../../repositories/ServicioRepository';

export class ServiciosController {
  async crear(req: Request, res: Response): Promise<void> {
    try {

       if (!req.user) {
        res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const servicioRepository = new ServicioRepository();
      const crearServicioUseCase = new CrearServicioUseCase(servicioRepository);

      const resultado = await crearServicioUseCase.execute({
        ...req.body,
        negocioId: req.user.negocioId,
      });

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
       if (!req.user) {
        res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
        return;
      }
      const servicioRepository = new ServicioRepository();
      const listarServiciosUseCase = new ListarServiciosUseCase(servicioRepository);

      const resultado = await listarServiciosUseCase.execute(req.user.negocioId);

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
       if (!req.user) {
        res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
        return;
      }
      const servicioRepository = new ServicioRepository();
      const obtenerServicioUseCase = new ObtenerServicioUseCase(servicioRepository);

      const resultado = await obtenerServicioUseCase.execute({
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

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
       if (!req.user) {
        res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
        return;
      }
      const servicioRepository = new ServicioRepository();
      const actualizarServicioUseCase = new ActualizarServicioUseCase(servicioRepository);

      const resultado = await actualizarServicioUseCase.execute({
        id: req.params.id,
        negocioId: req.user.negocioId,
        data: req.body,
      });

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
      if (!req.user) {
        res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
        return;
      }
      const servicioRepository = new ServicioRepository();
      const desactivarServicioUseCase = new DesactivarServicioUseCase(servicioRepository);

      const resultado = await desactivarServicioUseCase.execute({
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

  /* checkReqUser(req: Request, res: Response) {
     try {
       if (!req.user) {
         res.status(401).json({
           ok: false,
           message: "Usuario no autenticado",
         })
         return false
       }
         return true;
     }
     catch(error){
       res.status(401).json({
         ok: false,
         message: "Erorr al autenticar el usuario",
       })
       return false;
     }
   }*/
}
