import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  type Categoria,
} from '../api/categoriasApi';

import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  type Producto,
} from '../api/apiProductos';

import {
  obtenerExtras,
  crearExtra,
  actualizarExtra,
  obtenerExtrasPorCategoria,
  asignarExtraACategoria,
  quitarExtraDeCategoria,
  type Extra,
} from '../api/extrasApi';

import { obtenerMiNegocio } from '../api/negocioApi';
import { getApiErrorMessage } from '../api/apiClient';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function MenuPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);

  const [categoriaActiva, setCategoriaActiva] = useState<string>('');
  const [extrasPermitidos, setExtrasPermitidos] = useState<string[]>([]);

  const [menu_link, setMenuLink] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const activeCategory = useMemo(
    () =>
      categorias.find((categoria) => categoria.id === categoriaActiva) ??
      categorias[0],
    [categorias, categoriaActiva]
  );

  const productosCategoria = useMemo(
    () =>
      productos.filter(
        (producto) => producto.categoriaId === activeCategory?.id
      ),
    [productos, activeCategory]
  );

  async function cargarDatos() {
    try {
      setLoading(true);
      setError('');

      const [categoriasResponse, productosResponse, extrasResponse] =
        await Promise.all([
          obtenerCategorias(),
          obtenerProductos(),
          obtenerExtras(),
        ]);

      setCategorias(categoriasResponse.categorias);
      setProductos(productosResponse.productos);
      setExtras(extrasResponse.extras);

      if (categoriasResponse.categorias.length > 0) {
        setCategoriaActiva((current) => {
          if (current) return current;
          return categoriasResponse.categorias[0].id;
        });
      }

      try {
        const negocioResponse = await obtenerMiNegocio();
        setMenuLink(negocioResponse.negocio.menu_link ?? null);
      } catch {
        setMenuLink(null);
      }
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function cargarExtrasPermitidos(categoriaId: string) {
    try {
      const response = await obtenerExtrasPorCategoria(categoriaId);
      setExtrasPermitidos(response.extras.map((extra) => extra.id));
    } catch (error) {
      setError(getApiErrorMessage(error));
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (categoriaActiva) {
      cargarExtrasPermitidos(categoriaActiva);
    }
  }, [categoriaActiva]);

  async function addCategory() {
    try {
      setSaving(true);
      setError('');
      setMensaje('');

      const response: any = await crearCategoria('Nueva categoría');
      const nuevaCategoria: Categoria | undefined =
        response.categoria ?? response.data ?? response.resultado;

      await cargarDatos();

      if (nuevaCategoria?.id) {
        setCategoriaActiva(nuevaCategoria.id);
      }

      setMensaje('Categoría creada correctamente.');
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function saveCategory(categoria: Categoria) {
    try {
      setSaving(true);
      setError('');
      setMensaje('');

      await actualizarCategoria(categoria.id, {
        nombre: categoria.nombre,
        activo: categoria.activo,
      });

      setMensaje('Categoría actualizada.');
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(categoria: Categoria) {
    try {
      const nuevoActivo = !categoria.activo;

      setCategorias((current) =>
        current.map((item) =>
          item.id === categoria.id ? { ...item, activo: nuevoActivo } : item
        )
      );

      await actualizarCategoria(categoria.id, {
        activo: nuevoActivo,
      });
    } catch (error) {
      setError(getApiErrorMessage(error));
      cargarDatos();
    }
  }

  async function addProduct() {
    if (!activeCategory) return;

    try {
      setSaving(true);
      setError('');
      setMensaje('');

      await crearProducto({
        categoriaId: activeCategory.id,
        nombre: 'Nuevo producto',
        ingredientes: '',
        descripcion: 'Descripción breve',
        valor: 18000,
      });

      await cargarDatos();
      setMensaje('Producto creado correctamente.');
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function saveProduct(producto: Producto) {
    try {
      setSaving(true);
      setError('');
      setMensaje('');

      await actualizarProducto(producto.id, {
        categoriaId: producto.categoriaId,
        nombre: producto.nombre,
        ingredientes: producto.ingredientes ?? '',
        descripcion: producto.descripcion ?? '',
        valor: producto.valor,
        activo: producto.activo,
      });

      setMensaje('Producto actualizado.');
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleProduct(producto: Producto) {
    try {
      const nuevoActivo = !producto.activo;

      setProductos((current) =>
        current.map((item) =>
          item.id === producto.id ? { ...item, activo: nuevoActivo } : item
        )
      );

      await actualizarProducto(producto.id, {
        activo: nuevoActivo,
      });
    } catch (error) {
      setError(getApiErrorMessage(error));
      cargarDatos();
    }
  }

  async function addExtra() {
    try {
      setSaving(true);
      setError('');
      setMensaje('');

      await crearExtra({
        nombre: 'Nuevo extra',
        valor: 3000,
      });

      await cargarDatos();
      setMensaje('Extra creado correctamente.');
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function saveExtra(extra: Extra) {
    try {
      setSaving(true);
      setError('');
      setMensaje('');

      await actualizarExtra(extra.id, {
        nombre: extra.nombre,
        valor: extra.valor,
        activo: extra.activo,
      });

      setMensaje('Extra actualizado.');
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleExtra(extra: Extra) {
    try {
      const nuevoActivo = !extra.activo;

      setExtras((current) =>
        current.map((item) =>
          item.id === extra.id ? { ...item, activo: nuevoActivo } : item
        )
      );

      await actualizarExtra(extra.id, {
        activo: nuevoActivo,
      });
    } catch (error) {
      setError(getApiErrorMessage(error));
      cargarDatos();
    }
  }

  async function toggleCategoryExtra(extraId: string) {
    if (!activeCategory) return;

    const exists = extrasPermitidos.includes(extraId);

    try {
      setError('');
      setMensaje('');

      if (exists) {
        setExtrasPermitidos((current) =>
          current.filter((id) => id !== extraId)
        );

        await quitarExtraDeCategoria(activeCategory.id, extraId);
        setMensaje('Extra quitado de la categoría.');
      } else {
        setExtrasPermitidos((current) => [...current, extraId]);

        await asignarExtraACategoria(activeCategory.id, extraId);
        setMensaje('Extra asignado a la categoría.');
      }
    } catch (error) {
      setError(getApiErrorMessage(error));
      cargarExtrasPermitidos(activeCategory.id);
    }
  }

  function previewMenu() {
    if (!menu_link) {
      setError('Este negocio todavía no tiene un slug de menú configurado.');
      return;
    }

    window.open(`/menu/${menu_link}`, '_blank');
  }

  if (loading) {
    return (
      <Card>
        <p>Cargando menú...</p>
      </Card>
    );
  }

  return (
    <div className="stack">
      <div className="section-header">
        <div>
          <h2>Menú del restaurante</h2>
          <p>Administra categorías, productos y extras disponibles.</p>
        </div>

        <Button variant="primary" onClick={previewMenu}>
          Ver preview del menú
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
          {mensaje}
        </div>
      )}

      <div className="menu-grid">
        <section className="stack">
          <div className="section-header">
            <h2>Categorías</h2>
            <Button onClick={addCategory} disabled={saving}>
              Crear
            </Button>
          </div>

          {categorias.length === 0 && (
            <Card>
              <p>No hay categorías todavía.</p>
            </Card>
          )}

          {categorias.map((categoria) => (
            <Card
              key={categoria.id}
              className={`editable-row ${
                categoria.id === categoriaActiva ? 'selected' : ''
              }`}
            >
              <button onClick={() => setCategoriaActiva(categoria.id)}>
                {categoria.nombre}
              </button>

              <input
                value={categoria.nombre}
                onChange={(event) =>
                  setCategorias((current) =>
                    current.map((item) =>
                      item.id === categoria.id
                        ? { ...item, nombre: event.target.value }
                        : item
                    )
                  )
                }
                onBlur={() => saveCategory(categoria)}
              />

              <Button
                variant="ghost"
                onClick={() => toggleCategory(categoria)}
              >
                {categoria.activo ? 'Activa' : 'Inactiva'}
              </Button>
            </Card>
          ))}
        </section>

        <section className="stack">
          <div className="section-header">
            <div>
              <h2>Productos</h2>
              {activeCategory && <p>{activeCategory.nombre}</p>}
            </div>

            <Button
              onClick={addProduct}
              disabled={saving || !activeCategory}
            >
              Crear
            </Button>
          </div>

          {!activeCategory && (
            <Card>
              <p>Crea una categoría antes de agregar productos.</p>
            </Card>
          )}

          {activeCategory && productosCategoria.length === 0 && (
            <Card>
              <p>No hay productos en esta categoría.</p>
            </Card>
          )}

          {productosCategoria.map((producto) => (
            <Card key={producto.id} className="product-editor">
              <label>
                Nombre
                <input
                  value={producto.nombre}
                  onChange={(event) =>
                    setProductos((current) =>
                      current.map((item) =>
                        item.id === producto.id
                          ? { ...item, nombre: event.target.value }
                          : item
                      )
                    )
                  }
                  onBlur={() => saveProduct(producto)}
                />
              </label>

              <label>
                Ingredientes
                <textarea
                  value={producto.ingredientes ?? ''}
                  rows={2}
                  onChange={(event) =>
                    setProductos((current) =>
                      current.map((item) =>
                        item.id === producto.id
                          ? { ...item, ingredientes: event.target.value }
                          : item
                      )
                    )
                  }
                  onBlur={() => saveProduct(producto)}
                />
              </label>

              <label>
                Descripción
                <textarea
                  value={producto.descripcion ?? ''}
                  rows={2}
                  onChange={(event) =>
                    setProductos((current) =>
                      current.map((item) =>
                        item.id === producto.id
                          ? { ...item, descripcion: event.target.value }
                          : item
                      )
                    )
                  }
                  onBlur={() => saveProduct(producto)}
                />
              </label>

              <div className="inline-fields">
                <label>
                  Precio
                  <input
                    type="number"
                    value={producto.valor}
                    onChange={(event) =>
                      setProductos((current) =>
                        current.map((item) =>
                          item.id === producto.id
                            ? { ...item, valor: Number(event.target.value) }
                            : item
                        )
                      )
                    }
                    onBlur={() => saveProduct(producto)}
                  />
                </label>

                <Button
                  variant="ghost"
                  onClick={() => toggleProduct(producto)}
                >
                  {producto.activo ? 'Activo' : 'Inactivo'}
                </Button>
              </div>
            </Card>
          ))}
        </section>

        <section className="stack">
          <div className="section-header">
            <h2>Extras</h2>
            <Button onClick={addExtra} disabled={saving}>
              Crear
            </Button>
          </div>

          {extras.length === 0 && (
            <Card>
              <p>No hay extras todavía.</p>
            </Card>
          )}

          {extras.map((extra) => (
            <Card key={extra.id} className="editable-row">
              <input
                value={extra.nombre}
                onChange={(event) =>
                  setExtras((current) =>
                    current.map((item) =>
                      item.id === extra.id
                        ? { ...item, nombre: event.target.value }
                        : item
                    )
                  )
                }
                onBlur={() => saveExtra(extra)}
              />

              <input
                type="number"
                value={extra.valor}
                onChange={(event) =>
                  setExtras((current) =>
                    current.map((item) =>
                      item.id === extra.id
                        ? { ...item, valor: Number(event.target.value) }
                        : item
                    )
                  )
                }
                onBlur={() => saveExtra(extra)}
              />

              <Button variant="ghost" onClick={() => toggleExtra(extra)}>
                {extra.activo ? 'Activo' : 'Inactivo'}
              </Button>
            </Card>
          ))}

          {activeCategory && (
            <>
              <h2>Extras permitidos en {activeCategory.nombre}</h2>

              <div className="chip-list">
                {extras.map((extra) => (
                  <button
                    key={extra.id}
                    className={
                      extrasPermitidos.includes(extra.id)
                        ? 'chip selected'
                        : 'chip'
                    }
                    onClick={() => toggleCategoryExtra(extra.id)}
                  >
                    {extra.nombre} · {formatCurrency(extra.valor)}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
