import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovbqtaxwwxflvxdjkeih.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92YnF0YXh3d3hmbHZ4ZGprZWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjAxNTgsImV4cCI6MjA4NTU5NjE1OH0.7G4mHN5j8NV9TCkHoQ3C1VlieUNdsY8YbAhNe_C0X2w';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdmin() {
  const { data, error } = await supabase.from('admin_users').select('email');
  console.log("Admin Users Data:", data);
  console.log("Admin Users Error:", error);
}

checkAdmin();
