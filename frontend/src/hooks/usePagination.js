// frontend/src/hooks/usePagination.js
import { useMemo, useState } from 'react';

export function usePagination(items = [], initialPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  function next() { setPage((p) => Math.min(p + 1, totalPages)); }
  function prev() { setPage((p) => Math.max(p - 1, 1)); }
  function goto(n) { setPage(() => Math.min(Math.max(1, n), totalPages)); }

  return { page, pageSize, setPageSize, totalPages, current, next, prev, goto, total };
}
