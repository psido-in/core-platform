"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getClients, addClient, updateClient, deleteClient, logActivity, getActivityLogs, changePassword } from "../../../lib/supabase";
import type { Client, Plan, Status, PayStatus, ActivityLog } from "../../../lib/supabase";

const EMPTY: Omit<Client,"id"|"created_at"|"updated_at"> = {shop_name:"",owner_name:"",phone:"",city:"Bangalore",category:"Food",plan:"Basic",status:"Pending",website_url:"",monthly_fee:500,pay_status:"Due",due_date:"",joined_date:new Date().toISOString().split("T")[0],notes:""};
const PC: Record<Plan,string> = {Basic:"#00FF88",Standard:"#00D4FF",Premium:"#B57BFF"};
const SC: Record<Status,string> = {Active:"#00FF88",Pending:"#FFD700",Paused:"#FF6B6B"};
const PAC: Record<PayStatus,string> = {Paid:"#00FF88",Due:"#FFD700",Overdue:"#FF6B6B"};
const CATS = ["Food","Clothing","Grocery","Electronics","Pharmacy","Salon","Bakery","Other"];
const AICON: Record<string,string> = {LOGIN:"🔑",LOGOUT:"🚪",ADD_CLIENT:"➕",EDIT_CLIENT:"✏️",DELETE_CLIENT:"🗑",CHANGE_PASSWORD:"🔐",FAILED_LOGIN:"⛔"};
const ACOLOR: Record<string,string> = {LOGIN:"#00FF88",LOGOUT:"#FFD700",ADD_CLIENT:"#00D4FF",EDIT_CLIENT:"#B57BFF",DELETE_CLIENT:"#FF6B6B",CHANGE_PASSWORD:"#FF9500",FAILED_LOGIN:"#FF6B6B"};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState("admin");
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<Plan|"All">("All");
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client|null>(null);
  const [form, setForm] = useState<Omit<Client,"id"|"created_at"|"updated_at">>(EMPTY);
  const [delConfirm, setDelConfirm] = useState<string|null>(null);
  const [tab, setTab] = useState<"clients"|"analytics"|"logs"|"settings">("clients");
  const [toast, setToast] = useState("");
  const [pwForm, setPwForm] = useState({newPw:"",confirm:""});
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("psido_admin")) { router.push("/admin"); return; }
      setUser(localStorage.getItem("psido_user") || "admin");
    }
  }, [router]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const loadClients = useCallback(async () => {
    try { setLoading(true); setError(""); setClients(await getClients()); }
    catch { setError("Failed to load clients. Check Supabase connection."); }
    finally { setLoading(false); }
  }, []);

  const loadLogs = useCallback(async () => {
    try { setLogsLoading(true); setLogs(await getActivityLogs()); }
    catch { } finally { setLogsLoading(false); }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);
  useEffect(() => { if (tab === "logs") loadLogs(); }, [tab, loadLogs]);

  const logout = async () => {
    await logActivity("LOGOUT","admin",`${user} logged out`,user);
    localStorage.removeItem("psido_admin"); localStorage.removeItem("psido_user");
    router.push("/admin");
  };

  const filtered = clients.filter(c => {
    const s = c.shop_name.toLowerCase().includes(search.toLowerCase()) || c.owner_name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    return s && (filterPlan==="All" || c.plan===filterPlan);
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c=>c.status==="Active").length,
    revenue: clients.filter(c=>c.pay_status==="Paid").reduce((a,c)=>a+c.monthly_fee,0),
    overdue: clients.filter(c=>c.pay_status==="Overdue").length
  };

  const openAdd = () => { setForm({...EMPTY}); setEditClient(null); setShowForm(true); };
  const openEdit = (c: Client) => {
    setForm({shop_name:c.shop_name,owner_name:c.owner_name,phone:c.phone,city:c.city,category:c.category,plan:c.plan,status:c.status,website_url:c.website_url,monthly_fee:c.monthly_fee,pay_status:c.pay_status,due_date:c.due_date||"",joined_date:c.joined_date||"",notes:c.notes||""});
    setEditClient(c); setShowForm(true);
  };

  const save = async () => {
    if (!form.shop_name||!form.phone) { showToast("⚠ Shop name and phone required."); return; }
    setSaving(true);
    try {
      if (editClient) { await updateClient(editClient.id,form); await logActivity("EDIT_CLIENT",form.shop_name,`${user} edited: ${form.shop_name}`,user); showToast("✅ Client updated!"); }
      else { await addClient(form); await logActivity("ADD_CLIENT",form.shop_name,`${user} added: ${form.shop_name} (${form.plan} plan)`,user); showToast("✅ Client added!"); }
      setShowForm(false); loadClients();
    } catch { showToast("❌ Failed to save."); } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    const c = clients.find(c=>c.id===id);
    try { await deleteClient(id); await logActivity("DELETE_CLIENT",c?.shop_name||id,`${user} deleted: ${c?.shop_name}`,user); setDelConfirm(null); showToast("🗑 Deleted."); loadClients(); }
    catch { showToast("❌ Failed to delete."); }
  };

  const handleChangePw = async () => {
    setPwError("");
    if (pwForm.newPw.length<6) { setPwError("Min 6 characters."); return; }
    if (pwForm.newPw!==pwForm.confirm) { setPwError("Passwords do not match."); return; }
    setPwLoading(true);
    try { await changePassword(user,pwForm.newPw); await logActivity("CHANGE_PASSWORD","admin",`${user} changed password`,user); setPwForm({newPw:"",confirm:""}); showToast("🔐 Password changed!"); }
    catch { setPwError("Failed to change password."); } finally { setPwLoading(false); }
  };

  const openWA = (phone: string, name: string) => window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${name}, this is Psido team.`)}`, "_blank");
  const fmtTime = (ts: string) => new Date(ts).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});

  const switchTab = (t: typeof tab) => { setTab(t); setSidebarOpen(false); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Exo+2:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#020408;--bg2:#04060F;--bg3:#060810;--border:rgba(0,255,136,0.1);--green:#00FF88;--cyan:#00D4FF;--purple:#B57BFF;--red:#FF6B6B;--text:#E8FFF4;--muted:rgba(180,230,210,0.5);}
        body{font-family:'Exo 2',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}

        /* ── LAYOUT ── */
        .dash{display:flex;min-height:100vh;}
        .main{flex:1;overflow-x:hidden;padding-bottom:72px;}

        /* ── SIDEBAR ── */
        .sidebar{width:240px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh;z-index:200;}
        .sb-overlay{display:none;}
        .sb-logo{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;}
        .sb-logo img{width:34px;height:34px;object-fit:contain;filter:drop-shadow(0 0 10px rgba(0,255,136,0.6));}
        .sb-brand{font-family:'Orbitron',monospace;font-size:15px;font-weight:900;color:var(--green);letter-spacing:3px;}
        .sb-tag{font-size:9px;color:var(--muted);letter-spacing:0.15em;text-transform:uppercase;}
        .sb-user{padding:12px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:rgba(0,255,136,0.03);}
        .sb-avatar{width:30px;height:30px;border-radius:50%;background:rgba(0,255,136,0.15);border:1px solid rgba(0,255,136,0.3);display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:12px;font-weight:700;color:var(--green);flex-shrink:0;}
        .sb-uname{font-size:13px;font-weight:600;color:var(--text);text-transform:capitalize;}
        .sb-role{font-size:10px;color:var(--muted);}
        .sb-nav{padding:12px 0;flex:1;overflow-y:auto;}
        .sb-item{display:flex;align-items:center;gap:12px;padding:13px 24px;font-size:13px;font-weight:500;color:var(--muted);transition:all 0.2s;border-left:2px solid transparent;width:100%;text-align:left;background:transparent;border-top:none;border-right:none;border-bottom:none;text-decoration:none;cursor:pointer;}
        .sb-item:hover{color:var(--text);background:rgba(0,255,136,0.04);}
        .sb-item.active{color:var(--green);border-left-color:var(--green);background:rgba(0,255,136,0.06);}
        .sb-icon{font-size:16px;width:20px;text-align:center;}
        .sb-bottom{padding:16px 24px;border-top:1px solid var(--border);}
        .sb-logout{width:100%;background:transparent;border:1px solid rgba(255,107,107,0.2);color:rgba(255,107,107,0.6);padding:10px;font-family:'Orbitron',monospace;font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;transition:all 0.3s;cursor:pointer;}
        .sb-logout:hover{border-color:var(--red);color:var(--red);}

        /* ── TOP BAR ── */
        .dash-header{background:var(--bg2);border-bottom:1px solid var(--border);padding:16px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;}
        .dash-title{font-family:'Orbitron',monospace;font-size:14px;font-weight:800;letter-spacing:0.1em;}
        .dash-title span{color:var(--green);}
        .dash-meta{display:flex;align-items:center;gap:12px;}
        .dash-date{font-size:11px;color:var(--muted);font-family:'Orbitron',monospace;}
        .db-badge{display:inline-flex;align-items:center;gap:6px;font-family:'Orbitron',monospace;font-size:9px;letter-spacing:0.15em;color:var(--green);background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);padding:5px 10px;}
        .db-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,255,136,0.4)}50%{opacity:0.7;box-shadow:0 0 0 6px rgba(0,255,136,0)}}
        .hamburger{display:none;background:transparent;border:1px solid var(--border);color:var(--muted);width:36px;height:36px;align-items:center;justify-content:center;font-size:18px;cursor:pointer;flex-shrink:0;}

        /* ── STATS ── */
        .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;border-bottom:1px solid var(--border);}
        .stat-box{background:var(--bg2);padding:20px 24px;position:relative;}
        .stat-box::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
        .stat-box:nth-child(1)::before{background:var(--green);}
        .stat-box:nth-child(2)::before{background:var(--cyan);}
        .stat-box:nth-child(3)::before{background:var(--purple);}
        .stat-box:nth-child(4)::before{background:var(--red);}
        .stat-label{font-family:'Orbitron',monospace;font-size:8px;letter-spacing:0.3em;color:var(--muted);text-transform:uppercase;margin-bottom:6px;}
        .stat-value{font-family:'Orbitron',monospace;font-size:28px;font-weight:900;line-height:1;}
        .stat-sub{font-size:11px;color:var(--muted);margin-top:4px;}

        /* ── TOOLBAR ── */
        .toolbar{padding:16px 24px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-bottom:1px solid var(--border);background:var(--bg3);}
        .search-box{flex:1;min-width:160px;position:relative;}
        .search-box input{width:100%;background:rgba(0,255,136,0.03);border:1px solid var(--border);color:var(--text);padding:10px 14px 10px 36px;font-family:'Exo 2',sans-serif;font-size:14px;outline:none;transition:all 0.3s;}
        .search-box input:focus{border-color:rgba(0,255,136,0.3);}
        .search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:13px;opacity:0.4;}
        .filter-wrap{display:flex;gap:6px;flex-wrap:wrap;}
        .filter-btn{background:rgba(0,255,136,0.03);border:1px solid var(--border);color:var(--muted);padding:8px 12px;font-family:'Orbitron',monospace;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.2s;cursor:pointer;white-space:nowrap;}
        .filter-btn.active{border-color:var(--green);color:var(--green);background:rgba(0,255,136,0.08);}
        .add-btn{background:transparent;border:1px solid var(--green);color:var(--green);padding:10px 18px;font-family:'Orbitron',monospace;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;transition:all 0.3s;cursor:pointer;white-space:nowrap;margin-left:auto;}
        .add-btn:hover{box-shadow:0 0 30px rgba(0,255,136,0.3);background:rgba(0,255,136,0.08);}

        /* ── DESKTOP TABLE ── */
        .table-wrap{padding:0 24px 32px;overflow-x:auto;}
        .client-table{width:100%;border-collapse:collapse;margin-top:20px;}
        .client-table th{font-family:'Orbitron',monospace;font-size:8px;letter-spacing:0.25em;color:var(--muted);text-transform:uppercase;padding:10px 14px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap;}
        .client-table td{padding:14px;border-bottom:1px solid rgba(0,255,136,0.05);font-size:13px;vertical-align:middle;}
        .client-table tr:hover td{background:rgba(0,255,136,0.02);}

        /* ── MOBILE CARDS ── */
        .card-list{display:none;flex-direction:column;gap:10px;padding:16px;}
        .client-card{background:var(--bg2);border:1px solid var(--border);padding:16px;border-radius:2px;position:relative;}
        .client-card::before{content:'';position:absolute;top:0;left:0;bottom:0;width:3px;}
        .card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;gap:8px;}
        .card-name{font-weight:700;font-size:15px;color:var(--text);}
        .card-owner{font-size:12px;color:var(--muted);margin-top:2px;}
        .card-badges{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;}
        .card-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
        .card-label{font-family:'Orbitron',monospace;font-size:8px;color:var(--muted);letter-spacing:0.2em;text-transform:uppercase;}
        .card-val{font-size:13px;color:var(--text);}
        .card-actions{display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);}
        .card-btn{flex:1;background:transparent;border:1px solid var(--border);color:var(--muted);padding:9px;font-family:'Orbitron',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;text-align:center;}
        .card-btn.wa{border-color:rgba(37,211,102,0.3);color:#25D366;}
        .card-btn.edit:hover{border-color:var(--cyan);color:var(--cyan);}
        .card-btn.del:hover{border-color:var(--red);color:var(--red);}

        /* ── SHARED ── */
        .shop-name{font-weight:600;font-size:14px;}
        .owner-sub{font-size:12px;color:var(--muted);margin-top:2px;}
        .badge{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;font-family:'Orbitron',monospace;font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border:1px solid currentColor;}
        .badge-dot{width:4px;height:4px;border-radius:50%;background:currentColor;}
        .url-link{font-size:12px;color:var(--cyan);text-decoration:none;}
        .action-btns{display:flex;gap:6px;}
        .act-btn{background:transparent;border:1px solid var(--border);color:var(--muted);width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all 0.2s;cursor:pointer;}
        .act-btn:hover{border-color:var(--green);color:var(--green);}
        .act-btn.wa:hover{border-color:#25D366;color:#25D366;}
        .act-btn.del:hover{border-color:var(--red);color:var(--red);}
        .loading-state{text-align:center;padding:60px 20px;}
        .spinner{width:40px;height:40px;border:2px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .loading-txt{font-family:'Orbitron',monospace;font-size:11px;color:var(--muted);letter-spacing:0.2em;}
        .error-banner{background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.2);color:rgba(255,150,150,0.9);padding:14px 20px;margin:16px 24px;display:flex;align-items:center;justify-content:space-between;font-size:13px;gap:12px;}
        .retry-btn{background:transparent;border:1px solid rgba(255,107,107,0.4);color:rgba(255,150,150,0.9);padding:6px 14px;font-family:'Orbitron',monospace;font-size:10px;cursor:pointer;white-space:nowrap;}
        .empty-state{text-align:center;padding:60px 20px;color:var(--muted);}
        .empty-icon{font-size:40px;margin-bottom:12px;opacity:0.4;}
        .empty-txt{font-family:'Orbitron',monospace;font-size:12px;letter-spacing:0.15em;}

        /* ── MODAL ── */
        .modal-overlay{position:fixed;inset:0;z-index:9000;background:rgba(2,4,8,0.92);backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center;padding:0;}
        .modal{background:#06080F;border:1px solid var(--border);border-bottom:none;width:100%;max-width:600px;max-height:92vh;overflow-y:auto;animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;border-radius:12px 12px 0 0;}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
        .modal-hdr{padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#06080F;z-index:1;}
        .modal-title{font-family:'Orbitron',monospace;font-size:13px;font-weight:800;letter-spacing:0.1em;color:var(--green);}
        .modal-close{background:transparent;border:1px solid var(--border);color:var(--muted);width:32px;height:32px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;cursor:pointer;border-radius:4px;}
        .modal-close:hover{border-color:var(--red);color:var(--red);}
        .modal-body{padding:20px 24px 32px;}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .form-group{display:flex;flex-direction:column;gap:6px;}
        .form-group.full{grid-column:span 2;}
        .form-label{font-family:'Orbitron',monospace;font-size:8px;letter-spacing:0.3em;color:var(--muted);text-transform:uppercase;}
        .form-input{background:rgba(0,255,136,0.03);border:1px solid var(--border);color:var(--text);padding:11px 12px;font-family:'Exo 2',sans-serif;font-size:15px;outline:none;transition:all 0.3s;width:100%;-webkit-appearance:none;border-radius:0;}
        .form-input:focus{border-color:rgba(0,255,136,0.35);}
        .form-select{background:#06080F;border:1px solid var(--border);color:var(--text);padding:11px 12px;font-family:'Exo 2',sans-serif;font-size:15px;outline:none;width:100%;-webkit-appearance:none;border-radius:0;}
        .form-textarea{background:rgba(0,255,136,0.03);border:1px solid var(--border);color:var(--text);padding:11px 12px;font-family:'Exo 2',sans-serif;font-size:15px;outline:none;width:100%;resize:vertical;min-height:80px;border-radius:0;}
        .form-btns{display:flex;gap:10px;margin-top:20px;}
        .save-btn{flex:1;background:transparent;border:1px solid var(--green);color:var(--green);padding:14px;font-family:'Orbitron',monospace;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;transition:all 0.3s;cursor:pointer;}
        .save-btn:hover{background:rgba(0,255,136,0.08);}
        .save-btn:disabled{opacity:0.5;cursor:not-allowed;}
        .cancel-btn{background:transparent;border:1px solid var(--border);color:var(--muted);padding:14px 20px;font-family:'Orbitron',monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.2s;cursor:pointer;}
        .del-modal{background:#06080F;border:1px solid rgba(255,107,107,0.3);width:100%;max-width:380px;padding:32px 24px;text-align:center;border-radius:8px;margin:20px;}
        .del-title{font-family:'Orbitron',monospace;font-size:15px;font-weight:800;color:var(--red);margin-bottom:10px;}
        .del-sub{font-size:13px;color:var(--muted);margin-bottom:24px;line-height:1.6;}
        .del-btns{display:flex;gap:10px;justify-content:center;}
        .del-confirm{background:transparent;border:1px solid var(--red);color:var(--red);padding:11px 24px;font-family:'Orbitron',monospace;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;}
        .del-confirm:hover{background:rgba(255,107,107,0.1);}

        /* ── SECTIONS ── */
        .section-wrap{padding:24px;}
        .section-title{font-family:'Orbitron',monospace;font-size:12px;color:var(--muted);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:20px;}
        .analytics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
        .ana-card{background:var(--bg2);border:1px solid var(--border);padding:24px;}
        .ana-title{font-family:'Orbitron',monospace;font-size:10px;letter-spacing:0.2em;color:var(--muted);text-transform:uppercase;margin-bottom:16px;}
        .plan-bar{display:flex;flex-direction:column;gap:10px;}
        .plan-row{display:flex;align-items:center;gap:10px;}
        .plan-name{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;width:64px;}
        .plan-track{flex:1;height:5px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;}
        .plan-fill{height:100%;border-radius:3px;}
        .plan-count{font-family:'Orbitron',monospace;font-size:10px;color:var(--muted);width:16px;text-align:right;}
        .rev-big{font-family:'Orbitron',monospace;font-size:32px;font-weight:900;color:var(--green);line-height:1;margin-bottom:6px;}
        .rev-sub{font-size:12px;color:var(--muted);}
        .pay-list{display:flex;flex-direction:column;gap:10px;}
        .pay-row{display:flex;align-items:center;justify-content:space-between;}
        .pay-label{font-size:13px;color:var(--muted);}
        .pay-val{font-family:'Orbitron',monospace;font-size:14px;font-weight:700;}
        .log-list{display:flex;flex-direction:column;gap:8px;}
        .log-item{background:var(--bg2);border:1px solid var(--border);padding:14px 16px;display:flex;align-items:center;gap:14px;}
        .log-icon{font-size:18px;flex-shrink:0;}
        .log-info{flex:1;min-width:0;}
        .log-action{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;letter-spacing:0.1em;}
        .log-details{font-size:12px;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .log-by{font-size:11px;color:var(--green);margin-top:2px;text-transform:capitalize;}
        .log-time{font-family:'Orbitron',monospace;font-size:9px;color:var(--muted);text-align:right;flex-shrink:0;}
        .settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:700px;}
        .settings-card{background:var(--bg2);border:1px solid var(--border);padding:24px;}
        .settings-title{font-family:'Orbitron',monospace;font-size:10px;letter-spacing:0.2em;color:var(--muted);text-transform:uppercase;margin-bottom:18px;}
        .pw-err{color:var(--red);font-size:12px;margin-top:4px;}
        .info-row{margin-bottom:14px;}
        .info-label{font-family:'Orbitron',monospace;font-size:8px;letter-spacing:0.3em;color:var(--muted);text-transform:uppercase;margin-bottom:5px;}
        .info-val{font-size:13px;color:var(--text);}

        /* ── BOTTOM NAV (mobile) ── */
        .bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg2);border-top:1px solid var(--border);z-index:150;padding:0;}
        .bottom-nav-inner{display:flex;align-items:stretch;}
        .bn-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 4px 8px;gap:4px;background:transparent;border:none;color:var(--muted);font-family:'Orbitron',monospace;font-size:7px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;position:relative;}
        .bn-item.active{color:var(--green);}
        .bn-item.active::before{content:'';position:absolute;top:0;left:20%;right:20%;height:2px;background:var(--green);}
        .bn-icon{font-size:18px;}

        /* ── TOAST ── */
        .toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#06080F;border:1px solid var(--border);color:var(--text);padding:12px 24px;font-family:'Orbitron',monospace;font-size:11px;letter-spacing:0.1em;z-index:99999;animation:slideUp 0.3s ease both;box-shadow:0 8px 40px rgba(0,255,136,0.15);white-space:nowrap;}

        /* ── MOBILE BREAKPOINT ── */
        @media(max-width:768px){
          .sidebar{position:fixed;left:-260px;top:0;height:100vh;transition:left 0.3s ease;z-index:300;}
          .sidebar.open{left:0;}
          .sb-overlay{display:block;position:fixed;inset:0;background:rgba(2,4,8,0.7);z-index:250;backdrop-filter:blur(4px);}
          .hamburger{display:flex;}
          .dash-header{padding:14px 16px;}
          .dash-date{display:none;}
          .stats-row{grid-template-columns:repeat(2,1fr);}
          .stat-box{padding:16px;}
          .stat-value{font-size:22px;}
          .toolbar{padding:12px 16px;gap:8px;}
          .client-table{display:none;}
          .card-list{display:flex;}
          .table-wrap{padding:0 0 16px;}
          .error-banner{margin:12px 16px;}
          .analytics-grid{grid-template-columns:1fr;}
          .settings-grid{grid-template-columns:1fr;}
          .form-grid{grid-template-columns:1fr;}
          .form-group.full{grid-column:span 1;}
          .section-wrap{padding:16px;}
          .bottom-nav{display:block;}
          .main{padding-bottom:80px;}
          .toast{bottom:88px;}
          .log-time{display:none;}
          .modal-overlay{align-items:flex-end;}
        }
        @media(min-width:769px){
          .bottom-nav{display:none;}
          .hamburger{display:none;}
        }
      `}</style>

      {toast && <div className="toast">{toast}</div>}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="sb-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div className="modal-title">{editClient ? "// Edit Client" : "// Add New Client"}</div>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Shop Name *</label><input className="form-input" value={form.shop_name} onChange={e=>setForm(p=>({...p,shop_name:e.target.value}))} placeholder="Ramesh Chai Wala" /></div>
                <div className="form-group"><label className="form-label">Owner Name</label><input className="form-input" value={form.owner_name} onChange={e=>setForm(p=>({...p,owner_name:e.target.value}))} placeholder="Full name" /></div>
                <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="10-digit number" /></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} /></div>
                <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Plan</label><select className="form-select" value={form.plan} onChange={e=>setForm(p=>({...p,plan:e.target.value as Plan}))}><option>Basic</option><option>Standard</option><option>Premium</option></select></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value as Status}))}><option>Active</option><option>Pending</option><option>Paused</option></select></div>
                <div className="form-group"><label className="form-label">Monthly Fee (₹)</label><input className="form-input" type="number" value={form.monthly_fee} onChange={e=>setForm(p=>({...p,monthly_fee:+e.target.value}))} /></div>
                <div className="form-group"><label className="form-label">Payment Status</label><select className="form-select" value={form.pay_status} onChange={e=>setForm(p=>({...p,pay_status:e.target.value as PayStatus}))}><option>Paid</option><option>Due</option><option>Overdue</option></select></div>
                <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" type="date" value={form.due_date} onChange={e=>setForm(p=>({...p,due_date:e.target.value}))} /></div>
                <div className="form-group full"><label className="form-label">Website URL</label><input className="form-input" value={form.website_url} onChange={e=>setForm(p=>({...p,website_url:e.target.value}))} placeholder="shopname.psido.in" /></div>
                <div className="form-group full"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Internal notes..." /></div>
              </div>
              <div className="form-btns">
                <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="save-btn" onClick={save} disabled={saving}>{saving ? "Saving..." : editClient ? "Save Changes" : "Add Client"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delConfirm && (
        <div className="modal-overlay" onClick={() => setDelConfirm(null)}>
          <div className="del-modal" onClick={e => e.stopPropagation()}>
            <div className="del-title">⚠ Delete Client?</div>
            <div className="del-sub">This will permanently remove this client from the database.</div>
            <div className="del-btns">
              <button className="cancel-btn" onClick={() => setDelConfirm(null)}>Cancel</button>
              <button className="del-confirm" onClick={() => del(delConfirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="dash">
        {/* Sidebar */}
        <div className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sb-logo"><img src="/psido-logo.png" alt="Psido" /><div><div className="sb-brand">PSIDO</div><div className="sb-tag">Admin</div></div></div>
          <div className="sb-user"><div className="sb-avatar">{user[0]?.toUpperCase()}</div><div><div className="sb-uname">{user}</div><div className="sb-role">Administrator</div></div></div>
          <div className="sb-nav">
            <button className={`sb-item${tab==="clients"?" active":""}`} onClick={()=>switchTab("clients")}><span className="sb-icon">👥</span>Clients</button>
            <button className={`sb-item${tab==="analytics"?" active":""}`} onClick={()=>switchTab("analytics")}><span className="sb-icon">📊</span>Analytics</button>
            <button className={`sb-item${tab==="logs"?" active":""}`} onClick={()=>switchTab("logs")}><span className="sb-icon">📋</span>Activity Logs</button>
            <button className={`sb-item${tab==="settings"?" active":""}`} onClick={()=>switchTab("settings")}><span className="sb-icon">⚙️</span>Settings</button>
            <a href="/" className="sb-item" target="_blank"><span className="sb-icon">🌐</span>View Website</a>
          </div>
          <div className="sb-bottom"><button className="sb-logout" onClick={logout}>⏻ &nbsp;Logout</button></div>
        </div>

        {/* Main Content */}
        <div className="main">
          {/* Header */}
          <div className="dash-header">
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
            <div className="dash-title">// <span>Psido</span> Dashboard</div>
            <div className="dash-meta">
              <div className="db-badge"><div className="db-dot" />Live</div>
              <div className="dash-date">{new Date().toDateString()}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-box"><div className="stat-label">Clients</div><div className="stat-value" style={{color:"var(--green)"}}>{stats.total}</div><div className="stat-sub">Total</div></div>
            <div className="stat-box"><div className="stat-label">Active</div><div className="stat-value" style={{color:"var(--cyan)"}}>{stats.active}</div><div className="stat-sub">Running</div></div>
            <div className="stat-box"><div className="stat-label">Revenue</div><div className="stat-value" style={{color:"var(--purple)"}}>₹{stats.revenue.toLocaleString()}</div><div className="stat-sub">Collected</div></div>
            <div className="stat-box"><div className="stat-label">Overdue</div><div className="stat-value" style={{color:"var(--red)"}}>{stats.overdue}</div><div className="stat-sub">Follow up</div></div>
          </div>

          {/* Clients Tab */}
          {tab==="clients" && (
            <>
              <div className="toolbar">
                <div className="search-box"><span className="search-icon">🔍</span><input placeholder="Search shop, owner, phone..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
                <div className="filter-wrap">
                  {(["All","Basic","Standard","Premium"] as const).map(p=>(
                    <button key={p} className={`filter-btn${filterPlan===p?" active":""}`} onClick={()=>setFilterPlan(p)}>{p}</button>
                  ))}
                </div>
                <button className="add-btn" onClick={openAdd}>+ Add</button>
              </div>
              {error && <div className="error-banner">{error}<button className="retry-btn" onClick={loadClients}>Retry</button></div>}

              {loading ? (<div className="loading-state"><div className="spinner"/><div className="loading-txt">Loading...</div></div>)
              : filtered.length===0 ? (<div className="empty-state"><div className="empty-icon">🏪</div><div className="empty-txt">{search?"No results":"No clients yet!"}</div></div>)
              : (<>
                {/* Desktop Table */}
                <div className="table-wrap">
                  <table className="client-table">
                    <thead><tr><th>Shop</th><th>Plan</th><th>Status</th><th>Payment</th><th>Due</th><th>Fee</th><th>Website</th><th>Actions</th></tr></thead>
                    <tbody>{filtered.map(c=>(
                      <tr key={c.id}>
                        <td><div className="shop-name">{c.shop_name}</div><div className="owner-sub">{c.owner_name} · {c.phone}</div></td>
                        <td><span className="badge" style={{color:PC[c.plan]}}><span className="badge-dot"/>{c.plan}</span></td>
                        <td><span className="badge" style={{color:SC[c.status]}}><span className="badge-dot"/>{c.status}</span></td>
                        <td><span className="badge" style={{color:PAC[c.pay_status]}}><span className="badge-dot"/>{c.pay_status}</span></td>
                        <td style={{fontSize:11,color:"var(--muted)",fontFamily:"'Orbitron',monospace"}}>{c.due_date||"—"}</td>
                        <td style={{fontFamily:"'Orbitron',monospace",fontSize:13,color:"var(--green)"}}>₹{c.monthly_fee.toLocaleString()}</td>
                        <td>{c.website_url?<a href={`https://${c.website_url}`} target="_blank" className="url-link">↗ {c.website_url}</a>:<span style={{color:"var(--muted)"}}>—</span>}</td>
                        <td><div className="action-btns"><button className="act-btn wa" onClick={()=>openWA(c.phone,c.owner_name)}>💬</button><button className="act-btn" onClick={()=>openEdit(c)}>✏️</button><button className="act-btn del" onClick={()=>setDelConfirm(c.id)}>🗑</button></div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="card-list">
                  {filtered.map(c=>(
                    <div className="client-card" key={c.id} style={{"--card-color": PC[c.plan]} as React.CSSProperties}>
                      <style>{`.client-card::before{background:${PC[c.plan]}}`}</style>
                      <div className="card-top">
                        <div><div className="card-name">{c.shop_name}</div><div className="card-owner">{c.owner_name} · {c.phone}</div></div>
                        <span className="badge" style={{color:PC[c.plan],flexShrink:0}}><span className="badge-dot"/>{c.plan}</span>
                      </div>
                      <div className="card-badges">
                        <span className="badge" style={{color:SC[c.status]}}><span className="badge-dot"/>{c.status}</span>
                        <span className="badge" style={{color:PAC[c.pay_status]}}><span className="badge-dot"/>{c.pay_status}</span>
                      </div>
                      <div className="card-row"><div className="card-label">Fee</div><div className="card-val" style={{color:"var(--green)",fontFamily:"'Orbitron',monospace"}}>₹{c.monthly_fee.toLocaleString()}/mo</div></div>
                      {c.due_date && <div className="card-row"><div className="card-label">Due</div><div className="card-val" style={{fontFamily:"'Orbitron',monospace",fontSize:12}}>{c.due_date}</div></div>}
                      {c.website_url && <div className="card-row"><div className="card-label">Site</div><a href={`https://${c.website_url}`} target="_blank" className="url-link">↗ {c.website_url}</a></div>}
                      <div className="card-actions">
                        <button className="card-btn wa" onClick={()=>openWA(c.phone,c.owner_name)}>💬 WhatsApp</button>
                        <button className="card-btn edit" onClick={()=>openEdit(c)}>✏️ Edit</button>
                        <button className="card-btn del" onClick={()=>setDelConfirm(c.id)}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>)}
            </>
          )}

          {/* Analytics Tab */}
          {tab==="analytics" && (
            <div className="section-wrap">
              <div className="section-title">// Overview</div>
              <div className="analytics-grid">
                <div className="ana-card"><div className="ana-title">Plans Distribution</div><div className="plan-bar">{(["Basic","Standard","Premium"] as Plan[]).map(p=>{const count=clients.filter(c=>c.plan===p).length;const pct=clients.length?(count/clients.length)*100:0;return(<div className="plan-row" key={p}><div className="plan-name" style={{color:PC[p]}}>{p}</div><div className="plan-track"><div className="plan-fill" style={{width:`${pct}%`,background:PC[p]}}/></div><div className="plan-count">{count}</div></div>);})}</div></div>
                <div className="ana-card"><div className="ana-title">Monthly Revenue</div><div className="rev-big">₹{clients.reduce((a,c)=>a+c.monthly_fee,0).toLocaleString()}</div><div className="rev-sub">Billed · ₹{stats.revenue.toLocaleString()} collected</div></div>
                <div className="ana-card"><div className="ana-title">Payment Summary</div><div className="pay-list">{(["Paid","Due","Overdue"] as PayStatus[]).map(p=>(<div className="pay-row" key={p}><div className="pay-label">{p}</div><div className="pay-val" style={{color:PAC[p]}}>{clients.filter(c=>c.pay_status===p).length}</div></div>))}</div></div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {tab==="logs" && (
            <div className="section-wrap">
              <div className="section-title">// Activity Logs</div>
              {logsLoading ? (<div className="loading-state"><div className="spinner"/><div className="loading-txt">Loading...</div></div>)
              : logs.length===0 ? (<div className="empty-state"><div className="empty-icon">📋</div><div className="empty-txt">No activity yet</div></div>)
              : (<div className="log-list">{logs.map(log=>(
                <div className="log-item" key={log.id}>
                  <div className="log-icon">{AICON[log.action]||"📌"}</div>
                  <div className="log-info">
                    <div className="log-action" style={{color:ACOLOR[log.action]||"var(--text)"}}>{log.action.replace(/_/g," ")}</div>
                    <div className="log-details">{log.details}</div>
                    <div className="log-by">by {log.performed_by}</div>
                  </div>
                  <div className="log-time">{fmtTime(log.created_at)}</div>
                </div>
              ))}</div>)}
            </div>
          )}

          {/* Settings Tab */}
          {tab==="settings" && (
            <div className="section-wrap">
              <div className="section-title">// Settings</div>
              <div className="settings-grid">
                <div className="settings-card">
                  <div className="settings-title">Change My Password</div>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" placeholder="Min 6 characters" value={pwForm.newPw} onChange={e=>setPwForm(p=>({...p,newPw:e.target.value}))} /></div>
                    <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Repeat password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} /></div>
                    {pwError && <div className="pw-err">⚠ {pwError}</div>}
                    <button className="save-btn" style={{marginTop:4}} onClick={handleChangePw} disabled={pwLoading}>{pwLoading?"Saving...":"Change Password"}</button>
                  </div>
                </div>
                <div className="settings-card">
                  <div className="settings-title">Account Info</div>
                  <div className="info-row"><div className="info-label">Logged in as</div><div style={{fontFamily:"'Orbitron',monospace",fontSize:16,color:"var(--green)",textTransform:"capitalize"}}>{user}</div></div>
                  <div className="info-row"><div className="info-label">Role</div><div className="info-val">Administrator · Full Access</div></div>
                  <div className="info-row"><div className="info-label">Database</div><div style={{color:"var(--green)",fontSize:13}}>✅ Supabase Connected</div></div>
                  <div className="info-row"><div className="info-label">Note</div><div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>Change your password after first login!</div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          <button className={`bn-item${tab==="clients"?" active":""}`} onClick={()=>setTab("clients")}><span className="bn-icon">👥</span>Clients</button>
          <button className={`bn-item${tab==="analytics"?" active":""}`} onClick={()=>setTab("analytics")}><span className="bn-icon">📊</span>Stats</button>
          <button className={`bn-item${tab==="logs"?" active":""}`} onClick={()=>setTab("logs")}><span className="bn-icon">📋</span>Logs</button>
          <button className={`bn-item${tab==="settings"?" active":""}`} onClick={()=>setTab("settings")}><span className="bn-icon">⚙️</span>Settings</button>
        </div>
      </div>
    </>
  );
}