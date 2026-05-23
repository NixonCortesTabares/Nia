import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { categoriasMock, extrasMock, formatCurrency, productosMock, type Categoria, type Extra, type Producto } from '../data/mockData'

export function MenuPage() {
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasMock)
  const [productos, setProductos] = useState<Producto[]>(productosMock)
  const [extras, setExtras] = useState<Extra[]>(extrasMock)
  const [categoriaActiva, setCategoriaActiva] = useState(categoriasMock[0].id)

  const addProduct = () => {
    setProductos((current) => [...current, { id: `prod-${Date.now()}`, categoriaId: categoriaActiva, nombre: 'Nuevo producto', descripcion: 'Descripcion breve', precio: 18000, activo: true }])
  }

  const addCategory = () => {
    const id = `cat-${Date.now()}`
    setCategorias((current) => [...current, { id, nombre: 'Nueva categoria', activa: true, extrasPermitidos: [] }])
    setCategoriaActiva(id)
  }

  const addExtra = () => {
    setExtras((current) => [...current, { id: `ext-${Date.now()}`, nombre: 'Nuevo extra', precio: 3000, activo: true }])
  }

  const toggleCategoryExtra = (extraId: string) => {
    setCategorias((current) => current.map((categoria) => {
      if (categoria.id !== categoriaActiva) return categoria
      const exists = categoria.extrasPermitidos.includes(extraId)
      return { ...categoria, extrasPermitidos: exists ? categoria.extrasPermitidos.filter((id) => id !== extraId) : [...categoria.extrasPermitidos, extraId] }
    }))
  }

  const activeCategory = categorias.find((categoria) => categoria.id === categoriaActiva) ?? categorias[0]

  return (
    <div className="menu-grid">
      <section className="stack">
        <div className="section-header"><h2>Categorias</h2><Button onClick={addCategory}>Crear</Button></div>
        {categorias.map((categoria) => (
          <Card key={categoria.id} className={`editable-row ${categoria.id === categoriaActiva ? 'selected' : ''}`}>
            <button onClick={() => setCategoriaActiva(categoria.id)}>{categoria.nombre}</button>
            <input value={categoria.nombre} onChange={(event) => setCategorias((current) => current.map((item) => item.id === categoria.id ? { ...item, nombre: event.target.value } : item))} />
            <Button variant="ghost" onClick={() => setCategorias((current) => current.map((item) => item.id === categoria.id ? { ...item, activa: !item.activa } : item))}>{categoria.activa ? 'Activa' : 'Inactiva'}</Button>
          </Card>
        ))}
      </section>
      <section className="stack">
        <div className="section-header"><h2>Productos</h2><Button onClick={addProduct}>Crear</Button></div>
        {productos.filter((producto) => producto.categoriaId === activeCategory.id).map((producto) => (
          <Card key={producto.id} className="product-editor">
            <input value={producto.nombre} onChange={(event) => setProductos((current) => current.map((item) => item.id === producto.id ? { ...item, nombre: event.target.value } : item))} />
            <textarea value={producto.descripcion} rows={2} onChange={(event) => setProductos((current) => current.map((item) => item.id === producto.id ? { ...item, descripcion: event.target.value } : item))} />
            <div className="inline-fields">
              <input type="number" value={producto.precio} onChange={(event) => setProductos((current) => current.map((item) => item.id === producto.id ? { ...item, precio: Number(event.target.value) } : item))} />
              <Button variant="ghost" onClick={() => setProductos((current) => current.map((item) => item.id === producto.id ? { ...item, activo: !item.activo } : item))}>{producto.activo ? 'Activo' : 'Inactivo'}</Button>
            </div>
          </Card>
        ))}
      </section>
      <section className="stack">
        <div className="section-header"><h2>Extras</h2><Button onClick={addExtra}>Crear</Button></div>
        {extras.map((extra) => (
          <Card key={extra.id} className="editable-row">
            <input value={extra.nombre} onChange={(event) => setExtras((current) => current.map((item) => item.id === extra.id ? { ...item, nombre: event.target.value } : item))} />
            <span>{formatCurrency(extra.precio)}</span>
            <Button variant="ghost" onClick={() => setExtras((current) => current.map((item) => item.id === extra.id ? { ...item, activo: !item.activo } : item))}>{extra.activo ? 'Activo' : 'Inactivo'}</Button>
          </Card>
        ))}
        <h2>Extras permitidos en {activeCategory.nombre}</h2>
        <div className="chip-list">
          {extras.map((extra) => (
            <button key={extra.id} className={activeCategory.extrasPermitidos.includes(extra.id) ? 'chip selected' : 'chip'} onClick={() => toggleCategoryExtra(extra.id)}>
              {extra.nombre}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
