import { Monitor, ShieldCheck, CheckCircle2, BarChart3, CalendarClock, Layers } from 'lucide-react'

const icons = {
  monitor: Monitor,
  shield: ShieldCheck,
  check: CheckCircle2,
  chart: BarChart3,
  calendar: CalendarClock,
  layers: Layers,
}

export default function FeatureCard({ title, description, icon }) {
  const Icon = icons[icon] || Monitor

  return (
    <div className="group rounded-2xl border border-line bg-paper-raised p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[0_8px_24px_-12px_rgba(20,33,61,0.18)]">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-soft text-teal transition-colors group-hover:bg-teal group-hover:text-white">
        <Icon size={20} strokeWidth={2} />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  )
}
