// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Lazy init — only creates client when actually called, not at build time
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

export const supabase = (() => {
  try { return getSupabase(); } catch { return null as never; }
})();

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type Plan = 'Basic' | 'Standard' | 'Premium';
export type Status = 'Active' | 'Pending' | 'Paused';
export type PayStatus = 'Paid' | 'Due' | 'Overdue';

export interface Client {
  id: string;
  shop_name: string;
  owner_name: string;
  phone: string;
  city: string;
  category: string;
  plan: Plan;
  status: Status;
  website_url: string;
  monthly_fee: number;
  pay_status: PayStatus;
  due_date: string;
  joined_date: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

// ─── CLIENT FUNCTIONS ─────────────────────────────────────────────────────────
export async function getClients(): Promise<Client[]> {
  const { data, error } = await getSupabase()
    .from('clients').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
  const { data, error } = await getSupabase()
    .from('clients').insert([client]).select().single();
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, client: Partial<Client>): Promise<Client> {
  const { data, error } = await getSupabase()
    .from('clients').update(client).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await getSupabase().from('clients').delete().eq('id', id);
  if (error) throw error;
}