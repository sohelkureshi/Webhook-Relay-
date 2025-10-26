import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import DataTable from '../components/tables/DataTable';
import WebhookForm from '../components/forms/WebhookForm';

export default function Webhooks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await api.listWebhooks();
      setRows(res.data || []);
    } catch (e) {
      setErr('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onCreate(p) {
    await api.createWebhook(p);
    setCreating(false);
    await load();
  }

  async function onUpdate(p) {
    await api.updateWebhook(selected.id, p);
    setSelected(null);
    await load();
  }

  async function onDelete(id) {
    if (!confirm('Delete this webhook?')) return;
    await api.deleteWebhook(id);
    await load();
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'callback_url', label: 'Callback' },
    { key: 'event_types', label: 'Events', render: (r) => (r.event_types || []).join(', ') },
    { key: 'active', label: 'Active', render: (r) => (r.active ? 'Yes' : 'No') },
    { key: 'created_at', label: 'Created' }
  ];

  return (
    <div className="stack">
      <div className="row space">
        <h2>Webhooks</h2>
        <button className="btn" onClick={() => { setCreating(true); setSelected(null); }}>New</button>
      </div>
      {err ? <div className="error">{err}</div> : null}
      {creating ? <WebhookForm onSubmit={onCreate} onCancel={() => setCreating(false)} /> : null}
      {selected ? <WebhookForm initial={selected} onSubmit={onUpdate} onCancel={() => setSelected(null)} /> : null}
      {loading ? <div>Loading...</div> : (
        <DataTable
          columns={columns}
          rows={rows}
          actions={(r) => (
            <div className="row gap">
              <button className="btn ghost" onClick={() => setSelected(r)}>Edit</button>
              <button className="btn ghost" onClick={() => onDelete(r.id)}>Delete</button>
            </div>
          )}
        />
      )}
    </div>
  );
}






















































































































































































































































