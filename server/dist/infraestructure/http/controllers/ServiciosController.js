"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiciosController = void 0;
const ActualizarServicioUseCase_1 = require("../../../application/servicios/ActualizarServicioUseCase");
const CrearServicioUseCase_1 = require("../../../application/servicios/CrearServicioUseCase");
const DesactivarServicioUseCase_1 = require("../../../application/servicios/DesactivarServicioUseCase");
const ListarServiciosUseCase_1 = require("../../../application/servicios/ListarServiciosUseCase");
const ObtenerServicioUseCase_1 = require("../../../application/servicios/ObtenerServicioUseCase");
const ServicioRepository_1 = require("../../repositories/ServicioRepository");
class ServiciosController {
    async crear(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    ok: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const servicioRepository = new ServicioRepository_1.ServicioRepository();
            const crearServicioUseCase = new CrearServicioUseCase_1.CrearServicioUseCase(servicioRepository);
            const resultado = await crearServicioUseCase.execute({
                ...req.body,
                negocioId: req.user.negocioId,
            });
            res.status(201).json({ ok: true, data: resultado });
        }
        catch (error) {
            res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    }
    async listar(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    ok: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const servicioRepository = new ServicioRepository_1.ServicioRepository();
            const listarServiciosUseCase = new ListarServiciosUseCase_1.ListarServiciosUseCase(servicioRepository);
            const resultado = await listarServiciosUseCase.execute(req.user.negocioId);
            res.status(200).json({ ok: true, data: resultado });
        }
        catch (error) {
            res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    }
    async obtener(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    ok: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const servicioRepository = new ServicioRepository_1.ServicioRepository();
            const obtenerServicioUseCase = new ObtenerServicioUseCase_1.ObtenerServicioUseCase(servicioRepository);
            const resultado = await obtenerServicioUseCase.execute({
                id: req.params.id,
                negocioId: req.user.negocioId,
            });
            res.status(200).json({ ok: true, data: resultado });
        }
        catch (error) {
            res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    }
    async actualizar(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    ok: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const servicioRepository = new ServicioRepository_1.ServicioRepository();
            const actualizarServicioUseCase = new ActualizarServicioUseCase_1.ActualizarServicioUseCase(servicioRepository);
            const resultado = await actualizarServicioUseCase.execute({
                id: req.params.id,
                negocioId: req.user.negocioId,
                data: req.body,
            });
            res.status(200).json({ ok: true, data: resultado });
        }
        catch (error) {
            res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    }
    async desactivar(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    ok: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const servicioRepository = new ServicioRepository_1.ServicioRepository();
            const desactivarServicioUseCase = new DesactivarServicioUseCase_1.DesactivarServicioUseCase(servicioRepository);
            const resultado = await desactivarServicioUseCase.execute({
                id: req.params.id,
                negocioId: req.user.negocioId,
            });
            res.status(200).json({ ok: true, data: resultado });
        }
        catch (error) {
            res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    }
}
exports.ServiciosController = ServiciosController;
