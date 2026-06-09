import { NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

// Ensure standard dynamic resolution on server side
export const dynamic = 'force-dynamic'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt instruction is required' }, { status: 400 })
    }

    const systemPrompt = `You are a poster content generator.
Generate structured poster text from the user's prompt.
Return ONLY valid JSON.

Schema:
{
  "headline": string,
  "subheadline": string,
  "offerText": string,
  "description": string,
  "cta": string,
  "theme": string
}`

    // Call llama-3.3-70b-versatile with temperature 0.5 for creative poster generation
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      return NextResponse.json({ error: 'Empty response returned from Groq AI' }, { status: 500 })
    }

    try {
      const parsedConfig = JSON.parse(responseContent.trim())
      
      const validatedConfig = {
        headline: String(parsedConfig.headline || '').trim(),
        subheadline: String(parsedConfig.subheadline || '').trim(),
        offerText: String(parsedConfig.offerText || '').trim(),
        description: String(parsedConfig.description || '').trim(),
        cta: String(parsedConfig.cta || '').trim(),
        theme: String(parsedConfig.theme || '').trim()
      }

      return NextResponse.json(validatedConfig)
    } catch (parseError) {
      console.error('Failed to parse Groq AI response JSON:', responseContent, parseError)
      return NextResponse.json({ error: 'Invalid AI response JSON format' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in Groq generate-config route:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
