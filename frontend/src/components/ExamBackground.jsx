import { memo } from 'react'

/**
 * ExamBackground
 *
 * Exam Operations Grid — Subtle animated backdrop for Examora authentication.
 * Inspired by examination systems, standardized answer sheets (OMR),
 * structured data grids, and Swiss editorial registration marks.
 *
 * All layers are strictly pointer-events: none, stay behind the login card,
 * and respect prefers-reduced-motion.
 */
function ExamBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* ── 1. Optical Scanning Line & Beam ─────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 h-28 overflow-hidden animate-scan-line">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cobalt/45 dark:via-cobalt/60 to-transparent" />
        <div className="h-24 w-full bg-gradient-to-b from-cobalt/[0.035] dark:from-cobalt/[0.07] to-transparent" />
      </div>

      {/* ── 2. Technical Registration Marks & Swiss Crop Guides ───────────── */}
      {/* Top Left Registration Mark */}
      <div className="absolute top-16 left-6 hidden sm:flex items-center gap-2 font-mono text-[9px] font-bold text-muted/50 dark:text-muted/40 uppercase tracking-widest">
        <span className="inline-block h-3 w-3 border border-current text-center leading-[10px] text-[8px]">+</span>
        <span>SYS.EXAMORA // REF: 902-SEC</span>
      </div>

      {/* Top Right Alignment Notch */}
      <div className="absolute top-16 right-6 hidden sm:flex items-center gap-2 font-mono text-[9px] font-bold text-muted/50 dark:text-muted/40 uppercase tracking-widest">
        <span>OPTICAL_SCAN // READY</span>
        <span className="font-sans text-xs">⌜</span>
      </div>

      {/* Bottom Left Alignment Notch */}
      <div className="absolute bottom-6 left-6 hidden sm:flex items-center gap-2 font-mono text-[9px] font-bold text-muted/50 dark:text-muted/40 uppercase tracking-widest">
        <span className="font-sans text-xs">⌞</span>
        <span>INDEX: SECURE_EXAM_OPS</span>
      </div>

      {/* Bottom Right Timing Bar / Barcode */}
      <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-3 font-mono text-[9px] font-bold text-muted/50 dark:text-muted/40 uppercase tracking-widest">
        <span>KEY: #B-256</span>
        <div className="flex items-center gap-0.5 h-3">
          <span className="w-0.5 h-full bg-current" />
          <span className="w-1 h-full bg-current" />
          <span className="w-0.5 h-full bg-current" />
          <span className="w-1.5 h-full bg-current" />
          <span className="w-0.5 h-full bg-current" />
          <span className="w-1 h-full bg-current" />
        </div>
      </div>

      {/* ── 3. Left Flank: Answer Sheet (OMR) Matrix Block ─────────────────── */}
      <div className="absolute left-6 xl:left-14 top-[24%] hidden lg:block w-56 xl:w-60 animate-float-a">
        <div className="rounded-xl border border-line/15 dark:border-line/25 bg-paper-raised/40 dark:bg-paper-raised/15 p-4 shadow-[3px_3px_0px_var(--color-line)]/5 backdrop-blur-[1px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line/10 dark:border-line/20 pb-2 mb-3">
            <span className="font-mono text-[9px] font-bold tracking-wider text-muted/70 dark:text-muted/60 uppercase">
              SEC_01 // OMR MATRIX
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cobalt/60 animate-pulse" />
          </div>

          {/* OMR bubble rows */}
          <div className="space-y-2 font-mono text-[10px]">
            {/* Q01 */}
            <div className="flex items-center justify-between text-muted/60 dark:text-muted/50">
              <span className="font-bold">01</span>
              <div className="flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full border border-cobalt/60 bg-cobalt/15 text-cobalt font-bold text-[8px]">
                  A
                </span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">B</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">C</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">D</span>
              </div>
            </div>

            {/* Q02 */}
            <div className="flex items-center justify-between text-muted/60 dark:text-muted/50">
              <span className="font-bold">02</span>
              <div className="flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">A</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">B</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-cobalt/60 bg-cobalt/15 text-cobalt font-bold text-[8px]">
                  C
                </span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">D</span>
              </div>
            </div>

            {/* Q03 */}
            <div className="flex items-center justify-between text-muted/60 dark:text-muted/50">
              <span className="font-bold">03</span>
              <div className="flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">A</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-cobalt/60 bg-cobalt/15 text-cobalt font-bold text-[8px]">
                  B
                </span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">C</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">D</span>
              </div>
            </div>

            {/* Q04 */}
            <div className="flex items-center justify-between text-muted/60 dark:text-muted/50">
              <span className="font-bold">04</span>
              <div className="flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">A</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">B</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">C</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-cobalt/60 bg-cobalt/15 text-cobalt font-bold text-[8px]">
                  D
                </span>
              </div>
            </div>

            {/* Q05 */}
            <div className="flex items-center justify-between text-muted/60 dark:text-muted/50">
              <span className="font-bold">05</span>
              <div className="flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full border border-cobalt/60 bg-cobalt/15 text-cobalt font-bold text-[8px]">
                  A
                </span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">B</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">C</span>
                <span className="grid h-4 w-4 place-items-center rounded-full border border-line/20 text-[8px]">D</span>
              </div>
            </div>
          </div>

          {/* Timing track ticks */}
          <div className="mt-3 pt-2.5 border-t border-line/10 dark:border-line/20 flex items-center justify-between font-mono text-[8px] text-muted/50">
            <span>TIMING_TRACK: LOCKED</span>
            <div className="flex items-center gap-0.5">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="h-1.5 w-1 bg-current" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Right Flank: Exam Telemetry & Verification Block ─────────────── */}
      <div className="absolute right-6 xl:right-14 bottom-[22%] hidden lg:block w-56 xl:w-60 animate-float-b">
        <div className="rounded-xl border border-line/15 dark:border-line/25 bg-paper-raised/40 dark:bg-paper-raised/15 p-4 shadow-[3px_3px_0px_var(--color-line)]/5 backdrop-blur-[1px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line/10 dark:border-line/20 pb-2 mb-3">
            <span className="font-mono text-[9px] font-bold tracking-wider text-muted/70 dark:text-muted/60 uppercase">
              PROCTOR_TELEMETRY
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-teal/60" />
          </div>

          {/* Telemetry rows */}
          <div className="space-y-2 font-mono text-[9px] text-muted/70 dark:text-muted/60">
            <div className="flex items-center justify-between">
              <span>CIPHER:</span>
              <span className="font-bold text-ink-soft/80">AES-256-GCM</span>
            </div>
            <div className="flex items-center justify-between">
              <span>INTEGRITY:</span>
              <span className="font-bold text-teal/80">PARITY_VERIFIED</span>
            </div>
            <div className="flex items-center justify-between">
              <span>SESSION_GATE:</span>
              <span className="font-bold text-ink-soft/80">FEDERATED_TLS</span>
            </div>
            <div className="flex items-center justify-between">
              <span>BATCH_ID:</span>
              <span className="font-bold text-muted">#892-ALPHA</span>
            </div>
          </div>

          {/* Mini calibration target */}
          <div className="mt-3 pt-2.5 border-t border-line/10 dark:border-line/20 flex items-center justify-between font-mono text-[8px] text-muted/50">
            <span>CALIBRATION: 99.98%</span>
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full border border-current" />
              <span className="inline-block h-1 w-3 bg-current" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ExamBackground)
