"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (password === "psido@2025") {
        localStorage.setItem("psido_admin", "true");
        router.push("/admin/dashboard");
      } else {
        setError("Invalid password. Access denied.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Exo+2:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Exo 2', sans-serif; background: #020408; color: #E8FFF4; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        body::after { content:''; position:fixed; inset:0; z-index:0; background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.02) 2px,rgba(0,0,0,0.02) 4px); pointer-events:none; }
        .login-wrap { position: relative; z-index: 1; width: 100%; max-width: 420px; padding: 20px; }
        .login-glow { position: fixed; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; }
        .login-card { background: rgba(4,6,15,0.95); border: 1px solid rgba(0,255,136,0.15); padding: 48px 40px; clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px)); position: relative; }
        .login-card::before { content:''; position:absolute; top:0; right:0; width:0; height:0; border-left:24px solid transparent; border-top:24px solid rgba(0,255,136,0.2); }
        .login-logo { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; gap: 8px; }
        .login-logo img { width: 64px; height: 64px; object-fit: contain; filter: drop-shadow(0 0 20px rgba(0,255,136,0.7)); }
        .login-brand { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 900; color: #00FF88; letter-spacing: 4px; text-shadow: 0 0 20px rgba(0,255,136,0.7); }
        .login-sub { font-size: 11px; color: rgba(180,230,210,0.5); letter-spacing: 0.2em; text-transform: uppercase; font-family: 'Orbitron', monospace; }
        .login-title { font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 700; color: rgba(0,255,136,0.7); letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 24px; text-align: center; }
        .input-wrap { position: relative; margin-bottom: 20px; }
        .input-label { font-family: 'Orbitron', monospace; font-size: 9px; letter-spacing: 0.3em; color: rgba(180,230,210,0.5); text-transform: uppercase; margin-bottom: 8px; display: block; }
        .input-field { width: 100%; background: rgba(0,255,136,0.03); border: 1px solid rgba(0,255,136,0.15); color: #E8FFF4; padding: 14px 16px; font-family: 'Exo 2', sans-serif; font-size: 15px; letter-spacing: 0.1em; outline: none; transition: all 0.3s; }
        .input-field:focus { border-color: rgba(0,255,136,0.4); box-shadow: 0 0 20px rgba(0,255,136,0.1); }
        .error-msg { background: rgba(255,80,80,0.08); border: 1px solid rgba(255,80,80,0.2); color: rgba(255,150,150,0.9); padding: 12px 16px; font-size: 13px; margin-bottom: 20px; text-align: center; }
        .login-btn { width: 100%; background: transparent; border: 1px solid #00FF88; color: #00FF88; padding: 15px; font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; transition: all 0.3s; position: relative; overflow: hidden; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%); }
        .login-btn::before { content:''; position:absolute; inset:0; background: #00FF88; opacity:0; transition:opacity 0.3s; }
        .login-btn:hover:not(:disabled)::before { opacity:0.12; }
        .login-btn:hover:not(:disabled) { box-shadow: 0 0 40px rgba(0,255,136,0.4); }
        .login-btn:disabled { opacity: 0.5; }
        .login-btn span { position: relative; z-index: 1; }
        .login-hint { text-align: center; margin-top: 20px; font-size: 12px; color: rgba(180,230,210,0.3); font-family: 'Orbitron', monospace; letter-spacing: 0.1em; }
      `}</style>
      <div className="login-glow" />
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">
            <img src="/psido-logo.png" alt="Psido" />
            <div className="login-brand">PSIDO</div>
            <div className="login-sub">Admin Portal</div>
          </div>
          <div className="login-title">// Secure Access</div>
          <form onSubmit={handleLogin}>
            <div className="input-wrap">
              <label className="input-label">Admin Password</label>
              <input type="password" className="input-field" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="error-msg">⚠ {error}</div>}
            <button className="login-btn" type="submit" disabled={loading}>
              <span>{loading ? "Verifying..." : "Access Dashboard →"}</span>
            </button>
          </form>
          <div className="login-hint">Psido Internal Use Only</div>
        </div>
      </div>
    </>
  );
}

