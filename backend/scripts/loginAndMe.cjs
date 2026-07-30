const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  try {
    const loginResp = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher.ap_gnt_gnt_01_01.c2@fln.org', password: 'Fln@2026' })
    });
    const loginJson = await loginResp.json();
    console.log('LOGIN:', loginResp.status, JSON.stringify(loginJson));
    if (!loginJson?.data?.token) return;
    const token = loginJson.data.token;
    const meResp = await fetch('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meJson = await meResp.json();
    console.log('/api/auth/me:', meResp.status, JSON.stringify(meJson));
  } catch (e) {
    console.error('ERROR', e);
  }
})();
