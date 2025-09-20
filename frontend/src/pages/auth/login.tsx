import React, { useState, useEffect  } from "react";
import { useAuth } from "./authContext";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(email, password);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      window.dispatchEvent(new Event("storage"));

      if (response?.must_change_password) {
        navigate(`/password-reset/${response.token}`, { state: { firstLogin: true } });
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao logar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body p-4">
          <h1 className="card-title text-center mb-4">Login</h1>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
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

            <div className="mb-4">
              <label htmlFor="password" className="form-label">Senha:</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Sua senha"
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
                  Entrando...
                </>
              ) : "Login"}
            </button>
          </form>

          <div className="mt-3 text-center">
            <Link to="/forgot-password" className="text-decoration-none">
              Esqueci minha senha
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
