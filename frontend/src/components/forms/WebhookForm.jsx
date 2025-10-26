import React, { useState, useEffect } from 'react';

export default function WebhookForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [callback_url, setCallbackUrl] = useState('');
  const [event_types, setEventTypes] = useState('');
  const [secret, setSecret] = useState('');
  const [active, setActive] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setCallbackUrl(initial.callback_url || '');
      setEventTypes((initial.event_types || []).join(','));
      setSecret(initial.secret || '');
      setActive(Boolean(initial.active));
    }
  }, [initial]);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const payload = {
        name,
        callback_url,
        event_types: event_types.split(',').map(s => s.trim()).filter(Boolean),
        secret,
        active
      };
      await onSubmit(payload);
    } catch (e) {
      setErr(e.message || 'Error');
    }
  }

  return (
    <form className="card gap" onSubmit={submit}>
      <h3>{initial ? 'Edit Webhook' : 'New Webhook'}</h3>
      <label>Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} required />
      <label>Callback URL</label>
      <input value={callback_url} onChange={(e) => setCallbackUrl(e.target.value)} required />
      <label>Event Types (comma separated)</label>
      <input value={event_types} onChange={(e) => setEventTypes(e.target.value)} required />
      <label>Secret</label>
      <input value={secret} onChange={(e) => setSecret(e.target.value)} required />
      <label className="row">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        <span>Active</span>
      </label>
      {err ? <div className="error">{err}</div> : null}
      <div className="row">
        <button className="btn" type="submit">{initial ? 'Save' : 'Create'}</button>
        <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
