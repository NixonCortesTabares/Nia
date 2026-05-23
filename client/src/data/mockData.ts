export type EstadoPedido = 'Pendiente' | 'En cocina' | 'En ruta' | 'Entregado' | 'Cancelado'

export type ProductoPedido = {
  nombre: string
  cantidad: number
  precio: number
  extras: string[]
  notas: string
}

export type Pedido = {
  id: string
  cliente: string
  telefono: string
  productos: ProductoPedido[]
  direccion: string
  tipoEntrega: 'Domicilio' | 'Recoger en local'
  metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta'
  total: number
  estado: EstadoPedido
  hora: string
  fecha: string
}

export type Categoria = {
  id: string
  nombre: string
  activa: boolean
  extrasPermitidos: string[]
}

export type Producto = {
  id: string
  categoriaId: string
  nombre: string
  descripcion: string
  precio: number
  activo: boolean
}

export type Extra = {
  id: string
  nombre: string
  precio: number
  activo: boolean
}

export type Conversacion = {
  id: string
  cliente: string
  ultimoMensaje: string
  estado: 'Pendiente' | 'Atendida'
  fecha: string
}

export const pedidosMock: Pedido[] = [
  {
    id: 'NP-1048',
    cliente: 'Laura Mendez',
    telefono: '+57 300 245 1180',
    productos: [
      { nombre: 'Hamburguesa clasica', cantidad: 2, precio: 24000, extras: ['Tocineta'], notas: 'Una sin cebolla' },
      { nombre: 'Papas medianas', cantidad: 1, precio: 9000, extras: [], notas: '' },
    ],
    direccion: 'Cra 18 # 42-10, apto 302',
    tipoEntrega: 'Domicilio',
    metodoPago: 'Transferencia',
    total: 61000,
    estado: 'Pendiente',
    hora: '12:18',
    fecha: '2026-05-22',
  },
  {
    id: 'NP-1047',
    cliente: 'Andres Rojas',
    telefono: '+57 311 904 2201',
    productos: [
      { nombre: 'Pizza personal', cantidad: 1, precio: 28000, extras: ['Queso extra'], notas: 'Bien tostada' },
    ],
    direccion: 'Calle 9 # 25-31',
    tipoEntrega: 'Domicilio',
    metodoPago: 'Efectivo',
    total: 33000,
    estado: 'En cocina',
    hora: '12:05',
    fecha: '2026-05-22',
  },
  {
    id: 'NP-1046',
    cliente: 'Sofia Parra',
    telefono: '+57 320 556 0028',
    productos: [
      { nombre: 'Bowl pollo', cantidad: 2, precio: 26000, extras: ['Aguacate'], notas: 'Salsa aparte' },
    ],
    direccion: 'Recoge en barra',
    tipoEntrega: 'Recoger en local',
    metodoPago: 'Tarjeta',
    total: 60000,
    estado: 'Entregado',
    hora: '11:42',
    fecha: '2026-05-22',
  },
  {
    id: 'NP-1045',
    cliente: 'Mateo Gomez',
    telefono: '+57 315 330 7744',
    productos: [
      { nombre: 'Perro especial', cantidad: 1, precio: 22000, extras: ['Papas fosforo'], notas: 'Sin salsas dulces' },
      { nombre: 'Limonada natural', cantidad: 2, precio: 7000, extras: [], notas: '' },
    ],
    direccion: 'Av. 6 # 14-80',
    tipoEntrega: 'Domicilio',
    metodoPago: 'Efectivo',
    total: 41000,
    estado: 'En ruta',
    hora: '11:35',
    fecha: '2026-05-22',
  },
  {
    id: 'NP-1039',
    cliente: 'Carolina Diaz',
    telefono: '+57 301 443 8181',
    productos: [
      { nombre: 'Hamburguesa clasica', cantidad: 1, precio: 24000, extras: [], notas: '' },
    ],
    direccion: 'Calle 52 # 7-19',
    tipoEntrega: 'Domicilio',
    metodoPago: 'Transferencia',
    total: 29000,
    estado: 'Cancelado',
    hora: '19:20',
    fecha: '2026-05-21',
  },
]

export const categoriasMock: Categoria[] = [
  { id: 'cat-1', nombre: 'Hamburguesas', activa: true, extrasPermitidos: ['ext-1', 'ext-2'] },
  { id: 'cat-2', nombre: 'Pizzas', activa: true, extrasPermitidos: ['ext-2', 'ext-3'] },
  { id: 'cat-3', nombre: 'Bebidas', activa: true, extrasPermitidos: [] },
]

export const productosMock: Producto[] = [
  { id: 'prod-1', categoriaId: 'cat-1', nombre: 'Hamburguesa clasica', descripcion: 'Carne, queso, vegetales y salsa de la casa', precio: 24000, activo: true },
  { id: 'prod-2', categoriaId: 'cat-1', nombre: 'Perro especial', descripcion: 'Salchicha premium, queso y papas', precio: 22000, activo: true },
  { id: 'prod-3', categoriaId: 'cat-2', nombre: 'Pizza personal', descripcion: 'Masa delgada con queso mozzarella', precio: 28000, activo: true },
  { id: 'prod-4', categoriaId: 'cat-3', nombre: 'Limonada natural', descripcion: 'Limonada fria preparada al momento', precio: 7000, activo: true },
]

export const extrasMock: Extra[] = [
  { id: 'ext-1', nombre: 'Tocineta', precio: 5000, activo: true },
  { id: 'ext-2', nombre: 'Queso extra', precio: 4000, activo: true },
  { id: 'ext-3', nombre: 'Borde de queso', precio: 6000, activo: true },
]

export const conversacionesMock: Conversacion[] = [
  { id: 'conv-1', cliente: 'Julian Restrepo', ultimoMensaje: 'Quiero cambiar la direccion del pedido', estado: 'Pendiente', fecha: '2026-05-22 12:21' },
  { id: 'conv-2', cliente: 'Diana Lopez', ultimoMensaje: 'No me confirma el valor del domicilio', estado: 'Pendiente', fecha: '2026-05-22 11:58' },
  { id: 'conv-3', cliente: 'Felipe Arias', ultimoMensaje: 'Gracias, ya quedo claro', estado: 'Atendida', fecha: '2026-05-21 20:12' },
]

export const resumenMock = {
  pedidos7Dias: 186,
  pedidosMes: 742,
  ventas7Dias: 6380000,
  ventasMes: 25440000,
  ticketPromedio: 34300,
  productoMasVendido: 'Hamburguesa clasica',
  metodoPagoMasUsado: 'Transferencia',
  pedidosCancelados: 18,
  ventasPorDia: [
    { dia: 'Lun', pedidos: 22, ventas: 760000 },
    { dia: 'Mar', pedidos: 28, ventas: 910000 },
    { dia: 'Mie', pedidos: 24, ventas: 830000 },
    { dia: 'Jue', pedidos: 31, ventas: 1040000 },
    { dia: 'Vie', pedidos: 36, ventas: 1230000 },
    { dia: 'Sab', pedidos: 29, ventas: 990000 },
    { dia: 'Dom', pedidos: 16, ventas: 620000 },
  ],
}

export const configuracionMock = {
  nombreNegocio: 'Nia Burger House',
  ciudad: 'Bogota',
  direccion: 'Cra 15 # 80-12',
  telefonoWhatsapp: '+57 300 123 4567',
  metodosPago: ['Efectivo', 'Transferencia', 'Tarjeta'],
  modoDomicilio: 'fijo',
  costoDomicilioFijo: 5000,
  horarioAtencion: 'Lunes a domingo, 11:00 a.m. - 10:00 p.m.',
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
