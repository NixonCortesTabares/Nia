import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  actualizarMiNegocio,
  obtenerMiNegocio,
  type NegocioFormData,
} from '../api/negocioApi';
import {
  actualizarHorarioAtencion,
  crearHorarioAtencion,
  obtenerHorariosAtencion,
  type HorarioAtencion,
} from '../api/horariosAtencionApi';
import { getApiErrorMessage } from '../api/apiClient';

const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
];

interface HorarioFormData {
  id: string | null;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  activo: boolean;
}

function crearHorariosBase(): HorarioFormData[] {
  return DIAS_SEMANA.map((_, diaSemana) => ({
    id: null,
    diaSemana,
    horaApertura: '09:00',
    horaCierre: '18:00',
    activo: true,
  }));
}

function mapHorariosForm(horarios: HorarioAtencion[]): HorarioFormData[] {
  const horariosPorDia = new Map(horarios.map((horario) => [horario.diaSemana, horario]));

  return crearHorariosBase().map((horarioBase) => {
    const horario = horariosPorDia.get(horarioBase.diaSemana);

    if (!horario) {
      return horarioBase;
    }

    return {
      id: horario.id,
      diaSemana: horario.diaSemana,
      horaApertura: horario.horaApertura,
      horaCierre: horario.horaCierre,
      activo: horario.activo,
    };
  });
}

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
  const [horarios, setHorarios] = useState<HorarioFormData[]>(crearHorariosBase);
  const [savingHorarios, setSavingHorarios] = useState(false);
  const [horariosSaved, setHorariosSaved] = useState(false);

  useEffect(() => {
    async function cargarNegocio() {
      try {
        setLoading(true);
        setError('');

        const [negocioResponse, horariosResponse] = await Promise.all([
          obtenerMiNegocio(),
          obtenerHorariosAtencion(),
        ]);
        const negocio = negocioResponse.negocio;

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
        setHorarios(mapHorariosForm(horariosResponse.horarios));
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

  function handleHorarioChange(
    diaSemana: number,
    field: 'horaApertura' | 'horaCierre' | 'activo',
    value: string | boolean
  ) {
    setHorarios((current) =>
      current.map((horario) =>
        horario.diaSemana === diaSemana
          ? { ...horario, [field]: value }
          : horario
      )
    );

    setHorariosSaved(false);
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

  async function handleSubmitHorarios(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSavingHorarios(true);
      setError('');
      setHorariosSaved(false);

      const horariosGuardados = await Promise.all(
        horarios.map(async (horario) => {
          const payload = {
            diaSemana: horario.diaSemana,
            horaApertura: horario.horaApertura,
            horaCierre: horario.horaCierre,
            activo: horario.activo,
          };

          if (horario.id) {
            const response = await actualizarHorarioAtencion(horario.id, payload);
            return response.horario;
          }

          const response = await crearHorarioAtencion(payload);
          return response.horario;
        })
      );

      setHorarios(mapHorariosForm(horariosGuardados));
      setHorariosSaved(true);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSavingHorarios(false);
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

        {horariosSaved && (
          <div className="success-message">
            Horarios guardados correctamente.
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

        <form className="form" onSubmit={handleSubmitHorarios}>
          <div className="section-header">
            <div>
              <h2>Horarios de atencion</h2>
              <p>Configura apertura y cierre por dia.</p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Apertura</th>
                  <th>Cierre</th>
                  <th>Activo</th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((horario) => (
                  <tr key={horario.diaSemana}>
                    <td>
                      <strong>{DIAS_SEMANA[horario.diaSemana]}</strong>
                    </td>
                    <td>
                      <input
                        type="time"
                        value={horario.horaApertura}
                        onChange={(event) =>
                          handleHorarioChange(
                            horario.diaSemana,
                            'horaApertura',
                            event.target.value
                          )
                        }
                        disabled={savingHorarios || !horario.activo}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={horario.horaCierre}
                        onChange={(event) =>
                          handleHorarioChange(
                            horario.diaSemana,
                            'horaCierre',
                            event.target.value
                          )
                        }
                        disabled={savingHorarios || !horario.activo}
                        required
                      />
                    </td>
                    <td>
                      <label className="inline-checkbox">
                        <input
                          type="checkbox"
                          checked={horario.activo}
                          onChange={(event) =>
                            handleHorarioChange(
                              horario.diaSemana,
                              'activo',
                              event.target.checked
                            )
                          }
                          disabled={savingHorarios}
                        />
                        Activo
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center">
            <Button variant="primary" type="submit" disabled={savingHorarios}>
              {savingHorarios ? 'Guardando...' : 'Guardar horarios'}
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
