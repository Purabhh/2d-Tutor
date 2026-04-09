import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Your AI Tutor,{' '}
            <span className="text-primary">Always Ready</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Upload your study materials — PDFs, YouTube lectures, web articles — and have a
            conversational AI tutor that speaks, explains, and visualizes concepts just for you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-border px-8 text-lg font-medium text-foreground transition-colors hover:bg-muted"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-8">
          <div className="space-y-2">
            <div className="text-3xl">📚</div>
            <h3 className="font-semibold">Upload Sources</h3>
            <p className="text-sm text-muted-foreground">PDFs, YouTube, web pages, text</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🗣️</div>
            <h3 className="font-semibold">Voice Conversations</h3>
            <p className="text-sm text-muted-foreground">Powered by ElevenLabs TTS</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🎨</div>
            <h3 className="font-semibold">Visual Learning</h3>
            <p className="text-sm text-muted-foreground">AI-generated diagrams & images</p>
          </div>
        </div>
      </div>
    </div>
  )
}
