"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Tutor, Source } from "@/types/database"
import { ChatMessages, type ChatMessage } from "@/components/tutor/chat-messages"
import { ChatInput } from "@/components/tutor/chat-input"
import { ChatToolbar } from "@/components/tutor/chat-toolbar"
import { SourcesOverlay } from "@/components/tutor/sources-overlay"
import { SourceUploadMenu } from "@/components/tutor/source-upload-menu"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TutorPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showUploadMenu, setShowUploadMenu] = useState(false)

  const tutorId = params.id as string

  useEffect(() => {
    async function load() {
      const [tutorRes, sourcesRes, messagesRes] = await Promise.all([
        supabase.from("tutors").select("*").eq("id", tutorId).single(),
        supabase
          .from("sources")
          .select("*")
          .eq("tutor_id", tutorId)
          .order("created_at", { ascending: false }),
        supabase
          .from("messages")
          .select("*")
          .eq("tutor_id", tutorId)
          .order("created_at", { ascending: true }),
      ])

      if (tutorRes.data) setTutor(tutorRes.data)
      if (sourcesRes.data) setSources(sourcesRes.data)
      if (messagesRes.data) {
        setMessages(
          messagesRes.data
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              created_at: m.created_at,
            }))
        )
      }
      setLoading(false)
    }
    load()
  }, [tutorId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending])

  async function handleSend(content: string) {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    }
    setMessages((prev) => [...prev, userMsg])
    setSending(true)

    try {
      const res = await fetch(`/api/tutors/${tutorId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, voice: voiceEnabled }),
      })

      if (!res.ok) throw new Error("Chat failed")

      const data = await res.json()
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || "Sorry, I couldn't generate a response.",
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setSending(false)
    }
  }

  async function handleFileUpload(files: FileList, type: string) {
    for (const file of Array.from(files)) {
      const path = `${tutorId}/${crypto.randomUUID()}-${file.name}`
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
        type: "url",
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
    <div className="flex h-screen">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="px-4 py-3 flex items-center justify-between shrink-0">
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
          <ChatToolbar
            showSources={showSources}
            onToggleSources={() => setShowSources(!showSources)}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          />
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <ChatMessages messages={messages} isLoading={sending} />
        </div>

        {/* Sources overlay */}
        <SourcesOverlay
          sources={sources}
          open={showSources}
          onClose={() => setShowSources(false)}
        />

        {/* Input */}
        <div className="p-4 shrink-0">
          <div className="max-w-3xl mx-auto relative">
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
    </div>
  )
}
