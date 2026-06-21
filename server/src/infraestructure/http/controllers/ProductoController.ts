import { Request, Response } from 'express';
import { IProductoRepository } from '../../../domain/repositories/IProductoRepository';
import { ListarProductosUseCase } from '../../../application/menu/ListarProductosUseCase';
import { ActualizarProductoUseCase } from '../../../application/menu/ActualizarProductoUseCase';
import { ICategoriaRepository } from '../../../domain/repositories/ICategoriaRepository';
import { BuscarProdPorIdUseCase } from '../../../application/menu/BuscarProdPorIdUseCase';
import { CrearProductoUseCase } from '../../../application/menu/CrearProductoUseCase';

export class ProductoController {
    constructor(private productoRepository: IProductoRepository, private categoriaRepo: ICategoriaRepository) { }

    ObtenerProductosPorNegocio = async (req: Request, res: Response) => {
        try {
            if (!req.user?.negocioId) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Usuario no autenticado.',
                });
            }

            const listarProductosUseCase = new ListarProductosUseCase(
                this.productoRepository
            );

            const productos = await listarProductosUseCase.execute(
                req.user.negocioId
            );

            return res.status(200).json({
                ok: true,
                mensaje: 'Productos obtenidos.',
                productos,
            });
        } catch (error) {
            console.error('Error obteniendo productos:', error);

            return res.status(500).json({
                ok: false,
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error interno del servidor.'
            });
        }
    };

    ActualizarProducto = async (req: Request, res: Response) => {
        try {
            if (!req.user?.negocioId) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Usuario no autenticado'
                })
            }

            const actualizarProdUseCase = new ActualizarProductoUseCase(this.productoRepository, this.categoriaRepo)

            const resultado = await actualizarProdUseCase.execute({
                id: req.params.id,
                negocioId: req.user.negocioId,
                data: {
                    categoriaId: req.body.categoriaId,
                    nombre: req.body.nombre,
                    ingredientes: req.body.ingredientes,
                    descripcion: req.body.descripcion,
                    valor: req.body.valor,
                    activo: req.body.activo
                }
            });

            if (resultado === null) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encontró el producto o categoria.'
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: 'Se actualizó el producto exitosamente',
                resultado
            })
        }
        catch (error) {
            console.log(`Error interno al intentar actualizar el producto ${error}`);
            return res.status(500).json({
                ok: false,
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error interno del servidor.'
            })
        }
    };

    MostrarInfoProducto = async (req: Request, res: Response) => {
        try {
            if (!req.user?.negocioId) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'No autenticado.'
                })
            }

            const buscarProdPorIdUseCase = new BuscarProdPorIdUseCase(this.productoRepository);
            if (!req.params.id) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Campo id en la url faltante'
                })
            }
            const resultado = await buscarProdPorIdUseCase.execute(req.params.id, req.user.negocioId);

            if (!resultado) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Producto no encontrado.',
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: 'Producto obtenido con exito.',
                resultado
            })
        }
        catch (error) {
            console.log(`Error interno al intentar obtener el producto, ${error}`)
            return res.status(500).json({
                ok: false,
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error interno del servidor.'
            })
        }
    };

    CrearProducto = async (req: Request, res: Response) => {
        try {
            if (!req.user?.negocioId) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'No autenticado.'
                });
            }
            const crearProdUseCase = new CrearProductoUseCase(this.productoRepository, this.categoriaRepo);

            const resultado = await crearProdUseCase.execute({
                negocioId: req.user.negocioId,
                categoriaId: req.body.categoriaId,
                nombre: req.body.nombre,
                ingredientes: req.body.ingredientes,
                descripcion: req.body.descripcion,
                valor: req.body.valor
            });

            return res.status(201).json({
                ok: true,
                mensaje: 'Producto creado exitosamente.',
                resultado
            });
        }

        catch (error) {
            console.log('Error interno creando el producto', error);
            return res.status(500).json({
                ok: false,
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error interno del servidor.'
            })
        }
    };
}