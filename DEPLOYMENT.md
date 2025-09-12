# EllaCap EQ Dashboard - Deployment Info

## 🚀 Live Application
- **URL:** https://calm-moss-0e419f50f.1.azurestaticapps.net
- **Platform:** Azure Static Web Apps
- **Build System:** Vite + React
- **Auto-deployment:** GitHub Actions

## 🔧 Configuration Required
To fully activate the application, you need to configure these environment variables in Azure:

1. **VITE_GITHUB_TOKEN** - Your GitHub Personal Access Token
2. **VITE_AZURE_OPENAI_API_KEY** - Your Azure OpenAI API key  
3. **VITE_AZURE_OPENAI_ENDPOINT** - Your Azure OpenAI endpoint URL

## 📝 Environment Variables Setup
Use the Azure CLI to set these values:

```bash
az staticwebapp appsettings set --name ellacap-eq-dashboard \
  --setting-names \
  "VITE_GITHUB_TOKEN=your_actual_github_token" \
  "VITE_AZURE_OPENAI_API_KEY=your_actual_openai_key" \
  "VITE_AZURE_OPENAI_ENDPOINT=your_actual_openai_endpoint"
```

## 🔄 Automatic Deployments
- Every push to `master` branch triggers automatic deployment
- GitHub Actions workflow handles build and deployment
- Build output goes to `dist/` folder
- Deployment typically takes 2-3 minutes

## 📊 Features Deployed
✅ GitHub Projects integration  
✅ SOW phase tracking  
✅ AI-powered summaries  
✅ Interactive dashboard  
✅ Professional UI with Tailwind CSS  
