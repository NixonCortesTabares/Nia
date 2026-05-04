"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfesionalController = void 0;
const ActualizarProfesionalUseCase_1 = require("../../../application/profesionales/ActualizarProfesionalUseCase");
const CrearProfesionalUseCase_1 = require("../../../application/profesionales/CrearProfesionalUseCase");
const DesactivarProfesionalUseCase_1 = require("../../../application/profesionales/DesactivarProfesionalUseCase");
const ListarProfesionalesUseCase_1 = require("../../../application/profesionales/ListarProfesionalesUseCase");
const ObtenerProfesionalUseCase_1 = require("../../../application/profesionales/ObtenerProfesionalUseCase");
const ProfesionalRepository_1 = require("../../repositories/ProfesionalRepository");
class ProfesionalController {
    async crear(req, res) {
        try {
            const profesionalRepository = new ProfesionalRepository_1.ProfesionalRepository();
            const crearProfesionalUseCase = new CrearProfesionalUseCase_1.CrearProfesionalUseCase(profesionalRepository);
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
            if (!resultado) {
                res.status(404).json({ ok: false, message: "No se pudo crear el profesional" });
            }
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
            const profesionalRepository = new ProfesionalRepository_1.ProfesionalRepository();
            const listarProfesionalesUseCase = new ListarProfesionalesUseCase_1.ListarProfesionalesUseCase(profesionalRepository);
            if (!req.user) {
                res.status(401).json({
                    ok: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const resultado = await listarProfesionalesUseCase.execute(req.user.negocioId);
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
            const profesionalRepository = new ProfesionalRepository_1.ProfesionalRepository();
            const obtenerProfesionalUseCase = new ObtenerProfesionalUseCase_1.ObtenerProfesionalUseCase(profesionalRepository);
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
            if (!resultado) {
                res.status(404).json({ ok: false, message: "Profesional no encontrado" });
            }
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
            const profesionalRepository = new ProfesionalRepository_1.ProfesionalRepository();
            const actualizarProfesionalUseCase = new ActualizarProfesionalUseCase_1.ActualizarProfesionalUseCase(profesionalRepository);
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
            if (!resultado) {
                res.status(404).json({ ok: false, message: "Profesional no encontrado" });
            }
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
            const profesionalRepository = new ProfesionalRepository_1.ProfesionalRepository();
            const desactivarProfesionalUseCase = new DesactivarProfesionalUseCase_1.DesactivarProfesionalUseCase(profesionalRepository);
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
        }
        catch (error) {
            res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    }
}
exports.ProfesionalController = ProfesionalController;
