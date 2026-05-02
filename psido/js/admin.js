'use strict';
const ADMIN_CREDS = { email: 'admin@psido.in', password: 'Psido@2026' };
const DB = {
  get: k => JSON.parse(localStorage.getItem('psido_' + k) || 'null'),
  set: (k, v) => localStorage.setItem('psido_' + k, JSON.stringify(v))
};
function showToast(msg, type = 'info') {
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${icons[type]}"></i><span>${msg}</span>`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}
function adminLogout() { localStorage.removeItem('psido_admin_session'); window.location.href = 'login.html'; }
function requireAdmin() {
  if (!DB.get('admin_session')) { window.location.href = 'login.html'; return false; }
  return true;
}

/* === ADMIN LOGIN === */
if (document.getElementById('adminLoginForm')) {
  document.getElementById('adminLoginForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const pass = document.getElementById('adminPass').value;
    if (email === ADMIN_CREDS.email && pass === ADMIN_CREDS.password) {
      DB.set('admin_session', { email, role: 'CEO', name: 'Admin' });
      const otp = Math.floor(100000 + Math.random() * 900000);
      DB.set('admin_otp', { otp, expires: Date.now() + 300000 });
      showToast('OTP sent to email. Demo: Auto-filling...', 'info');
      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'block';
      const otpStr = otp.toString();
      document.querySelectorAll('#adminOtpForm .otp-input').forEach((inp, i) => inp.value = otpStr[i]);
    } else { showToast('Invalid admin credentials', 'error'); }
  });
  const otpForm = document.getElementById('adminOtpForm');
  if (otpForm) {
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((inp, i) => {
      inp.addEventListener('input', () => { if (inp.value && i < otpInputs.length - 1) otpInputs[i + 1].focus(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && i > 0) otpInputs[i - 1].focus(); });
    });
    otpForm.addEventListener('submit', e => {
      e.preventDefault();
      const entered = [...otpInputs].map(i => i.value).join('');
      const stored = DB.get('admin_otp');
      if (stored && stored.otp == entered && Date.now() < stored.expires) {
        localStorage.removeItem('psido_admin_otp');
        window.location.href = 'dashboard.html';
      } else { showToast('Invalid or expired OTP', 'error'); }
    });
  }
}

/* === ADMIN DASHBOARD === */
if (document.getElementById('adminDashPage')) {
  if (!requireAdmin()) return;
  const emps = DB.get('employees') || [];
  const certs = DB.get('certificates') || [];
  const payslips = DB.get('payslips') || [];
  const el = id => document.getElementById(id);
  if (el('totalEmp')) el('totalEmp').textContent = emps.filter(e => e.role !== 'Intern').length;
  if (el('totalInterns')) el('totalInterns').textContent = emps.filter(e => e.role === 'Intern').length;
  if (el('pendingCerts')) el('pendingCerts').textContent = certs.filter(c => c.status === 'pending').length;
  if (el('totalPayslips')) el('totalPayslips').textContent = payslips.length;
  const recentCertList = el('recentCerts');
  if (recentCertList) {
    recentCertList.innerHTML = certs.slice(0, 5).map(c => `
      <tr><td>${c.name}</td><td>${c.type}</td><td>${c.requested}</td>
      <td><span class="status-badge ${c.status}">${c.status}</span></td>
      <td><a href="certificates.html" class="btn btn-sm btn-outline">View</a></td></tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No requests</td></tr>';
  }
  document.getElementById('logoutBtn').addEventListener('click', adminLogout);
}

/* === MANAGE EMPLOYEES === */
if (document.getElementById('empPage')) {
  if (!requireAdmin()) return;
  window.renderEmps = function(filter = '') {
    const emps = (DB.get('employees') || []).filter(e => !filter || e.name.toLowerCase().includes(filter) || e.email.toLowerCase().includes(filter));
    const tbody = document.getElementById('empTableBody');
    if (!tbody) return;
    tbody.innerHTML = emps.map(e => `
      <tr>
        <td>${e.id}</td><td>${e.name}</td><td>${e.email}</td>
        <td>${e.role}</td><td>${e.dept}</td><td>${e.joined}</td>
        <td><span class="status-badge ${e.status}">${e.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="toggleEmpStatus('${e.id}')">${e.status === 'active' ? 'Disable' : 'Enable'}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEmp('${e.id}')">Delete</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">No employees found</td></tr>';
  };
  renderEmps();
  const search = document.getElementById('empSearch');
  if (search) search.addEventListener('input', () => renderEmps(search.value.trim().toLowerCase()));
  window.toggleEmpStatus = id => {
    const emps = DB.get('employees') || [];
    const idx = emps.findIndex(e => e.id === id);
    if (idx > -1) { emps[idx].status = emps[idx].status === 'active' ? 'inactive' : 'active'; DB.set('employees', emps); renderEmps(); showToast('Status updated', 'success'); }
  };
  window.deleteEmp = id => {
    if (!confirm('Delete this employee?')) return;
    DB.set('employees', (DB.get('employees') || []).filter(e => e.id !== id));
    renderEmps(); showToast('Employee deleted', 'info');
  };
  const addForm = document.getElementById('addEmpForm');
  if (addForm) {
    addForm.addEventListener('submit', e => {
      e.preventDefault();
      const emps = DB.get('employees') || [];
      const newEmp = {
        id: 'EMP' + (Date.now() % 100000),
        name: document.getElementById('empName').value,
        email: document.getElementById('empEmail').value,
        password: document.getElementById('empPass').value,
        role: document.getElementById('empRole').value,
        dept: document.getElementById('empDept').value,
        joined: document.getElementById('empJoined').value,
        status: 'active', twoFA: false
      };
      emps.push(newEmp); DB.set('employees', emps);
      document.getElementById('addEmpModal').classList.remove('open');
      addForm.reset(); renderEmps(); showToast('Employee added!', 'success');
    });
  }
  const addBtn = document.getElementById('addEmpBtn');
  const modal = document.getElementById('addEmpModal');
  const closeModal = document.getElementById('closeModal');
  if (addBtn) addBtn.addEventListener('click', () => modal.classList.add('open'));
  if (closeModal) closeModal.addEventListener('click', () => modal.classList.remove('open'));
  document.getElementById('logoutBtn').addEventListener('click', adminLogout);
}

/* === CERTIFICATES === */
if (document.getElementById('certAdminPage')) {
  if (!requireAdmin()) return;
  window.renderCerts = function(filter = '') {
    const certs = (DB.get('certificates') || []).filter(c => !filter || filter === 'all' || c.status === filter);
    const tbody = document.getElementById('certTableBody');
    if (!tbody) return;
    tbody.innerHTML = certs.map(c => `
      <tr>
        <td>${c.id}</td><td>${c.name}</td><td>${c.type}</td>
        <td>${c.dept}</td><td>${c.from} Ã¢â‚¬â€œ ${c.to}</td><td>${c.requested}</td>
        <td><span class="status-badge ${c.status}">${c.status}</span></td>
        <td>
          ${c.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="approveCert('${c.id}')">Approve</button>
          <button class="btn btn-sm btn-danger" onclick="rejectCert('${c.id}')">Reject</button>` : ''}
          ${c.status === 'approved' ? `<button class="btn btn-sm btn-outline" onclick="previewCert('${c.id}')">Preview</button>` : ''}
        </td>
      </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">No certificates</td></tr>';
  };
  renderCerts();
  const filterSel = document.getElementById('certFilter');
  if (filterSel) filterSel.addEventListener('change', () => renderCerts(filterSel.value));
  window.approveCert = id => {
    const ceoName = prompt('Enter CEO name to sign the certificate:') || 'CEO';
    const certs = DB.get('certificates') || [];
    const idx = certs.findIndex(c => c.id === id);
    if (idx > -1) { certs[idx].status = 'approved'; certs[idx].ceoName = ceoName; DB.set('certificates', certs); renderCerts(); showToast('Certificate approved!', 'success'); }
  };
  window.rejectCert = id => {
    const certs = DB.get('certificates') || [];
    const idx = certs.findIndex(c => c.id === id);
    if (idx > -1) { certs[idx].status = 'rejected'; DB.set('certificates', certs); renderCerts(); showToast('Certificate rejected', 'info'); }
  };
  window.previewCert = id => {
    const cert = (DB.get('certificates') || []).find(c => c.id === id);
    if (!cert) return;
    const prev = document.getElementById('certPreviewArea');
    if (prev) {
      const sig = DB.get('admin_signature') || '';
      const sigHtml = sig ? `<img src="${sig}" style="max-height:40px;max-width:120px;margin-bottom:0.25rem">` : `<div style="font-family:Georgia,serif;font-style:italic;font-size:1.4rem;color:#000;margin-bottom:0.25rem">${cert.ceoName}</div>`;
      prev.innerHTML = `<div style="width:100%;background:#fff;padding:1rem;box-sizing:border-box;border:6px solid #1a1a2e;position:relative"><div style="border:1px solid #c0a060;padding:1.5rem;text-align:center;font-family:Georgia,serif;color:#111"><img src="../assets/images/logo.png" height="40" style="margin-bottom:1rem;filter:invert(1)"><h1 style="font-size:1.6rem;font-weight:700;letter-spacing:4px;color:#1a1a2e;margin:0 0 0.25rem;text-transform:uppercase">Certificate of ${cert.type}</h1><p style="font-size:0.75rem;color:#666;letter-spacing:2px;text-transform:uppercase;margin:0 0 1.5rem">Psido Technologies Pvt. Ltd.</p><p style="font-size:0.9rem;color:#333;margin-bottom:0.75rem;font-style:italic">This is to proudly certify that</p><h2 style="font-size:1.5rem;color:#1a1a2e;border-bottom:2px solid #c0a060;display:inline-block;padding:0 1.5rem 0.25rem;margin:0 0 1rem">${cert.name}</h2><p style="font-size:0.85rem;color:#333;line-height:1.8;max-width:500px;margin:0 auto 2rem">has successfully completed the <strong>${cert.type}</strong> programme<br>within the <strong>${cert.dept}</strong> department.<br>From <strong>${cert.from}</strong> to <strong>${cert.to}</strong>.</p><div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:1rem;padding:0 1rem"><div style="text-align:center;width:150px"><div style="height:50px;display:flex;align-items:flex-end;justify-content:center;border-bottom:1px solid #333"></div><p style="font-size:0.8rem;font-weight:600;margin:0.25rem 0 0;color:#111">Human Resources</p></div><div style="text-align:center;width:150px"><div style="height:50px;display:flex;align-items:flex-end;justify-content:center;flex-direction:column;border-bottom:1px solid #333">${sigHtml}</div><p style="font-size:0.8rem;font-weight:600;margin:0.25rem 0 0;color:#111">${cert.ceoName}</p></div></div></div></div>`;
      document.getElementById('certPreviewModal').classList.add('open');
    }
  };
  const closePreview = document.getElementById('closePreviewModal');
  if (closePreview) closePreview.addEventListener('click', () => document.getElementById('certPreviewModal').classList.remove('open'));
  document.getElementById('logoutBtn').addEventListener('click', adminLogout);
}

/* === PAYSLIPS ADMIN === */
if (document.getElementById('payslipAdminPage')) {
  if (!requireAdmin()) return;
  window.renderPayslips = function() {
    const payslips = DB.get('payslips') || [];
    const emps = DB.get('employees') || [];
    const tbody = document.getElementById('payslipTableBody');
    if (!tbody) return;
    tbody.innerHTML = payslips.map(p => {
      const emp = emps.find(e => e.id === p.empId);
      return `<tr>
        <td>${p.id}</td><td>${emp ? emp.name : p.empId}</td><td>${p.month}</td>
        <td>₹${p.gross.toLocaleString()}</td><td>₹${p.deductions.toLocaleString()}</td>
        <td>₹${p.net.toLocaleString()}</td><td>${p.date}</td>
        <td><span class="status-badge active">${p.status}</span></td>
      </tr>`;
    }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">No payslips</td></tr>';
  };
  renderPayslips();
  const addForm = document.getElementById('addPayslipForm');
  if (addForm) {
    addForm.addEventListener('submit', e => {
      e.preventDefault();
      const payslips = DB.get('payslips') || [];
      payslips.push({
        id: 'PS' + Date.now(),
        empId: document.getElementById('psEmpId').value,
        month: document.getElementById('psMonth').value,
        gross: +document.getElementById('psGross').value,
        deductions: +document.getElementById('psDeductions').value,
        net: +document.getElementById('psGross').value - +document.getElementById('psDeductions').value,
        date: new Date().toISOString().split('T')[0], status: 'paid'
      });
      DB.set('payslips', payslips);
      document.getElementById('addPayslipModal').classList.remove('open');
      addForm.reset(); renderPayslips(); showToast('Payslip added!', 'success');
    });
  }
  const addBtn = document.getElementById('addPayslipBtn');
  const modal = document.getElementById('addPayslipModal');
  const closeModal = document.getElementById('closePayslipModal');
  if (addBtn) addBtn.addEventListener('click', () => modal.classList.add('open'));
  if (closeModal) closeModal.addEventListener('click', () => modal.classList.remove('open'));
  document.getElementById('logoutBtn').addEventListener('click', adminLogout);
}

/* === ADMIN SETTINGS === */
if (document.getElementById('adminSettingsPage')) {
  if (!requireAdmin()) return;
  const sigUpload = document.getElementById('sigUpload');
  const sigImg = document.getElementById('sigImg');
  const sigPlaceholder = document.getElementById('sigPlaceholder');
  if (sigUpload) {
    const saved = DB.get('admin_signature');
    if (saved) { sigImg.src = saved; sigImg.style.display = 'block'; sigPlaceholder.style.display = 'none'; }
    sigUpload.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          const b64 = e.target.result;
          DB.set('admin_signature', b64);
          sigImg.src = b64; sigImg.style.display = 'block'; sigPlaceholder.style.display = 'none';
          showToast('Signature saved!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }
  const pwForm = document.getElementById('adminPassForm');
  if (pwForm) {
    pwForm.addEventListener('submit', e => {
      e.preventDefault();
      const curr = document.getElementById('currAdminPass').value;
      const newP = document.getElementById('newAdminPass').value;
      const conf = document.getElementById('confAdminPass').value;
      if (curr !== ADMIN_CREDS.password) { showToast('Current password incorrect', 'error'); return; }
      if (newP !== conf) { showToast('Passwords do not match', 'error'); return; }
      ADMIN_CREDS.password = newP;
      showToast('Admin password updated! (session only)', 'success'); pwForm.reset();
    });
  }
  document.getElementById('logoutBtn').addEventListener('click', adminLogout);
}


