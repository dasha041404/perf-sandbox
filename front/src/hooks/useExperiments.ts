import { useCallback, useEffect, useState } from 'react';

import { getExperiments } from '../services/experiments-service';
import type { ExperimentItem } from '../services/backend-types';

export interface UseExperimentsState {
  items: ExperimentItem[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useExperiments(limit = 500): UseExperimentsState {
  const [items, setItems] = useState<ExperimentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await getExperiments({ limit, offset: 0 });
      setItems(page.items);
      setTotal(page.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  return { items, total, loading, error, refetch };
}
