"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyLogin, logActivity } from "../../lib/supabase";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError("Enter your username."); return; }
    setLoading(true); setError("");
    try {
      const valid = await verifyLogin(username, password);
      if (valid) {
        localStorage.setItem("psido_admin", "true");
        localStorage.setItem("psido_user", username.trim().toLowerCase());
        await logActivity("LOGIN", "admin", `${username} logged in`, username);
        router.push("/admin/dashboard");
      } else {
        await logActivity("FAILED_LOGIN", "admin", `Failed login: ${username}`, username);
        setError("Invalid username or password.");
      }
    } catch { setError("Connection error. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Exo+2:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Exo 2',sans-serif;background:#020408;color:#E8FFF4;min-height:100vh;display:flex;align-items:center;justify-content:center;}
        .glow{position:fixed;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(0,255,136,0.06) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:0;}
        .wrap{position:relative;z-index:1;width:100%;max-width:420px;padding:20px;}
        .card{background:rgba(4,6,15,0.95);border:1px solid rgba(0,255,136,0.15);padding:48px 40px;clip-path:polygon(0 0,calc(100% - 24px) 0,100% 24px,100% 100%,24px 100%,0 calc(100% - 24px));position:relative;}
        .card::before{content:'';position:absolute;top:0;right:0;width:0;height:0;border-left:24px solid transparent;border-top:24px solid rgba(0,255,136,0.2);}
        .logo{display:flex;flex-direction:column;align-items:center;margin-bottom:40px;gap:8px;}
        .logo img{width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 0 20px rgba(0,255,136,0.7));}
        .brand{font-family:'Orbitron',monospace;font-size:24px;font-weight:900;color:#00FF88;letter-spacing:4px;text-shadow:0 0 20px rgba(0,255,136,0.7);}
        .sub{font-size:11px;color:rgba(180,230,210,0.5);letter-spacing:0.2em;text-transform:uppercase;font-family:'Orbitron',monospace;}
        .title{font-family:'Orbitron',monospace;font-size:13px;color:rgba(0,255,136,0.7);letter-spacing:0.25em;text-transform:uppercase;margin-bottom:24px;text-align:center;}
        .field{margin-bottom:16px;}
        .label{font-family:'Orbitron',monospace;font-size:9px;letter-spacing:0.3em;color:rgba(180,230,210,0.5);text-transform:uppercase;margin-bottom:8px;display:block;}
        .input{width:100%;background:rgba(0,255,136,0.03);border:1px solid rgba(0,255,136,0.15);color:#E8FFF4;padding:14px 16px;font-family:'Exo 2',sans-serif;font-size:15px;outline:none;transition:all 0.3s;}
        .input:focus{border-color:rgba(0,255,136,0.4);box-shadow:0 0 20px rgba(0,255,136,0.1);}
        .err{background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.2);color:rgba(255,150,150,0.9);padding:12px 16px;font-size:13px;margin-bottom:20px;text-align:center;}
        .btn{width:100%;background:transparent;border:1px solid #00FF88;color:#00FF88;padding:15px;font-family:'Orbitron',monospace;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;transition:all 0.3s;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);cursor:pointer;}
        .btn:hover:not(:disabled){box-shadow:0 0 40px rgba(0,255,136,0.4);background:rgba(0,255,136,0.1);}
        .btn:disabled{opacity:0.5;cursor:not-allowed;}
        .hint{text-align:center;margin-top:20px;font-size:12px;color:rgba(180,230,210,0.3);font-family:'Orbitron',monospace;letter-spacing:0.1em;}
      `}</style>
      <div className="glow" />
      <div className="wrap">
        <div className="card">
          <div className="logo">
            <img src="/psido-logo.png" alt="Psido" />
            <div className="brand">PSIDO</div>
            <div className="sub">Admin Portal</div>
          </div>
          <div className="title">// Secure Access</div>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label className="label">Username</label>
              <input className="input" type="text" placeholder="Partha or Sandeep" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {error && <div className="err">⚠ {error}</div>}
            <button className="btn" type="submit" disabled={loading}>{loading ? "Verifying..." : "Access Dashboard →"}</button>
          </form>
          <div className="hint">Psido Internal Use Only</div>
        </div>
      </div>
    </>
  );
}