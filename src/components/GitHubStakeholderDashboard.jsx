import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AISummaryModal from './AISummaryModal';
import { Settings, Calendar, Users, MessageSquare, X, ArrowRight, Target, TrendingUp, Clock, CheckCircle, AlertTriangle, Activity, Layers, Zap, Sparkles } from 'lucide-react';
import EllaCapLogo from '../assets/ellacap-logo.png';

const PROJECT_OWNER = 'buddahb88';
const PROJECT_REPO = 'EllaCap_EQ';
const PROJECT_NUMBER = 3;

// SOW Phase Configuration
const SOW_PHASES = {
  'phase1a': {
    name: 'Phase 1A - Foundation',
    description: 'Project bootstrap, security, and infrastructure setup',
    duration: '4 weeks',
    keyDeliverables: ['Django backend with REST API', 'PostgreSQL database setup', 'React frontend with TypeScript', 'Azure infrastructure setup', 'CI/CD pipeline']
  },
  'phase1b': {
    name: 'Phase 1B - Core Features', 
    description: 'Document processing and AI integration',
    duration: '4 weeks',
    keyDeliverables: ['Document upload system', 'Azure Form Recognizer integration', 'OpenAI GPT-4 extraction', 'Data validation pipeline']
  },
  'phase1c': {
    name: 'Phase 1C - MVP Polish',
    description: 'User interface and feature completion',
    duration: '4 weeks', 
    keyDeliverables: ['Review & confirmation UI', 'Role-based permissions', 'Performance optimization', 'User documentation']
  },
  'phase1-completion': {
    name: 'Phase 1 Completion',
    description: 'Feature-ready milestone completion',
    duration: 'Milestone',
    keyDeliverables: ['Complete MVP with document ingestion', 'Data extraction capabilities', 'Export functionality']
  },
  'phase2a': {
    name: 'Phase 2A - Analysis Framework',
    description: 'Data analysis and KPI interfaces',
    duration: '4 weeks',
    keyDeliverables: ['PE-focused KPI queries', 'Visual analytics', 'Deal evaluation framework']
  },
  'phase2b': {
    name: 'Phase 2B - Advanced Features',
    description: 'Scenario modeling and reporting',
    duration: '4 weeks',
    keyDeliverables: ['Scenario planning tools', 'Forward projections', 'Deal comparison features']
  },
  'phase2c': {
    name: 'Phase 2C - Production Ready',
    description: 'Multi-tenant architecture and DevOps',
    duration: '4 weeks',
    keyDeliverables: ['Multi-tenant architecture', 'Production deployment', 'Enhanced security & monitoring']
  },
  'phase2-completion': {
    name: 'Phase 2 Completion',
    description: 'Production-ready milestone completion',
    duration: 'Milestone',
    keyDeliverables: ['Full production environment', 'Advanced dashboards', 'Enhanced AI insights']
  }
};

const PROJECT_V2_QUERY = `
  query($login: String!, $number: Int!) {
    owner: repositoryOwner(login: $login) {
      __typename
      ... on User {
        projectV2(number: $number) {
          id
          number
          title
          shortDescription
          createdAt
          updatedAt
          url
          items(first: 50) {
            nodes {
              id
              content {
                __typename
                ... on Issue {
                  id
                  number
                  title
                  body
                  state
                  createdAt
                  closedAt
                  updatedAt
                  assignees(first: 5) { nodes { login } }
                  labels(first: 10) { nodes { name } }
                  url
                  comments(first: 50) {
                    nodes {
                      id
                      body
                      author { login }
                      createdAt
                    }
                  }
                }
                ... on PullRequest {
                  id
                  number
                  title
                  body
                  state
                  createdAt
                  closedAt
                  mergedAt
                  updatedAt
                  assignees(first: 5) { nodes { login } }
                  labels(first: 10) { nodes { name } }
                  url
                  comments(first: 50) {
                    nodes {
                      id
                      body
                      author { login }
                      createdAt
                    }
                  }
                }
              }
            }
          }
        }
      }
      ... on Organization {
        projectV2(number: $number) {
          id
          number
          title
          shortDescription
          createdAt
          updatedAt
          url
          items(first: 50) {
            nodes {
              id
              content {
                __typename
                ... on Issue {
                  id
                  number
                  title
                  body
                  state
                  createdAt
                  closedAt
                  updatedAt
                  assignees(first: 5) { nodes { login } }
                  labels(first: 10) { nodes { name } }
                  url
                  comments(first: 50) {
                    nodes {
                      id
                      body
                      author { login }
                      createdAt
                    }
                  }
                }
                ... on PullRequest {
                  id
                  number
                  title
                  body
                  state
                  createdAt
                  closedAt
                  mergedAt
                  updatedAt
                  assignees(first: 5) { nodes { login } }
                  labels(first: 10) { nodes { name } }
                  url
                  comments(first: 50) {
                    nodes {
                      id
                      body
                      author { login }
                      createdAt
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

function normalize(projectV2){
  const items = projectV2.items.nodes
    .map(n=>n.content)
    .filter(c=>c && (c.__typename==='Issue'||c.__typename==='PullRequest'));
  const issues = items.map(it=>({
    id: it.id,
    title: it.title,
    body: it.body||'',
    state: (it.state||'').toLowerCase()==='closed'?'closed':'open',
    closed_at: it.closedAt || it.mergedAt || null,
    created_at: it.createdAt,
    updated_at: it.updatedAt || it.closedAt || it.mergedAt || it.createdAt,
    assignee: it.assignees?.nodes?.[0]?.login || 'Unassigned',
    labels: it.labels?.nodes?.map(l=>l.name) || [],
    number: it.number,
    comments: it.comments?.nodes?.map(c=>({
      id: c.id,
      body: c.body,
      author: c.author?.login || 'unknown',
      createdAt: c.createdAt
    })) || []
  }));
  return { project:{ name: projectV2.title, body: projectV2.shortDescription||'', created_at: projectV2.createdAt }, issues };
}

function getPhaseFromLabels(labels) {
  // Look for phase labels in the format "phase: Phase 1A", "Phase 1A", etc.
  const phaseLabel = labels.find(label => 
    label.toLowerCase().includes('phase') || 
    /phase\s*[12][abc]?/i.test(label) ||
    /^[12][abc]$/i.test(label)
  );
  
  if (!phaseLabel) return null;
  
  // Extract phase identifier
  const match = phaseLabel.match(/([12])([abc])?/i);
  if (!match) return null;
  
  const major = match[1];
  const minor = match[2];
  
  if (minor) {
    return `phase${major}${minor.toLowerCase()}`;
  } else {
    return `phase${major}-completion`;
  }
}

function calculatePhaseMetrics(issues) {
  const phaseMetrics = {};
  
  // Initialize all phases
  Object.keys(SOW_PHASES).forEach(phaseKey => {
    phaseMetrics[phaseKey] = {
      ...SOW_PHASES[phaseKey],
      totalIssues: 0,
      completedIssues: 0,
      progress: 0,
      status: 'upcoming',
      issues: []
    };
  });
  
  // Categorize issues by phase
  issues.forEach(issue => {
    const phase = getPhaseFromLabels(issue.labels);
    if (phase && phaseMetrics[phase]) {
      phaseMetrics[phase].issues.push(issue);
      phaseMetrics[phase].totalIssues++;
      
      if (issue.state === 'closed') {
        phaseMetrics[phase].completedIssues++;
      }
    }
  });
  
  // Calculate progress and status for each phase
  Object.keys(phaseMetrics).forEach(phaseKey => {
    const phase = phaseMetrics[phaseKey];
    
    if (phase.totalIssues > 0) {
      phase.progress = Math.round((phase.completedIssues / phase.totalIssues) * 100);
      
      // Determine status
      if (phase.progress === 100) {
        phase.status = 'completed';
      } else if (phase.progress > 0) {
        phase.status = 'in-progress';
      } else {
        // Check if previous phases are complete to determine if this is active
        const phaseOrder = ['phase1a', 'phase1b', 'phase1c', 'phase1-completion', 'phase2a', 'phase2b', 'phase2c', 'phase2-completion'];
        const currentIndex = phaseOrder.indexOf(phaseKey);
        const previousPhasesComplete = currentIndex === 0 || 
          phaseOrder.slice(0, currentIndex).every(prevPhase => 
            !phaseMetrics[prevPhase] || phaseMetrics[prevPhase].totalIssues === 0 || phaseMetrics[prevPhase].progress === 100
          );
        
        phase.status = previousPhasesComplete ? 'ready' : 'upcoming';
      }
    }
  });
  
  return phaseMetrics;
}

function transform({project, issues}){
  const closed = issues.filter(i=>i.state==='closed');
  const progress = issues.length? Math.round(closed.length/issues.length*100):0;
  
  // Calculate phase metrics
  const phaseMetrics = calculatePhaseMetrics(issues);
  
  let phase;
  if (progress > 75) phase = 'Testing & Refinement';
  else if (progress > 25) phase = 'Development';
  else phase = 'Planning';

  // Remove health status logic - just use 'in-progress'
  const health = 'in-progress';
  
  const features = issues.map(i => ({
    id: i.id,
    title: i.title,
    description: i.body ? i.body.slice(0,120)+'...' : 'No description',
    status: i.state === 'closed' ? 'completed' : 'in-progress',
    priority: 'medium',
    assignee: i.assignee,
    completedDate: i.closed_at,
    businessValue: `GitHub Issue #${i.number}`,
    body: i.body,
    comments: Array.isArray(i.comments) ? i.comments : [],
    phase: getPhaseFromLabels(i.labels)
  }));
  
  // Calculate realistic target date based on phase progress and SOW timeline
  const projectStart = new Date(project.created_at);
  const totalWeeks = 24; // 16-24 weeks per SOW, using upper bound
  const expectedEndDate = new Date(projectStart.getTime() + (totalWeeks * 7 * 24 * 60 * 60 * 1000));
  
  // Adjust based on current progress - if ahead/behind schedule
  const progressRatio = progress / 100;
  const timeElapsed = Date.now() - projectStart.getTime();
  const expectedTimeElapsed = progressRatio * (totalWeeks * 7 * 24 * 60 * 60 * 1000);
  const timeAdjustment = timeElapsed - expectedTimeElapsed;
  const adjustedEndDate = new Date(expectedEndDate.getTime() + timeAdjustment);
  
  const milestones=[
    {id:1,name:'Phase 1A - Foundation',targetDate:new Date(projectStart.getTime() + (4 * 7 * 24 * 60 * 60 * 1000)).toISOString(),status:phaseMetrics.phase1a.progress === 100 ? 'completed' : 'in-progress',progress:phaseMetrics.phase1a.progress,description:'Infrastructure & security setup'},
    {id:2,name:'Phase 1 - Feature Ready',targetDate:new Date(projectStart.getTime() + (12 * 7 * 24 * 60 * 60 * 1000)).toISOString(),status:progress>50?'in-progress':'upcoming',progress,description:'Core MVP with AI processing'},
    {id:3,name:'Phase 2 - Production Ready',targetDate:adjustedEndDate.toISOString(),status:'upcoming',progress:Math.max(0,progress-70),description:'Multi-tenant production deployment'}
  ];
  
  const recentActivity = issues.slice(0,5).map(i=>({
    date:i.updated_at,
    type:i.state==='closed'?'completion':'progress',
    message:`${i.state==='closed'?'Completed':'Updated'}: ${i.title}`,
    phase: getPhaseFromLabels(i.labels)
  }));
  
  return {
    project:{
      title: project.name||`${PROJECT_OWNER}/${PROJECT_REPO} Project`,
      description: project.body||`GitHub project for ${PROJECT_REPO}`,
      startDate: project.created_at,
      targetDate: adjustedEndDate.toISOString(),
      currentPhase: phase,
      overallProgress: progress,
      healthStatus: health,
      totalHours: 480,
      hoursSpent: Math.round(480*(progress/100)*0.9),
      teamSize: 6
    },
    milestones,
    features,
    recentActivity,
    phaseMetrics
  };
}

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [filters, setFilters] = useState({
    phase: '',
    status: '',
    assignee: '',
    search: ''
  });
  const [showAISummary, setShowAISummary] = useState(false);
  const TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

  async function fetchGraphQL(query, variables) {
    const r = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({query, variables})
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    if (j.errors) throw new Error(j.errors.map(e => e.message).join('; '));
    return j.data;
  }

  useEffect(() => {
    if (!TOKEN) {
      setError('');
      // You might want to set mock data here or fetch it differently
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError('');
        const d = await fetchGraphQL(PROJECT_V2_QUERY, {login: PROJECT_OWNER, number: PROJECT_NUMBER});

        let projectV2 = d.owner?.projectV2;
        if (!projectV2) throw new Error('Project not found');
        const normalized = normalize(projectV2);

        setData(transform(normalized));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [TOKEN]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in-progress': return 'bg-blue-500';
      case 'ready': return 'bg-purple-500';
      case 'on-track': return 'bg-emerald-500';
      case 'at-risk': return 'bg-amber-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'on-track': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'at-risk': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBorder = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-400';
      case 'medium': return 'border-l-amber-400';
      default: return 'border-l-emerald-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading your project dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const completedFeatures = data.features.filter(f => f.status === 'completed').length;
  const totalFeatures = data.features.length;
  const daysToTarget = Math.ceil((new Date(data.project.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

  // Filter features based on current filters
  const filteredFeatures = data.features.filter(feature => {
    const matchesPhase = !filters.phase || feature.phase === filters.phase;
    const matchesStatus = !filters.status || feature.status === filters.status;
    const matchesAssignee = !filters.assignee || feature.assignee === filters.assignee;
    const matchesSearch = !filters.search || 
      feature.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      feature.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesPhase && matchesStatus && matchesAssignee && matchesSearch;
  });

  // Get unique values for filter options
  const uniquePhases = [...new Set(data.features.map(f => f.phase).filter(Boolean))];
  const uniqueStatuses = [...new Set(data.features.map(f => f.status))];
  const uniqueAssignees = [...new Set(data.features.map(f => f.assignee))];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      phase: '',
      status: '',
      assignee: '',
      search: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col items-start">
            <img
              src={EllaCapLogo}
              alt="EllaCap Logo"
              className="h-40 w-40 object-contain"
              style={{ borderRadius: '0.75rem' }}
            />
            <h1 className="text-2xl font-bold text-slate-900">Ellacap EQ Financial Data Platform</h1>
            <p className="text-slate-500 text-sm mb-2">Development Dashboard - SOW Phase Tracking</p>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusBadgeColor(data.project.healthStatus)}`}>
                🔄 In Progress
              </span>
              {!TOKEN && (
                <span className="px-3 py-1.5 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-200">
                  Demo Mode
                </span>
              )}
              
              {/* AI Summary Button */}
              <button
                onClick={() => setShowAISummary(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">AI Project Summary</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-slate-900">{data.project.overallProgress}%</span>
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Overall Progress</h3>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{width: `${data.project.overallProgress}%`}}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-3xl font-bold text-slate-900">{completedFeatures}/{totalFeatures}</span>
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Features Complete</h3>
            <p className="text-sm text-slate-500">Major functionality delivered</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-slate-900">{data.project.teamSize}</span>
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Team Members</h3>
            <p className="text-sm text-slate-500">Active contributors</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-slate-900">{daysToTarget}</span>
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Days to Target</h3>
            <p className="text-sm text-slate-500">Estimated completion</p>
          </div>
        </div>

        {/* SOW Phase Breakdown */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Layers className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">SOW Phase Breakdown</h2>
            <span className="text-sm text-slate-500">($40,000 Total Contract Value)</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {Object.entries(data.phaseMetrics).map(([phaseKey, phase]) => (
              <div
                key={phaseKey}
                onClick={() => setSelectedPhase({phaseKey, ...phase})}
                className="cursor-pointer bg-slate-50 rounded-xl p-6 border-2 border-transparent hover:border-blue-200 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(phase.status)}`}></div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(phase.status)}`}>
                    {phase.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{phase.name}</h3>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{phase.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(phase.status)}`}
                      style={{width: `${phase.progress}%`}}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{phase.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issues:</span>
                    <span>{phase.completedIssues}/{phase.totalIssues}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{phase.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Phase Summary */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-3">Contract Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Phase 1 Total:</span>
                <div className="text-blue-900 font-bold">$10,000</div>
                <div className="text-blue-700 text-xs">Foundation & MVP</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Phase 2 Total:</span>
                <div className="text-blue-900 font-bold">$30,000</div>
                <div className="text-blue-700 text-xs">Production Ready</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Timeline:</span>
                <div className="text-blue-900 font-bold">16-24 Weeks</div>
                <div className="text-blue-700 text-xs">Two-phase delivery</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Budget Used:</span>
                <div className="text-blue-900 font-bold">${data.project.totalBudgetSpent.toLocaleString()}</div>
                <div className="text-blue-700 text-xs">{budgetUsed}% complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Timeline */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Project Timeline</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative">
                <div className="bg-slate-50 rounded-xl p-6 border-2 border-transparent hover:border-blue-200 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(milestone.status)}`}></div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(milestone.status)}`}>
                      {milestone.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 mb-2">{milestone.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{milestone.description}</p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(milestone.status)}`}
                        style={{width: `${milestone.progress}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500">
                    Target: {new Date(milestone.targetDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                {index < data.milestones.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-300 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Table */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Feature Development</h2>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500">
                {filteredFeatures.filter(f => f.status === 'completed').length} of {filteredFeatures.length} completed
                {hasActiveFilters && ` (filtered from ${totalFeatures} total)`}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search features..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phase</label>
              <select
                value={filters.phase}
                onChange={(e) => handleFilterChange('phase', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Phases</option>
                {uniquePhases.map(phase => (
                  <option key={phase} value={phase}>
                    {SOW_PHASES[phase]?.name?.replace('Phase ', '') || phase}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'completed' ? 'Completed' : 'In Progress'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assignee</label>
              <select
                value={filters.assignee}
                onChange={(e) => handleFilterChange('assignee', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Assignees</option>
                {uniqueAssignees.map(assignee => (
                  <option key={assignee} value={assignee}>{assignee}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Feature</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Phase</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Assignee</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Business Impact</th>
                  <th className="text-right py-4 px-6 font-semibold text-slate-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFeatures.length > 0 ? (
                  filteredFeatures.map((feature, index) => (
                    <tr 
                      key={feature.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <td className="py-4 px-6">
                        <div className={`border-l-4 pl-4 ${getPriorityBorder(feature.priority)}`}>
                          <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{feature.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {feature.phase ? (
                          <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
                            {SOW_PHASES[feature.phase]?.name?.replace('Phase ', '') || feature.phase}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">Not assigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {feature.assignee.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-slate-900 font-medium">{feature.assignee}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(feature.status)}`}>
                          {feature.status === 'completed' ? '✓ Done' : '🔄 In Progress'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-600">
                          {feature.businessValue}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                          <span>View Details</span>
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <AlertTriangle className="h-12 w-12 text-slate-400 mb-4" />
                        <p className="text-lg font-medium mb-2">No features match your filters</p>
                        <p className="text-sm">Try adjusting your filters or clearing them to see more results.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
          <div className="flex items-center space-x-2 mb-6">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Recent Updates</h2>
          </div>
          
          <div className="space-y-4">
            {data.recentActivity.map((activity, index) => {
              const getActivityColor = (type) => {
                switch (type) {
                  case 'completion': return 'bg-emerald-500';
                  case 'progress': return 'bg-blue-500';
                  case 'milestone': return 'bg-purple-500';
                  default: return 'bg-slate-400';
                }
              };

              return (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getActivityColor(activity.type)}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-medium">{activity.message}</p>
                    {activity.phase && (
                      <p className="text-xs text-purple-600 font-medium mt-1">
                        {SOW_PHASES[activity.phase]?.name || activity.phase}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase Detail Modal */}
      {selectedPhase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{selectedPhase.name}</h2>
                  <p className="text-slate-600 mb-4">{selectedPhase.description}</p>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeColor(selectedPhase.status)}`}>
                    {selectedPhase.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPhase(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-blue-600 text-sm font-medium">Duration</div>
                    <div className="text-blue-900 text-xl font-bold">{selectedPhase.duration}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="text-emerald-600 text-sm font-medium">Progress</div>
                    <div className="text-emerald-900 text-xl font-bold">{selectedPhase.progress}%</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-purple-600 text-sm font-medium">Issues</div>
                    <div className="text-purple-900 text-xl font-bold">{selectedPhase.completedIssues}/{selectedPhase.totalIssues}</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="text-amber-600 text-sm font-medium">Duration</div>
                    <div className="text-amber-900 text-xl font-bold">{selectedPhase.duration}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Key Deliverables</h3>
                  <div className="bg-slate-50 rounded-xl p-6">
                    <ul className="space-y-2">
                      {selectedPhase.keyDeliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Zap size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {selectedPhase.issues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Phase Issues</h3>
                    <div className="space-y-3">
                      {selectedPhase.issues.map(issue => (
                        <div key={issue.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-slate-900">#{issue.number} {issue.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(issue.state === 'closed' ? 'completed' : 'in-progress')}`}>
                              {issue.state === 'closed' ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            Assigned to: {issue.assignee}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Detail Modal - Enhanced with better markdown styling */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedFeature.title}</h2>
                  <p className="text-sm text-slate-500">Issue #{selectedFeature.businessValue.match(/\d+/)?.[0]} - Feature Details</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeColor(selectedFeature.status)}`}>
                  {selectedFeature.status === 'completed' ? '✓ Completed' : '🔄 In Progress'}
                </span>
                
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Feature Overview with Enhanced Markdown Styling */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Feature Overview</h3>
                  <div className="prose prose-slate max-w-none">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">GitHub Issue Content</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        This content is sourced directly from the GitHub issue and may contain technical implementation details.
                      </p>
                    </div>
                    
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => <h1 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-bold text-slate-800 mb-3 mt-6">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-semibold text-slate-700 mb-2 mt-4">{children}</h3>,
                        h4: ({children}) => <h4 className="text-base font-semibold text-slate-700 mb-2 mt-3">{children}</h4>,
                        ul: ({children}) => <ul className="list-disc pl-6 space-y-1 mb-4">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-6 space-y-1 mb-4">{children}</ol>,
                        li: ({children}) => <li className="text-slate-700 leading-relaxed">{children}</li>,
                        p: ({children}) => <p className="text-slate-700 leading-relaxed mb-4">{children}</p>,
                        strong: ({children}) => <strong className="font-semibold text-slate-900">{children}</strong>,
                        em: ({children}) => <em className="italic text-slate-600">{children}</em>,
                        code: ({inline, children}) => 
                          inline 
                            ? <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                            : <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto my-4 font-mono text-sm"><code>{children}</code></pre>,
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-blue-800">
                            {children}
                          </blockquote>
                        ),
                        table: ({children}) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({children}) => <thead className="bg-slate-50">{children}</thead>,
                        tbody: ({children}) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
                        tr: ({children}) => <tr>{children}</tr>,
                        th: ({children}) => <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{children}</th>,
                        td: ({children}) => <td className="px-4 py-2 text-sm text-slate-700">{children}</td>,
                        a: ({href, children}) => (
                          <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            {children}
                          </a>
                        )
                      }}
                    >
                      {selectedFeature.body || selectedFeature.description || 'No detailed description available.'}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Business Impact & Project Context */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Business Impact & Project Context</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Project Reference</h4>
                      <p className="text-blue-800">{selectedFeature.businessValue}</p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Development Status</h4>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedFeature.status)}`}></div>
                        <span className="text-green-800 font-medium">
                          {selectedFeature.status === 'completed' ? 'Implementation Complete' : 'Active Development'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team & Phase Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Assigned Developer</h4>
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {selectedFeature.assignee.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 block">{selectedFeature.assignee}</span>
                        <span className="text-sm text-slate-500">Lead Developer</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">SOW Phase</h4>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      {selectedFeature.phase ? (
                        <div>
                          <span className="font-medium text-purple-900 block">
                            {SOW_PHASES[selectedFeature.phase]?.name || selectedFeature.phase}
                          </span>
                          <span className="text-sm text-purple-700">
                            ${SOW_PHASES[selectedFeature.phase]?.budget.toLocaleString()} Budget
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Not assigned to SOW phase</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Priority Level</h4>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityBorder(selectedFeature.priority).replace('border-l-', 'bg-')}`}></div>
                        <span className="font-medium text-amber-900 capitalize">{selectedFeature.priority} Priority</span>
                      </div>
                      <span className="text-sm text-amber-700 block mt-1">Standard development priority</span>
                    </div>
                  </div>
                </div>

                {/* Comments Section with Enhanced Styling */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Discussion & Updates</h3>
                  {selectedFeature.comments && selectedFeature.comments.length > 0 ? (
                    <div className="space-y-4">
                      {selectedFeature.comments.map(comment => (
                        <div key={comment.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {comment.author.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900">{comment.author}</span>
                                <span className="text-sm text-slate-500 ml-2">
                                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="prose prose-slate max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({children}) => <h1 className="text-lg font-bold text-slate-900 mb-2">{children}</h1>,
                                h2: ({children}) => <h2 className="text-base font-bold text-slate-800 mb-2">{children}</h2>,
                                h3: ({children}) => <h3 className="text-base font-semibold text-slate-700 mb-2">{children}</h3>,
                                ul: ({children}) => <ul className="list-disc pl-4 space-y-1 mb-3">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal pl-4 space-y-1 mb-3">{children}</ol>,
                                li: ({children}) => <li className="text-slate-700">{children}</li>,
                                p: ({children}) => <p className="text-slate-700 leading-relaxed mb-3">{children}</p>,
                                strong: ({children}) => <strong className="font-semibold text-slate-900">{children}</strong>,
                                em: ({children}) => <em className="italic text-slate-600">{children}</em>,
                                code: ({inline, children}) => 
                                  inline 
                                    ? <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-sm">{children}</code>
                                    : <pre className="bg-slate-800 text-slate-100 rounded p-3 overflow-x-auto my-3 text-sm"><code>{children}</code></pre>,
                                blockquote: ({children}) => (
                                  <blockquote className="border-l-3 border-slate-400 bg-slate-100 pl-3 py-1 my-3 italic text-slate-700">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({href, children}) => (
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {children}
                                  </a>
                                )
                              }}
                            >
                              {comment.body}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center">
                      <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No comments or discussion yet</p>
                      <p className="text-sm text-slate-400">Comments and updates will appear here as development progresses</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal - New component for AI-generated summary */}
      {showAISummary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-slate-900">AI Summary</h2>
              <button
                onClick={() => setShowAISummary(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    return !inline ? (
                      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4">
                        <code {...props}>{children}</code>
                      </pre>
                    ) : (
                      <code className="bg-gray-100 rounded px-1">{children}</code>
                    );
                  }
                }}
              >
                {SOW_DOCUMENT}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Connection Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      <AISummaryModal
        isOpen={showAISummary}
        onClose={() => setShowAISummary(false)}
        dashboardData={data}
        sowDocument={SOW_DOCUMENT}
      />
    </div>
  );
};

export default ClientDashboard;

// SOW document text - add this constant before the ClientDashboard component
const SOW_DOCUMENT = `
**EllaCap EQ Financial Data Platform - Statement of Work**

**Project Overview:**
Omega Notes will develop a financial data platform (codename "EQ") for Ellacap to streamline internal deal evaluation and portfolio management. The platform will use AI-powered insights to capture, process, and analyze financial documents.

**Total Contract Value:** $40,000
- Phase 1: Features Ready - $10,000 (8-12 weeks)
- Phase 2: Production Ready - $30,000 (8-12 weeks)

**Phase 1 Deliverables:**
- Phase 1A ($2,000): Django backend with REST API, PostgreSQL database, React frontend with TypeScript, Azure infrastructure setup, CI/CD pipeline
- Phase 1B ($2,000): Document upload system, Azure Form Recognizer integration, OpenAI GPT-4 extraction, Data validation pipeline  
- Phase 1C ($2,000): Review & confirmation UI, Role-based permissions, Performance optimization, User documentation
- Phase 1 Completion ($4,000): Complete MVP with document ingestion, Financial data extraction, Export functionality

**Phase 2 Deliverables:**
- Phase 2A ($5,000): PE-focused KPI queries, Visual analytics, Deal evaluation framework
- Phase 2B ($5,000): Scenario planning tools, Forward projections, Deal comparison features
- Phase 2C ($5,000): Multi-tenant architecture, Production deployment, Enhanced security & monitoring
- Phase 2 Completion ($15,000): Full production environment, Advanced dashboards, Enhanced AI insights

**Technology Stack:**
- Backend: Python with Django REST Framework
- Database: PostgreSQL with PE-focused schema  
- Frontend: React with TypeScript and professional UI components
- AI Services: OpenAI GPT-4 API, Azure Form Recognizer
- Infrastructure: Microsoft Azure (Blob Storage, App Service, Azure Database)
- Authentication: Azure Active Directory B2C

**Key Success Metrics:**
- Complete MVP enabling document ingestion and AI-powered financial data extraction
- Scalable foundation for future commercialization
- Production-ready multi-tenant architecture
- Enhanced AI insights for deal evaluation and portfolio management
`;