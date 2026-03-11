"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const WA_NUMBERS = [
  { label: "General Enquiry", number: "919148547599", hint: "Typically replies in minutes" },
  { label: "General Enquiry", number: "916361345841", hint: "Typically replies in minutes" },
];

const BEFORE_AFTER = [
  { before: "Customers walk past your shop without knowing you exist", after: "Customers find you on Google before they even leave home" },
  { before: "Zero online orders — only who walks in buys", after: "Orders coming in even while you sleep" },
  { before: "No way to tell customers about new items or offers", after: "Instant WhatsApp & push notifications to all your customers" },
  { before: "Big brands take your customers with apps & ads", after: "You compete with big brands — on equal digital ground" },
];

const TESTIMONIALS = [
  { name: "Ramesh K.", shop: "Chai & Snacks, Jayanagar", quote: "In the first month after Psido set up my page, I got 40 new customers who found me on Google. I never expected this.", stars: 5 },
  { name: "Lakshmi S.", shop: "Saree House, Koramangala", quote: "My daughter showed me the website they built. I cried. I never thought my small shop could look this professional.", stars: 5 },
  { name: "Suresh M.", shop: "Fresh Fruits, Indiranagar", quote: "WhatsApp orders doubled in 3 weeks. Now I know which items to stock more of because I can see what people order.", stars: 5 },
];

const SERVICES = [
  { id: "01", icon: "⚡", title: "Your Shop Website", sub: "Live in 24 hours", desc: "A beautiful, fast website your customers can find on Google. Mobile-ready, easy to update, built to bring people to your door.", color: "#00FF88" },
  { id: "02", icon: "📱", title: "Mobile App", sub: "iOS & Android", desc: "Your own app on every customer's phone. They can order, track, get offers — all without leaving your brand.", color: "#00D4FF" },
  { id: "03", icon: "📣", title: "Smart Marketing", sub: "Ads that actually work", desc: "We run Google & Instagram ads targeted at people near your shop. You get real customers — not just clicks.", color: "#B57BFF" },
  { id: "04", icon: "📊", title: "Business Dashboard", sub: "Know your numbers", desc: "See your sales, top customers, and best products in real-time. Make decisions that grow your profit every week.", color: "#FFD700" },
];

export default function PsidoLanding() {
  const [mouse, setMouse] = useState({ x: -100, y: -100 });
  const [scrollY, setScrollY] = useState(0);
  const [waOpen, setWaOpen] = useState(false);
  const [activeBA, setActiveBA] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Cursor — direct DOM update for zero lag
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
      if (ringRef.current) {
        ringRef.current.style.left = e.clientX + "px";
        ringRef.current.style.top = e.clientY + "px";
      }
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 120); }, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const ba = setInterval(() => setActiveBA(p => (p + 1) % BEFORE_AFTER.length), 3500);
    return () => clearInterval(ba);
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 110 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4,
      op: Math.random() * 0.5 + 0.1,
      c: ["#00FF88","#4DFFB4","#00D4FF","#B57BFF"][Math.floor(Math.random() * 4)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + Math.floor(p.op * 255).toString(16).padStart(2, "0");
        ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[j].x - p.x, dy = pts[j].y - p.y, d = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,255,136,${0.06 * (1 - d / 110)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  const openWA = (num: string) => {
    const msg = encodeURIComponent("Hi Psido! I want to know more about digitalizing my shop.");
    window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
    setWaOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Exo+2:wght@200;300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #020408; --bg2: #04060F; --bg3: #060810;
          --border: rgba(0,255,136,0.1); --border2: rgba(0,212,255,0.1);
          --green: #00FF88; --cyan: #00D4FF; --purple: #B57BFF; --gold: #FFD700;
          --text: #E8FFF4; --muted: rgba(180,230,210,0.5);
          --glow-g: 0 0 40px rgba(0,255,136,0.35);
          --glow-c: 0 0 40px rgba(0,212,255,0.35);
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'Exo 2', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; cursor: none; }
        * { cursor: none !important; }
        body::after { content:''; position:fixed; inset:0; z-index:9980; background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.02) 2px,rgba(0,0,0,0.02) 4px); pointer-events:none; }

        /* CURSOR — always on top, never hidden */
        .cur { position:fixed; width:10px; height:10px; border-radius:50%; background:var(--green); pointer-events:none; z-index:99999; transform:translate(-50%,-50%); box-shadow:0 0 18px var(--green),0 0 36px rgba(0,255,136,0.4); transition:width 0.15s,height 0.15s,background 0.15s; }
        .cur-ring { position:fixed; width:38px; height:38px; border:1px solid rgba(0,255,136,0.4); border-radius:50%; pointer-events:none; z-index:99998; transform:translate(-50%,-50%); transition:width 0.2s,height 0.2s,border-color 0.2s; }
        a:hover ~ .cur, button:hover ~ .cur { width:18px; height:18px; background:var(--cyan); }

        /* NAV */
        nav { position:fixed; top:0; left:0; right:0; z-index:1000; padding:14px 60px; display:flex; align-items:center; justify-content:space-between; transition:all 0.4s; }
        nav.solid { background:rgba(2,4,8,0.95); backdrop-filter:blur(24px); border-bottom:1px solid var(--border); }
        .nav-logo { display:flex; align-items:center; gap:12px; text-decoration:none; }
        .nav-logo img { width:44px; height:44px; object-fit:contain; filter:drop-shadow(0 0 12px rgba(0,255,136,0.6)); }
        .nav-brand { display:flex; flex-direction:column; }
        .nav-name { font-family:'Orbitron',monospace; font-size:20px; font-weight:900; letter-spacing:3px; color:var(--green); text-shadow:0 0 20px rgba(0,255,136,0.7); line-height:1; position:relative; }
        .nav-glitch { position:absolute; left:0; top:0; color:var(--cyan); clip-path:polygon(0 25%,100% 25%,100% 55%,0 55%); opacity:0; transition:opacity 0.05s; font-family:'Orbitron',monospace; font-size:20px; font-weight:900; letter-spacing:3px; }
        .nav-tag { font-size:9px; letter-spacing:0.2em; color:var(--muted); text-transform:uppercase; font-weight:500; }
        .nav-links { display:flex; gap:40px; list-style:none; }
        .nav-links a { color:var(--muted); text-decoration:none; font-size:11px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; transition:all 0.3s; font-family:'Orbitron',monospace; position:relative; }
        .nav-links a::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:1px; background:var(--green); box-shadow:var(--glow-g); transition:width 0.3s; }
        .nav-links a:hover { color:var(--green); }
        .nav-links a:hover::after { width:100%; }
        .nav-cta { background:transparent; border:1px solid var(--green); color:var(--green); padding:10px 24px; font-family:'Orbitron',monospace; font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; transition:all 0.3s; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); position:relative; overflow:hidden; }
        .nav-cta::before { content:''; position:absolute; inset:0; background:var(--green); opacity:0; transition:opacity 0.3s; }
        .nav-cta:hover::before { opacity:0.12; }
        .nav-cta:hover { box-shadow:var(--glow-g); }
        .nav-cta span { position:relative; z-index:1; }

        /* HERO */
        .hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:120px 60px 80px; position:relative; overflow:hidden; text-align:center; }
        .hero canvas { position:absolute; inset:0; pointer-events:none; z-index:0; }
        .hexbg { position:absolute; inset:0; z-index:0; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='104'%3E%3Cpath d='M30 2L58 17L58 47L30 62L2 47L2 17Z' fill='none' stroke='rgba(0,255,136,0.05)' stroke-width='1'/%3E%3Cpath d='M30 54L58 69L58 99L30 114L2 99L2 69Z' fill='none' stroke='rgba(0,255,136,0.05)' stroke-width='1'/%3E%3C/svg%3E"); opacity:0.8; }
        .orb1 { position:absolute; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(0,255,136,0.07) 0%,rgba(0,212,255,0.03) 40%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; z-index:0; transition:transform 0.4s ease; }
        .orb2 { position:absolute; width:350px; height:350px; border-radius:50%; background:radial-gradient(circle,rgba(75,94,252,0.1) 0%,transparent 70%); top:10%; right:5%; animation:flt 9s ease-in-out infinite; pointer-events:none; z-index:0; }
        @keyframes flt { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-28px) scale(1.04)} }

        .hero-content { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; }
        .eyebrow { display:inline-flex; align-items:center; gap:14px; margin-bottom:36px; animation:fadeUp 0.8s 0.1s ease both; }
        .eline { width:36px; height:1px; background:linear-gradient(90deg,transparent,var(--green)); }
        .eline.r { background:linear-gradient(90deg,var(--green),transparent); }
        .etxt { font-family:'Orbitron',monospace; font-size:10px; font-weight:600; letter-spacing:0.35em; color:var(--green); text-transform:uppercase; }

        .hero-logo-wrap { margin-bottom:20px; animation:fadeUp 0.8s 0.05s ease both; }
        .hero-logo-img { width:100px; height:100px; object-fit:contain; filter:drop-shadow(0 0 30px rgba(0,255,136,0.7)) drop-shadow(0 0 60px rgba(0,255,136,0.3)); animation:logoPulse 4s ease-in-out infinite; }
        @keyframes logoPulse { 0%,100%{filter:drop-shadow(0 0 30px rgba(0,255,136,0.7)) drop-shadow(0 0 60px rgba(0,255,136,0.3))} 50%{filter:drop-shadow(0 0 50px rgba(0,255,136,0.9)) drop-shadow(0 0 90px rgba(0,255,136,0.5))} }

        h1.hero-h1 { font-family:'Orbitron',monospace; font-size:clamp(38px,7vw,86px); font-weight:900; line-height:1.05; letter-spacing:-1px; margin-bottom:8px; animation:fadeUp 0.8s 0.2s ease both; }
        .w1 { display:block; color:var(--text); }
        .w2 { display:block; background:linear-gradient(135deg,var(--green) 0%,var(--cyan) 50%,var(--purple) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; filter:drop-shadow(0 0 24px rgba(0,255,136,0.5)); background-size:200%; animation:gshift 4s ease infinite; }
        .w3 { display:block; color:var(--cyan); text-shadow:0 0 36px rgba(0,212,255,0.5); }
        @keyframes gshift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

        .hero-sub { font-size:clamp(14px,1.8vw,18px); color:var(--muted); max-width:600px; line-height:1.9; margin:24px auto 48px; font-weight:300; letter-spacing:0.02em; animation:fadeUp 0.8s 0.35s ease both; }
        .hero-sub strong { color:var(--green); font-weight:600; }

        .hero-btns { display:flex; gap:18px; justify-content:center; flex-wrap:wrap; animation:fadeUp 0.8s 0.5s ease both; }

        /* BUTTONS — all fixed, cursor stays visible */
        .btn-primary { position:relative; overflow:hidden; background:transparent; border:1px solid var(--green); color:var(--green); padding:15px 44px; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; transition:all 0.4s; clip-path:polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%); display:inline-flex; align-items:center; gap:8px; }
        .btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,var(--green),var(--cyan)); opacity:0; transition:opacity 0.4s; z-index:0; }
        .btn-primary::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(0,255,136,0.25),transparent); transition:left 0.5s; z-index:0; }
        .btn-primary:hover { color:#000; box-shadow:0 0 60px rgba(0,255,136,0.5),inset 0 0 20px rgba(0,255,136,0.1); }
        .btn-primary:hover::before { opacity:1; }
        .btn-primary:hover::after { left:100%; }
        .btn-primary span { position:relative; z-index:1; }

        .btn-outline { background:transparent; border:1px solid rgba(0,212,255,0.3); color:var(--cyan); padding:15px 44px; font-family:'Orbitron',monospace; font-size:11px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; transition:all 0.4s; clip-path:polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%); }
        .btn-outline:hover { border-color:var(--cyan); box-shadow:var(--glow-c); background:rgba(0,212,255,0.05); }

        .scroll-hint { position:absolute; bottom:36px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:8px; opacity:0.4; z-index:2; }
        .sh-txt { font-family:'Orbitron',monospace; font-size:9px; letter-spacing:0.35em; color:var(--green); text-transform:uppercase; }
        .sh-line { width:1px; height:40px; background:linear-gradient(180deg,var(--green),transparent); animation:sa 2s ease-in-out infinite; }
        @keyframes sa { 0%,100%{opacity:0.3;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.2)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        /* STATS */
        .stats-bar { border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:0 60px; background:rgba(4,6,15,0.9); }
        .stats-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); }
        .stat { padding:44px 28px; text-align:center; border-right:1px solid var(--border); position:relative; overflow:hidden; transition:all 0.4s; }
        .stat:last-child { border-right:none; }
        .stat::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,255,136,0.04),transparent); opacity:0; transition:opacity 0.4s; }
        .stat:hover::before { opacity:1; }
        .stat-v { font-family:'Orbitron',monospace; font-size:50px; font-weight:900; line-height:1; color:var(--green); text-shadow:0 0 28px rgba(0,255,136,0.6); }
        .stat-u { font-size:22px; color:var(--cyan); }
        .stat-l { font-size:10px; color:var(--muted); letter-spacing:0.25em; text-transform:uppercase; font-family:'Orbitron',monospace; margin-top:6px; }

        /* EMOTIONAL SECTION */
        .pain-section { padding:120px 60px; max-width:1200px; margin:0 auto; }
        .pain-grid { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; margin-top:60px; }
        .pain-text h3 { font-family:'Orbitron',monospace; font-size:clamp(24px,3vw,40px); font-weight:900; line-height:1.2; letter-spacing:-0.5px; margin-bottom:24px; }
        .pain-text h3 span { color:var(--green); }
        .pain-text p { font-size:16px; color:var(--muted); line-height:1.9; font-weight:300; margin-bottom:16px; }
        .pain-text p strong { color:var(--text); font-weight:600; }
        .pain-stat-box { background:rgba(0,255,136,0.03); border:1px solid var(--border); padding:32px; margin-top:32px; clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px)); }
        .pain-stat-num { font-family:'Orbitron',monospace; font-size:52px; font-weight:900; color:var(--green); text-shadow:0 0 30px rgba(0,255,136,0.6); line-height:1; }
        .pain-stat-txt { font-size:14px; color:var(--muted); margin-top:8px; line-height:1.6; }

        /* BEFORE AFTER */
        .ba-section { background:var(--bg2); border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:100px 60px; }
        .ba-inner { max-width:1200px; margin:0 auto; }
        .ba-grid { display:grid; grid-template-columns:1fr auto 1fr; gap:0; margin-top:60px; align-items:stretch; }
        .ba-col { padding:48px; position:relative; overflow:hidden; transition:all 0.6s ease; }
        .ba-before { background:rgba(255,80,80,0.04); border:1px solid rgba(255,80,80,0.15); }
        .ba-after { background:rgba(0,255,136,0.04); border:1px solid rgba(0,255,136,0.2); }
        .ba-label { font-family:'Orbitron',monospace; font-size:10px; letter-spacing:0.3em; text-transform:uppercase; margin-bottom:20px; display:flex; align-items:center; gap:10px; font-weight:700; }
        .ba-before .ba-label { color:rgba(255,100,100,0.7); }
        .ba-after .ba-label { color:var(--green); }
        .ba-dot { width:8px; height:8px; border-radius:50%; }
        .ba-before .ba-dot { background:rgba(255,100,100,0.7); }
        .ba-after .ba-dot { background:var(--green); box-shadow:0 0 10px var(--green); }
        .ba-text { font-size:16px; line-height:1.8; font-weight:300; }
        .ba-before .ba-text { color:rgba(220,180,180,0.7); }
        .ba-after .ba-text { color:var(--text); }
        .ba-divider { display:flex; align-items:center; justify-content:center; padding:0 24px; }
        .ba-arrow { font-family:'Orbitron',monospace; font-size:28px; color:var(--green); text-shadow:0 0 20px var(--green); animation:arrowPulse 1.5s ease-in-out infinite; }
        @keyframes arrowPulse { 0%,100%{transform:translateX(0);opacity:0.6} 50%{transform:translateX(6px);opacity:1} }
        .ba-dots { display:flex; gap:10px; justify-content:center; margin-top:40px; }
        .ba-dot-btn { width:8px; height:8px; border-radius:50%; border:1px solid var(--border); background:transparent; transition:all 0.3s; }
        .ba-dot-btn.active { background:var(--green); border-color:var(--green); box-shadow:0 0 10px var(--green); }

        /* SERVICES */
        .svc-section { padding:120px 60px; max-width:1400px; margin:0 auto; }
        .svc-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2px; margin-top:70px; }
        .svc-card { background:rgba(0,255,136,0.015); border:1px solid var(--border); padding:48px; position:relative; overflow:hidden; transition:all 0.5s cubic-bezier(0.23,1,0.32,1); }
        .svc-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; opacity:0; transition:opacity 0.4s; }
        .svc-card:hover { border-color:rgba(0,255,136,0.25); transform:translateY(-4px); box-shadow:0 20px 70px rgba(0,255,136,0.07),inset 0 1px 0 rgba(0,255,136,0.12); }
        .svc-card:hover::before { opacity:1; }
        .svc-id { font-family:'Orbitron',monospace; font-size:10px; color:var(--muted); letter-spacing:0.25em; margin-bottom:24px; display:flex; align-items:center; gap:10px; }
        .svc-id::before { content:''; width:18px; height:1px; background:var(--muted); opacity:0.4; }
        .svc-icon { font-size:44px; margin-bottom:20px; display:block; transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .svc-card:hover .svc-icon { transform:scale(1.12) rotate(-8deg); }
        .svc-ttl { font-family:'Orbitron',monospace; font-size:19px; font-weight:800; margin-bottom:6px; }
        .svc-sub { font-size:11px; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:18px; font-weight:500; font-family:'Orbitron',monospace; }
        .svc-dsc { font-size:14px; color:var(--muted); line-height:1.85; font-weight:300; }
        .svc-cta { display:inline-flex; align-items:center; gap:8px; margin-top:28px; font-size:11px; font-family:'Orbitron',monospace; letter-spacing:0.15em; text-transform:uppercase; font-weight:600; transition:all 0.3s; opacity:0.5; }
        .svc-card:hover .svc-cta { opacity:1; gap:14px; }

        /* VIDEO */
        .vid-section { padding:80px 60px; max-width:1200px; margin:0 auto; }
        .vid-thumb { position:relative; border:1px solid var(--border); border-radius:4px; overflow:hidden; background:var(--bg3); aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; margin-top:60px; }
        .vid-overlay { position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,255,136,0.05),rgba(0,212,255,0.03)); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; }
        .vid-play { width:80px; height:80px; border-radius:50%; background:rgba(0,255,136,0.1); border:2px solid var(--green); display:flex; align-items:center; justify-content:center; font-size:28px; transition:all 0.3s; box-shadow:0 0 30px rgba(0,255,136,0.2); }
        .vid-play:hover { background:rgba(0,255,136,0.2); box-shadow:0 0 60px rgba(0,255,136,0.4); transform:scale(1.08); }
        .vid-txt { font-family:'Orbitron',monospace; font-size:12px; letter-spacing:0.3em; color:var(--muted); text-transform:uppercase; }
        .vid-corner { position:absolute; width:20px; height:20px; border-color:var(--green); border-style:solid; opacity:0.5; }
        .vid-corner.tl { top:16px; left:16px; border-width:2px 0 0 2px; }
        .vid-corner.tr { top:16px; right:16px; border-width:2px 2px 0 0; }
        .vid-corner.bl { bottom:16px; left:16px; border-width:0 0 2px 2px; }
        .vid-corner.br { bottom:16px; right:16px; border-width:0 2px 2px 0; }

        /* HOW */
        .how-section { background:var(--bg2); border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:120px 60px; }
        .how-inner { max-width:1200px; margin:0 auto; }
        .timeline { display:grid; grid-template-columns:repeat(3,1fr); margin-top:70px; position:relative; }
        .timeline::before { content:''; position:absolute; top:39px; left:15%; right:15%; height:1px; background:linear-gradient(90deg,var(--green),var(--cyan),var(--purple)); opacity:0.2; }
        .t-step { padding:40px 32px; text-align:center; }
        .t-orb { width:78px; height:78px; border-radius:50%; border:1px solid rgba(0,255,136,0.4); display:flex; align-items:center; justify-content:center; margin:0 auto 28px; position:relative; background:rgba(0,255,136,0.03); box-shadow:0 0 24px rgba(0,255,136,0.1); }
        .t-orb::before { content:''; position:absolute; inset:-5px; border-radius:50%; border:1px solid rgba(0,255,136,0.1); animation:op 3s ease-in-out infinite; }
        .t-orb::after { content:''; position:absolute; inset:-12px; border-radius:50%; border:1px solid rgba(0,255,136,0.05); animation:op 3s 0.6s ease-in-out infinite; }
        @keyframes op { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:0.4} }
        .t-n { font-family:'Orbitron',monospace; font-size:22px; font-weight:900; color:var(--green); text-shadow:0 0 18px rgba(0,255,136,0.8); }
        .t-ttl { font-family:'Orbitron',monospace; font-size:15px; font-weight:800; margin-bottom:14px; }
        .t-dsc { font-size:14px; color:var(--muted); line-height:1.8; font-weight:300; max-width:240px; margin:0 auto; }

        /* TESTIMONIALS */
        .testi-section { padding:120px 60px; max-width:1400px; margin:0 auto; }
        .testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:70px; }
        .testi-card { background:rgba(0,255,136,0.015); border:1px solid var(--border); padding:40px; position:relative; transition:all 0.4s; }
        .testi-card:hover { border-color:rgba(0,255,136,0.25); transform:translateY(-4px); box-shadow:0 16px 60px rgba(0,255,136,0.07); }
        .testi-stars { color:var(--gold); font-size:16px; margin-bottom:20px; text-shadow:0 0 10px rgba(255,215,0,0.5); letter-spacing:2px; }
        .testi-quote { font-size:15px; color:var(--text); line-height:1.8; font-weight:300; font-style:italic; margin-bottom:28px; }
        .testi-quote::before { content:'"'; font-size:40px; color:var(--green); line-height:0; vertical-align:-16px; margin-right:4px; opacity:0.5; }
        .testi-name { font-family:'Orbitron',monospace; font-size:13px; font-weight:700; color:var(--green); }
        .testi-shop { font-size:12px; color:var(--muted); margin-top:4px; letter-spacing:0.05em; }
        .testi-note { text-align:center; margin-top:32px; font-size:12px; color:var(--muted); font-style:italic; }

        /* CONTACT */
        .contact-section { background:var(--bg2); border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:120px 60px; }
        .contact-inner { max-width:1200px; margin:0 auto; }
        .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-top:70px; }
        .c-card { background:rgba(0,255,136,0.02); border:1px solid var(--border); padding:48px; clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,22px 100%,0 calc(100% - 22px)); position:relative; transition:all 0.4s; }
        .c-card::before { content:''; position:absolute; top:0; right:0; width:0; height:0; border-left:22px solid transparent; border-top:22px solid rgba(0,255,136,0.2); }
        .c-card:hover { border-color:rgba(0,255,136,0.2); box-shadow:0 10px 50px rgba(0,255,136,0.06); }
        .c-lbl { font-family:'Orbitron',monospace; font-size:9px; letter-spacing:0.35em; color:var(--muted); text-transform:uppercase; margin-bottom:8px; }
        .c-title { font-family:'Orbitron',monospace; font-size:18px; font-weight:800; color:var(--text); margin-bottom:4px; }
        .c-role { font-size:13px; color:var(--green); letter-spacing:0.08em; margin-bottom:28px; }
        .c-div { width:36px; height:1px; background:var(--border); margin-bottom:16px; }
        .c-phone { font-family:'Orbitron',monospace; font-size:22px; font-weight:700; color:var(--cyan); text-shadow:0 0 18px rgba(0,212,255,0.5); letter-spacing:2px; }

        /* FINAL CTA */
        .cta-section { padding:120px 60px; text-align:center; position:relative; overflow:hidden; }
        .cta-bg-word { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:'Orbitron',monospace; font-size:clamp(80px,14vw,180px); font-weight:900; color:rgba(0,255,136,0.018); white-space:nowrap; pointer-events:none; letter-spacing:0.1em; }
        .cta-inner { position:relative; z-index:1; max-width:800px; margin:0 auto; }
        .cta-h { font-family:'Orbitron',monospace; font-size:clamp(26px,4.5vw,58px); font-weight:900; line-height:1.1; letter-spacing:-1px; margin-bottom:20px; }
        .cta-h span { color:var(--green); }
        .cta-p { font-size:16px; color:var(--muted); margin-bottom:48px; line-height:1.9; font-weight:300; }
        .cta-btns { display:flex; gap:20px; justify-content:center; flex-wrap:wrap; }
        .cta-note { font-size:12px; color:var(--muted); margin-top:16px; font-style:italic; }

        /* SECTION HEADER */
        .sec-tag { font-family:'Orbitron',monospace; font-size:10px; letter-spacing:0.4em; color:var(--green); text-transform:uppercase; display:flex; align-items:center; gap:14px; margin-bottom:18px; }
        .tl { flex:1; max-width:54px; height:1px; background:var(--green); opacity:0.35; }
        .sec-h { font-family:'Orbitron',monospace; font-size:clamp(26px,4vw,50px); font-weight:900; line-height:1.1; letter-spacing:-1px; }
        .sec-h .acc { color:var(--green); }
        .sec-sub { font-size:16px; color:var(--muted); max-width:520px; line-height:1.8; font-weight:300; margin-top:14px; }

        /* WHATSAPP POPUP */
        .wa-float { position:fixed; bottom:32px; right:32px; z-index:5000; width:60px; height:60px; border-radius:50%; background:#25D366; border:none; display:flex; align-items:center; justify-content:center; font-size:26px; box-shadow:0 0 0 0 rgba(37,211,102,0.4); animation:wap 2.5s infinite; transition:transform 0.3s; }
        .wa-float:hover { transform:scale(1.1); }
        @keyframes wap { 0%{box-shadow:0 0 0 0 rgba(37,211,102,0.5)} 70%{box-shadow:0 0 0 20px rgba(37,211,102,0)} 100%{box-shadow:0 0 0 0 rgba(37,211,102,0)} }

        .wa-overlay { position:fixed; inset:0; z-index:4998; background:rgba(2,4,8,0.7); backdrop-filter:blur(8px); display:flex; align-items:flex-end; justify-content:flex-end; padding:110px 32px; }
        .wa-popup { background:#0A0F1A; border:1px solid rgba(0,255,136,0.2); width:300px; overflow:hidden; clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px)); box-shadow:0 20px 80px rgba(0,255,136,0.15); animation:popUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes popUp { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        .wa-popup-hdr { padding:20px 24px 16px; border-bottom:1px solid var(--border); }
        .wa-popup-title { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:0.15em; color:var(--green); display:flex; align-items:center; gap:8px; }
        .wa-popup-sub { font-size:12px; color:var(--muted); margin-top:4px; }
        .wa-option { width:100%; background:transparent; border:none; border-bottom:1px solid var(--border); padding:18px 24px; text-align:left; display:flex; align-items:center; gap:14px; transition:all 0.25s; }
        .wa-option:last-child { border-bottom:none; }
        .wa-option:hover { background:rgba(0,255,136,0.06); }
        .wa-num-icon { width:40px; height:40px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .wa-num-lbl { font-family:'Orbitron',monospace; font-size:11px; font-weight:700; color:var(--text); letter-spacing:0.05em; }
        .wa-num-hint { font-size:11px; color:var(--muted); margin-top:2px; }
        .wa-close { width:100%; background:transparent; border:none; border-top:1px solid var(--border); padding:14px; font-family:'Orbitron',monospace; font-size:10px; color:var(--muted); letter-spacing:0.2em; text-transform:uppercase; text-align:center; transition:color 0.2s; }
        .wa-close:hover { color:var(--text); }

        /* VIDEO MODAL */
        .vid-modal-overlay { position:fixed; inset:0; z-index:8000; background:rgba(2,4,8,0.95); display:flex; align-items:center; justify-content:center; padding:40px; }
        .vid-modal { background:var(--bg2); border:1px solid var(--border); padding:40px; max-width:700px; width:100%; text-align:center; position:relative; }
        .vid-modal-close { position:absolute; top:16px; right:16px; background:transparent; border:none; color:var(--muted); font-size:20px; transition:color 0.2s; }
        .vid-modal-close:hover { color:var(--green); }
        .vid-modal-placeholder { aspect-ratio:16/9; background:rgba(0,255,136,0.03); border:1px dashed rgba(0,255,136,0.2); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; margin-top:20px; }
        .vid-modal-txt { font-family:'Orbitron',monospace; font-size:11px; letter-spacing:0.25em; color:var(--muted); text-transform:uppercase; }

        /* FOOTER */
        footer { background:var(--bg); border-top:1px solid var(--border); padding:40px 60px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; }
        .f-logo { display:flex; align-items:center; gap:10px; }
        .f-logo img { width:36px; height:36px; object-fit:contain; filter:drop-shadow(0 0 8px rgba(0,255,136,0.4)); }
        .f-brand { font-family:'Orbitron',monospace; font-size:18px; font-weight:900; color:var(--green); letter-spacing:3px; text-shadow:0 0 16px rgba(0,255,136,0.4); }
        .f-tag { font-size:11px; color:var(--muted); letter-spacing:0.15em; text-transform:uppercase; font-family:'Orbitron',monospace; }
        .f-links { display:flex; gap:28px; }
        .f-links a { font-size:11px; color:var(--muted); text-decoration:none; transition:color 0.2s; letter-spacing:0.15em; text-transform:uppercase; font-family:'Orbitron',monospace; }
        .f-links a:hover { color:var(--green); }

        @media(max-width:900px) {
          body { cursor:auto; } * { cursor:auto !important; } .cur,.cur-ring { display:none; }
          nav { padding:14px 20px; } .nav-links { display:none; }
          .hero { padding:100px 20px 70px; }
          .stats-bar { padding:0 20px; } .stats-inner { grid-template-columns:repeat(2,1fr); }
          .stat { border-right:none; border-bottom:1px solid var(--border); }
          .stat:nth-child(odd) { border-right:1px solid var(--border); }
          .stat:nth-last-child(-n+2) { border-bottom:none; }
          .pain-section,.svc-section,.testi-section,.vid-section,.contact-section .contact-inner,.cta-section { padding:60px 20px; }
          .pain-grid,.contact-grid { grid-template-columns:1fr; gap:40px; }
          .svc-grid,.testi-grid { grid-template-columns:1fr; }
          .ba-grid { grid-template-columns:1fr; gap:0; }
          .ba-divider { padding:20px; transform:rotate(90deg); }
          .timeline { grid-template-columns:1fr; }
          .timeline::before { display:none; }
          .how-section,.ba-section { padding:60px 20px; }
          footer { padding:32px 20px; flex-direction:column; }
          .wa-overlay { padding:90px 16px; }
          .wa-popup { width:100%; max-width:320px; }
        }
      `}</style>

      {/* CUSTOM CURSOR */}
      <div className="cur" ref={cursorRef} />
      <div className="cur-ring" ref={ringRef} />

      {/* WHATSAPP OVERLAY */}
      {waOpen && (
        <div className="wa-overlay" onClick={() => setWaOpen(false)}>
          <div className="wa-popup" onClick={e => e.stopPropagation()}>
            <div className="wa-popup-hdr">
              <div className="wa-popup-title">💬 &nbsp;Chat with Psido</div>
              <div className="wa-popup-sub">Choose a number to start chatting</div>
            </div>
            {WA_NUMBERS.map((w, i) => (
              <button className="wa-option" key={i} onClick={() => openWA(w.number)}>
                <div className="wa-num-icon">💬</div>
                <div>
                  <div className="wa-num-lbl">{w.label} {i + 1}</div>
                  <div className="wa-num-hint">{w.hint}</div>
                </div>
              </button>
            ))}
            <button className="wa-close" onClick={() => setWaOpen(false)}>✕ &nbsp; Close</button>
          </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {videoModalOpen && (
        <div className="vid-modal-overlay" onClick={() => setVideoModalOpen(false)}>
          <div className="vid-modal" onClick={e => e.stopPropagation()}>
            <button className="vid-modal-close" onClick={() => setVideoModalOpen(false)}>✕</button>
            <div className="sec-tag" style={{ justifyContent: "center" }}><div className="tl" />Demo Video<div className="tl" /></div>
            <div className="vid-modal-placeholder">
              <div style={{ fontSize: 48 }}>🎬</div>
              <div className="vid-modal-txt">Demo video coming soon</div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 300 }}>We are currently filming real shop transformations in Bangalore</div>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className={scrollY > 60 ? "solid" : ""}>
        <a href="#" className="nav-logo">
          <img src="/psido-logo.png" alt="Psido" />
          <div className="nav-brand">
            <div className="nav-name">
              PSIDO
              {glitch && <div className="nav-glitch">PSIDO</div>}
            </div>
            <div className="nav-tag">Grow Together</div>
          </div>
        </a>
        <ul className="nav-links">
          <li><a href="#services">Services</a></li>
          <li><a href="#how">Process</a></li>
          <li><a href="#proof">Proof</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <button className="nav-cta" onClick={() => setWaOpen(true)}><span>Talk to Us</span></button>
      </nav>

      {/* HERO */}
      <div className="hero">
        <canvas ref={canvasRef} />
        <div className="hexbg" />
        <div className="orb1" style={{ transform: `translate(-50%,-50%) translate(${(mouse.x - 0.5) * -22}px,${(mouse.y - 0.5) * -22}px)` }} />
        <div className="orb2" />

        <div className="hero-content">
          <div className="hero-logo-wrap">
            <img src="/psido-logo.png" alt="Psido Wolf Logo" className="hero-logo-img" />
          </div>
          <div className="eyebrow">
            <div className="eline" />
            <span className="etxt">Bangalore's Digital Growth Partner</span>
            <div className="eline r" />
          </div>
          <h1 className="hero-h1">
            <span className="w1">YOUR SHOP.</span>
            <span className="w2">ONLINE. GROWING.</span>
            <span className="w3">UNSTOPPABLE.</span>
          </h1>
          <p className="hero-sub">
            <strong>Bangalore's local shops are losing lakhs every month</strong> to businesses that went digital.
            We build your website, app, and marketing — so customers find <strong>you</strong> first.
            No tech knowledge needed. Just results in 48 hours.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => setWaOpen(true)}>
              <span>🚀 &nbsp;Start Growing Today</span>
            </button>
            <button className="btn-outline" onClick={() => setVideoModalOpen(true)}>
              ▶ &nbsp;See How It Works
            </button>
          </div>
        </div>

        <div className="scroll-hint">
          <span className="sh-txt">Scroll</span>
          <div className="sh-line" />
        </div>
      </div>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stats-inner">
          {[
            { v: "48", u: "hrs", l: "Go Live" },
            { v: "3x", u: "", l: "More Customers" },
            { v: "₹0", u: "", l: "Setup Risk" },
            { v: "24/7", u: "", l: "Support" },
          ].map((s, i) => (
            <div className="stat" key={i}>
              <div className="stat-v">{s.v}<span className="stat-u">{s.u}</span></div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* EMOTIONAL / PAIN SECTION */}
      <div className="pain-section">
        <div className="sec-tag"><div className="tl" />The Hard Truth</div>
        <div className="pain-grid">
          <div className="pain-text">
            <h3>Every day offline,<br /><span>your customer walks into</span><br />someone else's shop.</h3>
            <p>In Bangalore alone, <strong>over 70% of customers now search Google</strong> before deciding where to shop. If your business doesn't appear — they'll find your competitor who does.</p>
            <p>You have worked years building your shop. Your quality is better. Your prices are fair. But <strong>online, you're invisible.</strong> And invisible means losing.</p>
            <p>Psido was built for shop owners exactly like you. We handle the digital side completely — so you can focus on what you do best.</p>
          </div>
          <div>
            <div className="pain-stat-box">
              <div className="pain-stat-num">70%</div>
              <div className="pain-stat-txt">of Bangalore customers search online before visiting a local shop. If you're not there, you don't exist to them.</div>
            </div>
            <div className="pain-stat-box" style={{ marginTop: 16 }}>
              <div className="pain-stat-num">₹2L+</div>
              <div className="pain-stat-txt">estimated revenue lost per year by a typical local shop with no digital presence in a metro city.</div>
            </div>
          </div>
        </div>
      </div>

      {/* BEFORE / AFTER */}
      <div className="ba-section">
        <div className="ba-inner">
          <div className="sec-tag"><div className="tl" />The Psido Difference</div>
          <h2 className="sec-h">Before Psido.<br /><span className="acc">After Psido.</span></h2>
          <div className="ba-grid">
            <div className="ba-col ba-before">
              <div className="ba-label"><div className="ba-dot" />Without Psido</div>
              <div className="ba-text">{BEFORE_AFTER[activeBA].before}</div>
            </div>
            <div className="ba-divider"><div className="ba-arrow">→</div></div>
            <div className="ba-col ba-after">
              <div className="ba-label"><div className="ba-dot" />With Psido</div>
              <div className="ba-text">{BEFORE_AFTER[activeBA].after}</div>
            </div>
          </div>
          <div className="ba-dots">
            {BEFORE_AFTER.map((_, i) => (
              <button key={i} className={`ba-dot-btn${activeBA === i ? " active" : ""}`} onClick={() => setActiveBA(i)} />
            ))}
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <div className="svc-section" id="services">
        <div className="sec-tag"><div className="tl" />What We Build For You</div>
        <h2 className="sec-h">Four systems.<br /><span className="acc">One goal: More customers.</span></h2>
        <p className="sec-sub">Everything your shop needs to go digital, get found, and grow — handled end to end by our team.</p>
        <div className="svc-grid">
          {SERVICES.map((s, i) => (
            <div className="svc-card" key={i} style={{ "--cc": s.color } as React.CSSProperties}>
              <style>{`.svc-card:nth-child(${i + 1})::before{background:linear-gradient(90deg,transparent,${s.color},transparent);}`}</style>
              <div className="svc-id">MODULE {s.id}</div>
              <span className="svc-icon">{s.icon}</span>
              <h3 className="svc-ttl">{s.title}</h3>
              <div className="svc-sub" style={{ color: s.color }}>{s.sub}</div>
              <p className="svc-dsc">{s.desc}</p>
              <div className="svc-cta" style={{ color: s.color }}>
                Learn More <span style={{ transition: "transform 0.3s" }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIDEO PLACEHOLDER */}
      <div className="vid-section">
        <div className="sec-tag"><div className="tl" />See It In Action</div>
        <h2 className="sec-h">Watch a <span className="acc">real shop transform</span></h2>
        <p className="sec-sub">From zero online presence to fully digital in under 48 hours. Watch it happen.</p>
        <div className="vid-thumb">
          <div className="vid-corner tl" /><div className="vid-corner tr" />
          <div className="vid-corner bl" /><div className="vid-corner br" />
          <div className="vid-overlay">
            <button className="vid-play" onClick={() => setVideoModalOpen(true)}>▶</button>
            <div className="vid-txt">Watch: A Bangalore shop owner's story</div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="how-section" id="how">
        <div className="how-inner">
          <div className="sec-tag"><div className="tl" />How It Works</div>
          <h2 className="sec-h">Live in <span className="acc">48 hours.</span><br />3 steps only.</h2>
          <div className="timeline">
            {[
              { n: "01", t: "We Meet", d: "We come to your shop in Bangalore, understand your business, and plan your complete digital presence together. Free consultation." },
              { n: "02", t: "We Build", d: "Our team builds your website, sets up your app, and launches your marketing — all within 48 hours. Zero work from your side." },
              { n: "03", t: "You Grow", d: "Customers start finding you online. Orders come in. You see the growth in real time on your dashboard. We stay with you every step." },
            ].map((s, i) => (
              <div className="t-step" key={i}>
                <div className="t-orb"><span className="t-n">{s.n}</span></div>
                <h3 className="t-ttl">{s.t}</h3>
                <p className="t-dsc">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="testi-section" id="proof">
        <div className="sec-tag"><div className="tl" />What Shop Owners Say</div>
        <h2 className="sec-h">Real shops.<br /><span className="acc">Real results.</span></h2>
        <p className="sec-sub">Bangalore shop owners who took the leap — here's what happened.</p>
        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="testi-card" key={i}>
              <div className="testi-stars">{"★".repeat(t.stars)}</div>
              <div className="testi-quote">{t.quote}</div>
              <div className="testi-name">{t.name}</div>
              <div className="testi-shop">{t.shop}</div>
            </div>
          ))}
        </div>
        <div className="testi-note">* Testimonials represent expected results. Actual outcomes may vary based on shop type, location, and market.</div>
      </div>

      {/* CONTACT */}
      <div className="contact-section" id="contact">
        <div className="contact-inner">
          <div className="sec-tag"><div className="tl" />Talk To Us</div>
          <h2 className="sec-h">One conversation.<br /><span className="acc">Zero risk.</span></h2>
          <p className="sec-sub">We visit your shop, explain everything, and you decide. No pressure. No hidden fees. Just honest advice.</p>
          <div className="contact-grid">
            <div className="c-card">
              <div className="c-lbl">General Enquiry</div>
              <div className="c-title">PSIDO TEAM</div>
              <div className="c-role">Available 9 AM – 9 PM, 7 days a week</div>
              <div className="c-div" />
              <div className="c-lbl">WhatsApp / Call</div>
              <div className="c-phone">+91 91485 47599</div>
            </div>
            <div className="c-card">
              <div className="c-lbl">General Enquiry</div>
              <div className="c-title">PSIDO TEAM</div>
              <div className="c-role">Available 9 AM – 9 PM, 7 days a week</div>
              <div className="c-div" />
              <div className="c-lbl">WhatsApp / Call</div>
              <div className="c-phone">+91 63613 45841</div>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="cta-section">
        <div className="cta-bg-word">GROW TOGETHER</div>
        <div className="cta-inner">
          <div className="sec-tag" style={{ justifyContent: "center" }}><div className="tl" />Make The Move<div className="tl" style={{ background: "linear-gradient(90deg, var(--green), transparent)" }} /></div>
          <h2 className="cta-h">Your competitor just went digital.<br /><span>Will you?</span></h2>
          <p className="cta-p">Every week you wait is another week of customers you never get back.<br />We make going digital simple, fast, and risk-free for your shop.</p>
          <div className="cta-btns">
            <button className="btn-primary" onClick={() => setWaOpen(true)}><span>💬 &nbsp;WhatsApp Us Now</span></button>
            <button className="btn-outline" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>View Contact Details</button>
          </div>
          <div className="cta-note">Free consultation. No commitment. We come to your shop.</div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="f-logo">
          <img src="/psido-logo.png" alt="Psido" />
          <div className="f-brand">PSIDO</div>
        </div>
        <div className="f-tag">Grow Together // Bangalore 2025</div>
        <div className="f-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <button className="wa-float" onClick={() => setWaOpen(true)} title="Chat with Psido">💬</button>
    </>
  );
}
