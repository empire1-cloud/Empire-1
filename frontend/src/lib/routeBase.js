import { useLocation } from 'react-router-dom';

export function useRouteBase() {
  const location = useLocation();
  const basePrefix = location.pathname.startsWith('/empire') ? '/empire' : '';
  const withBase = (path) => `${basePrefix}${path}`;
  return { basePrefix, withBase };
}

