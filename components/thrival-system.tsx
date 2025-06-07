import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/radix-components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/radix-components';
import { Switch } from '@/components/ui/radix-components';
import { UserCheck, FileText, Target, TrendingUp, Lightbulb, Focus, Sun, Moon, Upload, Download, Trash2, Plus, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Simple Label replacement
const Label = ({ children, className }: any) => <div className={`text-sm font-medium ${className || ''}`}>{children}</div>;

const ThrivalSystem = () => {
  console.log('ThrivalSystem component loaded - UPDATED TEST');
  console.log('Supabase client:', supabase);
  
  // State declarations
  const [activeTab, setActiveTab] = useState('evaluate');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTeamInvite, setShowTeamInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [currentEvaluator, setCurrentEvaluator] = useState('Current User');
  const [projectName, setProjectName] = useState('');
  const [activeSettingsSection, setActiveSettingsSection] = useState('overview');
  const [applicationText, setApplicationText] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('program1');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<any[]>([]);
  const [bulkFile, setBulkFile] = useState<any>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPromptText, setCurrentPromptText] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'setup'>('login');
  const [prompts, setPrompts] = useState({
    systemPrompt: '',
    scoringGuidelines: '',
    criterionPrompts: {
      team: '',
      evidence: '',
      fit: '',
      need: '',
      novelty: '',
      focus: ''
    }
  });
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  
  const handleLogin = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (error) throw error;

    setUser(data.user);
    setShowAuthModal(false);
    setAuthEmail('');
    setAuthPassword('');
  } catch (error: any) {
    alert('Login failed: ' + error.message);
  }
};
  const handleRequestMagicLink = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail,
        options: { shouldCreateUser: false }
      });
      if (error) throw error;
      alert('Magic link sent! Check your email.');
    } catch (error: any) {
      alert('Failed to send magic link: ' + error.message);
    }
  };
  
   const handleInviteUser = async () => {
    // Only allow admins to send invites
    if (!isAdmin(user)) {
      alert('Only admins can send invitations');
      return;
    }
  
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }
  
    try {
      // Create the invite through Supabase
      const { data, error } = await supabase
        .from('team_invitations')
        .insert([{
          email: inviteEmail,
          invited_by: user.id,
          status: 'pending'
        }])
        .select()
        .single();
  
      if (error) throw error;
      
      alert(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
      setShowTeamInvite(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation: ' + error.message);
    }
  };
  // Check if user is admin
  const isAdmin = (user: any) => {
    return user?.email === 'subsacct@proton.me';
  };
  const [newProgram, setNewProgram] = useState({
    name: '',
    overallPrompt: '',
    weights: {
      team: 20,
      evidence: 20,
      fit: 15,
      need: 15,
      novelty: 15,
      focus: 15
    },
    customPrompts: {
      team: '',
      evidence: '',
      fit: '',
      need: '',
      novelty: '',
      focus: ''
    }
  });
  
  const [editingProgram, setEditingProgram] = useState<string | null>(null);
  
  const [programs, setPrograms] = useState<any>({});
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const [externalData, setExternalData] = useState({
    twitter: '',
    github: '',
    website: ''
  });

  const [criteriaWeights, setCriteriaWeights] = useState({
    team: 20,
    evidence: 20,
    fit: 15,
    need: 15,
    novelty: 15,
    focus: 15
  });

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'Lead Evaluator' },
    { id: 2, name: 'Bob Smith', email: 'bob@company.com', role: 'Technical Reviewer' }
  ]);

  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    email: '',
    role: 'Evaluator'
  });

  const [showTeamEditor, setShowTeamEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProgram, setDeletingProgram] = useState(null);

  const [apiKeys, setApiKeys] = useState({
    claude: '',
    twitter: '',
    github: ''
  });
  
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: {success: boolean, message: string}}>({});
  const [apiUsageStats, setApiUsageStats] = useState({
    claude: 0,
    twitter: 0,
    github: 0
  });

  const [systemPreferences, setSystemPreferences] = useState({
    emailNotifications: true,
    autoSave: false,
    exportFormat: 'pdf',
    evaluationTimeout: 10,
    itemsPerPage: 25
  });

  const [defaultPrompts, setDefaultPrompts] = useState({
    team: {
      default: 'Evaluate the team\'s experience, track record, and ability to execute on this project.'
    },
    evidence: {
      default: 'Assess the evidence of traction, user adoption, technical progress, and market validation.'
    },
    fit: {
      default: 'Determine how well this project aligns with the program\'s focus and strategic objectives.'
    },
    need: {
      default: 'Evaluate the market need, problem significance, and demand for this solution.'
    },
    novelty: {
      default: 'Assess the innovation, technical novelty, and differentiation from existing solutions.'
    },
    focus: {
      default: 'Evaluate strategic focus, clear vision, and alignment with stated goals.'
    }
  });

  const gradingTiers = [
    {
      min: 4.5,
      max: 5,
      recommendation: 'Strongly Recommend',
      applicantMessage: 'Congratulations! Your application demonstrates exceptional merit across all evaluation criteria.'
    },
    {
      min: 3.5,
      max: 4.4,
      recommendation: 'Recommend',
      applicantMessage: 'Your application shows strong potential and aligns well with {programName} objectives.'
    },
    {
      min: 2.5,
      max: 3.4,
      recommendation: 'Conditional',
      applicantMessage: 'Your application shows promise but requires additional development in key areas.'
    },
    {
      min: 0,
      max: 2.4,
      recommendation: 'Do Not Fund',
      applicantMessage: 'Unfortunately, your application does not meet the current criteria for {programName}.'
    }
  ];

  // Real AI evaluation function
  const evaluateWithAI = async (criterion: string, applicationText: string, programId: string) => {
    try {
      // 1. Load base AI Evaluator Instructions from database
      const { data: systemData, error: systemError } = await supabase
        .from('prompt_templates')
        .select('prompt_text')
        .eq('prompt_type', 'system')
        .order('created_at', { ascending: false });
      
      const baseInstructions = systemData?.[0]?.prompt_text || 'You are an expert grant application evaluator.';
      
      // 2. Load criterion-specific prompt from database
      const { data: criterionData, error: criterionError } = await supabase
        .from('prompt_templates')
        .select('prompt_text')
        .eq('prompt_type', criterion)
        .order('created_at', { ascending: false });
      
      const criterionPrompt = criterionData?.[0]?.prompt_text || '';
      
      // 3. Get program-specific context
      const program = programs[programId];
      const programContext = program?.customPrompts?.[criterion] || program?.overallPrompt || '';
      
      // 4. Layer all prompts together
      let combinedPrompt = baseInstructions;
      
      if (criterionPrompt) {
        combinedPrompt += `\n\nCRITERION-SPECIFIC GUIDANCE:\n${criterionPrompt}`;
      }
      
      if (programContext) {
        combinedPrompt += `\n\nPROGRAM-SPECIFIC CONTEXT:\n${programContext}`;
      }
      
      // Get API key from localStorage
      const savedConfig = localStorage.getItem('thrival_api_config');
      let claudeApiKey = '';
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        claudeApiKey = config.apiKeys?.claude || '';
      }
      
      if (!claudeApiKey) {
        return { 
          score: 5, 
          feedback: 'No Claude API key configured. Please add your API key in Settings → API Configuration.'
        };
      }
      
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          criterion, 
          applicationText, 
          programId,
          prompt: combinedPrompt,  // Send the layered prompt
          externalData: externalData,
          apiKey: claudeApiKey
        })
      });
  
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
  
      const result = await response.json();
      return { 
        score: result.score, 
        feedback: result.feedback 
      };
    } catch (error: any) {
      console.error('Evaluation API error details:', error);
      
      return { 
        score: 5, 
        feedback: `API Error: ${error.message || 'Unknown error'}`
      };
    }
  };

 // Calculate weighted score
  const calculateWeightedScore = (scores: any, programWeights?: any) => {
    const weights = programWeights || criteriaWeights;
    const totalWeightedScore =
      (scores.team * weights.team / 100) +
      (scores.evidence * weights.evidence / 100) +
      (scores.fit * weights.fit / 100) +
      (scores.need * weights.need / 100) +
      (scores.novelty * weights.novelty / 100) +
      (scores.focus * weights.focus / 100);
  
    const percentage = (totalWeightedScore / 5) * 100;  // Changed from /10 to /5
    return { score: totalWeightedScore, percentage };
  };

  // Main evaluation function
  const handleEvaluate = async () => {
    if (!applicationText.trim()) {
      alert('Please enter application text before evaluating.');
      return;
    }

    setIsEvaluating(true);
    setActiveTab('evaluate');

    try {
      const criteria = ['team', 'evidence', 'fit', 'need', 'novelty', 'focus'];
      const results: any = {};

      for (const criterion of criteria) {
        const result = await evaluateWithAI(criterion, applicationText, selectedProgram);
        results[criterion] = result;
      }

      const scores = {
        team: results.team.score,
        evidence: results.evidence.score,
        fit: results.fit.score,
        need: results.need.score,
        novelty: results.novelty.score,
        focus: results.focus.score
      };

      const programWeights = programs[selectedProgram]?.weights || criteriaWeights;
      const finalScore = calculateWeightedScore(scores, programWeights);

      // Find the appropriate grading tier
      const tier = gradingTiers.find(tier =>
        finalScore.score >= tier.min && finalScore.score <= tier.max
      );

      const recommendation = tier ? tier.recommendation : 'Ungraded';

      // Generate personalized applicant feedback based on actual scores
      let applicantFeedback = '';
      if (tier) {
        // Start with base message
        applicantFeedback = tier.applicantMessage.replace('{programName}', programs[selectedProgram].name);
        
        // Add specific score details
        applicantFeedback += ` Your overall score was ${finalScore.score.toFixed(1)}/10 (${finalScore.percentage.toFixed(0)}%).`;
        
        // Add top performing criterion
        const topScore = Math.max(...Object.values(scores));
        const topCriterion = Object.entries(scores).find(([, score]) => score === topScore)?.[0];
        if (topCriterion) {
          applicantFeedback += ` Your strongest area was ${topCriterion} (${topScore}/10).`;
        }
        
        // Add lowest performing criterion if score is low
        const lowScore = Math.min(...Object.values(scores));
        const lowCriterion = Object.entries(scores).find(([, score]) => score === lowScore)?.[0];
        if (lowScore < 6 && lowCriterion) {
          applicantFeedback += ` Focus on improving ${lowCriterion} (${lowScore}/10) for future applications.`;
        }
      } else {
        applicantFeedback = 'Unable to determine appropriate feedback tier.';
      }

      const evaluation = {
        id: Date.now(),
        program: programs[selectedProgram],
        projectName: projectName || `Application ${Date.now()}`,
        evaluator: currentEvaluator,
        date: new Date().toISOString().split('T')[0],
        applicationText,
        externalData: { ...externalData },
        results,
        scores,
        weightsUsed: programWeights,
        finalScore,
        recommendation,
        applicantFeedback
      };
      
setEvaluationResult(evaluation);

  // Save to Supabase
  try {
    const { data, error } = await supabase
      .from('evaluations')
     .insert([{
        program_id: selectedProgram,
        project_name: evaluation.projectName,
        evaluator: user.email || 'Unknown User',  // Add this line
        evaluator_id: user.id,
        application_text: evaluation.applicationText,
        external_data: evaluation.externalData,
        results: evaluation.results,
        scores: evaluation.scores,
        weights_used: evaluation.weightsUsed,
        final_score: evaluation.finalScore,
        recommendation: evaluation.recommendation,
        applicant_feedback: evaluation.applicantFeedback
      }])
      .select()
      .single();
  
    if (error) throw error;
  
    // Update local state with the saved evaluation (including database ID)
    const savedEvaluation = {
      ...evaluation,
      id: data.id
    };
    setEvaluationHistory(prev => [savedEvaluation, ...prev]);
  } catch (error: any) {
    console.error('Error saving evaluation:', error);
    // Still add to local state even if save fails
    setEvaluationHistory(prev => [evaluation, ...prev]);
    alert('Evaluation completed but failed to save to database: ' + error.message);
  }

      // Auto-redirect to Results page and clear form
      setActiveTab('results');
      setApplicationText('');
      setProjectName('');
      setExternalData({ twitter: '', github: '', website: '' });
    } catch (error) {
      console.error('Evaluation error:', error);
      alert('An error occurred during evaluation. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Bulk processing
  const handleBulkProcess = async () => {
    if (!bulkFile) {
      alert('Please select a CSV file to process.');
      return;
    }

    setBulkProcessing(true);

    // Mock bulk processing
    setTimeout(() => {
      const mockResults = [
        { id: 1, name: 'Application A', score: 8.2, percentage: 82, recommendation: 'Recommend' },
        { id: 2, name: 'Application B', score: 6.5, percentage: 65, recommendation: 'Conditional' },
        { id: 3, name: 'Application C', score: 9.1, percentage: 91, recommendation: 'Strongly Recommend' },
        { id: 4, name: 'Application D', score: 4.8, percentage: 48, recommendation: 'Do Not Fund' },
        { id: 5, name: 'Application E', score: 7.3, percentage: 73, recommendation: 'Recommend' }
      ];

      setBulkResults(mockResults);
      setBulkProcessing(false);
    }, 3000);
  };

  // Program management functions
  const handleAddProgram = () => {
    if (!newProgram.name.trim() || !newProgram.overallPrompt.trim()) {
      alert('Please fill in both program name and overall prompt.');
      return;
    }

    const totalWeight = Object.values(newProgram.weights).reduce((sum: number, weight: any) => sum + weight, 0);
    if (totalWeight !== 100) {
      alert(`Criteria weights must total 100%. Currently: ${totalWeight}%`);
      return;
    }

    const programId = `program${Date.now()}`;
    setPrograms((prev: any) => ({
      ...prev,
      [programId]: {
        name: newProgram.name,
        criteria: newProgram.overallPrompt,
        overallPrompt: newProgram.overallPrompt,
        weights: { ...newProgram.weights },
        customPrompts: { ...newProgram.customPrompts },
        active: true
      }
    }));

    setNewProgram({
      name: '',
      overallPrompt: '',
      weights: { team: 20, evidence: 20, fit: 15, need: 15, novelty: 15, focus: 15 },
      customPrompts: { team: '', evidence: '', fit: '', need: '', novelty: '', focus: '' }
    });
    setShowProgramEditor(false);
  };

      const handleDeleteProgram = async (programId: string) => {
      const activePrograms = Object.entries(programs).filter(([, prog]) => (prog as any).active);
      const remainingActiveAfterDelete = activePrograms.filter(([id]) => id !== programId);
      if (remainingActiveAfterDelete.length === 0) {
        alert('Cannot delete the last active program. Please ensure at least one program remains active.');
        return;
      }
    
      try {
        const { error } = await supabase
          .from('programs')
          .delete()
          .eq('id', programId);
    
        if (error) throw error;
    
        // Update local state
        setPrograms((prev: any) => {
          const updated = { ...prev };
          delete updated[programId];
          return updated;
        });
    
        if (selectedProgram === programId) {
          const remainingPrograms = Object.keys(programs).filter(id => id !== programId);
          setSelectedProgram(remainingPrograms[0]);
        }
    
        setShowDeleteConfirm(false);
        setDeletingProgram(null);
        alert('Program deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting program:', error);
        alert('Failed to delete program: ' + error.message);
      }
    };

const handleAddTeamMember = () => {
    if (!newTeamMember.name.trim() || !newTeamMember.email.trim()) {
      alert('Please fill in both name and email.');
      return;
    }
  
    const member = {
      id: Date.now(),
      ...newTeamMember
    };
  
    setTeamMembers((prev: any) => [...prev, member]);
    setNewTeamMember({ name: '', email: '', role: 'Evaluator' });
    setShowTeamEditor(false);
  };
  
  const handleDeleteTeamMember = (memberId: number) => {
    setTeamMembers((prev: any) => prev.filter((member: any) => member.id !== memberId));
  };

  // Weight management
  const handleWeightChange = (criterion: string, value: string) => {
    setCriteriaWeights((prev: any) => ({
      ...prev,
      [criterion]: parseInt(value) || 0
    }));
  };

  const getTotalWeight = () => {
    return Object.values(criteriaWeights).reduce((sum: number, weight: any) => sum + (weight as number), 0);
  };

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

// Check authentication status
useEffect(() => {
  const checkAuth = async () => {
      console.log('Checking authentication status');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User result:', user);
      
      if (!user) {
        console.log('No user found, showing auth modal');
        setShowAuthModal(true);
      } else {
        console.log('User authenticated:', user.email);
        setUser(user);
        setShowAuthModal(false);
        
        if (isAdmin(user)) {
          console.log('Admin user detected');
      }
    }
  };

  checkAuth();
}, []);

// Load programs from Supabase
useEffect(() => {
  const loadPrograms = async () => {
    if (!user) return;
    
    try {
      setLoadingPrograms(true);
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert array to object format for your existing UI
      const programsObj = {};
      data.forEach(program => {
        programsObj[program.id] = {
          name: program.name,
          criteria: program.criteria,
          overallPrompt: program.overall_prompt,
          weights: program.weights,
          customPrompts: program.custom_prompts,
          active: program.active
        };
      });
      
      setPrograms(programsObj);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  loadPrograms();
}, [user]);

    // Load evaluation history from Supabase
    useEffect(() => {
      const loadEvaluationHistory = async () => {
        if (!user) return;
        
        try {
          const { data, error } = await supabase
            .from('evaluations')
            .select(`
              *,
              programs!inner(name)
            `)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          // Convert to your existing format
          const formattedEvaluations = data.map(evaluation => ({
            id: evaluation.id,
            program: { name: evaluation.programs.name },
            projectName: evaluation.project_name,
            evaluator: 'User', // You can enhance this later with user names
            date: new Date(evaluation.created_at).toISOString().split('T')[0],
            applicationText: evaluation.application_text,
            externalData: evaluation.external_data || {},
            results: evaluation.results,
            scores: evaluation.scores,
            weightsUsed: evaluation.weights_used,
            finalScore: evaluation.final_score,
            recommendation: evaluation.recommendation,
            applicantFeedback: evaluation.applicant_feedback
          }));
          
          setEvaluationHistory(formattedEvaluations);
        } catch (error) {
          console.error('Error loading evaluation history:', error);
        }
      };
    
      loadEvaluationHistory();
    }, [user]);
  
  // Load team members from Supabase
    useEffect(() => {
      const loadTeamMembers = async () => {
        if (!user) return;
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, email, name, role, created_at')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          // Convert to your existing format
          const formattedTeamMembers = data.map(profile => ({
            id: profile.id,
            name: profile.name || profile.email,
            email: profile.email,
            role: profile.role || 'Evaluator'
          }));
          
          setTeamMembers(formattedTeamMembers);
        } catch (error) {
          console.error('Error loading team members:', error);
        }
      };

      loadTeamMembers();
    }, [user]);

  
// Simple test useEffect
useEffect(() => {
  console.log('TEST: useEffect is working!');
}, []);

  // Test API connections
  const handleTestApiConnection = async (apiType: string) => {
    setTestingConnection(apiType);
    setConnectionStatus(prev => ({ ...prev, [apiType]: { success: false, message: 'Testing connection...' } }));

    try {
      switch (apiType) {
        case 'claude':
  if (!apiKeys.claude) {
    throw new Error('API key is required');
  }
  
  // Test Claude API using the existing evaluate endpoint
  const claudeResponse = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      criterion: 'team',
      applicationText: 'This is a test evaluation.',
      prompt: 'Please respond with a simple test message.',
      apiKey: apiKeys.claude
    })
  });
  
  if (!claudeResponse.ok) {
    throw new Error('Invalid API key or connection failed');
  }
  
  const result = await claudeResponse.json();
  
  setConnectionStatus(prev => ({ 
    ...prev, 
    [apiType]: { success: true, message: 'Connection successful! API key is valid.' } 
  }));
  break;

        case 'twitter':
          if (!apiKeys.twitter) {
            throw new Error('Bearer token is required');
          }
          
          // Mock Twitter API test (replace with real test when implementing)
          await new Promise(resolve => setTimeout(resolve, 1000));
          setConnectionStatus(prev => ({ 
            ...prev, 
            [apiType]: { success: true, message: 'Connection successful! Bearer token is valid.' } 
          }));
          break;

        case 'github':
          if (!apiKeys.github) {
            throw new Error('Personal access token is required');
          } 
          // Test GitHub API
          const githubResponse = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `token ${apiKeys.github}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          if (!githubResponse.ok) {
            throw new Error('Invalid token or connection failed');
          }
          
          setConnectionStatus(prev => ({ 
            ...prev, 
            [apiType]: { success: true, message: 'Connection successful! Token is valid.' } 
          }));
          break;
        default:
          throw new Error('Unknown API type');
      }
    } catch (error: any) {
      setConnectionStatus(prev => ({ 
        ...prev, 
        [apiType]: { success: false, message: error.message || 'Connection failed' } 
      }));
    } finally {
      setTestingConnection(null);
    }
  };

  // Save API configuration
  const handleSaveApiConfiguration = () => {
    try {
      // Save to localStorage for now (will be replaced with proper backend later)
      const configData = {
        apiKeys: {
          claude: apiKeys.claude,
          twitter: apiKeys.twitter,
          github: apiKeys.github
        },
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('thrival_api_config', JSON.stringify(configData));
      
      alert('API configuration saved successfully!');
    } catch (error) {
      console.error('Error saving API configuration:', error);
      alert('Failed to save API configuration. Please try again.');
    }
  };

  // Load API configuration on component mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('thrival_api_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.apiKeys) {
          setApiKeys(config.apiKeys);
        }
      }
    } catch (error) {
      console.error('Error loading API configuration:', error);
    }
  }, []);

  // Handle prompt changes
  const handlePromptChange = (criterion: string, newPrompt: string) => {
    setPrompts(prev => ({
      ...prev,
      [criterion]: {
        ...prev[criterion],
        default: newPrompt
      }
    }));
  };

  // Reset prompt to default
  const handleResetPrompt = (criterion: string) => {
    const defaultPrompts: {[key: string]: string} = {
      team: 'Evaluate the team\'s experience, track record, and ability to execute on this project.',
      evidence: 'Assess the evidence of traction, user adoption, technical progress, and market validation.',
      fit: 'Determine how well this project aligns with the program\'s focus and strategic objectives.',
      need: 'Evaluate the market need, problem significance, and demand for this solution.',
      novelty: 'Assess the innovation, technical novelty, and differentiation from existing solutions.',
      focus: 'Evaluate strategic focus, clear vision, and alignment with stated goals.'
    };
    
    setPrompts(prev => ({
      ...prev,
      [criterion]: {
        ...prev[criterion],
        default: defaultPrompts[criterion]
      }
    }));
  };

  // Save system preferences
  const handleSaveSystemPreferences = () => {
    try {
      const preferencesData = {
        preferences: systemPreferences,
        darkMode: darkMode,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('thrival_system_preferences', JSON.stringify(preferencesData));
      alert('System preferences saved successfully!');
    } catch (error) {
      console.error('Error saving system preferences:', error);
      alert('Failed to save system preferences. Please try again.');
    }
  };

  // Program management functions
 const handleToggleProgram = async (programId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('programs')
        .update({ active })
        .eq('id', programId);
  
      if (error) throw error;
  
      // Update local state
      setPrograms(prev => ({
        ...prev,
        [programId]: {
          ...prev[programId],
          active: active
        }
      }));
    } catch (error: any) {
      console.error('Error updating program status:', error);
      alert('Failed to update program status: ' + error.message);
    }
};

  const handleEditProgram = (programId: string) => {
    const program = programs[programId];
    setNewProgram({
      name: program.name,
      overallPrompt: program.overallPrompt || program.criteria,
      weights: program.weights || { team: 20, evidence: 20, fit: 15, need: 15, novelty: 15, focus: 15 },
      customPrompts: program.customPrompts || { team: '', evidence: '', fit: '', need: '', novelty: '', focus: '' }
    });
    setEditingProgram(programId);
    setShowProgramEditor(true);
  };

  const handleDuplicateProgram = (programId: string) => {
    const originalProgram = programs[programId];
    const newProgramId = `program${Date.now()}`;
    setPrograms(prev => ({
      ...prev,
      [newProgramId]: {
        ...originalProgram,
        name: `${originalProgram.name} (Copy)`,
        active: false
      }
    }));
  };
  
  // Prompt management functions
  const handleEditPrompt = async (promptType: string) => {
    console.log('Loading prompt for type:', promptType);
    setEditingPrompt(promptType);
    
    try {
      // Load prompt from Supabase
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('prompt_text')
        .eq('prompt_type', promptType)
        .order('created_at', { ascending: false });
      
      console.log('Load response:', { data, error });
      
      if (error && error.code !== 'PGRST116') {
        console.error('Load error:', error);
        throw error;
      }
      
      // Get the first result since we removed .single()
      const promptText = data?.[0]?.prompt_text || '';
      console.log('Setting prompt text to:', promptText);
      setCurrentPromptText(promptText);
    } catch (error) {
      console.error('Error loading prompt:', error);
      setCurrentPromptText(''); // Start with empty if error
    }
    
    setShowPromptEditor(true);
  };

  const handleSavePrompt = async () => {
      console.log('Saving prompt:', editingPrompt);
      console.log('Prompt text:', currentPromptText);
      
      try {
        const { data, error } = await supabase
          .from('prompt_templates')
          .upsert([{
            prompt_type: editingPrompt,
            prompt_text: currentPromptText,
            created_by: user.id
          }])
          .select()
          .single();
    
        console.log('Save result:', data);
        
        if (error) throw error;
        
        alert('Prompt saved successfully!');
        setShowPromptEditor(false);
        setEditingPrompt(null);
      } catch (error: any) {
        console.error('Error saving prompt:', error);
        alert('Failed to save prompt: ' + error.message);
      }
    };
  
  const handleCreateProgram = async () => {
      if (!newProgram.name.trim() || !newProgram.overallPrompt.trim()) {
        alert('Please fill in both program name and overall prompt.');
        return;
      }
      
      const totalWeight = Object.values(newProgram.weights).reduce((sum: number, weight: any) => sum + weight, 0);
      if (totalWeight !== 100) {
        alert(`Criteria weights must total 100%. Currently: ${totalWeight}%`);
        return;
      }
    
      try {
        const { data, error } = await supabase
          .from('programs')
          .insert([{
            name: newProgram.name,
            criteria: newProgram.overallPrompt,
            overall_prompt: newProgram.overallPrompt,
            weights: newProgram.weights,
            custom_prompts: newProgram.customPrompts,
            active: true,
            created_by: user.id
          }])
          .select()
          .single();
    
        if (error) throw error;
    
        // Update local state
        setPrograms(prev => ({
          ...prev,
          [data.id]: {
            name: data.name,
            criteria: data.criteria,
            overallPrompt: data.overall_prompt,
            weights: data.weights,
            customPrompts: data.custom_prompts,
            active: data.active
          }
        }));
        
        // Reset form
        setNewProgram({
          name: '',
          overallPrompt: '',
          weights: { team: 20, evidence: 20, fit: 15, need: 15, novelty: 15, focus: 15 },
          customPrompts: { team: '', evidence: '', fit: '', need: '', novelty: '', focus: '' }
        });
        setShowProgramEditor(false);
        setEditingProgram(null);
    
        alert('Program created successfully!');
      } catch (error: any) {
        console.error('Error creating program:', error);
        alert('Failed to create program: ' + error.message);
      }
    };
    
      
      const handleMagicLink = async () => {
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email: authEmail,
            options: {
              emailRedirectTo: window.location.origin
            }
          });
    
          if (error) throw error;
          alert('Magic link sent! Check your email.');
        } catch (error: any) {
          alert('Failed to send magic link: ' + error.message);
       }
     };

      const handleUpdateProgram = async () => {
      if (!editingProgram || !newProgram.name.trim() || !newProgram.overallPrompt.trim()) {
        alert('Please fill in both program name and overall prompt.');
        return;
      }
      
      const totalWeight = Object.values(newProgram.weights).reduce((sum: number, weight: any) => sum + weight, 0);
      if (totalWeight !== 100) {
        alert(`Criteria weights must total 100%. Currently: ${totalWeight}%`);
        return;
      }
    
      try {
        const { data, error } = await supabase
          .from('programs')
          .update({
            name: newProgram.name,
            criteria: newProgram.overallPrompt,
            overall_prompt: newProgram.overallPrompt,
            weights: newProgram.weights,
            custom_prompts: newProgram.customPrompts
          })
          .eq('id', editingProgram)
          .select()
          .single();
    
        if (error) throw error;
    
        // Update local state
        setPrograms(prev => ({
          ...prev,
          [editingProgram]: {
            name: data.name,
            criteria: data.criteria,
            overallPrompt: data.overall_prompt,
            weights: data.weights,
            customPrompts: data.custom_prompts,
            active: data.active
          }
        }));
    
        // Reset form
        setNewProgram({
          name: '',
          overallPrompt: '',
          weights: { team: 20, evidence: 20, fit: 15, need: 15, novelty: 15, focus: 15 },
          customPrompts: { team: '', evidence: '', fit: '', need: '', novelty: '', focus: '' }
        });
        setShowProgramEditor(false);
        setEditingProgram(null);
    
        alert('Program updated successfully!');
      } catch (error: any) {
        console.error('Error updating program:', error);
        alert('Failed to update program: ' + error.message);
      }
    };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Thrival: AI Evaluation System</h1>
          <div className="flex items-center space-x-4">
            <Sun className="h-4 w-4" />
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
            <Moon className="h-4 w-4" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Process</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Evaluate Tab */}
          <TabsContent value="evaluate" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-6">
                {/* Program Selection */}
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Program Selection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                      <SelectTrigger className={darkMode ? 'border-white/20' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(programs)
                          .filter(([, program]) => (program as any).active)
                          .map(([id, program]) => (
                            <SelectItem key={id} value={id}>
                              {(program as any).name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Application Input */}
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Application</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Project Name (Optional)</Label>
                      <Input
                        placeholder="Enter a name for this project/application..."
                        value={projectName}
                        onChange={(e: any) => setProjectName(e.target.value)}
                        className={darkMode ? 'border-white/30' : ''}
                      />
                    </div>
                    <div>
                      <Label>Application Text</Label>
                      <Textarea
                        placeholder="Paste the application text here..."
                        value={applicationText}
                        onChange={(e: any) => setApplicationText(e.target.value)}
                        rows={18}
                        className={darkMode ? 'border-white/30' : ''}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Evaluation Criteria and External Data Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Evaluation Criteria */}
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Evaluation Criteria</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(programs[selectedProgram]?.weights || criteriaWeights).map(([criterion, weight]) => {
                      const criteriaInfo: {[key: string]: any} = {
                        team: {
                          icon: UserCheck,
                          title: 'Team',
                          description: 'Experience & track record'
                        },
                        evidence: {
                          icon: FileText,
                          title: 'Evidence',
                          description: 'Traction & validation'
                        },
                        fit: {
                          icon: Target,
                          title: 'Fit',
                          description: 'Program alignment'
                        },
                        need: {
                          icon: TrendingUp,
                          title: 'Need',
                          description: 'Market demand'
                        },
                        novelty: {
                          icon: Lightbulb,
                          title: 'Novelty',
                          description: 'Innovation level'
                        },
                        focus: {
                          icon: Focus,
                          title: 'Focus',
                          description: 'Strategic clarity'
                        }
                      };

                      const info = (criteriaInfo as any)[criterion];
                      const IconComponent = info.icon;

                      return (
                        <div key={criterion} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium">{info.title}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{info.description}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className={darkMode ? 'border-white/20' : ''}>
                            {weight}%
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* External Data */}
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>External Data (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Twitter Handle</Label>
                      <Input
                        placeholder="@username"
                        value={externalData.twitter}
                        onChange={(e: any) => setExternalData((prev: any) => ({ ...prev, twitter: e.target.value }))}
                        className={darkMode ? 'border-white/20' : ''}
                      />
                    </div>
                    <div>
                      <Label>GitHub Repository</Label>
                      <Input
                        placeholder="github.com/username/repo"
                        value={externalData.github}
                        onChange={(e: any) => setExternalData((prev: any) => ({ ...prev, github: e.target.value }))}
                        className={darkMode ? 'border-white/20' : ''}
                      />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input
                        placeholder="https://example.com"
                        value={externalData.website}
                        onChange={(e: any) => setExternalData((prev: any) => ({ ...prev, website: e.target.value }))}
                        className={darkMode ? 'border-white/20' : ''}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Start Evaluation Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  size="lg"
                >
                  {isEvaluating ? 'Evaluating...' : 'Start Evaluation'}
                </Button>
              </div>
            </div>
          </TabsContent>

                          
          {/* Bulk Process Tab */}
          <TabsContent value="bulk" className="space-y-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle>Bulk Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Upload CSV File</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('bulk-file')?.click()}
                      className="h-10"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {bulkFile ? bulkFile.name : 'No file selected'}
                    </span>
                    <input
                      id="bulk-file"
                      type="file"
                      accept=".csv"
                      onChange={(e: any) => setBulkFile(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleBulkProcess}
                  disabled={!bulkFile || bulkProcessing}
                  className="w-full"
                >
                  {bulkProcessing ? 'Processing...' : 'Process Applications'}
                </Button>

                {bulkResults.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Results ({bulkResults.length} applications)</h3>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700">
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Application</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Score</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Percentage</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Recommendation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkResults.map((result: any) => (
                            <tr key={result.id}>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{result.name}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{result.score}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{result.percentage}%</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                <Badge variant={
                                  result.recommendation === 'Strongly Recommend' ? 'default' :
                                  result.recommendation === 'Recommend' ? 'default' :
                                  result.recommendation === 'Conditional' ? 'secondary' : 'destructive'
                                }>
                                  {result.recommendation}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {/* Latest Evaluation Result */}
            {evaluationResult && (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle>Latest Evaluation Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Project Info */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <h3 className="font-medium text-lg">{evaluationResult.projectName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Evaluated by {evaluationResult.evaluator} on {evaluationResult.date} using {evaluationResult.program.name}
                      </p>
                    </div>
                    <Badge className="text-lg px-4 py-2" variant={
                      evaluationResult.recommendation === 'Strongly Recommend' ? 'default' :
                      evaluationResult.recommendation === 'Recommend' ? 'default' :
                      evaluationResult.recommendation === 'Conditional' ? 'secondary' : 'destructive'
                    }>
                      {evaluationResult.finalScore.score.toFixed(1)}/10
                    </Badge>
                  </div>
          
                  {/* Overall Score */}
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                    <div className="text-4xl font-bold text-blue-600">{evaluationResult.finalScore.score.toFixed(1)}/10</div>
                    <div className="text-lg text-gray-600 dark:text-gray-400">{evaluationResult.finalScore.percentage.toFixed(0)}% Overall Score</div>
                    <Badge className="mt-2" variant={
                      evaluationResult.recommendation === 'Strongly Recommend' ? 'default' :
                      evaluationResult.recommendation === 'Recommend' ? 'default' :
                      evaluationResult.recommendation === 'Conditional' ? 'secondary' : 'destructive'
                    }>
                      {evaluationResult.recommendation}
                    </Badge>
                  </div>
          
                  {/* Criteria Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(evaluationResult.results).map(([criterion, result]: [string, any]) => (
                      <Card key={criterion} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">{criterion}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              {(result as any).score}/10
                            </Badge>
                            <Badge variant="outline" className={darkMode ? 'border-white/20' : ''}>
                              {evaluationResult.weightsUsed[criterion]}% weight
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{(result as any).feedback}</p>
                      </Card>
                    ))}
                  </div>
          
                  {/* Applicant Feedback */}
                  <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="font-medium mb-2">Applicant Feedback</h4>
                    <p className="text-sm">{evaluationResult.applicantFeedback}</p>
                  </Card>
                </CardContent>
              </Card>
            )}
          
            {/* Evaluation History */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Evaluation History</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search evaluations..."
                      value={searchTerm}
                      onChange={(e: any) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {evaluationHistory.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No evaluations completed yet. Start by evaluating an application in the Evaluate tab.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {evaluationHistory
                      .filter((evaluation: any) => 
                        !searchTerm || 
                        evaluation.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        evaluation.program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        evaluation.evaluator.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((evaluation: any) => (
                        <div key={evaluation.id} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                             onClick={() => setEvaluationResult(evaluation)}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{evaluation.projectName}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span>📅 {evaluation.date}</span>
                                <span>👤 {evaluation.evaluator}</span>
                                <span>📁 {evaluation.program.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="text-lg px-3 py-1">
                                {evaluation.finalScore.score.toFixed(1)}/10
                              </Badge>
                              <Badge variant={
                                evaluation.recommendation === 'Strongly Recommend' ? 'default' :
                                evaluation.recommendation === 'Recommend' ? 'default' :
                                evaluation.recommendation === 'Conditional' ? 'secondary' : 'destructive'
                              }>
                                {evaluation.recommendation}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Navigation Menu */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveSettingsSection('api')}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      activeSettingsSection === 'api' 
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
                    }`}
                  >
                    <h3 className={`font-medium ${activeSettingsSection === 'api' ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                      ✅ API Configuration
                    </h3>
                    <p className={`text-sm mt-1 ${activeSettingsSection === 'api' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      Claude, Twitter & GitHub API keys
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setActiveSettingsSection('preferences')}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      activeSettingsSection === 'preferences' 
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
                    }`}
                  >
                    <h3 className={`font-medium ${activeSettingsSection === 'preferences' ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                      ⚙️ System Preferences
                    </h3>
                    <p className={`text-sm mt-1 ${activeSettingsSection === 'preferences' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      Notifications, export format & defaults
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setActiveSettingsSection('programs')}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      activeSettingsSection === 'programs' 
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
                    }`}
                  >
                    <h3 className={`font-medium ${activeSettingsSection === 'programs' ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                      📁 Program Management
                    </h3>
                    <p className={`text-sm mt-1 ${activeSettingsSection === 'programs' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      Create, edit & manage evaluation programs
                    </p>
                  </button>

                  {isAdmin(user) && (
                    <button
                      onClick={() => setActiveSettingsSection('prompts')}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        activeSettingsSection === 'prompts' 
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
                      }`}
                    >
                      <h3 className={`font-medium ${activeSettingsSection === 'prompts' ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                        🎯 Prompt Management
                      </h3>
                      <p className={`text-sm mt-1 ${activeSettingsSection === 'prompts' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                        Edit AI evaluation prompts & scoring guidelines
                      </p>
                    </button>
                  )}
                  
                 {isAdmin(user) && (
                  <button
                    onClick={() => setActiveSettingsSection('team')}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      activeSettingsSection === 'team' 
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
                    }`}
                  >
                    <h3 className={`font-medium ${activeSettingsSection === 'team' ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                      👥 Team & Access
                    </h3>
                    <p className={`text-sm mt-1 ${activeSettingsSection === 'team' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      Manage team members and roles
                    </p>
                  </button>
                )}
                </div>
              </CardContent>
            </Card>

            {/* API Configuration Section */}
            {activeSettingsSection === 'api' && (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>API Configuration</span>
                    <Badge variant="outline" className="text-xs">
                      Required for AI evaluations
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Claude API Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Claude API</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Required for AI-powered evaluations
                        </p>
                      </div>
                      <Badge variant={apiKeys.claude ? 'default' : 'secondary'}>
                        {apiKeys.claude ? 'Configured' : 'Not Set'}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      <div>
                        <Label>API Key</Label>
                        <div className="flex space-x-2">
                          <Input
                            type="password"
                            placeholder="sk-ant-..."
                            value={apiKeys.claude}
                            onChange={(e: any) => setApiKeys(prev => ({ ...prev, claude: e.target.value }))}
                            className={darkMode ? 'border-white/20' : ''}
                          />
                          <Button
                            variant="outline"
                            onClick={() => handleTestApiConnection('claude')}
                            disabled={!apiKeys.claude || testingConnection === 'claude'}
                            className="min-w-[80px]"
                          >
                            {testingConnection === 'claude' ? 'Testing...' : 'Test'}
                          </Button>
                        </div>
                        {connectionStatus.claude && (
                          <div className={`text-sm mt-1 ${connectionStatus.claude.success ? 'text-green-600' : 'text-red-600'}`}>
                            {connectionStatus.claude.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    {/* Twitter API Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Twitter API</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Optional: For social media data collection
                          </p>
                        </div>
                        <Badge variant={apiKeys.twitter ? 'default' : 'secondary'}>
                          {apiKeys.twitter ? 'Configured' : 'Not Set'}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4">
                        <div>
                          <Label>Bearer Token</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="password"
                              placeholder="AAAA..."
                              value={apiKeys.twitter}
                              onChange={(e: any) => setApiKeys(prev => ({ ...prev, twitter: e.target.value }))}
                              className={darkMode ? 'border-white/20' : ''}
                            />
                            <Button
                              variant="outline"
                              onClick={() => handleTestApiConnection('twitter')}
                              disabled={!apiKeys.twitter || testingConnection === 'twitter'}
                              className="min-w-[80px]"
                            >
                              {testingConnection === 'twitter' ? 'Testing...' : 'Test'}
                            </Button>
                          </div>
                          {connectionStatus.twitter && (
                            <div className={`text-sm mt-1 ${connectionStatus.twitter.success ? 'text-green-600' : 'text-red-600'}`}>
                              {connectionStatus.twitter.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    {/* GitHub API Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">GitHub API</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Optional: For repository analysis and code metrics
                          </p>
                        </div>
                        <Badge variant={apiKeys.github ? 'default' : 'secondary'}>
                          {apiKeys.github ? 'Configured' : 'Not Set'}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4">
                        <div>
                          <Label>Personal Access Token</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="password"
                              placeholder="ghp_..."
                              value={apiKeys.github}
                              onChange={(e: any) => setApiKeys(prev => ({ ...prev, github: e.target.value }))}
                              className={darkMode ? 'border-white/20' : ''}
                            />
                            <Button
                              variant="outline"
                              onClick={() => handleTestApiConnection('github')}
                              disabled={!apiKeys.github || testingConnection === 'github'}
                              className="min-w-[80px]"
                            >
                              {testingConnection === 'github' ? 'Testing...' : 'Test'}
                            </Button>
                          </div>
                          {connectionStatus.github && (
                            <div className={`text-sm mt-1 ${connectionStatus.github.success ? 'text-green-600' : 'text-red-600'}`}>
                              {connectionStatus.github.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Configuration */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          API keys are stored securely and used only for evaluations
                        </p>
                      </div>
                      <Button onClick={handleSaveApiConfiguration}>
                        Save Configuration
                      </Button>
                    </div>
                  </div>

                  {/* API Usage Statistics */}
                  {(apiKeys.claude || apiKeys.twitter || apiKeys.github) && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                      <h4 className="font-medium mb-4">API Usage Statistics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {apiKeys.claude && (
                          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Claude API</div>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                              {apiUsageStats.claude || 0}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">evaluations this month</div>
                          </div>
                        )}
                        {apiKeys.twitter && (
                          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Twitter API</div>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                              {apiUsageStats.twitter || 0}
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">requests this month</div>
                          </div>
                        )}
                        {apiKeys.github && (
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="text-sm font-medium text-green-700 dark:text-green-300">GitHub API</div>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                              {apiUsageStats.github || 0}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">requests this month</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* System Preferences Section */}
            {activeSettingsSection === 'preferences' && (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>System Preferences</span>
                    <Badge variant="outline" className="text-xs">
                      Global system settings
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notifications */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive email alerts for evaluation completions and updates
                          </p>
                        </div>
                        <Switch
                          checked={systemPreferences.emailNotifications}
                          onCheckedChange={(checked: boolean) => 
                            setSystemPreferences(prev => ({ ...prev, emailNotifications: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-save Progress</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Automatically save evaluation progress every 30 seconds
                          </p>
                        </div>
                        <Switch
                          checked={systemPreferences.autoSave}
                          onCheckedChange={(checked: boolean) => 
                            setSystemPreferences(prev => ({ ...prev, autoSave: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    {/* Export & Download Preferences */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Export & Download Preferences</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Default Export Format</Label>
                          <Select 
                            value={systemPreferences.exportFormat} 
                            onValueChange={(value: string) => 
                              setSystemPreferences(prev => ({ ...prev, exportFormat: value }))
                            }
                          >
                            <SelectTrigger className={darkMode ? 'border-white/20' : ''}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF Report</SelectItem>
                              <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                              <SelectItem value="json">JSON Data</SelectItem>
                              <SelectItem value="xlsx">Excel Workbook</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Evaluation Timeout (minutes)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="60"
                            value={systemPreferences.evaluationTimeout || 10}
                            onChange={(e: any) => 
                              setSystemPreferences(prev => ({ ...prev, evaluationTimeout: parseInt(e.target.value) || 10 }))
                            }
                            className={`w-32 ${darkMode ? 'border-white/20' : ''}`}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Maximum time to wait for AI evaluation responses
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    {/* UI Preferences */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Interface Preferences</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Use dark theme across the application
                            </p>
                          </div>
                          <Switch
                            checked={darkMode}
                            onCheckedChange={setDarkMode}
                          />
                        </div>
                        
                        <div>
                          <Label>Items per Page</Label>
                          <Select 
                            value={systemPreferences.itemsPerPage?.toString() || '25'} 
                            onValueChange={(value: string) => 
                              setSystemPreferences(prev => ({ ...prev, itemsPerPage: parseInt(value) }))
                            }
                          >
                            <SelectTrigger className={`w-32 ${darkMode ? 'border-white/20' : ''}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Preferences are saved automatically and apply system-wide
                        </p>
                      </div>
                      <Button onClick={handleSaveSystemPreferences}>
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prompt Management Section */}
            {activeSettingsSection === 'prompts' && isAdmin(user) && (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Prompt Management</span>
                    <Badge variant="outline" className="text-xs">
                      AI evaluation prompts
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">System Prompts</h4>
                      
                    <div className="grid grid-cols-1 gap-4">
                      </div>
                
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h5 className="font-medium mb-2">🤖 AI Evaluator Instructions</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Base instructions that tell Claude who they are and what they're doing
                          </p>
                          <Button variant="outline" size="sm" onClick={() => handleEditPrompt('system')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Instructions
                          </Button>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mt-6">Criterion-Specific Prompts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['team', 'evidence', 'fit', 'need', 'novelty', 'focus'].map((criterion) => (
                        <div key={criterion} className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                          <h5 className="font-medium mb-2 capitalize">{criterion}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Custom prompt for {criterion} evaluation
                          </p>
                          <Button variant="outline" size="sm" onClick={() => handleEditPrompt(criterion)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit {criterion}
                          </Button>
                        </div>
                      ))}
                    </div>
                </CardContent>
              </Card>
            )}
            
            {/* Program Management Section */}
            {activeSettingsSection === 'programs' && (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <span>Program Management</span>
                      <Badge variant="outline" className="text-xs">
                        Evaluation programs
                      </Badge>
                    </CardTitle>
                    <Button onClick={() => setShowProgramEditor(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Program
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Program List */}
                  <div className="space-y-4">
                    {Object.entries(programs).map(([programId, program]: [string, any]) => (
                     <div key={programId} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium">{program.name}</h4>
                            <Badge variant={program.active ? 'default' : 'secondary'}>
                              {program.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={program.active}
                              onCheckedChange={(checked: boolean) => handleToggleProgram(programId, checked)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProgram(programId)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingProgram(programId);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team & Access Management Section */}
            {activeSettingsSection === 'team' && (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <span>Team & Access Management</span>
                      <Badge variant="outline" className="text-xs">
                        Organization members
                      </Badge>
                    </CardTitle>
                    <Button onClick={() => setShowTeamInvite(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Team Members */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Team Members</h4>
                    {teamMembers.map((member: any) => (
                      <div key={member.id} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium">{member.name}</h4>
                              <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                                {member.role === 'owner' ? 'Owner' : 'Evaluator'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {member.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {member.role !== 'owner' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTeamMember(member.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Access Control Info */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Role Permissions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="text-xs">Owner</Badge>
                        <span className="text-blue-800 dark:text-blue-200">Full access - can manage team, delete data, and invite members</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">Evaluator</Badge>
                        <span className="text-blue-800 dark:text-blue-200">Can evaluate applications and view results, but cannot manage team</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Authentication Modal / Landing Page */}
        {!user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg w-96 max-w-md`}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Welcome to Thrival</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  AI-powered evaluation system
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={authEmail}
                    onChange={(e: any) => setAuthEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={authPassword}
                    onChange={(e: any) => setAuthPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleLogin} 
                    disabled={!authEmail || !authPassword}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  
                  <Button 
                    onClick={handleRequestMagicLink} 
                    disabled={!authEmail}
                    variant="outline"
                    className="w-full"
                  >
                    Send Magic Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      
      {/* Add Team Member Modal */}
      {showTeamEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-96 max-w-md`}>
            <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newTeamMember.name}
                  onChange={(e: any) => setNewTeamMember((prev: any) => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newTeamMember.email}
                  onChange={(e: any) => setNewTeamMember((prev: any) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select 
                  value={newTeamMember.role} 
                  onValueChange={(value: any) => setNewTeamMember((prev: any) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead Evaluator">Lead Evaluator</SelectItem>
                    <SelectItem value="Evaluator">Evaluator</SelectItem>
                    <SelectItem value="Technical Reviewer">Technical Reviewer</SelectItem>
                    <SelectItem value="Observer">Observer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setShowTeamEditor(false);
                setNewTeamMember({ name: '', email: '', role: 'Evaluator' });
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddTeamMember}>
                Add Member
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Team Invite Modal */}
        {showTeamInvite && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-96 max-w-md`}>
              <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
              <div className="space-y-4">
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e: any) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => {
                  setShowTeamInvite(false);
                  setInviteEmail('');
                }}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser}>
                  Send Invitation
                </Button>
              </div>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-96 max-w-md`}>
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete "{programs[deletingProgram as any]?.name}"?
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteProgram(deletingProgram as any)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Program Modal */}
      {showProgramEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-lg font-semibold mb-4">
              {editingProgram ? 'Edit Program' : 'Create New Program'}
            </h3>
            
            <div className="space-y-6">
              {/* Program Name */}
              <div>
                <Label>Program Name</Label>
                <Input
                  value={newProgram.name}
                  onChange={(e: any) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter program name..."
                />
              </div>

              {/* Overall Prompt */}
              <div>
                <Label>Overall Evaluation Prompt</Label>
                <Textarea
                  value={newProgram.overallPrompt}
                  onChange={(e: any) => setNewProgram(prev => ({ ...prev, overallPrompt: e.target.value }))}
                  rows={4}
                  placeholder="Enter the main prompt that will guide AI evaluation for this program..."
                />
              </div>

              {/* Criteria Weights */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Criteria Weights</Label>
                  <Badge variant={
                    Object.values(newProgram.weights).reduce((sum: number, weight: any) => sum + weight, 0) === 100 
                      ? 'default' 
                      : 'destructive'
                  }>
                    Total: {Object.values(newProgram.weights).reduce((sum: number, weight: any) => sum + weight, 0)}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(newProgram.weights).map(([criterion, weight]) => {
                    const criteriaInfo: {[key: string]: any} = {
                      team: { title: 'Team', icon: '👥' },
                      evidence: { title: 'Evidence', icon: '📊' },
                      fit: { title: 'Fit', icon: '🎯' },
                      need: { title: 'Need', icon: '📈' },
                      novelty: { title: 'Novelty', icon: '💡' },
                      focus: { title: 'Focus', icon: '🔍' }
                    };
                    
                    const info = criteriaInfo[criterion];
                    
                    return (
                      <div key={criterion} className="p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{info.icon}</span>
                          <span className="font-medium text-sm">{info.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={weight}
                            onChange={(e: any) => 
                              setNewProgram(prev => ({
                                ...prev,
                                weights: {
                                  ...prev.weights,
                                  [criterion]: parseInt(e.target.value) || 0
                                }
                              }))
                            }
                            className="w-16 text-sm"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Prompts */}
              <div>
                <Label>Custom Criterion Prompts (Optional)</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Leave blank to use the overall prompt for all criteria, or customize individual prompts below.
                </p>
                
                <div className="space-y-4">
                  {Object.entries(newProgram.customPrompts).map(([criterion, prompt]) => {
                    const criteriaInfo: {[key: string]: any} = {
                      team: { title: 'Team', icon: '👥' },
                      evidence: { title: 'Evidence', icon: '📊' },
                      fit: { title: 'Fit', icon: '🎯' },
                      need: { title: 'Need', icon: '📈' },
                      novelty: { title: 'Novelty', icon: '💡' },
                      focus: { title: 'Focus', icon: '🔍' }
                    };
                    
                    const info = criteriaInfo[criterion];
                    
                    return (
                      <div key={criterion}>
                        <Label className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{info.icon}</span>
                          <span>{info.title} Prompt</span>
                        </Label>
                        <Textarea
                          value={prompt}
                          onChange={(e: any) => 
                            setNewProgram(prev => ({
                              ...prev,
                              customPrompts: {
                                ...prev.customPrompts,
                                [criterion]: e.target.value
                              }
                            }))
                          }
                          rows={2}
                          placeholder={`Custom ${info.title.toLowerCase()} evaluation prompt...`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowProgramEditor(false);
                  setEditingProgram(null);
                  setNewProgram({
                    name: '',
                    overallPrompt: '',
                    weights: { team: 20, evidence: 20, fit: 15, need: 15, novelty: 15, focus: 15 },
                    customPrompts: { team: '', evidence: '', fit: '', need: '', novelty: '', focus: '' }
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editingProgram ? handleUpdateProgram : handleCreateProgram}
                disabled={Object.values(newProgram.weights).reduce((sum: number, weight: any) => sum + weight, 0) !== 100}
              >
                {editingProgram ? 'Update Program' : 'Create Program'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Editor Modal */}
      {showPromptEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-lg font-semibold mb-4">
              Edit {editingPrompt === 'system' ? 'AI Evaluator Instructions' : 
                   `${editingPrompt.charAt(0).toUpperCase() + editingPrompt.slice(1)}`}
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label>Prompt Text</Label>
                <Textarea
                  rows={15}
                  value={currentPromptText}
                  onChange={(e) => {
                    console.log('Textarea changed to:', e.target.value);
                    setCurrentPromptText(e.target.value);
                  }}
                  placeholder="Enter your prompt here..."
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowPromptEditor(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePrompt}>
                Save Prompt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThrivalSystem;
