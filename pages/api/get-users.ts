import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.email?.split('@')[0] || 'Unknown',
      email: user.email,
      role: user.email === 'subsacct@proton.me' ? 'admin' : 'evaluator'
    }));

    res.status(200).json(formattedUsers);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
}
