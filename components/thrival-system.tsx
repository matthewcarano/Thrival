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
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple Label replacement
const Label = ({ children, className }: any) => <div className={`text-sm font-medium ${className || ''}`}>{children}</div>;

const ThrivalSystem = () => {
  console.log('Component loading');
  
  // Core state
  const [activeTab, setActiveTab] = useState('evaluate');
  const [applicationText, setApplicationText] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('program1');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<any[]>([]);
  const [bulkFile, setBulkFile] = useState<any>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState<any[]>([]);

  // Authentication state
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'setup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Program management state
  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const [editingProgram, setEditingProgram] = useState<string | null>(null);
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

  const [programs, setPrograms] = useState<any>({
    program1: {
      name: 'Program 1 - DeFi Innovation',
      active: true,
      criteria: 'Focus on decentralized finance protocols and yield optimization'
    },
    program2: {
      name: 'Program 2 - Infrastructure & Tooling',
      active: true,
      criteria: 'Developer tools, APIs, and blockchain infrastructure'
    },
    program3: {
      name: 'Program 3 - Consumer Applications',
      active: false,
      criteria: 'End-user facing applications and mobile experiences'
    }
  });

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

  // Team management state
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

  // Settings state
  const [apiKeys, setApiKeys] = useState({
    claude: '',
    twitter: '',
    github: ''
  });

  const [systemPreferences, setSystemPreferences] = useState({
    emailNotifications: true,
    autoSave: false,
    exportFormat: 'pdf'
  });

  const [prompts, setPrompts] = useState({
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
      min: 9,
      max: 10,
      recommendation: 'Strongly Recommend',
      applicantMessage: 'Congratulations! Your application demonstrates exceptional merit across all evaluation criteria.'
    },
    {
      min: 7,
      max: 8.9,
      recommendation: 'Recommend',
      applicantMessage: 'Your application shows strong potential and aligns well with {programName} objectives.'
    },
    {
      min: 5,
      max: 6.9,
      recommendation: 'Conditional',
      applicantMessage: 'Your application shows promise but requires additional development in key areas.'
    },
    {
      min: 0,
      max: 4.9,
      recommendation: 'Do Not Fund',
      applicantMessage: 'Unfortunately, your application does not meet the current criteria for {programName}.'
    }
  ];

  // Authentication functions
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

  // Program management functions
  const handleCreateProgram = () => {
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
    setPrograms(prev => ({
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

    // Reset form
    setNewProgram({
      name: '',
      overallPrompt: '',
      weights: { team: 20, evidence: 20, fit: 15, need: 15, novelty: 15, focus: 15 },
      customPrompts: { team: '', evidence: '', fit: '', need: '', novelty: '', focus: '' }
    });
    setShowProgramEditor(false);
    setEditingProgram(null);
  };

  const handleUpdateProgram = () => {
    if (!editingProgram || !newProgram.name.trim() || !newProgram.overallPrompt.trim()) {
      alert('Please fill in both program name and overall prompt.');
      return;
    }
    const totalWeight = Object.values(newProgram.weights).reduce((sum: number, weight: any) => sum + weight, 0);
    if (totalWeight !== 100) {
      alert(`Criteria weights must total 100%. Currently: ${totalWeight}%`);
      return;
    }
    setPrograms(prev => ({
      ...prev,
      [editingProgram]: {
        ...prev[editingProgram],
        name: newProgram.name,
        criteria: newProgram.overallPrompt,
        overallPrompt: newProgram.overallPrompt,
        weights: { ...newProgram.weights },
        customPrompts: { ...newProgram.customPrompts }
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
  };

  // Mock AI evaluation function - will be replaced with real Claude API
  const evaluateWithAI = async (criterion: string, applicationText: string, programId: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

    const baseScore = Math.floor(Math.random() * 4) + 4; // 4-7 base range
    const programBonus = programId === 'program1' ? 1 : 0;
    const externalBonus = (externalData.twitter || externalData.github) ? 1 : 0;

    const score = Math.min(10, baseScore + programBonus + externalBonus);

    const evidenceExamples: {[key: string]: string[]} = {
      team: [
        "GitHub shows 500+ commits across 15 repositories",
        "Ex-Coinbase product manager with 3 years DeFi experience", 
        "Led team that launched $50M TVL protocol in 2023",
        "Strong technical background with 2 previous successful exits"
      ],
      evidence: [
        "Current TVL of $2.3M with 45% month-over-month growth",
        "15,000+ Twitter followers with 8% engagement rate",
        "Demo shows working product with 1,200+ beta users",
        "Partnerships confirmed with 3 major DeFi protocols"
      ],
      fit: [
        "Deep integration with ecosystem's native AMM",
        "Utilizes ecosystem-specific yield farming mechanisms", 
        "Built specifically for ecosystem's unique consensus model",
        "Leverages ecosystem's cross-chain bridge infrastructure"
      ],
      need: [
        "Addresses $500M+ market gap in current ecosystem",
        "Survey shows 78% of users want this specific solution",
        "No direct competitors in ecosystem currently", 
        "Strong demand signals from 5+ major ecosystem partners"
      ],
      novelty: [
        "First implementation of novel yield optimization algorithm",
        "Breakthrough approach to solving MEV extraction problem",
        "Innovative tokenomics model not seen in current market",
        "Novel use of zero-knowledge proofs for privacy"
      ],
      focus: [
        "Directly addresses ecosystem's #1 strategic priority",
        "Aligns with roadmap goals for institutional adoption",
        "Matches program focus on sustainable yield generation",
        "Perfect fit for ecosystem's Q2 growth targets"
      ]
    };

    const feedback = `${evidenceExamples[criterion][Math.floor(Math.random() * evidenceExamples[criterion].length)]} The project demonstrates ${score >= 8 ? 'exceptional' : score >= 6 ? 'strong' : score >= 4 ? 'adequate' : 'limited'} performance in this criterion. ${score >= 7 ? 'This is a significant strength that enhances the overall application.' : score >= 5 ? 'This area shows promise but could benefit from additional development.' : 'This area requires improvement to meet program standards.'} ${score >= 6 ? 'The evidence provided is convincing and well-documented.' : 'More concrete evidence would strengthen this evaluation.'} Overall, this criterion ${score >= 7 ? 'exceeds' : score >= 5 ? 'meets' : 'falls short of'} the expected standards for this program.`;

    return { score, feedback };
  };

  // Calculate weighted score
  const calculateWeightedScore = (scores: any) => {
    const totalWeightedScore =
      (scores.team * criteriaWeights.team / 100) +
      (scores.evidence * criteriaWeights.evidence / 100) +
      (scores.fit * criteriaWeights.fit / 100) +
      (scores.need * criteriaWeights.need / 100) +
      (scores.novelty * criteriaWeights.novelty / 100) +
      (scores.focus * criteriaWeights.focus / 100);

    const percentage = (totalWeightedScore / 10) * 100;
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

      const finalScore = calculateWeightedScore(scores);

      // Find the appropriate grading tier
      const tier = gradingTiers.find(tier =>
        finalScore.score >= tier.min && finalScore.score <= tier.max
      );

      const recommendation = tier ? tier.recommendation : 'Ungraded';
      const applicantFeedback = tier ?
        tier.applicantMessage.replace('{programName}', programs[selectedProgram].name) :
        'Unable to determine appropriate feedback tier.';

      const evaluation = {
        id: Date.now(),
        program: programs[selectedProgram],
        date: new Date().toISOString().split('T')[0],
        applicationText,
        externalData: { ...externalData },
        results,
        scores,
        finalScore,
        recommendation,
        applicantFeedback
      };

      setEvaluationResult(evaluation);
      setEvaluationHistory(prev => [evaluation, ...prev]);

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

  // Team management  
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
      }
    };

    checkAuth();
  }, []);

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
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Evaluate Tab */}
          <TabsContent value="evaluate" className="space-y-6">
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
                <CardContent>
                  <Textarea
                    placeholder="Paste the application text here..."
                    value={applicationText}
                    onChange={(e: any) => setApplicationText(e.target.value)}
                    rows={20}
                    className={darkMode ? 'border-white/30' : ''}
                  />
                </CardContent>
              </Card>

              {/* Evaluation Criteria and External Data Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Evaluation Criteria */}
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Evaluation Criteria</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(criteriaWeights).map(([criterion, weight]) => {
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

              {/* Temporary Auth Test Button */}
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={() => {
                    console.log('Showing auth modal');
                    setShowAuthModal(true);
                    console.log('showAuthModal set to true');
                  }}
                  variant="outline"
                >
                  Test Auth Modal
                </Button>
              </div>

              {/* Evaluation Results */}
              {evaluationResult && (
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Evaluation Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
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
                                {criteriaWeights[criterion]}% weight
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

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Evaluation History</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {evaluationHistory.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No evaluations completed yet. Start by evaluating an application in the Evaluate tab.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {evaluationHistory.map((evaluation: any) => (
                      <Card key={evaluation.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{evaluation.program.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{evaluation.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {evaluation.applicationText.substring(0, 150)}...
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Settings interface will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-96 max-w-md`}>
            <h3 className="text-lg font-semibold mb-4">
              {authMode === 'login' ? 'Sign In to Thrival' : 'Complete Your Setup'}
            </h3>
            
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
              
              {authMode === 'login' && (
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={authPassword}
                    onChange={(e: any) => setAuthPassword(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              {authMode === 'login' ? (
                <>
                  <Button onClick={handleLogin} disabled={!authEmail || !authPassword}>
                    Sign In
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleMagicLink} disabled={!authEmail}>
                    Send Magic Link
                  </Button>
                </>
              )}
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {authMode === 'login' 
                  ? "Don't have an account? Contact your admin for an invitation."
                  : "Check your email for the magic link to complete setup."
                }
              </p>
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
              <Button variant="destructive" onClick={() => {
                // handleDeleteProgram function would go here
                setShowDeleteConfirm(false);
                setDeletingProgram(null);
              }}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThrivalSystem;
