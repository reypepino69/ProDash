/* ============================================================
   ProDash — Supabase Configuration
   Replace SUPABASE_URL and SUPABASE_ANON_KEY with your values
   from: supabase.com → Your Project → Settings → API
   ============================================================ */

const SUPABASE_URL = 'https://plmpvomffocspumyvzmo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsbXB2b21mZm9jc3B1bXl2em1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTA5OTEsImV4cCI6MjA4ODE4Njk5MX0.t8eAoKWjTdYeq9lZjFXSZCOx2FRTQu7sw73e-sUAj9U';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== AUTH ====================
async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { display_name: name } }
  });
  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
  return data;
}

async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
  return data;
}

async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Sign out error:', err);
  }
  // Force clearing local storage manually just in case
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('sb-')) localStorage.removeItem(key);
  }
  window.location.href = '/auth.html';
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ==================== DATABASE: Metrics ====================
async function getMetrics(userId) {
  const { data, error } = await supabase.from('metrics').select('*')
    .eq('user_id', userId).order('date', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function addMetric(userId, metric) {
  const { data, error } = await supabase.from('metrics')
    .insert({ user_id: userId, ...metric }).select();
  if (error) throw error;
  return data;
}

// ==================== DATABASE: Transactions ====================
async function getTransactions(userId) {
  const { data, error } = await supabase.from('transactions').select('*')
    .eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function addTransaction(userId, tx) {
  const { data, error } = await supabase.from('transactions')
    .insert({ user_id: userId, ...tx }).select();
  if (error) throw error;
  return data;
}

// ==================== DATABASE: Customers ====================
async function getCustomers(userId) {
  const { data, error } = await supabase.from('customers').select('*')
    .eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function addCustomer(userId, customer) {
  const { data, error } = await supabase.from('customers')
    .insert({ user_id: userId, ...customer }).select();
  if (error) throw error;
  return data;
}

async function deleteCustomer(id) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}

// ==================== DATABASE: Profile ====================
async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}

async function updateProfile(userId, profile) {
  const { data, error } = await supabase.from('profiles')
    .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() }).select();
  if (error) throw error;
  return data;
}

// Expose globally
window.ProDashDB = {
  supabase, signUp, signIn, signInWithGoogle, signInWithGitHub, signOut,
  getUser, getSession, getMetrics, addMetric, getTransactions, addTransaction,
  getCustomers, addCustomer, deleteCustomer, getProfile, updateProfile
};
