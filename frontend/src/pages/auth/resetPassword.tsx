import React, { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { apiResetPassword } from "./authService";
import "bootstrap/dist/css/bootstrap.min.css";

interface ResetPasswordProps {
  firstLogin?: boolean; 
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ firstLogin = false }) => {
  const { token } = useParams<{ token: string }>(); 
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const localtion = useLocation();
  firstLogin = localtion.state?.firstLogin || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Token inválido ou ausente.");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setError("As senhas não conferem.");
      setLoading(false);
      return;
    }

    try {
      await apiResetPassword(token, password, passwordConfirmation);
      setMessage("Senha alterada com sucesso! Agora você já pode fazer login.");
    } catch (err: any) {
      setError("Erro ao alterar senha. O token pode ter expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body p-4">
          <h1 className="card-title text-center mb-3">
            {firstLogin ? "Senha provisória" : "Redefinir senha"}
          </h1>

          {firstLogin && (
            <p className="text-center text-warning mb-4">
              Você está usando uma senha provisória. Por favor, altere sua senha agora.
            </p>
          )}

          {message && (
            <div className="alert alert-success text-center" role="alert">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          {!token ? (
            <p className="text-center text-danger">Token inválido ou ausente.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nova senha</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Digite a nova senha"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Confirmar senha</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  placeholder="Confirme a nova senha"
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Alterando...
                  </>
                ) : (
                  "Alterar senha"
                )}
              </button>

              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none">
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
