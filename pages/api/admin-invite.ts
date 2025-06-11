import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, adminUserId } = req.body;

  if (!email || !adminUserId) {
    return res.status(400).json({ message: 'Email and adminUserId are required' });
  }

  try {
    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify the requester is an admin
    const { data: { user: adminUser } } = await supabase.auth.admin.getUserById(adminUserId);
    
    if (!adminUser || adminUser.email !== 'subsacct@proton.me') {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

    // Create the user account
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        role: 'evaluator',
        invited_by: adminUserId,
        requires_password_change: true
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return res.status(400).json({ message: userError.message });
    }

    // Send a password reset email so they can set their own password
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`
      }
    });

    if (resetError) {
      console.error('Error sending password reset:', resetError);
      // Don't fail the whole operation for this
    }

    res.status(200).json({ 
      success: true, 
      message: 'User account created successfully',
      userId: userData.user.id,
      tempPassword: tempPassword
    });

  } catch (error: any) {
    console.error('Admin invite error:', error);
    res.status(500).json({ message: error.message });
  }
}
