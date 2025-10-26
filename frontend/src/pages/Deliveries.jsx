// import React, { useEffect, useState } from 'react';
// import { api } from '../lib/api';
// import DataTable from '../components/tables/DataTable';

// export default function Deliveries() {
//   const [rows, setRows] = useState([]);
//   const [status, setStatus] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState('');

//   async function load() {
//     setLoading(true);
//     setMsg('');
//     try {
//       const res = await api.listDeliveries({ status: status || undefined, limit: 50 });
//       setRows(res.data || []);
//     } catch {
//       setMsg('Failed to load deliveries');
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => { load(); }, []); // initial

//   const columns = [
//     { key: 'id', label: 'Delivery' },
//     { key: 'event_id', label: 'Event' },
//     { key: 'subscription_id', label: 'Subscription' },
//     { key: 'status', label: 'Status' },
//     { key: 'attempt_count', label: 'Attempts' },
//     { key: 'last_error', label: 'Last Error' },
//     { key: 'created_at', label: 'Created' }
//   ];

//   async function retry(id) {
//     try {
//       await api.retryDelivery(id);
//       setMsg('Retry enqueued');
//       await load();
//     } catch {
//       setMsg('Retry failed');
//     }
//   }

//   return (
//     <div className="stack">
//       <div className="row gap">
//         <h2>Deliveries</h2>
//         <select value={status} onChange={(e) => setStatus(e.target.value)}>
//           <option value="">All</option>
//           <option value="PENDING">PENDING</option>
//           <option value="SUCCESS">SUCCESS</option>
//           <option value="FAILED">FAILED</option>
//           <option value="DISABLED">DISABLED</option>
//         </select>
//         <button className="btn" onClick={load}>Apply</button>
//       </div>
//       {msg ? <div className="note">{msg}</div> : null}
//       {loading ? <div>Loading...</div> :
//         <DataTable
//           columns={columns}
//           rows={rows}
//           actions={(r) => (
//             r.status !== 'SUCCESS' ? <button className="btn ghost" onClick={() => retry(r.id)}>Retry</button> : null
//           )}
//         />
//       }
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import DataTable from '../components/tables/DataTable';

export default function Deliveries() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState(''); // empty means no filter
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    setMsg('');
    try {
      const query = { limit: 50 };
      if (status) query.status = status; // only include when selected
      const res = await api.listDeliveries(query);
      setRows(res.data || []);
    } catch {
      setMsg('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // initial load

  const columns = [
    { key: 'id', label: 'Delivery' },
    { key: 'event_id', label: 'Event' },
    { key: 'subscription_id', label: 'Subscription' },
    { key: 'status', label: 'Status' },
    { key: 'attempt_count', label: 'Attempts' },
    { key: 'last_error', label: 'Last Error' },
    { key: 'created_at', label: 'Created' }
  ];

  async function retry(id) {
    try {
      await api.retryDelivery(id);
      setMsg('Retry enqueued');
      await load();
    } catch {
      setMsg('Retry failed');
    }
  }

  return (
    <div className="stack">
      <div className="row gap">
        <h2>Deliveries</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="PENDING">PENDING</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
          <option value="DISABLED">DISABLED</option>
        </select>
        <button className="btn" onClick={load}>Apply</button>
      </div>
      {msg ? <div className="note">{msg}</div> : null}
      {loading ? <div>Loading...</div> :
        <DataTable
          columns={columns}
          rows={rows}
          actions={(r) => (
            r.status !== 'SUCCESS' ? <button className="btn ghost" onClick={() => retry(r.id)}>Retry</button> : null
          )}
        />
      }
    </div>
  );
}
