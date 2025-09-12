import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_AZURE_OPENAI_KEY,
  baseURL: `${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT}openai/deployments/${import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': import.meta.env.VITE_AZURE_OPENAI_API_VERSION },
  defaultHeaders: {
    'api-key': import.meta.env.VITE_AZURE_OPENAI_KEY,
  },
  dangerouslyAllowBrowser: true // Only for development, use backend proxy in production
});

export async function generateProjectSummary(dashboardData, sowDocument) {
  try {
    const prompt = `You are a business consultant creating an executive summary for stakeholders at Ellacap, a private equity firm. Your audience consists of business leaders who need to understand project progress in clear, business terms without technical jargon.

PROJECT CONTEXT:
${sowDocument}

CURRENT DASHBOARD DATA:
${JSON.stringify(dashboardData, null, 2)}

Create a comprehensive executive summary that speaks directly to private equity professionals. Focus on business value, deal impact, and ROI implications. This is a standalone report - do not suggest follow-up conversations or additional reports.

Structure your response with these sections:

## 🎯 Executive Summary
Brief overview of where we stand and what it means for Ellacap's deal evaluation capabilities.

## 📊 Current Progress & Milestones
- Overall project completion percentage
- Which phase we're in and what that delivers
- Key deliverables completed and their business impact
- Upcoming milestones and expected completion dates

## 💰 Financial Performance
- Budget utilization vs. progress delivered
- Value being created relative to investment
- Cost efficiency analysis
- Expected ROI timeline

## 🏢 Business Impact & Value Creation
- How completed features improve deal evaluation speed
- Time savings on document processing and analysis
- Enhanced data accuracy for investment decisions
- Competitive advantages being built

## 🎢 Risks & Mitigations
- Any schedule or budget concerns
- Technical risks translated to business impact
- Mitigation strategies already in place
- Contingency planning

## 📈 What's Next
- Immediate priorities (next 30 days)
- Phase completion timeline
- Business capabilities being unlocked
- Expected outcomes for deal flow efficiency

## 🎉 Key Wins & Achievements
- Major milestones accomplished
- Early value being delivered
- Foundation strength for future scaling
- Technical debt avoided

Use business language throughout. When mentioning technical components, always explain their business purpose (e.g., "secure document storage system that protects confidential deal information" rather than "Azure Blob Storage implementation").

Focus on outcomes that matter to PE professionals: faster deal evaluation, better data accuracy, improved decision-making speed, reduced manual work, enhanced competitive positioning, and scalable processes.

Keep the tone professional but optimistic, acknowledging challenges while emphasizing solutions and progress. This summary should give executives confidence in the investment and clear visibility into value creation.`;

    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT,
      messages: [
        {
          role: "system",
          content: "You are a senior business consultant specializing in private equity technology implementations. You excel at translating technical progress into clear business value propositions. You write executive summaries that help business leaders understand ROI, risks, and strategic value. You never suggest follow-up conversations or additional reports - each summary is complete and actionable on its own."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 2500
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI Summary Error:', error);
    throw new Error(`Failed to generate AI summary: ${error.message}`);
  }
}