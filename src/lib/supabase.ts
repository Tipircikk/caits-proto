import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string, userData: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Users
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function getPendingUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function approveUser(userId: string) {
  const { error } = await supabase
    .from('users')
    .update({ is_approved: true })
    .eq('id', userId);
    
  if (error) throw error;
}

// Complaints
export async function getComplaints() {
  const { data, error } = await supabase
    .from('complaints')
    .select('*, users(*)')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function addComplaint(complaintData: any) {
  const { data, error } = await supabase
    .from('complaints')
    .insert(complaintData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function resolveComplaint(complaintId: string, policeStation: string) {
  const { error } = await supabase
    .from('complaints')
    .update({
      is_resolved: true,
      police_station: policeStation,
      resolved_at: new Date().toISOString()
    })
    .eq('id', complaintId);
    
  if (error) throw error;
}

// Plate Info
export async function getPlateInfo() {
  const { data, error } = await supabase
    .from('plate_info')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function addPlateInfo(plateData: any) {
  const { data, error } = await supabase
    .from('plate_info')
    .insert(plateData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function searchPlateInfo(searchParams: any) {
  let query = supabase.from('plate_info').select('*');
  
  if (searchParams.plate) {
    query = query.ilike('plate', `%${searchParams.plate}%`);
  }
  if (searchParams.owner) {
    query = query.ilike('owner', `%${searchParams.owner}%`);
  }
  if (searchParams.tcNo) {
    query = query.eq('tc_no', searchParams.tcNo);
  }
  if (searchParams.phone) {
    query = query.eq('phone', searchParams.phone);
  }
  if (searchParams.email) {
    query = query.ilike('email', `%${searchParams.email}%`);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}