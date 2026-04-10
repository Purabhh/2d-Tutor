"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Globe,
  Video,
  Type,
  ImageIcon,
  Check,
  X,
} from "lucide-react"
import type { Source } from "@/types/database"

const sourceTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  webpage: Globe,
  youtube: Video,
  text: Type,
  image: ImageIcon,
  url: Globe,
  document: FileText,
}

export function SourcesOverlay({
  sources,
  open,
  onClose,
}: {
  sources: Source[]
  open: boolean
  onClose: () => void
}) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    new Set(sources.map((s) => s.id))
  )

  const toggle = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ type: "spring", damping: 26, stiffness: 340 }}
          className="fixed inset-x-4 top-16 bottom-4 z-40 flex flex-col rounded-2xl overflow-hidden max-w-md mx-auto"
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
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">
              Sources ({sources.length})
            </h3>
            <button
              onClick={onClose}
              className="glass-fab h-7 w-7"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Source list */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {sources.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No sources added yet</p>
                <p className="text-xs mt-1">Use the Attach button to add sources</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {sources.map((source, index) => {
                  const checked = checkedIds.has(source.id)
                  const Icon = sourceTypeIcons[source.type] || FileText

                  return (
                    <motion.button
                      key={source.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => toggle(source.id)}
                      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer outline-none text-left transition-colors duration-100 hover:bg-white/5"
                    >
                      {/* Checkbox */}
                      <div
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-100 ${
                          checked
                            ? "border-white/40 bg-white/10"
                            : "border-white/20 group-hover:border-white/40"
                        }`}
                      >
                        <AnimatePresence>
                          {checked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: "spring", duration: 0.15, bounce: 0 }}
                            >
                              <Check className="h-3 w-3 text-foreground" strokeWidth={2.5} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Icon */}
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-100 ${
                          checked
                            ? "bg-white/8 text-foreground"
                            : "bg-white/4 text-muted-foreground"
                        }`}
                        style={{
                          boxShadow: checked
                            ? "inset 1px 1px 0.5px -0.5px rgba(255,255,255,0.3), inset -1px -1px 0.5px -0.5px rgba(255,255,255,0.3)"
                            : "none",
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Label */}
                      <span
                        className={`text-[13px] truncate transition-all duration-100 ${
                          checked
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {source.name}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
