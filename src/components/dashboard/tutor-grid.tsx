"use client"

// Based on vault: Cards/morphing-card-stack.md (Draggable card stack with grid/list/stack)
// Remixed: each tutor is a card, click navigates to chat, + create card at the end

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Tutor } from "@/types/database"
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
  GraduationCap,
  Plus,
  Trash2,
} from "lucide-react"

type LayoutMode = "stack" | "grid" | "list"

const layoutIcons = {
  stack: Layers,
  grid: Grid3X3,
  list: LayoutList,
}

const SWIPE_THRESHOLD = 50

export function TutorGrid({ tutors: initialTutors }: { tutors: Tutor[] }) {
  const [tutors, setTutors] = useState(initialTutors)
  const [layout, setLayout] = useState<LayoutMode>("stack")
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function createTutor() {
    if (!newName.trim()) return
    setCreating(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from("tutors")
      .insert({ name: newName.trim(), user_id: user.id })
      .select()
      .single()
    if (data && !error) {
      setTutors([data, ...tutors])
      setNewName("")
      setShowCreate(false)
      setActiveIndex(0)
    }
    setCreating(false)
  }

  async function deleteTutor(id: string) {
    await supabase.from("tutors").delete().eq("id", id)
    const updated = tutors.filter((t) => t.id !== id)
    setTutors(updated)
    if (activeIndex >= updated.length) setActiveIndex(Math.max(0, updated.length - 1))
  }

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info
    const swipe = Math.abs(offset.x) * velocity.x
    if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
      setActiveIndex((prev) => (prev + 1) % tutors.length)
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
      setActiveIndex((prev) => (prev - 1 + tutors.length) % tutors.length)
    }
    setIsDragging(false)
  }

  const getStackOrder = () => {
    const reordered = []
    for (let i = 0; i < tutors.length; i++) {
      const index = (activeIndex + i) % tutors.length
      reordered.push({ tutor: tutors[index], stackPosition: i, originalIndex: index })
    }
    return reordered.reverse()
  }

  const getLayoutStyles = (stackPosition: number) => {
    if (layout === "stack") {
      return {
        top: stackPosition * 12,
        left: stackPosition * 12,
        zIndex: tutors.length - stackPosition,
        rotate: (stackPosition - 1) * 2.5,
      }
    }
    return { top: 0, left: 0, zIndex: 1, rotate: 0 }
  }

  const containerStyles = {
    stack: "relative h-[22rem] w-[22rem]",
    grid: "grid grid-cols-2 gap-4 w-full",
    list: "flex flex-col gap-4 w-full",
  }

  const displayTutors =
    layout === "stack"
      ? getStackOrder()
      : tutors.map((t, i) => ({ tutor: t, stackPosition: i, originalIndex: i }))

  return (
    <div className="space-y-6">
      {/* Layout toggle + create button */}
      <div className="flex items-center justify-between">
        <div className="glass-toggle flex items-center gap-1 rounded-full p-1">
          {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
            const Icon = layoutIcons[mode]
            return (
              <button
                key={mode}
                onClick={() => setLayout(mode)}
                className={cn(
                  "rounded-full p-2 transition-all cursor-pointer",
                  layout === mode
                    ? "glass-fab-pill !p-2 text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={`Switch to ${mode} layout`}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>

        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="glass-fab-pill text-white"
          >
            <Plus className="h-4 w-4" />
            <span>New Tutor</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createTutor()
                if (e.key === "Escape") setShowCreate(false)
              }}
              className="glass-input !h-9 !rounded-full !w-40 text-sm"
            />
            <button
              onClick={createTutor}
              disabled={creating || !newName.trim()}
              className="glass-fab-pill text-white disabled:opacity-40"
            >
              {creating ? "..." : "Create"}
            </button>
            <button
              onClick={() => {
                setShowCreate(false)
                setNewName("")
              }}
              className="glass-fab-pill text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {tutors.length === 0 && (
        <div className="text-center py-24 text-muted-foreground">
          <GraduationCap className="h-14 w-14 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No tutors yet</p>
          <p className="text-sm mt-1">Create your first tutor to get started</p>
        </div>
      )}

      {/* Card stack / grid / list */}
      {tutors.length > 0 && (
        <LayoutGroup>
          <motion.div
            layout
            className={cn(containerStyles[layout], "mx-auto")}
          >
            <AnimatePresence mode="popLayout">
              {displayTutors.map(({ tutor, stackPosition, originalIndex }) => {
                const styles = getLayoutStyles(stackPosition)
                const isTopCard = layout === "stack" && stackPosition === 0
                return (
                  <motion.div
                    key={tutor.id}
                    layoutId={tutor.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      ...styles,
                    }}
                    exit={{ opacity: 0, scale: 0.8, x: -200 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    drag={isTopCard ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                    onClick={() => {
                      if (isDragging) return
                      router.push(`/tutor/${tutor.id}`)
                    }}
                    className={cn(
                      "glass-card-solid cursor-pointer rounded-2xl pt-2 px-5 pb-6",
                      layout === "stack"
                        ? "absolute w-80 h-72"
                        : "relative",
                      layout === "stack" &&
                        isTopCard &&
                        "cursor-grab active:cursor-grabbing",
                      layout === "grid" && "w-full aspect-square",
                      layout === "list" && "w-full"
                    )}
                  >
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-card-foreground truncate text-lg">
                        {tutor.name}
                      </h3>
                      <p className="text-[9px] text-muted-foreground -mt-[1px]">
                        {new Date(tutor.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    </div>

                    {tutor.soul_md && (
                      <p
                        className={cn(
                          "text-sm text-muted-foreground mt-3",
                          layout === "stack" && "line-clamp-3",
                          layout === "grid" && "line-clamp-2",
                          layout === "list" && "line-clamp-1"
                        )}
                      >
                        {tutor.soul_md}
                      </p>
                    )}

                    {/* Delete button — stop propagation so click doesn't navigate */}
                    <div className="absolute bottom-3 right-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm("Delete this tutor?"))
                            deleteTutor(tutor.id)
                        }}
                        className="transition-colors p-1 cursor-pointer text-black/30 hover:text-black/70"
                        aria-label="Delete tutor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {isTopCard && (
                      <div className="absolute bottom-3 left-0 right-0 text-center">
                        <span className="text-xs text-muted-foreground/30">
                          Swipe to navigate
                        </span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}

      {/* Dot pagination for stack mode */}
      {layout === "stack" && tutors.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {tutors.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all cursor-pointer",
                index === activeIndex
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to tutor ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
