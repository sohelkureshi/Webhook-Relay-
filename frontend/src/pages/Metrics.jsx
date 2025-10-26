import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Metrics() {
  const [m, setM] = useState(null);
  const [err, setErr] = useState('');

  async function load() {
    setErr('');
    try {
      const data = await api.metrics();
      setM(data);
    } catch {
      setErr('Failed to load metrics');
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="stack">
      <div className="row space">
        <h2>Metrics</h2>
        <button className="btn" onClick={load}>Refresh</button>
      </div>
      {err ? <div className="error">{err}</div> : null}
      {!m ? <div>Loading...</div> : (
        <div className="grid">
          <div className="card small">events_received: {m.events_received}</div>
          <div className="card small">deliveries_total: {m.deliveries_total}</div>
          <div className="card small">deliveries_success: {m.deliveries_success}</div>
          <div className="card small">deliveries_failed: {m.deliveries_failed}</div>
          <div className="card small">retries_scheduled: {m.retries_scheduled}</div>
          <div className="card small">timestamp: {m.timestamp}</div>
        </div>
      )}
    </div>
  );
}
