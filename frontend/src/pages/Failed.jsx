import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import DataTable from '../components/tables/DataTable';

export default function Failed() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    setMsg('');
    try {
      const res = await api.listDeliveries({ status: 'FAILED', limit: 50 });
      setRows(res.data || []);
    } catch {
      setMsg('Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function retry(id) {
    try {
      await api.retryDelivery(id);
      setMsg('Retry enqueued');
      await load();
    } catch {
      setMsg('Retry failed');
    }
  }

  const columns = [
    { key: 'id', label: 'Delivery' },
    { key: 'event_id', label: 'Event' },
    { key: 'subscription_id', label: 'Subscription' },
    { key: 'attempt_count', label: 'Attempts' },
    { key: 'last_error', label: 'Last Error' },
    { key: 'created_at', label: 'Created' }
  ];

  return (
    <div className="stack">
      <h2>Failed Deliveries</h2>
      {msg ? <div className="note">{msg}</div> : null}
      {loading ? <div>Loading...</div> :
        <DataTable
          columns={columns}
          rows={rows}
          actions={(r) => <button className="btn ghost" onClick={() => retry(r.id)}>Retry</button>}
        />
      }
    </div>
  );
}
