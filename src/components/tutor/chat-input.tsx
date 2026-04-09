"use client"

import { ArrowRight } from "lucide-react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: {
  minHeight: number
  maxHeight?: number
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return
      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }
      textarea.style.height = `${minHeight}px`
      textarea.style.height = `${Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      )}px`
    },
    [minHeight, maxHeight]
  )
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`
  }, [minHeight])
  return { textareaRef, adjustHeight }
}

export function ChatInput({
  onSend,
  onAttach,
  disabled,
}: {
  onSend: (message: string) => void
  onAttach?: () => void
  disabled?: boolean
}) {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 56,
    maxHeight: 200,
  })

  function handleSend() {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue("")
    adjustHeight(true)
  }

  return (
    <div className="w-full">
      <div className="glass-textbox rounded-2xl p-1.5">
        <div className="relative flex flex-col">
          <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
            <Textarea
              value={value}
              placeholder="Ask your tutor anything..."
              className={cn(
                "w-full rounded-xl rounded-b-none px-4 py-3 bg-transparent border-none placeholder:text-muted-foreground resize-none focus-visible:ring-0 text-foreground",
                "min-h-[56px]"
              )}
              ref={textareaRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && value.trim()) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              onChange={(e) => {
                setValue(e.target.value)
                adjustHeight()
              }}
              disabled={disabled}
            />
          </div>
          <div className="h-12 rounded-b-xl flex items-center">
            <div className="absolute left-3 right-3 bottom-2 flex items-center justify-between w-[calc(100%-24px)]">
              <div className="flex items-center gap-2">
                {onAttach && (
                  <button
                    type="button"
                    onClick={onAttach}
                    className="glass-fab-pill !py-1.5 !px-3.5 !text-xs text-white"
                  >
                    Attach
                  </button>
                )}
              </div>
              <button
                type="button"
                className={cn(
                  "glass-fab-pill !py-1.5 !px-3.5 !text-xs text-white",
                  (!value.trim() || disabled) && "opacity-30 cursor-not-allowed pointer-events-none"
                )}
                aria-label="Send message"
                disabled={!value.trim() || disabled}
                onClick={handleSend}
              >
                Send
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
