type Milestone = { year: string; title: string; description: string }

export function BiographyTimeline({
  showDescription = false,
  milestones,
}: {
  showDescription?: boolean
  milestones: Milestone[]
}) {
  return (
    <div className="bg-white p-4 lg:p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {milestones.map((item, index) => (
          <div
            key={index}
            className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-vatican-yellow transition-all duration-200 cursor-default"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-vatican-yellow/20 text-[16px] font-black text-vatican-blue shrink-0">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-vatican-blue font-black text-[18px] leading-none tracking-tight">
                {item.year}
              </span>
            </div>
            <h3 className="text-vatican-dark font-bold text-[18px] leading-snug mb-2 group-hover:text-vatican-blue transition-colors">
              {item.title}
            </h3>
            {showDescription && (
              <p className="text-[18px] text-gray-500 leading-relaxed">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
