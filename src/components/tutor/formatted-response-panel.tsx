"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface FormattedResponsePanelProps {
  open: boolean
  onClose: () => void
  content: string | null
  isLoading: boolean
}

export function FormattedResponsePanel({ open, onClose, content, isLoading }: FormattedResponsePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: -40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -40, scale: 0.95 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="absolute left-4 top-16 bottom-20 w-[380px] z-30 flex flex-col rounded-2xl overflow-hidden"
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
            <h3 className="text-sm font-semibold text-foreground">Formatted Response</h3>
            <button onClick={onClose} className="glass-fab h-7 w-7">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-5">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:300ms]" />
                </div>
                <span className="text-xs">Generating detailed response...</span>
              </div>
            ) : content ? (
              <div className="prose prose-invert prose-sm max-w-none text-foreground/90 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_p]:text-sm [&_li]:text-sm [&_code]:text-xs [&_pre]:bg-white/5 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-white/10">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/60 text-center py-8">
                Ask your tutor for a detailed explanation and it will appear here.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
