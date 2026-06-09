'use client';
import { useState, useCallback, useEffect } from 'react';
import axios from './axios';

export function useListQuery<T>({
  uri,
  params,
}: {
  uri: string;
  params: Record<string, any>;
}) {
  const [data, setData] = useState<{ data: T[]; count: number; currentPage: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchData = useCallback(async (newParams: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/${uri}`, { params: { ...params, ...newParams } });
      if (newParams.page && newParams.page > 1 && data) {
        setData((prev) => ({
          ...res.data,
          data: [...(prev?.data || []), ...res.data.data],
        }));
      } else {
        setData(res.data);
      }
      setHasNextPage(res.data.data.length === (newParams.limit || params.limit));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [uri, params]);

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, fetchData, hasNextPage };
}

export function useMyToast() {
  // We'll use Chakra toast — returned from the component with useToast()
  // This is a lightweight fallback for module-level usage
  return (options: { title: string; description?: string; status: string }) => {
    console.log(`[${options.status.toUpperCase()}] ${options.title}`, options.description || '');
  };
}
