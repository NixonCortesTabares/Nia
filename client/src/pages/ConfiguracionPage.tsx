import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  actualizarMiNegocio,
  obtenerMiNegocio,
  type NegocioFormData,
} from '../api/negocioApi';
import { getApiErrorMessage } from '../api/apiClient';

export function ConfiguracionPage() {
  const [formData, setFormData] = useState<NegocioFormData>({
    nombre: '',
    ciudad: '',
    direccion: '',
    menuLink: '',
    costoDomicilio: '',
  });

  const [telefonoWs, setTelefonoWs] = useState<string | null>(null);
  const [activo, setActivo] = useState<boolean>(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarNegocio() {
      try {
        setLoading(true);
        setError('');

        const response = await obtenerMiNegocio();
        const negocio = response.negocio;

        setFormData({
          nombre: negocio.nombre ?? '',
          ciudad: negocio.ciudad ?? '',
          direccion: negocio.direccion ?? '',
          menuLink: negocio.menu_link ?? '',
          costoDomicilio:
            negocio.costo_domicilio === null
              ? ''
              : String(negocio.costo_domicilio),
        });

        setTelefonoWs(negocio.telefonoWs);
        setActivo(negocio.activo);
      } catch (error) {
        setError(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    cargarNegocio();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSaved(false);


      const costoDomicilio = Number(formData.costoDomicilio || 0);

      await actualizarMiNegocio({
        nombre: formData.nombre.trim(),
        ciudad: formData.ciudad.trim(),
        direccion: formData.direccion.trim(),
        menu_link: formData.menuLink.trim() || null,
        costo_domicilio: costoDomicilio,
      });

      setSaved(true);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function abrirPreviewMenu() {
    if (!formData.menuLink.trim()) {
      setError('Primero configura el link del menú.');
      return;
    }

    window.open(`/menu/${formData.menuLink.trim()}`, '_blank');
  }

  if (loading) {
    return (
      <Card className="wide-card">
        <p>Cargando configuración...</p>
      </Card>
    );
  }

  return (
    <Card className="wide-card">
      <div className="stack">
        <div className="section-header">
          <div>
            <h2>Configuración del negocio</h2>
            <p>Actualiza la información principal del restaurante.</p>
          </div>

          <Button type="button" variant="ghost" onClick={abrirPreviewMenu}>
            Ver preview del menú
          </Button>
        </div>

        {saved && (
          <div className="success-message">
            Configuración guardada correctamente.
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form className="form two-columns" onSubmit={handleSubmit}>
          <label>
            Nombre del negocio
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={saving}
              required
            />
          </label>

          <label>
            Ciudad
            <input
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              disabled={saving}
            />
          </label>

          <label>
            Dirección
            <input
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              disabled={saving}
            />
          </label>

          <label>
            Link del menú
            <input
              name="menuLink"
              value={formData.menuLink}
              onChange={handleChange}
              disabled={saving}
              placeholder="nia-burger-test"
            />
          </label>


          <label>
            Costo domicilio fijo
            <input
              name="costoDomicilio"
              type="number"
              value={formData.costoDomicilio}
              onChange={handleChange}
              disabled={saving}
              placeholder="0"
              min={0}
            />
          </label>

          <div className="full">
            <Card>
              <div className="detail-grid">
                <Info
                  label="Estado del negocio"
                  value={activo ? 'Activo' : 'Inactivo'}
                />

                <Info
                  label="Teléfono WhatsApp / Phone ID"
                  value={telefonoWs ?? 'No configurado'}
                />

                <Info
                  label="URL pública del menú"
                  value={
                    formData.menuLink
                      ? `/menu/${formData.menuLink}`
                      : 'No configurada'
                  }
                />
              </div>
            </Card>
          </div>

          <div className="full flex justify-center">
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}