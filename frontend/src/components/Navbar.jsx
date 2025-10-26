import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAdminKey } from '../lib/auth';
import { getAdminKey } from '../lib/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = Boolean(getAdminKey());

  function onLogout() {
    if (!loggedIn) return;
    clearAdminKey();
    navigate('/login');
  }

  return (
    <div className="navbar center-brand">
      <div className="left"></div>
      <div className="brand">AlgoHire Relay</div>
      <div className="right">
        <button className="btn" onClick={onLogout} disabled={!loggedIn}>
          Logout
        </button>
      </div>
    </div>
  );
}
