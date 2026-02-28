import { supabase } from './src/lib/customSupabaseClient.js';

async function checkContent() {
    const { data, error } = await supabase.from('content').select('*');
    console.log("Error:", error);
    console.log("Data length:", data?.length);
    console.log("Data:", data);
}

checkContent();
