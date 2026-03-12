// lib/supabase.ts
// Standard PostgreSQL via Supabase — easy AWS RDS migration later

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── TYPES ────────────────────────────────────────────────────────────────────
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
  entity: string;
  entity_name: string;
  details: string;
  performed_by: string;
  ip_address: string;
  created_at: string;
}

// ─── CLIENT FUNCTIONS ─────────────────────────────────────────────────────────
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, client: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── PASSWORD FUNCTIONS ───────────────────────────────────────────────────────
export async function verifyPassword(password: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'admin_password')
    .single();
  if (error) return password === 'psido@2025'; // fallback
  return data.value === password;
}

export async function changePassword(newPassword: string): Promise<void> {
  const { error } = await supabase
    .from('admin_settings')
    .update({ value: newPassword, updated_at: new Date().toISOString() })
    .eq('key', 'admin_password');
  if (error) throw error;
}

// ─── ACTIVITY LOG FUNCTIONS ───────────────────────────────────────────────────
export async function logActivity(
  action: string,
  entity: string,
  entityName: string,
  details: string,
  performedBy: string
): Promise<void> {
  await supabase.from('activity_logs').insert([{
    action,
    entity,
    entity_name: entityName,
    details,
    performed_by: performedBy,
    ip_address: 'web',
  }]);
  // Fire and forget — don't block on log failure
}

export async function getActivityLogs(limit = 50): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}