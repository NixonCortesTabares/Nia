import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { useRouter } from '../routes/AppRoutes';
import { login, guardarSesion } from '../api/authApi';
import { getApiErrorMessage } from '../api/apiClient';

export function LoginPage() {
  const { navigate } = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await login(formData.email, formData.password);

      guardarSesion(response.data);

      navigate('/dashboard');
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">N</span>
          <div>
            <h1>Nia Pedidos</h1>
            <p>Panel operativo para pedidos por WhatsApp</p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="operacion@restaurante.com"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <label>
            Contraseña
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700" >{error}</div>}

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>

          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate('/agendar-visita')}
            disabled={loading}
          >
            Agendar visita
          </Button>
        </form>
      </section>
    </main>
  );
}