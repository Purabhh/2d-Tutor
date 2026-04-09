"use client"

// Based on vault: Cards/morphing-card-stack.md (Draggable card stack with grid/list/stack)
// Remixed: displays tutor sources with layout toggle

import { useState, type ReactNode } from "react"
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  type PanInfo,
} from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Grid3X3,
  Layers,
  LayoutList,
  FileText,
  Globe,
  Video,
  Type,
  ImageIcon,
} from "lucide-react"
import type { Source } from "@/types/database"

type LayoutMode = "stack" | "grid" | "list"

const layoutIcons = {
  stack: Layers,
  grid: Grid3X3,
  list: LayoutList,
}

const sourceTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  webpage: Globe,
  youtube: Video,
  text: Type,
  image: ImageIcon,
}

const SWIPE_THRESHOLD = 50

export function SourceCardStack({
  sources,
  className,
}: {
  sources: Source[]
  className?: string
}) {
  const [layout, setLayout] = useState<LayoutMode>("list")
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  if (sources.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No sources added yet</p>
      </div>
    )
  }

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info
    const swipe = Math.abs(offset.x) * velocity.x
    if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
      setActiveIndex((prev) => (prev + 1) % sources.length)
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
      setActiveIndex((prev) => (prev - 1 + sources.length) % sources.length)
    }
    setIsDragging(false)
  }

  const getStackOrder = () => {
    const reordered = []
    for (let i = 0; i < sources.length; i++) {
      const index = (activeIndex + i) % sources.length
      reordered.push({ ...sources[index], stackPosition: i })
    }
    return reordered.reverse()
  }

  const getLayoutStyles = (stackPosition: number) => {
    if (layout === "stack") {
      return {
        top: stackPosition * 8,
        left: stackPosition * 8,
        zIndex: sources.length - stackPosition,
        rotate: (stackPosition - 1) * 2,
      }
    }
    return { top: 0, left: 0, zIndex: 1, rotate: 0 }
  }

  const containerStyles = {
    stack: "relative h-48 w-full",
    grid: "grid grid-cols-2 gap-2",
    list: "flex flex-col gap-2",
  }

  const displaySources =
    layout === "stack"
      ? getStackOrder()
      : sources.map((s, i) => ({ ...s, stackPosition: i }))

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">
          Sources ({sources.length})
        </h4>
        <div className="flex items-center gap-0.5 rounded-lg bg-secondary/50 p-0.5">
          {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
            const Icon = layoutIcons[mode]
            return (
              <button
                key={mode}
                onClick={() => setLayout(mode)}
                className={cn(
                  "rounded-md p-1.5 transition-all",
                  layout === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
                aria-label={`Switch to ${mode} layout`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            )
          })}
        </div>
      </div>

      <LayoutGroup>
        <motion.div layout className={cn(containerStyles[layout])}>
          <AnimatePresence mode="popLayout">
            {displaySources.map((source) => {
              const styles = getLayoutStyles(source.stackPosition)
              const isTopCard =
                layout === "stack" && source.stackPosition === 0
              const SourceIcon =
                sourceTypeIcons[source.type] || FileText

              return (
                <motion.div
                  key={source.id}
                  layoutId={source.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, x: 0, ...styles }}
                  exit={{ opacity: 0, scale: 0.8, x: -200 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                  className={cn(
                    "rounded-lg border border-border bg-card p-3",
                    "hover:border-primary/50 transition-colors",
                    layout === "stack" &&
                      "absolute w-full h-40 cursor-grab active:cursor-grabbing",
                    layout === "grid" && "w-full",
                    layout === "list" && "w-full"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
                      <SourceIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {source.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {source.type}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {layout === "stack" && sources.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {sources.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to source ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
