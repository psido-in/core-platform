// lib/supabase.ts
// Using standard PostgreSQL queries via Supabase JS client
// Easy to migrate to AWS RDS later — just swap this file with a pg/postgres client

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── CLIENT TYPES ────────────────────────────────────────────────────────────
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

// ─── DB FUNCTIONS ─────────────────────────────────────────────────────────────
// These functions use standard SQL patterns — easy to replace with pg queries on AWS

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
