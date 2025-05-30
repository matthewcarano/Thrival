import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/radix-components';
import { Badge } from '@/components/ui';
import { Switch } from '@/components/ui/radix-components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/radix-components';
import { AlertCircle, Settings, Users, FileText, History, Upload, Moon, Sun, Edit, Trash2, Plus, X, UserCheck, TrendingUp, Puzzle, Target, Lightbulb, Focus, ChevronDown, ChevronRight } from 'lucide-react';

// Simple Label replacement
const Label = ({ children, className }: any) => <div className={`text-sm font-medium ${className || ''}`}>{children}</div>;

const ThrivalSystem = () => {
  // Core state
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('evaluate');
  const [settingsSection, setSettingsSection] = useState('prompts');
  
  // Evaluation state
  const [selectedProgram, setSelectedProgram] = useState('program1');
  const [applicationText, setApplicationText] = useState('');
  const [externalData, setExternalData] = useState({
    twitter: '',
    github: '',
    website: ''
  });
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationHistory, setEvaluationHistory] = useState<any[]>([]);
  
  // Bulk processing state
  const [bulkFile, setBulkFile] = useState<any>(null);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  
  // Settings state
  const [programs, setPrograms] = useState<any>({
    program1: { 
      name: 'Program 1 - DeFi Innovation', 
      active: true,
      criteria: 'Focus on DeFi protocols, yield farming, and decentralized exchanges. Priority on TVL growth and protocol sustainability.'
    },
    program2: { 
      name: 'Program 2 - Infrastructure Tools', 
      active: true,
      criteria: 'Developer tools, blockchain infrastructure, and scaling solutions. Emphasis on technical innovation and adoption potential.'
    },
    program3: { 
      name: 'Program 3 - Gaming & NFTs', 
      active: false,
      criteria: 'Gaming protocols, NFT marketplaces, and metaverse projects. Focus on user engagement and community building.'
    }
  });
  
  const [teamMembers, setTeamMembers] = useState<any[]>([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'Evaluator',
      status: 'Active',
      lastLogin: '2024-01-14'
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'Viewer',
      status: 'Active',
      lastLogin: '2024-01-12'
    }
  ]);
  
  const [criteriaWeights, setCriteriaWeights] = useState({
    team: 20,
    evidence: 20,
    fit: 15,
    need: 15,
    novelty: 15,
    focus: 15
  });
  
  const [apiKeys, setApiKeys] = useState({
    claude: '',
    twitter: '',
    github: '',
    defiLlama: '',
    coinGecko: '',
    discord: ''
  });
  
  const [systemPreferences, setSystemPreferences] = useState({
    emailNotifications: true,
    auditLogging: true,
    autoSave: true,
    exportFormat: 'pdf',
    evaluationTimeout: 60
  });
  
  const [gradingTiers, setGradingTiers] = useState([
    {
      id: 1,
      name: 'Recommend Funding',
      minScore: 80,
      maxScore: 100,
      recommendation: 'Recommend funding',
      applicantMessage: 'Congratulations! Your application has been shortlisted for our {programName} program. Our evaluation team was impressed by your project\'s strong performance across multiple criteria. You should expect to hear from our ecosystem board within the next week to schedule your pitch presentation. Please prepare a 15-minute presentation highlighting your key value propositions and roadmap milestones.',
      color: 'green'
    },
    {
      id: 2,
      name: 'Conditional Review',
      minScore: 60,
      maxScore: 79,
      recommendation: 'Conditional - needs clarification',
      applicantMessage: 'Thank you for your application to {programName}. Your project shows promise and has been selected for manual review by our evaluation committee. We see potential in your approach but would like clarification on a few aspects before making a final decision. Our team will reach out within 5 business days with specific questions and next steps.',
      color: 'yellow'
    },
    {
      id: 3,
      name: 'Do Not Fund',
      minScore: 0,
      maxScore: 59,
      recommendation: 'Do not fund',
      applicantMessage: 'Thank you for your interest in {programName}. While we appreciate the effort you\'ve put into your application, we\'re unable to move forward with funding at this time. To strengthen future applications, we recommend focusing on improving areas such as team experience, demonstrable traction, or ecosystem alignment based on your specific project needs. We encourage you to reapply once you\'ve addressed these areas.',
      color: 'red'
    }
  ]);
  
  const [prompts, setPrompts] = useState({
    team: {
      default: "Evaluate the team's background, experience, and proven execution ability. Consider their track record in blockchain/crypto, relevant technical expertise, previous successful projects, and leadership experience. Score 1-10 where 10 = team has led top-10 protocols or achieved crypto exits above $500M FDV, 8-9 = strong track record with major protocol experience, 6-7 = solid background with some relevant experience, 4-5 = limited but promising experience, 1-3 = insufficient experience or red flags.",
      program1: "For DeFi projects, evaluate team's specific experience with: protocol development, smart contract security, tokenomics design, liquidity management, and regulatory compliance. Assess previous DeFi protocol launches, audit history, and community building experience.",
      program2: "For infrastructure projects, evaluate team's technical depth in: blockchain architecture, consensus mechanisms, networking protocols, developer tooling, and scalability solutions. Look for systems programming background and open-source contributions.",
      program3: "For gaming/NFT projects, evaluate team's experience in: game development, NFT marketplace creation, community management, user acquisition, and tokenized gaming economies. Consider previous gaming or entertainment industry experience."
    },
    evidence: {
      default: "Assess the project's traction metrics and performance evidence. Look for verifiable metrics such as TVL, user numbers, transaction volume, revenue, partnerships, and growth trends. Score 1-10 where 10 = >$100M TVL or >100K active users with strong growth, 8-9 = significant traction with $10M+ metrics, 6-7 = moderate traction with promising growth, 4-5 = early traction or strong partnerships, 1-3 = idea stage or unverifiable claims.",
      program1: "For DeFi: Analyze TVL trends, trading volume, yield rates, protocol fees, liquidity depth, number of LPs, integration partnerships, and audit reports. Verify metrics through DeFi Llama, DEX screeners, and blockchain explorers.",
      program2: "For infrastructure: Evaluate adoption metrics like developer usage, API calls, network participants, throughput benchmarks, uptime statistics, and integration by other projects. Look for GitHub activity and technical documentation quality.",
      program3: "For gaming/NFTs: Assess user engagement metrics, NFT trading volume, marketplace activity, community size, game retention rates, and secondary market performance. Verify through NFT platforms and analytics tools."
    },
    fit: {
      default: "Evaluate how well the project fits within the target blockchain ecosystem. Consider native integration requirements, use of ecosystem-specific features, alignment with ecosystem roadmap, and whether the ecosystem technology is essential vs. optional. Score 1-10 where 10 = ecosystem technology is absolutely essential and deeply integrated, 8-9 = strong ecosystem integration with meaningful use of native features, 6-7 = good fit with some ecosystem-specific benefits, 4-5 = could work on ecosystem but not optimized for it, 1-3 = minimal ecosystem relevance or could easily port elsewhere.",
      program1: "For DeFi: Evaluate use of ecosystem's DeFi primitives, AMM integrations, native yield opportunities, cross-chain bridge utilization, and ecosystem token integrations.",
      program2: "For infrastructure: Assess deep protocol-level integrations, consensus mechanism dependencies, native developer tools usage, and ecosystem-specific optimizations.",
      program3: "For gaming/NFTs: Consider ecosystem's NFT standards usage, gaming-specific tools, metaverse integrations, and community crossover potential."
    },
    need: {
      default: "Assess how the project addresses an ecosystem gap or market need. Evaluate the urgency and size of the problem being solved, current solution landscape, and demand evidence. Score 1-10 where 10 = addresses critical underserved need with massive demand, 8-9 = solves important problem with clear demand signals, 6-7 = addresses moderate need with some demand evidence, 4-5 = solves nice-to-have problem, 1-3 = unclear need or highly competitive space.",
      program1: "For DeFi: Identify gaps in current DeFi ecosystem like missing yield opportunities, liquidity fragmentation, user experience problems, or regulatory compliance needs.",
      program2: "For infrastructure: Assess critical infrastructure gaps like scalability bottlenecks, developer experience issues, security vulnerabilities, or interoperability challenges.",
      program3: "For gaming/NFTs: Evaluate entertainment value gaps, user experience improvements, creator economy needs, or community engagement solutions."
    },
    novelty: {
      default: "Evaluate the project's innovation and novelty in approach, technology, or business model. Consider breakthrough potential, differentiation from existing solutions, and technical innovation. Score 1-10 where 10 = breakthrough solution to major unsolved problem with novel approach, 8-9 = significant innovation with clear differentiation, 6-7 = solid innovation with some novel elements, 4-5 = incremental improvement over existing solutions, 1-3 = derivative solution or direct clone.",
      program1: "For DeFi: Assess novel tokenomics, innovative yield mechanisms, new primitive development, or breakthrough approaches to DeFi problems like MEV, impermanent loss, or capital efficiency.",
      program2: "For infrastructure: Evaluate novel consensus mechanisms, innovative scaling approaches, new developer tools, or breakthrough solutions to blockchain trilemma challenges.",
      program3: "For gaming/NFTs: Consider innovative game mechanics, novel NFT utilities, creative tokenization approaches, or new models for player ownership and rewards."
    },
    focus: {
      default: "Assess the project's alignment with strategic focus areas and program priorities. Consider how well it matches stated program goals, strategic importance to ecosystem growth, and resource allocation efficiency. Score 1-10 where 10 = perfect alignment with top strategic priorities, 8-9 = strong alignment with key focus areas, 6-7 = good alignment with secondary priorities, 4-5 = partial alignment with some priorities, 1-3 = minimal alignment with program focus.",
      program1: "For DeFi programs: Align with TVL growth targets, institutional adoption goals, regulatory readiness, and sustainable yield generation priorities.",
      program2: "For infrastructure programs: Align with scalability roadmap, developer adoption targets, security improvement goals, and ecosystem integration priorities.",
      program3: "For gaming/NFT programs: Align with user acquisition goals, creator economy development, mainstream adoption targets, and community growth objectives."
    }
  });
  
  // Modal states
  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const [showTeamEditor, setShowTeamEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [deletingProgram, setDeletingProgram] = useState(null);
 // Update the newProgram state initialization (find this line and replace it)
const [newProgram, setNewProgram] = useState({ 
  name: '', 
  criteria: '',
  mainCriteria: '',
  prompts: {
    team: '',
    evidence: '',
    fit: '',
    need: '',
    novelty: '',
    focus: ''
  },
  weights: {
    team: 20,
    evidence: 20,
    fit: 15,
    need: 15,
    novelty: 15,
    focus: 15
  }
});

const handleAddProgram = () => {
  if (!newProgram.name.trim() || !newProgram.mainCriteria.trim()) {
    alert('Please fill in both program name and main evaluation criteria.');
    return;
  }
  
  const totalWeight = Object.values(newProgram.weights).reduce((sum: any, w: any) => sum + w, 0);
  if (totalWeight !== 100) {
    alert('Criteria weights must total exactly 100%.');
    return;
  }
  
  const programData = {
    name: newProgram.name,
    criteria: newProgram.criteria,
    mainCriteria: newProgram.mainCriteria,
    active: true,
    weights: { ...newProgram.weights },
    prompts: {
      team: newProgram.prompts.team || prompts.team.default,
      evidence: newProgram.prompts.evidence || prompts.evidence.default,
      fit: newProgram.prompts.fit || prompts.fit.default,
      need: newProgram.prompts.need || prompts.need.default,
      novelty: newProgram.prompts.novelty || prompts.novelty.default,
      focus: newProgram.prompts.focus || prompts.focus.default
    }
  };

  if (editingProgram) {
    // Update existing program
    setPrograms((prev: any) => ({
      ...prev,
      [editingProgram]: programData
    }));
  } else {
    // Create new program
    const programId = `program${Date.now()}`;
    setPrograms((prev: any) => ({
      ...prev,
      [programId]: programData
    }));
  }
  
  // Reset form
  setNewProgram({ 
    name: '', 
    criteria: '',
    mainCriteria: '',
    prompts: {
      team: '',
      evidence: '',
      fit: '',
      need: '',
      novelty: '',
      focus: ''
    },
    weights: {
      team: 20,
      evidence: 20,
      fit: 15,
      need: 15,
      novelty: 15,
      focus: 15
    }
  });
  setEditingProgram(null);
  setShowProgramEditor(false);
};
  
  // Reset form
setNewProgram({ 
  name: '', 
  criteria: '',
  mainCriteria: '',
  prompts: {
    team: '',
    evidence: '',
    fit: '',
    need: '',
    novelty: '',
    focus: ''
  },
  weights: {
    team: 20,
    evidence: 20,
    fit: 15,
    need: 15,
    novelty: 15,
    focus: 15
  }
});
  setShowProgramEditor(false);
};

  const [newTeamMember, setNewTeamMember] = useState({ name: '', email: '', role: 'Evaluator' });
  const [expandedTiers, setExpandedTiers] = useState({});

  // Mock AI evaluation function
  const evaluateWithAI = async (criterion: string, applicationText: string, programId: string, externalData: any) => {
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
  const calculateWeightedScore = (scores: any, weights: any) => {
    const totalWeightedScore = 
        (scores.team * weights.team / 100) +
        (scores.evidence * weights.evidence / 100) +
        (scores.fit * weights.fit / 100) +
        (scores.need * weights.need / 100) +
        (scores.novelty * weights.novelty / 100) +
        (scores.focus * weights.focus / 100);
    
    const maxPossibleScore = 10;
    const percentage = Math.round((totalWeightedScore / maxPossibleScore) * 100);
    
    return {
      weighted: parseFloat(totalWeightedScore.toFixed(1)),
      percentage,
      total: scores.team + scores.evidence + scores.fit + scores.need + scores.novelty + scores.focus
    };
  };

  // Main evaluation function

  const handleEvaluate = async (applicationText: string, setIsEvaluating: any, setActiveTab: any, selectedProgram: string, externalData: any, setEvaluationResult: any, setEvaluationHistory: any, programs: any, gradingTiers: any, prompts: any, criteriaWeights: any) => {
    if (!applicationText.trim()) {
      alert('Please enter application text before evaluating.');
      return;
    }
    
    setIsEvaluating(true);
    setActiveTab('results');
    
    try {
      const criteria = ['team', 'evidence', 'fit', 'need', 'novelty', 'focus'];
      const results: any = {};
      
      for (const criterion of criteria) {
        const result = await evaluateWithAI(criterion, applicationText, selectedProgram, externalData);
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
      
      const finalScore = calculateWeightedScore(scores, programs[selectedProgram]?.weights || criteriaWeights);
      
      // Find the appropriate grading tier
      const tier = gradingTiers.find(tier => 
        finalScore.percentage >= tier.minScore && finalScore.percentage <= tier.maxScore
      );

        // Bulk processing
  const handleBulkProcess = async (bulkFile: any, setBulkProcessing: any, setBulkResults: any) => {
    if (!bulkFile) {
      alert('Please select a CSV file to process.');
      return;
    }
    
    setBulkProcessing(true);
    
    // Mock bulk processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockResults = [
      { id: 1, name: 'DeFi Yield Protocol', score: 7.2, percentage: 72, recommendation: 'Conditional' },
      { id: 2, name: 'Cross-Chain Bridge', score: 8.4, percentage: 84, recommendation: 'Recommend funding' },
      { id: 3, name: 'NFT Marketplace', score: 5.1, percentage: 51, recommendation: 'Do not fund' },
      { id: 4, name: 'Gaming Protocol', score: 6.8, percentage: 68, recommendation: 'Conditional' },
      { id: 5, name: 'Infrastructure Tool', score: 9.1, percentage: 91, recommendation: 'Recommend funding' }
    ];
    
    setBulkResults(mockResults);
    setBulkProcessing(false);
  };


      
      const recommendation = tier ? tier.recommendation : 'Ungraded';
      const applicantFeedback = tier ? 
        tier.applicantMessage.replace('{programName}', programs[selectedProgram].name) : 
        'Unable to determine appropriate feedback tier.';
      
      const evaluation = {
        id: Date.now(),
        program: programs[selectedProgram].name,
        date: new Date().toLocaleDateString(),
        applicationText,
        externalData: { ...externalData },
        results,
        scores,
        finalScore,
        recommendation,
        applicantFeedback
      };
      
      setEvaluationResult(evaluation);
      setEvaluationHistory((prev: any) => [evaluation, ...prev]);
      
    } catch (error) {
      console.error('Evaluation error:', error);
      alert('An error occurred during evaluation. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };


const handleEditProgram = (programId: string, programs: any, setNewProgram: any, setEditingProgram: any, setShowProgramEditor: any, prompts: any) => {
  const program = programs[programId];
  setNewProgram({
    name: program.name,
    criteria: program.criteria || '',
    mainCriteria: program.mainCriteria || '',
    prompts: {
      team: program.prompts?.team || '',
      evidence: program.prompts?.evidence || '',
      fit: program.prompts?.fit || '',
      need: program.prompts?.need || '',
      novelty: program.prompts?.novelty || '',
      focus: program.prompts?.focus || ''
    },
    weights: {
      team: program.weights?.team || 20,
      evidence: program.weights?.evidence || 20,
      fit: program.weights?.fit || 15,
      need: program.weights?.need || 15,
      novelty: program.weights?.novelty || 15,
      focus: program.weights?.focus || 15
    }
  });
  setEditingProgram(programId);
  setShowProgramEditor(true);
};

  const handleDeleteProgram = (programId: string, programs: any, setPrograms: any, selectedProgram: string, setSelectedProgram: any, setShowDeleteConfirm: any, setDeletingProgram: any) => {
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
  const handleAddTeamMember = (newTeamMember: any, setTeamMembers: any, setNewTeamMember: any, setShowTeamEditor: any) => {
    if (!newTeamMember.name.trim() || !newTeamMember.email.trim()) {
      alert('Please fill in both name and email.');
      return;
    }
    
    const member = {
      id: Date.now(),
      name: newTeamMember.name,
      email: newTeamMember.email,
      role: newTeamMember.role,
      status: 'Pending',
      lastLogin: 'Never'
    };
    
    setTeamMembers((prev: any) => [...prev, member]);
    setNewTeamMember({ name: '', email: '', role: 'Evaluator' });
    setShowTeamEditor(false);
  };

  const handleDeleteTeamMember = (memberId: number, setTeamMembers: any) => {
    setTeamMembers((prev: any) => prev.filter((member: any) => member.id !== memberId));
  };

  // Weight management
  const handleWeightChange = (criterion: string, value: string, setCriteriaWeights: any) => {
    setCriteriaWeights((prev: any) => ({
      ...prev,
      [criterion]: parseInt(value) || 0
    }));
  };

  const getTotalWeight = (criteriaWeights: any) => {
    return Object.values(criteriaWeights).reduce((sum: number, weight: any) => sum + (weight as number), 0);

  return (
    <<div className="min-h-screen transition-colors duration-200 bg-gray-50 text-gray-900">
      {/* Header */}
      <header className={`border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Thrival: AI Evaluation System</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
{showProgramEditor && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
      <h3 className="text-xl font-semibold mb-6">
        {editingProgram ? 'Edit Evaluation Program' : 'Create New Evaluation Program'}
      </h3>
      
      <div className="space-y-6">
        {/* Basic Program Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">Program Name</Label>
            <Input
              value={newProgram.name}
              onChange={(e: any) => setNewProgram((prev: any) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Program 4 - AI & Machine Learning"
              className={darkMode ? 'border-white/20' : ''}
            />
          </div>
          <div>
            <Label className="text-base font-medium">Program Focus</Label>
            <Input
              value={newProgram.criteria}
              onChange={(e: any) => setNewProgram((prev: any) => ({ ...prev, criteria: e.target.value }))}
              placeholder="Brief description of program focus..."
              className={darkMode ? 'border-white/20' : ''}
            />
          </div>
        </div>

        {/* Criteria Weights */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h4 className="text-lg font-semibold mb-4">Evaluation Criteria Weights</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(newProgram.weights).map(([criterion, weight]) => (
              <div key={criterion} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="capitalize font-medium">{criterion}</Label>
                  <span className="text-sm font-medium">{weight}%</span>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={weight}
                  onChange={(e: any) => setNewProgram((prev: any) => ({
                    ...prev,
                    weights: {
                      ...prev.weights,
                      [criterion]: parseInt(e.target.value) || 0
                    }
                  }))}
                  className={`text-center ${darkMode ? 'border-white/20' : ''}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <p className={`text-sm font-medium ${Object.values(newProgram.weights).reduce((sum: any, w: any) => sum + w, 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
              Total Weight: {Object.values(newProgram.weights).reduce((sum: any, w: any) => sum + w, 0)}% 
              {Object.values(newProgram.weights).reduce((sum: any, w: any) => sum + w, 0) !== 100 && ' (Must equal 100%)'}
            </p>
          </div>
        </div>

        {/* MAIN EVALUATION CRITERIA - NEW SECTION */}
        <div>
          <Label className="text-lg font-medium mb-2 block">Main Evaluation Criteria</Label>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Describe the overall evaluation approach for this program. This will be the primary instruction to Claude.
          </p>
          <Textarea
            value={newProgram.mainCriteria}
            onChange={(e: any) => setNewProgram((prev: any) => ({ ...prev, mainCriteria: e.target.value }))}
            rows={6}
            className={`${darkMode ? 'border-white/20 bg-gray-900' : ''} text-sm`}
            placeholder="Enter the main evaluation criteria for this program. Example: 'Focus on AI/ML projects with strong technical teams, demonstrated traction in model performance, and clear commercial applications. Prioritize projects that show novel approaches to existing problems and have defensible competitive advantages...'"
          />
          <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border`}>
            <p className="text-xs">
              <strong>Tip:</strong> This field defines the overall evaluation approach. The custom prompts below are optional and allow fine-tuning specific criteria.
            </p>
          </div>
        </div>

        {/* Custom Evaluation Prompts - Now Optional/Advanced - Updated */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Advanced: Custom Criterion Prompts (Optional)</h4>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Optionally customize how Claude evaluates each specific criterion. Leave blank to use defaults.
          </p>
          
          <Tabs defaultValue="team" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-4">
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="fit">Fit</TabsTrigger>
              <TabsTrigger value="need">Need</TabsTrigger>
              <TabsTrigger value="novelty">Novelty</TabsTrigger>
              <TabsTrigger value="focus">Focus</TabsTrigger>
            </TabsList>

            {/* Team Prompt */}
            <TabsContent value="team" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Team Evaluation Prompt ({newProgram.weights.team}% weight)</Label>
                <Button variant="outline" size="sm" onClick={() => {
                  setNewProgram((prev: any) => ({
                    ...prev,
                    prompts: {
                      ...prev.prompts,
                      team: ''
                    }
                  }));
                }}>
                  Clear (Use Default)
                </Button>
              </div>
              <Textarea
                value={newProgram.prompts?.team || ''}
                onChange={(e: any) => setNewProgram((prev: any) => ({
                  ...prev,
                  prompts: {
                    ...prev.prompts,
                    team: e.target.value
                  }
                }))}
                rows={6}
                className={`${darkMode ? 'border-white/20 bg-gray-900' : ''} text-sm`}
                placeholder="Optional: Custom prompt for evaluating team background, experience, and execution ability. Leave blank to use default."
              />
            </TabsContent>

            {/* Evidence Prompt */}
            <TabsContent value="evidence" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Evidence Evaluation Prompt ({newProgram.weights.evidence}% weight)</Label>
                <Button variant="outline" size="sm" onClick={() => {
                  setNewProgram((prev: any) => ({
                    ...prev,
                    prompts: {
                      ...prev.prompts,
                      evidence: ''
                    }
                  }));
                }}>
                  Clear (Use Default)
                </Button>
              </div>
              <Textarea
                value={newProgram.prompts?.evidence || ''}
                onChange={(e: any) => setNewProgram((prev: any) => ({
                  ...prev,
                  prompts: {
                    ...prev.prompts,
                    evidence: e.target.value
                  }
                }))}
                rows={6}
                className={`${darkMode ? 'border-white/20 bg-gray-900' : ''} text-sm`}
                placeholder="Optional: Custom prompt for evaluating traction metrics and performance evidence. Leave blank to use default."
              />
            </TabsContent>

            {/* Fit Prompt */}
            <TabsContent value="fit" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Ecosystem Fit Prompt ({newProgram.weights.fit}% weight)</Label>
                <Button variant="outline" size="sm" onClick={() => {
                  setNewProgram((prev: any) => ({
                    ...prev,
                    prompts: {
                      ...prev.prompts,
                      fit: ''
                    }
                  }));
                }}>
                  Clear (Use Default)
                </Button>
              </div>
              <Textarea
                value={newProgram.prompts?.fit || ''}
                onChange={(e: any) => setNewProgram((prev: any) => ({
                  ...prev,
                  prompts: {
                    ...prev.prompts,
                    fit: e.target.value
                  }
                }))}
                rows={6}
                className={`${darkMode ? 'border-white/20 bg-gray-900' : ''} text-sm`}
                placeholder="Optional: Custom prompt for evaluating ecosystem integration and alignment. Leave blank to use default."
              />
            </TabsContent>

            {/* Need Prompt */}
            <TabsContent value="need" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Market Need Prompt ({newProgram.weights.need}% weight)</Label>
                <Button variant="outline" size="sm" onClick={() => {
                  setNewProgram((prev: any) => ({
                    ...prev,
                    prompts: {
                      ...prev.prompts,
                      need: ''
                    }
                  }));
                }}>
                  Clear (Use Default)
                </Button>
              </div>
              <Textarea
                value={newProgram.prompts?.need || ''}
                onChange={(e: any) => setNewProgram((prev: any) => ({
                  ...prev,
                  prompts: {
                    ...prev.prompts,
                    need: e.target.value
                  }
                }))}
                rows={6}
                className={`${darkMode ? 'border-white/20 bg-gray-900' : ''} text-sm`}
                placeholder="Optional: Custom prompt for evaluating market gaps and demand. Leave blank to use default."
              />
            </TabsContent>

            {/* Novelty Prompt */}
            <TabsContent value="novelty" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Innovation & Novelty Prompt ({newProgram.weights.novelty}% weight)</Label>
                <Button variant="outline" size="sm" onClick={() => {
                  setNewProgram((prev: any) => ({
                    ...prev,
                    prompts: {
                      ...prev.prompts,
                      novelty: ''
                    }
                  }));
                }}>
                  Clear (Use Default)
                </Button>
              </div>
              <Textarea
                value={newProgram.prompts?.novelty || ''}
                onChange={(e: any) => setNewProgram((prev: any) => ({
                  ...prev,
                  prompts: {
                    ...prev.prompts,
                    novelty: e.target.value
                  }
                }))}
                rows={6}
                className={`${darkMode ? 'border-white/20 bg-gray-900' : ''} text-sm`}
                placeholder="Optional: Custom prompt for evaluating innovation and differentiation. Leave blank to use default."
              />
            </TabsContent>

            {/* Focus Prompt */}
            <TabsContent value="focus" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Strategic Focus Prompt ({newProgram.weights.focus}% weight)</Label>
                <Button variant="outline" size="sm" onClick={() => {
                  setNewProgram((prev: any) => ({
                    ...prev,
                    prompts: {
                      ...prev.prompts,
                      focus: ''
                    }
                  }));
                }}>
                  Clear (Use Default)
                </Button>
              </div>
              <Textarea
                value={newProgram.prompts?.focus || ''}
                onChange={(e: any) => setNewProgram((prev: any) => ({
                  ...prev,
                  prompts: {
                    ...prev.prompts,
                    focus: e.target.value
                  }
                }))}
                rows={6}
                className={`${darkMode ? 'border-white/20 bg-gray-900' : ''} text-sm`}
                placeholder="Optional: Custom prompt for evaluating strategic alignment. Leave blank to use default."
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-300 dark:border-gray-600">
          <Button variant="outline" onClick={() => {
            setShowProgramEditor(false);
            setEditingProgram(null);
            setNewProgram({ 
              name: '', 
              criteria: '',
              mainCriteria: '',
              prompts: {
                team: '',
                evidence: '',
                fit: '',
                need: '',
                novelty: '',
                focus: ''
              },
              weights: {
                team: 20,
                evidence: 20,
                fit: 15,
                need: 15,
                novelty: 15,
                focus: 15
              }
            });
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddProgram}
            disabled={!newProgram.name.trim() || !newProgram.mainCriteria.trim() || 
              Object.values(newProgram.weights).reduce((sum: any, w: any) => sum + w, 0) !== 100}
          >
            {editingProgram ? 'Update Program' : 'Create Program'}
          </Button>
        </div>
      </div>
    </div>
  </div>
)}

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
                  className={darkMode ? 'border-white/20' : ''}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newTeamMember.email}
                  onChange={(e: any) => setNewTeamMember((prev: any) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@company.com"
                  className={darkMode ? 'border-white/20' : ''}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select 
                  value={newTeamMember.role} 
                  onValueChange={(value: any) => setNewTeamMember((prev: any) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className={darkMode ? 'border-white/20' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Evaluator">Evaluator</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowTeamEditor(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleAddTeamMember(newTeamMember, setTeamMembers, setNewTeamMember, setShowTeamEditor)}>
                  Add Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <Button variant="destructive" onClick={() => handleDeleteProgram(deletingProgram as any, programs, setPrograms, selectedProgram, setSelectedProgram, setShowDeleteConfirm, setDeletingProgram)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Process</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
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
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Evaluation Criteria</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {Object.entries(programs[selectedProgram]?.weights || criteriaWeights).map(([criterion, weight]) => {
                          const criteriaInfo: {[key: string]: any} = {
                            team: {
                              icon: UserCheck,
                              title: 'Team',
                              description: 'Experience & track record'
                            },
                            evidence: {
                              icon: TrendingUp,
                              title: 'Evidence',
                              description: 'Traction & performance metrics'
                            },
                            fit: {
                              icon: Puzzle,
                              title: 'Fit',
                              description: 'Ecosystem alignment'
                            },
                            need: {
                              icon: Target,
                              title: 'Need',
                              description: 'Market gap & demand'
                            },
                            novelty: {
                              icon: Lightbulb,
                              title: 'Novelty',
                              description: 'Innovation & differentiation'
                            },
                            focus: {
                              icon: Focus,
                              title: 'Focus',
                              description: 'Strategic priority alignment'
                            }
                          };
                          
                          const info = criteriaInfo[criterion];
                          const IconComponent = info.icon;
                          
                          return (
                            <div key={criterion} className="flex items-start justify-between">
                              <div className="flex items-start space-x-2 flex-1">
                                <IconComponent className={`h-4 w-4 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <div className="flex-1">
                                  <div className="font-semibold text-sm">{info.title}</div>
                                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} leading-tight`}>
                                    {info.description}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className={`text-xs ml-2 ${darkMode ? 'border-white/20' : ''}`}>
                                {weight}%
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* External Data */}
                  <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">External Data</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div>
                        <Label className="text-sm font-semibold">Twitter Handle</Label>
                        <Input
                          placeholder="@username"
                          value={externalData.twitter}
                          onChange={(e: any) => setExternalData((prev: any) => ({ ...prev, twitter: e.target.value }))}
                          className={`text-xs h-8 ${darkMode ? 'border-white/20' : ''}`}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">GitHub Repository</Label>
                        <Input
                          placeholder="github.com/user/repo"
                          value={externalData.github}
                          onChange={(e: any) => setExternalData((prev: any) => ({ ...prev, github: e.target.value }))}
                          className={`text-xs h-8 ${darkMode ? 'border-white/20' : ''}`}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Project Website</Label>
                        <Input
                          placeholder="https://project.com"
                          value={externalData.website}
                          onChange={(e: any) => setExternalData((prev: any) => ({ ...prev, website: e.target.value }))}
                          className={`text-xs h-8 ${darkMode ? 'border-white/20' : ''}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

               {/* Start Evaluation Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={() => handleEvaluate(applicationText, setIsEvaluating, setActiveTab, selectedProgram, externalData, setEvaluationResult, setEvaluationHistory, programs, gradingTiers, prompts, criteriaWeights)}
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
                <CardTitle>Bulk Application Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bulk-file" className="text-base font-medium">
                      Upload CSV File
                    </Label>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Select a CSV file containing multiple grant applications for batch processing.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
  <Switch
    checked={(program as any).active}
    onCheckedChange={(checked: any) => {
      setPrograms((prev: any) => ({
        ...prev,
        [id]: { ...prev[id], active: checked }
      }));
    }}
  />
  <Button 
    variant="ghost" 
    size="sm"
    onClick={() => handleEditProgram(id, programs, setNewProgram, setEditingProgram, setShowProgramEditor, prompts)}
  >
    <Edit className="h-4 w-4" />
  </Button>
  <Button 
    variant="ghost" 
    size="sm"
    onClick={() => {
      setDeletingProgram(id);
      setShowDeleteConfirm(true);
    }}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="font-medium mb-2">CSV Format Requirements</h3>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>First column: Project Name</li>
                    <li>Second column: Application Text</li>
                    <li>Third column: Twitter Handle (optional)</li>
                    <li>Fourth column: GitHub Repository (optional)</li>
                    <li>Fifth column: Website URL (optional)</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => handleBulkProcess(bulkFile, setBulkProcessing, setBulkResults)}
                    disabled={!bulkFile || bulkProcessing}
                    size="lg"
                  >
                    {bulkProcessing ? 'Processing Applications...' : 'Process Applications'}
                  </Button>
                </div>

                {bulkResults.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Processing Results</h3>
                    <div className="overflow-x-auto">
                      <table className={`w-full border rounded-lg ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className="px-4 py-3 text-left">Project Name</th>
                            <th className="px-4 py-3 text-left">Score</th>
                            <th className="px-4 py-3 text-left">Percentage</th>
                            <th className="px-4 py-3 text-left">Recommendation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkResults.map((result: any, index: number) => (
                            <tr key={result.id} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                              <td className="px-4 py-3 font-medium">{result.name}</td>
                              <td className="px-4 py-3">{result.score}/10.0</td>
                              <td className="px-4 py-3">{result.percentage}%</td>
                              <td className="px-4 py-3">
                                <Badge 
                                  variant={result.recommendation === 'Recommend funding' ? 'default' : 
                                          result.recommendation === 'Conditional' ? 'secondary' : 'destructive'}
                                >
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
            {isEvaluating ? (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardContent className="py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">AI Evaluation in Progress</h3>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Analyzing application across 6 criteria...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : evaluationResult ? (
              <div className="space-y-6">
                {/* Top Row - Evaluation Results (1/3) + Applicant Feedback (2/3) */}
                <div className="flex gap-6">
                  {/* Evaluation Results - 1/3 width */}
                  <div className="w-1/3">
                    <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                      <CardHeader>
                        <CardTitle>Evaluation Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                              {evaluationResult.finalScore.percentage}%
                            </div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Final Weighted Score
                            </div>
                          </div>
                          <div>
                            <div className={`text-base font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {evaluationResult.finalScore.total}/60 total points
                            </div>
                            <Badge 
                              variant={evaluationResult.recommendation === 'Recommend funding' ? 'default' : 
                                      evaluationResult.recommendation.includes('Conditional') ? 'secondary' : 'destructive'}
                              className="text-sm px-3 py-1"
                            >
                              {evaluationResult.recommendation}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Applicant Feedback - 2/3 width */}
                  <div className="w-2/3">
                    <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                      <CardHeader>
                        <CardTitle>Applicant Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <p className="leading-relaxed">
                            {evaluationResult.applicantFeedback}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Detailed Analysis - Full Width */}
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(evaluationResult.results).map(([criterion, result]) => (
                        <div key={criterion} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold capitalize text-lg">{criterion}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-lg px-3 py-1">
                                {(result as any).score}/10
                              </Badge>
                              <Badge variant="outline" className={darkMode ? 'border-white/20' : ''}>
                                {(criteriaWeights as any)[criterion]}% weight
                              </Badge>
                            </div>
                          </div>
                          <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {(result as any).feedback}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardContent className="py-16">
                  <div className="text-center pt-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-6 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No Evaluation Results</h3>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Start an evaluation to see detailed results here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Evaluation History</CardTitle>
                  <Button variant="outline" size="sm">
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {evaluationHistory.length > 0 ? (
                  <div className="space-y-4">
                    {evaluationHistory.map((evaluation: any) => (
                      <div key={evaluation.id} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{evaluation.program}</h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {evaluation.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {evaluation.finalScore.percentage}%
                            </div>
                            <Badge 
                              variant={evaluation.recommendation === 'Recommend funding' ? 'default' : 
                                      evaluation.recommendation.includes('Conditional') ? 'secondary' : 'destructive'}
                              className="mt-1"
                            >
                              {evaluation.recommendation}
                            </Badge>
                          </div>
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                          {evaluation.applicationText.substring(0, 200)}...
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No Evaluations Yet</h3>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Your evaluation history will appear here after you complete evaluations.
                    </p>
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
              <p>Settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );

export default ThrivalSystem;
