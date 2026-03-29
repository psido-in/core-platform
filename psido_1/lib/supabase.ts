import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  _client = createClient(url.trim(), key.trim());
  return _client;
}

// ─── TYPES ───────────────────────────────────────────
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

export interface ActivityLog {
  id: string;
  action: string;
  entity_name: string;
  details: string;
  performed_by: string;
  created_at: string;
}

// ─── AUTH ────────────────────────────────────────────
export async function verifyLogin(username: string, password: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('admin_users')
    .select('id')
    .eq('username', username.toLowerCase().trim())
    .eq('password', password)
    .single();
  if (error) return false;
  return !!data;
}

export async function changePassword(username: string, newPassword: string): Promise<void> {
  const { error } = await getSupabase()
    .from('admin_users')
    .update({ password: newPassword })
    .eq('username', username.toLowerCase().trim());
  if (error) throw error;
}

// ─── ACTIVITY LOGS ───────────────────────────────────
export async function logActivity(action: string, entityName: string, details: string, performedBy: string): Promise<void> {
  await getSupabase().from('activity_logs').insert([{ action, entity_name: entityName, details, performed_by: performedBy }]);
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const { data, error } = await getSupabase()
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}

// ─── CLIENTS ─────────────────────────────────────────
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