import { Monitor, ShieldCheck, CheckCircle2, BarChart3, CalendarClock, Layers } from 'lucide-react'

const icons = {
  monitor: Monitor,
  shield: ShieldCheck,
  check: CheckCircle2,
  chart: BarChart3,
  calendar: CalendarClock,
  layers: Layers,
}

export default function FeatureCard({ id, title, description, icon }) {
  const Icon = icons[icon] || Monitor
  const formattedIndex = id < 10 ? `0${id}` : id

  return (
    <div className="neo-card-interactive flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center justify-between border-b-2 border-line/10 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-line bg-cobalt-soft text-cobalt">
            <Icon size={20} strokeWidth={2.2} />
          </div>
          <span className="font-mono text-xs font-bold text-muted">
            SYS_MOD // {formattedIndex}
          </span>
        </div>

        <h3 className="mt-4 font-display text-lg font-bold text-ink sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {description}
        </p>
      </div>

      <div className="mt-6 border-t-2 border-line/10 pt-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
          ENTERPRISE_GRADE
        </span>
      </div>
    </div>
  )
}
