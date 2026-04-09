"use client"

// Based on vault: Navigation/toolbar.md (Text editor toolbar with formatting toggles)
// Remixed: chat action toolbar — sources panel, report mode, image gen toggle

import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  FileText,
  ImageIcon,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useState } from "react"

const ToolbarButton = ({
  label,
  icon: Icon,
  isActive,
  onClick,
  tooltip,
  showTooltip,
  hideTooltip,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
  onClick: () => void
  tooltip: string | null
  showTooltip: (label: string) => void
  hideTooltip: () => void
}) => (
  <div
    className="relative"
    onMouseEnter={() => showTooltip(label)}
    onMouseLeave={hideTooltip}
  >
    <button
      className={`h-9 w-9 flex items-center justify-center rounded-md transition-colors duration-200 ${
        isActive ? "bg-primary/15 text-primary" : "text-muted-foreground"
      } hover:bg-primary/10 focus:outline-none cursor-pointer`}
      aria-label={label}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
    </button>
    <AnimatePresence>
      {tooltip === label && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="text-nowrap font-medium absolute -top-9 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs rounded-md px-2 py-1 shadow-lg z-50"
        >
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

export function ChatToolbar({
  showSources,
  onToggleSources,
  voiceEnabled,
  onToggleVoice,
}: {
  showSources: boolean
  onToggleSources: () => void
  voiceEnabled: boolean
  onToggleVoice: () => void
}) {
  const [tooltip, setTooltip] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="bg-card rounded-lg shadow-sm border border-border flex items-center gap-0.5 p-1"
    >
      <ToolbarButton
        label="Sources"
        icon={BookOpen}
        isActive={showSources}
        onClick={onToggleSources}
        tooltip={tooltip}
        showTooltip={setTooltip}
        hideTooltip={() => setTooltip(null)}
      />
      <div className="w-px h-6 bg-border mx-0.5" />
      <ToolbarButton
        label={voiceEnabled ? "Mute Voice" : "Enable Voice"}
        icon={voiceEnabled ? Volume2 : VolumeX}
        isActive={voiceEnabled}
        onClick={onToggleVoice}
        tooltip={tooltip}
        showTooltip={setTooltip}
        hideTooltip={() => setTooltip(null)}
      />
    </motion.div>
  )
}
