import React, { useMemo, useState } from 'react';
import { apiFetch } from '../api/client';

type CollectionKey = 'profiles' | 'conversations' | 'growth-metrics' | 'compatibility-reports';

const collectionOptions: { key: CollectionKey; label: string }[] = [
  { key: 'profiles', label: 'Profiles' },
  { key: 'conversations', label: 'Conversations' },
  { key: 'growth-metrics', label: 'Growth Metrics' },
  { key: 'compatibility-reports', label: 'Compatibility Reports' }
];

const CrudManager: React.FC = () => {
  const [collection, setCollection] = useState<CollectionKey>('profiles');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createJson, setCreateJson] = useState<string>('{}');

  const basePath = useMemo(() => `/api/${collection}`, [collection]);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch(basePath, { method: 'GET' });
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const create = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const body = JSON.parse(createJson);
      await apiFetch(basePath, { method: 'POST', body: JSON.stringify(body) });
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Create failed');
      setIsLoading(false);
    }
  };

  const remove = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiFetch(`${basePath}/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 font-display">Data Manager</h2>
        <div className="flex items-center gap-3">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={collection}
            onChange={(e) => setCollection(e.target.value as CollectionKey)}
          >
            {collectionOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <button onClick={refresh} className="btn-secondary">
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="text-red-600 text-sm mb-3">{error}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Create (JSON)</h3>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 font-mono text-xs h-48"
            value={createJson}
            onChange={(e) => setCreateJson(e.target.value)}
          />
          <button onClick={create} disabled={isLoading} className="btn-primary mt-3 disabled:opacity-50">
            Create
          </button>
          <p className="text-xs text-gray-500 mt-2">
            For non-admin users, `user_id` is auto-set from your token.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
          <div className="border border-gray-200 rounded-lg p-3 h-64 overflow-auto bg-gray-50">
            {isLoading ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-gray-600">No records</div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it._id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">{it._id}</div>
                      <button
                        onClick={() => remove(it._id)}
                        disabled={isLoading}
                        className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                    <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(it, null, 2)}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrudManager;
