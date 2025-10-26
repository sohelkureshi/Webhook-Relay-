// import React, { useState, useEffect } from 'react';
// import { setAdminKey, getAdminKey } from '../lib/auth';
// import { useNavigate } from 'react-router-dom';
// import { api } from '../lib/api';

// export default function Login() {
//   const [key, setKey] = useState('');
//   const [err, setErr] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const existing = getAdminKey();
//     if (existing) navigate('/webhooks', { replace: true });
//   }, [navigate]);

//   async function onSubmit(e) {
//     e.preventDefault();
//     setErr('');
//     try {
//       setAdminKey(key);
//       await api.metrics();
//       navigate('/webhooks', { replace: true });
//     } catch (e) {
//       setErr('Invalid key or server not reachable');
//     }
//   }

//   return (
//     <div className="center">
//       <form className="card" onSubmit={onSubmit}>
//         <h2>Admin Login</h2>
//         <label>API Key</label>
//         <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter admin API key" />
//         {err ? <div className="error">{err}</div> : null}
//         <button className="btn" type="submit">Continue</button>
//       </form>
//     </div>
//   );
// }


// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { setAdminKey, getAdminKey } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Login() {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const existing = getAdminKey();
    if (existing) navigate('/webhooks', { replace: true });
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      setAdminKey(key);
      await api.metrics();
      navigate('/webhooks', { replace: true });
    } catch {
      setErr('Invalid key or server not reachable');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center">
      <form className="card login" onSubmit={onSubmit}>
        
        <h1>Welcome to AlgoHire Relay</h1>
        <h2>Admin Login</h2>

        <div className="field">
          <label htmlFor="apiKey">API Key</label>
          <div className="input-wrap">
            <input
              id="apiKey"
              type={show ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter admin API key"
              autoFocus
              required
            />
            <button
              type="button"
              className="toggle"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide API key' : 'Show API key'}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {err ? <div className="error">{err}</div> : null}

        <button className="btn primary block" type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
