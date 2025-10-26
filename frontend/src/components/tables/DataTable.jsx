import React from 'react';

export default function DataTable({ columns = [], rows = [], rowKey = (r) => r.id, actions }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((c) => <th key={c.key}>{c.label}</th>)}
          {actions ? <th>Actions</th> : null}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={(columns.length + (actions ? 1 : 0))}>No data</td></tr>
        ) : rows.map((r) => (
          <tr key={rowKey(r)}>
            {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}
            {actions ? <td>{actions(r)}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
