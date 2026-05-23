import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { configuracionMock } from '../data/mockData'

export function ConfiguracionPage() {
  const [saved, setSaved] = useState(false)

  return (
    <Card className="wide-card">
      {saved ? <p className="success-message">Configuracion guardada localmente.</p> : null}
      <form className="form two-columns" onSubmit={(event) => { event.preventDefault(); setSaved(true) }}>
        <label>Nombre del negocio<input defaultValue={configuracionMock.nombreNegocio} /></label>
        <label>Ciudad<input defaultValue={configuracionMock.ciudad} /></label>
        <label>Direccion<input defaultValue={configuracionMock.direccion} /></label>
        <label>Telefono WhatsApp<input defaultValue={configuracionMock.telefonoWhatsapp} /></label>
        <label>Metodos de pago aceptados<input defaultValue={configuracionMock.metodosPago.join(', ')} /></label>
        <label>Modo domicilio<select defaultValue={configuracionMock.modoDomicilio}><option value="fijo">Fijo</option><option value="por confirmar">Por confirmar</option></select></label>
        <label>Costo domicilio fijo<input type="number" defaultValue={configuracionMock.costoDomicilioFijo} /></label>
        <label className="full">Horario de atencion<textarea rows={3} defaultValue={configuracionMock.horarioAtencion} /></label>
        <Button variant="primary" type="submit">Guardar cambios</Button>
      </form>
    </Card>
  )
}
