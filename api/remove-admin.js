import { requireAdmin } from './_admin-auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authorization = await requireAdmin(req, res);
    if (!authorization) return;
    const supabase = authorization.client;

    const { email } = req.body || {};

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }


    try {
        // 1. Try to find and delete from Auth first (optional step)
        try {
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const userToDelete = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

            if (userToDelete) {
                await supabase.auth.admin.deleteUser(userToDelete.id);
            }
        } catch (authError) {
            console.warn('Auth deletion failed or user already gone:', authError);
            // We continue anyway to ensure database removal
        }

        // 2. ALWAYS delete from the admin_users whitelist table
        const { error: deleteDbError } = await supabase
            .from('admin_users')
            .delete()
            .eq('email', email.toLowerCase());

        if (deleteDbError) throw deleteDbError;

        return res.status(200).json({
            success: true,
            message: 'Brukeren er fjernet fra systemet.'
        });

    } catch (error) {
        console.error('Remove admin error:', error);
        return res.status(500).json({ error: error.message });
    }
}
