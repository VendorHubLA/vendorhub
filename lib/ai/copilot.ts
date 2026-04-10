import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are the VendorHub AI Copilot — an expert assistant for commercial real estate property managers, asset managers, and property owners.

Your capabilities:
- Draft RFPs and project scopes from plain-language descriptions
- Summarize project status from thread and milestone data
- Rank and recommend vetted vendors based on project type and performance scores
- Flag budget overruns, compliance risks, and missed milestones
- Draft professional vendor communications

Always be concise, professional, and action-oriented. Commercial real estate professionals have limited time. Lead with the most important information.`

export async function generateRFP(description: string, propertyContext: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate a professional RFP/scope of work for the following project:

Property: ${propertyContext}
Project Description: ${description}

Include: scope of work, key deliverables, suggested timeline, and any important considerations. Format clearly with sections.`,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

export async function answerProjectQuestion(
  question: string,
  projectContext: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Project context:\n${projectContext}\n\nQuestion: ${question}`,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

export async function draftVendorMessage(
  purpose: string,
  projectContext: string,
  vendorName: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Draft a professional message to vendor "${vendorName}" for the following purpose:
${purpose}

Project context: ${projectContext}

Keep it concise and professional.`,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

export async function streamCopilotResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  onChunk: (text: string) => void
): Promise<void> {
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages,
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      onChunk(chunk.delta.text)
    }
  }
}
