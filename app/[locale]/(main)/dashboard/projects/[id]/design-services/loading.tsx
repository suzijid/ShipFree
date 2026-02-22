export default function DesignServicesLoading() {
  return (
    <div className='p-4 md:p-6 space-y-8 animate-pulse'>
      {/* Header skeleton */}
      <div className='space-y-1'>
        <div className='h-6 w-40 bg-[#f0f0f0] rounded' />
        <div className='h-4 w-64 bg-[#f0f0f0] rounded' />
      </div>

      {/* Package cards skeleton */}
      <div className='grid md:grid-cols-2 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='border border-[#e0e0e0] p-6 space-y-4'>
            <div className='flex items-baseline justify-between'>
              <div className='h-5 w-32 bg-[#f0f0f0] rounded' />
              <div className='h-6 w-16 bg-[#f0f0f0] rounded' />
            </div>
            <div className='space-y-2'>
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className='h-4 w-full bg-[#f0f0f0] rounded' />
              ))}
            </div>
            <div className='h-10 w-full bg-[#f0f0f0] rounded' />
          </div>
        ))}
      </div>
    </div>
  )
}
