"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AudioLines, Video, ChevronLeft, Sparkles } from "lucide-react"

type StudioTool = "audio-overview" | "video-overview" | null

const tools = [
  {
    id: "audio-overview" as const,
    label: "Audio Overview",
    icon: AudioLines,
    description: "A podcast-style conversation exploring your sources",
    formats: [
      { id: "deep-dive", label: "Deep Dive", desc: "A lively conversation between two hosts, unpacking and connecting topics in your sources" },
      { id: "brief", label: "Brief", desc: "A bite-sized overview to help you quickly grasp core ideas from your sources" },
      { id: "debate", label: "Debate", desc: "A thoughtful debate between two hosts, illuminating different perspectives" },
    ],
  },
  {
    id: "video-overview" as const,
    label: "Video Overview",
    icon: Video,
    description: "A cinematic video walkthrough of your material",
    formats: [
      { id: "cinematic", label: "Cinematic", desc: "A rich, immersive experience that unpacks complex ideas through engaging visuals" },
      { id: "explainer", label: "Explainer", desc: "A structured, comprehensive overview that connects the dots within your sources" },
      { id: "brief", label: "Brief", desc: "A bite-sized overview to help you quickly grasp core ideas" },
    ],
  },
]

interface StudioPanelProps {
  open: boolean
  onClose: () => void
  onGenerate: (tool: string, format: string, prompt: string) => void
  isGenerating: boolean
}

export function StudioPanel({ open, onClose, onGenerate, isGenerating }: StudioPanelProps) {
  const [activeTool, setActiveTool] = useState<StudioTool>(null)
  const [selectedFormat, setSelectedFormat] = useState<string>("")
  const [prompt, setPrompt] = useState("")

  const currentTool = tools.find((t) => t.id === activeTool)

  function handleGenerate() {
    if (!activeTool || !selectedFormat) return
    onGenerate(activeTool, selectedFormat, prompt)
  }

  function handleBack() {
    setActiveTool(null)
    setSelectedFormat("")
    setPrompt("")
  }

  function handleClose() {
    setActiveTool(null)
    setSelectedFormat("")
    setPrompt("")
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.95 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="absolute right-4 top-16 bottom-20 w-[380px] z-30 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: `
              0 0 6px rgba(255, 255, 255, 0.02),
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 3px 3px 0.5px -3px rgba(255, 255, 255, 0.7),
              inset -3px -3px 0.5px -3px rgba(255, 255, 255, 0.6),
              inset 1px 1px 1px -0.5px rgba(255, 255, 255, 0.4),
              inset -1px -1px 1px -0.5px rgba(255, 255, 255, 0.4),
              inset 0 0 8px 5px rgba(255, 255, 255, 0.04),
              inset 0 0 2px 2px rgba(255, 255, 255, 0.02)
            `,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 shrink-0">
            <div className="flex items-center gap-2">
              {activeTool && (
                <button onClick={handleBack} className="glass-fab h-7 w-7">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              )}
              <h3 className="text-sm font-semibold text-foreground">
                {currentTool ? currentTool.label : "Studio"}
              </h3>
            </div>
            <button onClick={handleClose} className="glass-fab h-7 w-7">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-5">
            <AnimatePresence mode="wait">
              {!activeTool ? (
                /* Tool grid */
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {tools.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setActiveTool(tool.id)
                          setSelectedFormat(tool.formats[0].id)
                        }}
                        className="flex flex-col items-start gap-2 p-4 rounded-xl text-left cursor-pointer transition-all duration-150 hover:bg-white/5"
                        style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <Icon className="h-5 w-5 text-foreground/70" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{tool.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{tool.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </motion.div>
              ) : (
                /* Tool customization */
                <motion.div
                  key="customize"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  {/* Format selection */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Format</p>
                    <div className="flex flex-col gap-2">
                      {currentTool?.formats.map((fmt) => (
                        <button
                          key={fmt.id}
                          onClick={() => setSelectedFormat(fmt.id)}
                          className="flex flex-col items-start p-3 rounded-xl text-left cursor-pointer transition-all duration-150"
                          style={{
                            background: selectedFormat === fmt.id ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.02)",
                            border: selectedFormat === fmt.id ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(255, 255, 255, 0.06)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{fmt.label}</p>
                            {selectedFormat === fmt.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center"
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12l5 5L20 7" />
                                </svg>
                              </motion.div>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{fmt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt input */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      {activeTool === "audio-overview"
                        ? "What should the AI hosts focus on?"
                        : "How would you like the video to be customised?"}
                    </p>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        activeTool === "audio-overview"
                          ? "Explain the key concepts simply..."
                          : "Focus on the main themes..."
                      }
                      className="glass-input !h-24 !rounded-xl resize-none py-3 text-sm"
                      style={{ height: "auto" }}
                    />
                  </div>

                  {/* Quick suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {["Beginner Overview", "Technical Deep Dive", "Practical Examples"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setPrompt((prev) => prev ? `${prev}, ${s.toLowerCase()}` : s.toLowerCase())}
                        className="glass-fab-pill !text-[11px] !py-1.5 !px-3"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="glass-button-primary w-full !h-11 !rounded-full disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-4 w-4" />
                      {isGenerating ? "Generating..." : "Generate"}
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
