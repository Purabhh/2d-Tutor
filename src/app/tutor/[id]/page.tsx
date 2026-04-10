"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Tutor, Source } from "@/types/database"
import { TutorCharacter } from "@/components/tutor/tutor-character"
import { ChatInput } from "@/components/tutor/chat-input"
import { FormattedResponsePanel } from "@/components/tutor/formatted-response-panel"
import { StudioPanel } from "@/components/tutor/studio-panel"
import { SourcesOverlay } from "@/components/tutor/sources-overlay"
import { SourceUploadMenu } from "@/components/tutor/source-upload-menu"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, FileText, Clapperboard, BookOpen, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TutorPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  // Panels
  const [showFormatted, setShowFormatted] = useState(false)
  const [showStudio, setShowStudio] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [showUploadMenu, setShowUploadMenu] = useState(false)

  // Response content
  const [spokenText, setSpokenText] = useState<string | null>(null)
  const [detailedContent, setDetailedContent] = useState<string | null>(null)
  const [detailedLoading, setDetailedLoading] = useState(false)
  const [studioGenerating, setStudioGenerating] = useState(false)

  // Chat history (kept in memory, not displayed as bubbles — character speaks)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])

  const tutorId = params.id as string

  useEffect(() => {
    async function load() {
      const [tutorRes, sourcesRes] = await Promise.all([
        supabase.from("tutors").select("*").eq("id", tutorId).single(),
        supabase
          .from("sources")
          .select("*")
          .eq("tutor_id", tutorId)
          .order("created_at", { ascending: false }),
      ])

      if (tutorRes.data) setTutor(tutorRes.data)
      if (sourcesRes.data) setSources(sourcesRes.data)
      setLoading(false)
    }
    load()
  }, [tutorId])

  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled) return
    setIsSpeaking(true)
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error("TTS failed")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
      }
      await audio.play()
    } catch {
      setIsSpeaking(false)
    }
  }, [voiceEnabled])

  async function handleSend(content: string) {
    setSending(true)
    setSpokenText(null)
    setDetailedContent(null)

    const newHistory = [...chatHistory, { role: "user", content }]
    setChatHistory(newHistory)

    try {
      const res = await fetch(`/api/tutors/${tutorId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: newHistory }),
      })

      if (!res.ok) throw new Error("Chat failed")

      const data = await res.json()

      // Conversational response — character speaks it
      const spoken = data.spoken || data.reply || "Sorry, I couldn't generate a response."
      setSpokenText(spoken)
      setChatHistory((prev) => [...prev, { role: "assistant", content: spoken }])

      // Detailed response — only if returned
      if (data.detailed) {
        setDetailedContent(data.detailed)
        setShowFormatted(true)
      }

      // Speak it
      await speakText(spoken)
    } catch {
      setSpokenText("Something went wrong. Please try again.")
    } finally {
      setSending(false)
    }
  }

  async function handleStudioGenerate(tool: string, format: string, prompt: string) {
    setStudioGenerating(true)
    try {
      const res = await fetch(`/api/tutors/${tutorId}/studio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, format, prompt }),
      })
      if (!res.ok) throw new Error("Studio generation failed")
      // TODO: handle generated content (audio blob, video url, etc.)
    } catch {
      console.error("Studio generation failed")
    } finally {
      setStudioGenerating(false)
    }
  }

  async function handleFileUpload(files: FileList, type: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    for (const file of Array.from(files)) {
      const path = `${user.id}/${tutorId}/${crypto.randomUUID()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from("sources")
        .upload(path, file)

      if (uploadError) {
        console.error("Upload failed:", uploadError)
        continue
      }

      const { data } = await supabase
        .from("sources")
        .insert({
          tutor_id: tutorId,
          name: file.name,
          type,
          storage_path: path,
        })
        .select()
        .single()

      if (data) setSources((prev) => [data, ...prev])
    }
  }

  async function handleUrlSubmit(url: string) {
    const { data } = await supabase
      .from("sources")
      .insert({
        tutor_id: tutorId,
        name: url,
        type: "webpage",
        original_url: url,
      })
      .select()
      .single()

    if (data) setSources((prev) => [data, ...prev])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Tutor not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Header — floating over everything */}
      <header className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            className="glass-fab h-8 w-8"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-semibold text-sm leading-tight">
              {tutor.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {sources.length} source{sources.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSources(!showSources)}
            className={`glass-fab h-8 w-8 ${showSources ? "!bg-white/10" : ""}`}
          >
            <BookOpen className="h-4 w-4" />
          </button>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`glass-fab h-8 w-8 ${voiceEnabled ? "!bg-white/10" : ""}`}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Character area — takes up top ~60% */}
      <div className="flex-1 flex flex-col items-center justify-end relative z-10 pb-0">
        {/* Spoken text subtitle — above character */}
        <AnimatePresence>
          {spokenText && !sending && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 max-w-lg text-center px-4"
            >
              <div className="glass-textbox rounded-2xl px-5 py-3">
                <p className="text-sm text-foreground/80 leading-relaxed">{spokenText}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        <AnimatePresence>
          {sending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex gap-1.5"
            >
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:300ms]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character — large, sitting at desk edge, overlaps desk */}
        <div className="relative z-10 mb-[-40px] md:mb-[-50px]">
          <TutorCharacter
            isSpeaking={isSpeaking}
            className="w-[340px] h-[280px] md:w-[420px] md:h-[340px]"
          />
        </div>
      </div>

      {/* Desk — full width, bottom section */}
      <div
        className="relative shrink-0 z-[5]"
        style={{
          background: "linear-gradient(180deg, #5C3D2E 0%, #4A2F22 100%)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Desk front panel — covers character's lower body for "behind desk" effect */}
        <div
          className="absolute top-0 left-0 right-0 h-[30px] z-10"
          style={{
            background: "linear-gradient(180deg, #5C3D2E 0%, #553828 100%)",
          }}
        />
        {/* Desk top edge highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] z-20"
          style={{
            background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.12) 70%, transparent 95%)",
          }}
        />

        {/* Glass pill buttons on desk surface */}
        <div className="flex items-start justify-between px-6 pt-5">
          <button
            onClick={() => {
              setShowFormatted(!showFormatted)
              setShowStudio(false)
            }}
            className={`glass-fab-pill flex-col !gap-1 !py-3 !px-4 ${showFormatted ? "!bg-white/10" : ""}`}
          >
            <FileText className="h-4 w-4" />
            <span className="text-[10px]">Response</span>
          </button>

          <button
            onClick={() => {
              setShowStudio(!showStudio)
              setShowFormatted(false)
            }}
            className={`glass-fab-pill flex-col !gap-1 !py-3 !px-4 ${showStudio ? "!bg-white/10" : ""}`}
          >
            <Clapperboard className="h-4 w-4" />
            <span className="text-[10px]">Studio</span>
          </button>
        </div>

        {/* Chat input on desk */}
        <div className="px-6 pb-6 pt-3">
          <div className="max-w-xl mx-auto relative">
            <SourceUploadMenu
              open={showUploadMenu}
              onClose={() => setShowUploadMenu(false)}
              onFileUpload={handleFileUpload}
              onUrlSubmit={handleUrlSubmit}
            />
            <ChatInput
              onSend={handleSend}
              onAttach={() => setShowUploadMenu(!showUploadMenu)}
              disabled={sending}
            />
          </div>
        </div>
      </div>

      {/* Panels — overlay on top of everything */}
      <FormattedResponsePanel
        open={showFormatted}
        onClose={() => setShowFormatted(false)}
        content={detailedContent}
        isLoading={detailedLoading}
      />
      <StudioPanel
        open={showStudio}
        onClose={() => setShowStudio(false)}
        onGenerate={handleStudioGenerate}
        isGenerating={studioGenerating}
      />
      <SourcesOverlay
        sources={sources}
        open={showSources}
        onClose={() => setShowSources(false)}
      />
    </div>
  )
}
