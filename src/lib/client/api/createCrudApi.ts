import { fetchJson, HttpError } from './http';

export interface CrudApi<T, TForm> 
{
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(data: TForm): Promise<T>;
  update(id: string, data: TForm): Promise<T>;
  delete(id: string): Promise<void>;
}

interface CreateCrudApiOptions 
{
  notFoundMessage?: string;
}

export function createCrudApi<T, TForm>(
  basePath: string, 
  opts?: CreateCrudApiOptions
): CrudApi<T, TForm> 
{
  return {
    getAll: () => fetchJson<T[]>(basePath),

    getById: async (id: string) => 
    {
      try 
      {
        return await fetchJson<T>(`${basePath}/${id}`);
      } 
      catch (e) 
      {
        if (e instanceof HttpError && e.status === 404 && opts?.notFoundMessage) 
        {
          throw new Error(opts.notFoundMessage);
        }
        throw e;
      }
    },

    create: (data: TForm) =>
      fetchJson<T>(basePath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),

    update: (id: string, data: TForm) =>
      fetchJson<T>(`${basePath}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchJson<void>(`${basePath}/${id}`, { method: 'DELETE' }),
  };
}
