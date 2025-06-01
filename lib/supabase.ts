import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const db = {
  // Programs
  async getPrograms(userId: string) {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createProgram(userId: string, programData: any) {
    const { data, error } = await supabase
      .from('programs')
      .insert([{ ...programData, user_id: userId }])
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
  async getEvaluations(userId: string) {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        programs (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createEvaluation(userId: string, evaluationData: any) {
    const { data, error } = await supabase
      .from('evaluations')
      .insert([{ ...evaluationData, user_id: userId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Team Members
  async getTeamMembers(userId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createTeamMember(userId: string, memberData: any) {
    const { data, error } = await supabase
      .from('team_members')
      .insert([{ ...memberData, user_id: userId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteTeamMember(memberId: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
    
    if (error) throw error
  }
}
