'use strict';
/* ===== LOCAL DATA STORE ===== */
const DB = {
  get: k => JSON.parse(localStorage.getItem('psido_' + k) || 'null'),
  set: (k, v) => localStorage.setItem('psido_' + k, JSON.stringify(v)),
  init() {
    if (!this.get('employees')) {
      this.set('employees', [
        { id: 'EMP001', name: 'Rahul Sharma', email: 'rahul@psido.in', password: 'Pass@123', role: 'Security Analyst', dept: 'SOC', joined: '2025-06-01', status: 'active', twoFA: false },
        { id: 'INT001', name: 'Priya Menon', email: 'priya@psido.in', password: 'Pass@123', role: 'Intern', dept: 'VAPT', joined: '2026-01-15', status: 'active', twoFA: false }
      ]);
    }
    if (!this.get('payslips')) {
      this.set('payslips', [
        { id: 'PS001', empId: 'EMP001', month: 'April 2026', gross: 65000, deductions: 8000, net: 57000, date: '2026-04-30', status: 'paid' },
        { id: 'PS002', empId: 'EMP001', month: 'March 2026', gross: 65000, deductions: 8000, net: 57000, date: '2026-03-31', status: 'paid' },
        { id: 'PS003', empId: 'INT001', month: 'April 2026', gross: 15000, deductions: 0, net: 15000, date: '2026-04-30', status: 'paid' }
      ]);
    }
    if (!this.get('certificates')) {
      this.set('certificates', [
        { id: 'CERT001', empId: 'INT001', name: 'Priya Menon', type: 'Internship', dept: 'VAPT', from: '2026-01-15', to: '2026-07-15', requested: '2026-04-20', status: 'pending', ceoName: '' }
      ]);
    }
  }
};
DB.init();

/* ===== AUTH ===== */
function getCurrentUser() { return DB.get('session'); }
function requireAuth() {
  if (!getCurrentUser()) { window.location.href = 'login.html'; return null; }
  return getCurrentUser();
}
function logout() { localStorage.removeItem('psido_session'); window.location.href = 'login.html'; }

/* ===== TOAST ===== */
function showToast(msg, type = 'info') {
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${icons[type]}"></i><span>${msg}</span>`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ===== LOGIN PAGE ===== */
if (document.getElementById('loginForm')) {
  const form = document.getElementById('loginForm');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  let loginEmail = '';
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const employees = DB.get('employees') || [];
    const user = employees.find(u => u.email === email && u.password === password && u.status === 'active');
    if (!user) { showToast('Invalid credentials. Please try again.', 'error'); return; }
    loginEmail = email;
    if (user.twoFA) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      DB.set('otp_temp', { otp, email, expires: Date.now() + 300000 });
      showToast('OTP sent to email. Demo: Auto-filling...', 'info');
      step1.style.display = 'none'; step2.style.display = 'block';
      const otpStr = otp.toString();
      document.querySelectorAll('#otpForm .otp-input').forEach((inp, i) => inp.value = otpStr[i]);
    } else {
      DB.set('session', { ...user, password: undefined });
      window.location.href = 'dashboard.html';
    }
  });
  const otpForm = document.getElementById('otpForm');
  if (otpForm) {
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((inp, i) => {
      inp.addEventListener('input', () => { if (inp.value && i < otpInputs.length - 1) otpInputs[i + 1].focus(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && i > 0) otpInputs[i - 1].focus(); });
    });
    otpForm.addEventListener('submit', e => {
      e.preventDefault();
      const entered = [...otpInputs].map(i => i.value).join('');
      const stored = DB.get('otp_temp');
      if (stored && stored.otp == entered && stored.email === loginEmail && Date.now() < stored.expires) {
        localStorage.removeItem('psido_otp_temp');
        const emp = (DB.get('employees') || []).find(u => u.email === loginEmail);
        DB.set('session', { ...emp, password: undefined });
        window.location.href = 'dashboard.html';
      } else { showToast('Invalid or expired OTP', 'error'); }
    });
  }
}

/* ===== DASHBOARD ===== */
if (document.getElementById('dashboardPage')) {
  const user = requireAuth();
  if (user) {
    document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.user-role').forEach(el => el.textContent = user.role);
    document.querySelectorAll('.user-dept').forEach(el => el.textContent = user.dept);
    const initEl = document.querySelectorAll('.user-init');
    initEl.forEach(el => el.textContent = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase());
    const payslips = (DB.get('payslips') || []).filter(p => p.empId === user.id);
    const certs = (DB.get('certificates') || []).filter(c => c.empId === user.id);
    const el = id => document.getElementById(id);
    if (el('payslipCount')) el('payslipCount').textContent = payslips.length;
    if (el('certCount')) el('certCount').textContent = certs.length;
    if (el('pendingCount')) el('pendingCount').textContent = certs.filter(c => c.status === 'pending').length;
    if (el('logoutBtn')) el('logoutBtn').addEventListener('click', logout);
  }
}

/* ===== PAYSLIP PAGE ===== */
if (document.getElementById('payslipPage')) {
  const user = requireAuth();
  if (user) {
    document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.user-init').forEach(el => el.textContent = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase());
    const payslips = (DB.get('payslips') || []).filter(p => p.empId === user.id);
    const list = document.getElementById('payslipList');
    if (list) {
      list.innerHTML = payslips.length ? payslips.map(p => `
        <div class="payslip-card">
          <div><div class="payslip-month">${p.month}</div><small style="color:var(--text-muted)">Date: ${p.date}</small></div>
          <div class="payslip-amount">₹${p.net.toLocaleString()}</div>
          <div><span class="status-badge active">${p.status}</span></div>
          <button class="btn btn-sm btn-outline" onclick="printPayslip('${p.id}')"><i class="fas fa-download"></i> Download</button>
        </div>`).join('') : '<p style="color:var(--text-muted);text-align:center;padding:2rem">No payslips found</p>';
    }
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }
}
window.printPayslip = function (id) {
  const user = DB.get('session');
  const p = (DB.get('payslips') || []).find(ps => ps.id === id);
  if (!p || !user) return;
  const win = window.open('', '_blank');
  
  const basic = Math.round(p.gross * 0.5);
  const hra = Math.round(p.gross * 0.2);
  const conv = Math.round(p.gross * 0.1);
  const spl = p.gross - basic - hra - conv;
  
  const pf = Math.round(basic * 0.12);
  const pt = 200;
  const tds = p.deductions - pf - pt;
  
  const html = `<html><head><title>Payslip - ${p.month}</title><style>body{font-family:Arial,sans-serif;margin:0;padding:2rem;background:#f5f5f5;display:flex;justify-content:center} .payslip-container{background:#fff;width:100%;max-width:850px;padding:3rem;box-shadow:0 10px 30px rgba(0,0,0,0.1);box-sizing:border-box} .header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #00D4FF;padding-bottom:1rem;margin-bottom:2rem} .logo{max-height:50px;filter:invert(1)} .company-info{text-align:right;color:#555;font-size:0.85rem;line-height:1.4} .company-info h2{color:#1a1a2e;margin:0 0 0.25rem;font-size:1.4rem;letter-spacing:1px} .title{text-align:center;font-size:1.4rem;font-weight:700;color:#1a1a2e;text-transform:uppercase;margin-bottom:2rem;letter-spacing:2px} .emp-details{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem;border:1px solid #eee;padding:1.5rem;border-radius:4px;background:#fafafa} .detail-row{display:flex;margin-bottom:0.5rem;font-size:0.9rem} .detail-label{width:140px;color:#666;font-weight:600} .detail-val{color:#111;font-weight:700} .salary-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:2rem} .salary-table{width:100%;border-collapse:collapse} .salary-table th{background:#f8f9fa;padding:10px;text-align:left;border-bottom:2px solid #00D4FF;color:#1a1a2e;font-size:0.9rem} .salary-table td{padding:10px;border-bottom:1px solid #eee;font-size:0.9rem;color:#333} .salary-table .amount{text-align:right;font-family:monospace;font-size:1rem} .total-row td{font-weight:700;background:#f8f9fa;border-bottom:none;border-top:2px solid #1a1a2e} .net-pay{background:#00D4FF;color:#fff;padding:1.5rem;text-align:center;border-radius:4px;margin-bottom:2rem} .net-pay h3{margin:0 0 0.5rem;font-size:1.1rem;text-transform:uppercase;letter-spacing:1px} .net-pay .amount{font-size:2.2rem;font-weight:700;margin:0} .footer{text-align:center;font-size:0.8rem;color:#888;margin-top:3rem;padding-top:1rem;border-top:1px solid #eee}</style></head><body><div class="payslip-container"><div class="header"><img src="../assets/images/logo.png" class="logo" alt="Psido"> <div class="company-info"><h2>Psido Technologies Pvt. Ltd.</h2>Koramangala, Bengaluru - 560034<br>Email: hr@psido.in | Web: www.psido.in</div></div><div class="title">Payslip for ${p.month}</div><div class="emp-details"><div><div class="detail-row"><div class="detail-label">Employee Name:</div><div class="detail-val">${user.name}</div></div><div class="detail-row"><div class="detail-label">Employee ID:</div><div class="detail-val">${user.id}</div></div><div class="detail-row"><div class="detail-label">Designation:</div><div class="detail-val">${user.role}</div></div><div class="detail-row"><div class="detail-label">Department:</div><div class="detail-val">${user.dept}</div></div></div><div><div class="detail-row"><div class="detail-label">Date of Joining:</div><div class="detail-val">${user.joined}</div></div><div class="detail-row"><div class="detail-label">UAN Number:</div><div class="detail-val">100${Math.floor(Math.random()*8999999+1000000)}</div></div><div class="detail-row"><div class="detail-label">PAN Number:</div><div class="detail-val">ABCDE${Math.floor(Math.random()*899+100)}F</div></div><div class="detail-row"><div class="detail-label">Bank A/C No:</div><div class="detail-val">XXXXXXXX${Math.floor(Math.random()*8999+1000)}</div></div></div></div><div class="salary-grid"><table class="salary-table"><tr><th>EARNINGS</th><th class="amount">AMOUNT (₹)</th></tr><tr><td>Basic Salary</td><td class="amount">${basic.toLocaleString()}</td></tr><tr><td>House Rent Allowance</td><td class="amount">${hra.toLocaleString()}</td></tr><tr><td>Conveyance Allowance</td><td class="amount">${conv.toLocaleString()}</td></tr><tr><td>Special Allowance</td><td class="amount">${spl.toLocaleString()}</td></tr><tr class="total-row"><td>Gross Earnings</td><td class="amount">${p.gross.toLocaleString()}</td></tr></table><table class="salary-table"><tr><th>DEDUCTIONS</th><th class="amount">AMOUNT (₹)</th></tr><tr><td>Provident Fund (PF)</td><td class="amount">${pf.toLocaleString()}</td></tr><tr><td>Professional Tax</td><td class="amount">${pt.toLocaleString()}</td></tr><tr><td>Income Tax (TDS)</td><td class="amount">${Math.max(0, tds).toLocaleString()}</td></tr><tr><td>Other Deductions</td><td class="amount">0</td></tr><tr class="total-row"><td>Total Deductions</td><td class="amount">${p.deductions.toLocaleString()}</td></tr></table></div><div class="net-pay"><h3>Net Payable Amount</h3><div class="amount">₹ ${p.net.toLocaleString()}</div></div><div class="footer">This is a computer-generated payslip and does not require a physical signature.</div></div><script>window.onload=()=>window.print();</script></body></html>`;
  
  win.document.write(html);
  win.document.close();
};

/* ===== CERTIFICATE PAGE ===== */
if (document.getElementById('certPage')) {
  const user = requireAuth();
  if (user) {
    document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.user-init').forEach(el => el.textContent = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase());
    const certForm = document.getElementById('certRequestForm');
    const certs = DB.get('certificates') || [];
    const userCerts = certs.filter(c => c.empId === user.id);
    const listEl = document.getElementById('certList');
    window.renderCerts = function() {
      if (!listEl) return;
      const uc = (DB.get('certificates') || []).filter(c => c.empId === user.id);
      listEl.innerHTML = uc.length ? uc.map(c => `
        <div class="payslip-card">
          <div><strong>${c.type} Certificate</strong><br><small style="color:var(--text-muted)">${c.dept} | ${c.from} to ${c.to}</small></div>
          <span class="status-badge ${c.status}">${c.status}</span>
          ${c.status === 'approved' ? `<button class="btn btn-sm btn-outline" onclick="downloadCert('${c.id}')"><i class="fas fa-download"></i> Download</button>` : ''}
        </div>`).join('') : '<p style="color:var(--text-muted)">No certificate requests yet.</p>';
    };
    renderCerts();
    if (certForm) {
      certForm.addEventListener('submit', e => {
        e.preventDefault();
        const allCerts = DB.get('certificates') || [];
        allCerts.push({
          id: 'CERT' + Date.now(), empId: user.id, name: user.name,
          type: document.getElementById('certType').value,
          dept: user.dept,
          from: document.getElementById('fromDate').value,
          to: document.getElementById('toDate').value,
          requested: new Date().toISOString().split('T')[0],
          status: 'pending', ceoName: ''
        });
        DB.set('certificates', allCerts);
        showToast('Certificate requested successfully!', 'success');
        certForm.reset(); renderCerts();
      });
    }
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }
}
window.downloadCert = function (id) {
  const cert = (DB.get('certificates') || []).find(c => c.id === id);
  if (!cert || cert.status !== 'approved') return;
  const win = window.open('', '_blank');
  win.document.write(`<html><head><title>Certificate</title><style>body{font-family:Georgia,serif;padding:3rem;background:#fff;color:#000;text-align:center}.border-box{border:4px double #c0a060;padding:3rem;max-width:720px;margin:0 auto;position:relative}.title{font-size:2.2rem;font-weight:700;color:#1a1a2e;letter-spacing:2px;margin:1.5rem 0 0.5rem}.sub{text-transform:uppercase;letter-spacing:4px;font-size:0.85rem;color:#666;margin-bottom:2rem}.body-text{font-size:1rem;line-height:2;color:#333;margin-bottom:2rem}.name{font-size:1.5rem;font-weight:700;color:#1a1a2e;border-bottom:2px solid #c0a060;display:inline-block;padding:0 1rem}.sign-area{display:flex;justify-content:space-between;margin-top:3rem}.sign-block{text-align:center}.sign-line{width:150px;height:1px;background:#333;margin:0.5rem auto}.sign-name{font-size:0.85rem;color:#666}</style></head><body><div class="border-box"><img src="../assets/images/logo.png" height="60" style="margin-bottom:1rem"><div class="title">CERTIFICATE OF ${cert.type.toUpperCase()}</div><div class="sub">Psido Technologies Pvt. Ltd.</div><div class="body-text">This is to certify that<br><span class="name">${cert.name}</span><br>has successfully completed the <strong>${cert.type}</strong> program<br>in the <strong>${cert.dept}</strong> department<br>from <strong>${cert.from}</strong> to <strong>${cert.to}</strong>.</div><div class="sign-area"><div class="sign-block"><div class="sign-line"></div><div class="sign-name">HR Manager<br>Psido Technologies</div></div><div class="sign-block"><div class="sign-line"></div><div class="sign-name">${cert.ceoName}<br>CEO, Psido Technologies</div></div></div><p style="margin-top:2rem;font-size:0.75rem;color:#999">Certificate ID: ${cert.id} | Issued: ${new Date().toLocaleDateString('en-IN')}</p></div></body></html>`);
  win.document.close(); win.print();
};

/* ===== PROFILE PAGE ===== */
if (document.getElementById('profilePage')) {
  const user = requireAuth();
  if (user) {
    document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.user-init').forEach(el => el.textContent = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase());
    const fields = ['profName', 'profEmail', 'profRole', 'profDept', 'profId', 'profJoined'];
    const vals = [user.name, user.email, user.role, user.dept, user.id, user.joined];
    fields.forEach((f, i) => { const el = document.getElementById(f); if (el) el.value = vals[i]; });
    const pwForm = document.getElementById('changePassForm');
    if (pwForm) {
      pwForm.addEventListener('submit', e => {
        e.preventDefault();
        const curr = document.getElementById('currPass').value;
        const newP = document.getElementById('newPass').value;
        const conf = document.getElementById('confPass').value;
        if (curr !== user.password) { showToast('Current password is incorrect', 'error'); return; }
        if (newP !== conf) { showToast('Passwords do not match', 'error'); return; }
        if (newP.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
        const emps = DB.get('employees') || [];
        const idx = emps.findIndex(u => u.id === user.id);
        if (idx > -1) { emps[idx].password = newP; DB.set('employees', emps); }
        showToast('Password changed successfully!', 'success'); pwForm.reset();
      });
    }
    const twoFAToggle = document.getElementById('twoFAToggle');
    if (twoFAToggle) {
      twoFAToggle.checked = user.twoFA || false;
      twoFAToggle.addEventListener('change', () => {
        const emps = DB.get('employees') || [];
        const idx = emps.findIndex(u => u.id === user.id);
        if (idx > -1) { emps[idx].twoFA = twoFAToggle.checked; DB.set('employees', emps); }
        showToast('2-Step Verification ' + (twoFAToggle.checked ? 'enabled' : 'disabled'), 'success');
      });
    }
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }
}

/* === RESET PASSWORD PAGE === */
if (document.getElementById('resetPage')) {
  const form = document.getElementById('resetForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value.trim();
      const emps = DB.get('employees') || [];
      const user = emps.find(u => u.email === email);
      if (user) {
        const otp = Math.floor(100000 + Math.random() * 900000);
        DB.set('reset_otp', { otp, email, expires: Date.now() + 300000 });
        showToast('OTP: ' + otp + ' (simulated email delivery)', 'info');
        document.getElementById('step1r').style.display = 'none';
        document.getElementById('step2r').style.display = 'block';
      } else { showToast('Email not found', 'error'); }
    });
    const form2 = document.getElementById('resetForm2');
    if (form2) {
      form2.addEventListener('submit', e => {
        e.preventDefault();
        const otp = document.getElementById('resetOtp').value;
        const newP = document.getElementById('resetNewPass').value;
        const conf = document.getElementById('resetConfPass').value;
        const stored = DB.get('reset_otp');
        if (!stored || stored.otp != otp || Date.now() > stored.expires) { showToast('Invalid or expired OTP', 'error'); return; }
        if (newP !== conf) { showToast('Passwords do not match', 'error'); return; }
        const emps = DB.get('employees') || [];
        const idx = emps.findIndex(u => u.email === stored.email);
        if (idx > -1) { emps[idx].password = newP; DB.set('employees', emps); }
        localStorage.removeItem('psido_reset_otp');
        showToast('Password reset successfully! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
      });
    }
  }
}


