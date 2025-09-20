import React, { useState } from "react";
import { apiForgotPassword } from "./authService";
import 'bootstrap/dist/css/bootstrap.min.css';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await apiForgotPassword(email); // chama o back-end
      setMessage("Se o email existir, enviamos um link para alterar a senha.");
    } catch (err: any) {
      setError("Erro ao enviar link. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body p-4">
                    <h1 className="card-title text-center mb-4">Redefinir senha</h1>

          {message && (
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <p className="text-center mb-3">
            Informe seu email e enviaremos um link para redefinir sua senha.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label">Email:</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Seu email"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enviando...
                </>
              ) : "Enviar link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

