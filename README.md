# EllaCap EQ Financial Data Platform - Dashboard

A comprehensive React dashboard for tracking the development progress of the EllaCap EQ Financial Data Platform. This stakeholder-friendly application visualizes GitHub Project (Projects v2) data with SOW phase tracking, AI-powered project summaries, and detailed progress metrics.

## 🚀 Features

### Core Dashboard
- **Real-time Project Tracking**: Live integration with GitHub Projects v2 API
- **SOW Phase Breakdown**: Visual tracking of 8 development phases with budget and timeline metrics
- **Progress Visualization**: Interactive progress rings, milestone timelines, and completion metrics
- **Feature Management**: Filterable feature table with detailed issue tracking
- **Activity Feed**: Recent updates and development activity

### Advanced Features
- **AI Project Summaries**: Azure OpenAI-powered executive summaries tailored for PE stakeholders
- **Interactive Modals**: Detailed feature views with markdown support and comment threads
- **Phase Deep-Dives**: Comprehensive phase analysis with deliverables and budget tracking
- **Responsive Design**: Optimized for desktop and tablet viewing

## 🛠 Technology Stack

### Frontend
- **React 19** with modern hooks and concurrent features
- **Vite** for fast development and optimized builds
- **Tailwind CSS v4** (Vite plugin mode) for responsive styling
- **Lucide React** for consistent iconography
- **React Markdown** with GitHub Flavored Markdown support

### API Integration
- **GitHub GraphQL API** for real-time project data
- **Azure OpenAI** for AI-powered project summaries

### Development Tools
- **ESLint** for code quality
- **Vite Dev Server** with hot module replacement

## 📦 Project Structure

```
src/
├── components/
│   ├── GitHubStakeholderDashboard.jsx    # Main dashboard component
│   └── AISummaryModal.jsx                # AI summary modal
├── services/
│   └── aiService.js                      # Azure OpenAI integration
├── assets/
│   └── ellacap-logo.png                  # Company branding
├── App.jsx                               # Root application component
├── main.jsx                              # React entry point
└── index.css                             # Global styles with Tailwind
```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file based on `.env.example`:

```bash
# GitHub Integration
VITE_GITHUB_TOKEN=ghp_your_personal_access_token

# Azure OpenAI (for AI summaries)
VITE_AZURE_OPENAI_KEY=your_azure_openai_key
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
VITE_AZURE_OPENAI_DEPLOYMENT=your_deployment_name
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### GitHub Project Configuration
The dashboard tracks this specific project (configured in `GitHubStakeholderDashboard.jsx`):
```js
const PROJECT_OWNER = 'buddahb88';
const PROJECT_REPO = 'EllaCap_EQ';
const PROJECT_NUMBER = 3;
```

### SOW Phase Mapping
The application maps GitHub issues to SOW phases based on labels:
- `phase1a` → Phase 1A - Foundation ($2,000)
- `phase1b` → Phase 1B - Core Features ($2,000)
- `phase1c` → Phase 1C - MVP Polish ($2,000)
- `phase1-completion` → Phase 1 Completion ($4,000)
- `phase2a` → Phase 2A - Analysis Framework ($5,000)
- `phase2b` → Phase 2B - Advanced Features ($5,000)
- `phase2c` → Phase 2C - Production Ready ($5,000)
- `phase2-completion` → Phase 2 Completion ($15,000)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GitHub Personal Access Token with `public_repo` and `read:project` scopes
- Azure OpenAI resource (optional, for AI summaries)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd EllaCap_EQ_Dashboard

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your tokens and endpoints

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

## 🎯 SOW Integration

This dashboard directly maps to the **EllaCap EQ Financial Data Platform Statement of Work**:

### Contract Overview
- **Total Value**: $40,000
- **Phase 1**: Feature Ready - $10,000 (Foundation → MVP)  
- **Phase 2**: Production Ready - $30,000 (Analytics → Full Production)

### Key Metrics Tracked
- Budget utilization vs. progress
- Phase completion percentages
- Feature delivery timelines
- Development velocity
- Risk indicators

## 🔒 Security Considerations

### Current Implementation
- GitHub token exposed to frontend (development mode)
- Azure OpenAI key exposed to browser

### Production Recommendations
- Implement backend proxy for API calls
- Use server-side authentication
- Add rate limiting and request validation
- Implement proper CORS policies
- Add audit logging for API access

## 🎨 UI/UX Features

### Design System
- Consistent color palette with blue/slate theme
- Gradient accents for key interactive elements
- Responsive grid layouts
- Hover states and smooth transitions
- Status-based color coding

### Interactive Elements
- Clickable phase cards with detailed modals
- Filterable and searchable feature table
- Copy-to-clipboard functionality for AI summaries
- Expandable feature details with markdown rendering
- Real-time progress animations

## 📊 Data Flow

1. **GitHub API** → Project data, issues, and metadata
2. **Data Transformation** → SOW phase mapping and progress calculations
3. **UI Rendering** → Visual components with interactive elements
4. **AI Integration** → Summary generation on demand
5. **Real-time Updates** → Live data refresh and state management

## 🧪 Development Features

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Hot Reload
Vite provides instant hot module replacement for rapid development.

### Error Handling
- Graceful API failure handling
- Loading states for all async operations
- User-friendly error messages
- Fallback modes when services unavailable

## 🚧 Future Enhancements

### Short-term
- GitHub issue pagination (currently limited to 50 items)
- Enhanced error recovery and retry logic
- Offline mode with cached data
- Export functionality for reports

### Long-term
- Real-time WebSocket updates
- Advanced analytics and forecasting
- Multi-project dashboard support
- Integration with additional data sources
- Enhanced AI insights and recommendations

## 📄 License

Internal/private use for EllaCap and development partners.
