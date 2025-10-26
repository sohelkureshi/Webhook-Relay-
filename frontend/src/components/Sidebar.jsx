// frontend/src/components/Sidebar.jsx 
import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <Link to="/webhooks">Webhooks</Link>
      <Link to="/deliveries">Deliveries</Link>
      <Link to="/failed">Failed</Link>
      <Link to="/metrics">Metrics</Link>
    </div>
  );
}
