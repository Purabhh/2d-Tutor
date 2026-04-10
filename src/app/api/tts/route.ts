import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text) {
    return NextResponse.json({ error: "Text required" }, { status: 400 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"

  if (!apiKey) {
    return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error("ElevenLabs error:", err)
      return NextResponse.json({ error: "TTS failed" }, { status: 502 })
    }

    const audioBuffer = await res.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (err) {
    console.error("TTS error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
