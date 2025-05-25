import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types based on our schema
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  customer_id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  order_number: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  order_date: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};