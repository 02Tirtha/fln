const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  try {
    const loginResp = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher.ap_gnt_gnt_01_01.c2@fln.org', password: 'Fln@2026' })
    });
    const loginJson = await loginResp.json();
    console.log('LOGIN:', loginResp.status);
    const token = loginJson?.data?.token;
    console.log('token length:', token ? token.length : 'no token');
    const meResp = await fetch('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    console.log('/api/auth/me status:', meResp.status);
    console.log('/api/auth/me headers:', JSON.stringify(Object.fromEntries(meResp.headers.entries())));
    const text = await meResp.text();
    console.log('/api/auth/me body (first 1000 chars):', text.slice(0, 1000));
  } catch (e) {
    console.error('ERROR', e);
  }
})();
