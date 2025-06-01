import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const db = {
  // Auth & Organization
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getUserOrganization(userId: string) {
    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        *,
        organizations (*)
      `)
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows found"
    return data
  },

  async createOrganization(userId: string, orgName: string) {
    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name: orgName, owner_id: userId }])
      .select()
      .single()
    
    if (orgError) throw orgError

    // Add user as owner
    const { error: memberError } = await supabase
      .from('user_organizations')
      .insert([{ 
        user_id: userId, 
        organization_id: org.id, 
        role: 'owner' 
      }])
    
    if (memberError) throw memberError
    
    return org
  },

  // Programs
  async getPrograms(organizationId: string) {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createProgram(organizationId: string, userId: string, programData: any) {
    const { data, error } = await supabase
      .from('programs')
      .insert([{ 
        ...programData, 
        organization_id: organizationId,
        user_id: userId 
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateProgram(programId: string, updates: any) {
    const { data, error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', programId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteProgram(programId: string) {
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', programId)
    
    if (error) throw error
  },

  // Evaluations
  async getEvaluations(organizationId: string) {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        programs (name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createEvaluation(organizationId: string, userId: string, evaluationData: any) {
    const { data, error } = await supabase
      .from('evaluations')
      .insert([{ 
        ...evaluationData, 
        organization_id: organizationId,
        user_id: userId 
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Team Members
  async getTeamMembers(organizationId: string) {
    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        *,
        auth.users (
          email
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async inviteTeamMember(organizationId: string, email: string, role: 'owner' | 'evaluator', invitedBy: string) {
    // This is simplified - in production you'd send an email invitation
    // For now, we'll just add them directly if they have an account
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (userError) throw new Error('User not found')

    const { data, error } = await supabase
      .from('user_organizations')
      .insert([{ 
        user_id: userData.id,
        organization_id: organizationId,
        role: role,
        invited_by: invitedBy
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async removeTeamMember(userId: string, organizationId: string) {
    const { error } = await supabase
      .from('user_organizations')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
    
    if (error) throw error
  }
}
