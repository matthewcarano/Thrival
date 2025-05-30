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

// Simple Label replacement
const Label = ({ children, className }: any) => <div className={`text-sm font-medium ${className || ''}`}>{children}</div>;

const ThrivalSystem = () => {
  // State declarations
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
  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const [newProgram, setNewProgram] = useState({ name: '', criteria: '' });
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

  // Mock AI evaluation function
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

  // Program management
  const handleAddProgram = () => {
    if (!newProgram.name.trim() || !newProgram.criteria.trim()) {
      alert('Please fill in both program name and criteria.');
      return;
    }

    const programId = `program${Date.now()}`;
    setPrograms((prev: any) => ({
      ...prev,
      [programId]: {
        name: newProgram.name,
        criteria: newProgram.criteria,
        active: true
      }
    }));

    setNewProgram({ name: '', criteria: '' });
    setShowProgramEditor(false);
  };

  const handleDeleteProgram = (programId: string) => {
    const activePrograms = Object.entries(programs).filter(([, prog]) => (prog as any).active);
    if (activePrograms.length <= 1) {
      alert('Cannot delete the last active program.');
      return;
    }

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
          
          // Test Claude API with a simple request
          const claudeResponse = await fetch('/api/test-claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: apiKeys.claude })
          });
          
          if (!claudeResponse.ok) {
            throw new Error('Invalid API key or connection failed');
          }
          
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
  
  // Save criteria settings
  const handleSaveCriteriaSettings = () => {
    try {
      const criteriaData = {
        weights: criteriaWeights,
        prompts: prompts,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('thrival_criteria_settings', JSON.stringify(criteriaData));
      alert('Criteria settings saved successfully!');
    } catch (error) {
      console.error('Error saving criteria settings:', error);
      alert('Failed to save criteria settings. Please try again.');
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Process</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
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
              </div>

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

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Members</CardTitle>
                  <Button onClick={() => setShowTeamEditor(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member: any) => (
                    <div key={member.id} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                          <Badge variant="outline" className="mt-1">
                            {member.role}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTeamMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

{/* Settings Tab */}
<TabsContent value="settings" className="space-y-6">
  {/* Settings Navigation Menu */}
  <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
    <CardHeader>
      <CardTitle>Settings Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <h3 className="font-medium text-blue-900 dark:text-blue-100">✅ API Configuration</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Claude, Twitter & GitHub API keys</p>
        </div>
    <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-medium">🔨 Evaluation Criteria</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">→ Now part of Program Management</p>
        </div>
        <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-medium">⚙️ System Preferences</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Notifications, export format & defaults</p>
        </div>
        <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-medium">📁 Program Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create, edit & manage programs</p>
        </div>
        <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-medium">👥 Team & Access</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">User roles, permissions & invitations</p>
        </div>
        <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-medium">📊 Analytics & Reports</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Usage stats & performance metrics</p>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* API Configuration Section */}
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

      {/* API Usage Statistics (if any APIs are configured) */}
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


  {/* System Preferences Section */}
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

  {/* Placeholder for remaining settings sections */}
  <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
    <CardHeader>
      <CardTitle>Additional Settings</CardTitle>
    </CardHeader>
    <CardContent>
      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
        Remaining settings sections:
        <br />• Program Management Hub
        <br />• Team & Access Management
      </p>
    </CardContent>
  </Card>
</TabsContent>

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
              <Button variant="destructive" onClick={() => handleDeleteProgram(deletingProgram as any)}>
                Delete
             </Button>
            </div>
          </div>
        </div>
    )}
        </Tabs>
      </div>
    </div>
  );
};
export default ThrivalSystem;
