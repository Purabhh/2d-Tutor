import { NextRequest, NextResponse } from "next/server"

const DEEPSEEK_BASE = "https://api.deepseek.com/v1"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tutorId } = await params
  const { message, history = [] } = await req.json()

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  const systemPrompt = `You are an AI tutor. You are having a conversation with a student.

IMPORTANT: You must respond with valid JSON containing two fields:
- "spoken": A short, conversational response (2-4 sentences max). This will be read aloud by a text-to-speech system, so keep it natural and conversational. No markdown, no bullet points, no special formatting.
- "detailed": A comprehensive, well-formatted markdown response with full explanations, examples, code blocks, etc. This is shown in a separate panel for reading. Include headers, lists, code examples where relevant.

If the student's question is simple/casual (greetings, short questions), the "detailed" field should be null.
If the student asks for explanation, analysis, or anything substantive, provide both.

Respond ONLY with the JSON object, no other text.`

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10),
    { role: "user", content: message },
  ]

  try {
    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("DeepSeek error:", err)
      return NextResponse.json({ error: "AI request failed" }, { status: 502 })
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content || ""

    // Try to parse as JSON
    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "").trim()
      const parsed = JSON.parse(cleaned)
      return NextResponse.json({
        spoken: parsed.spoken || raw,
        detailed: parsed.detailed || null,
        reply: parsed.spoken || raw,
      })
    } catch {
      // Fallback: treat entire response as spoken
      return NextResponse.json({
        spoken: raw,
        detailed: null,
        reply: raw,
      })
    }
  } catch (err) {
    console.error("Chat error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
