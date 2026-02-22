export default function OverviewLoading() {
  return (
    <div className='p-4 md:p-6 space-y-6 animate-pulse'>
      {/* Welcome hero skeleton */}
      <div className='border border-[#e0e0e0] p-6 space-y-3'>
        <div className='h-6 w-64 bg-[#f0f0f0] rounded' />
        <div className='h-4 w-96 bg-[#f0f0f0] rounded' />
      </div>

      {/* Phase progress skeleton */}
      <div className='border border-[#e0e0e0] p-5 space-y-3'>
        <div className='h-5 w-40 bg-[#f0f0f0] rounded' />
        <div className='h-3 w-full bg-[#f0f0f0] rounded' />
        <div className='flex justify-between'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='h-4 w-16 bg-[#f0f0f0] rounded' />
          ))}
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='border border-[#e0e0e0] p-5 space-y-3'>
            <div className='h-5 w-32 bg-[#f0f0f0] rounded' />
            <div className='h-4 w-full bg-[#f0f0f0] rounded' />
            <div className='h-4 w-3/4 bg-[#f0f0f0] rounded' />
          </div>
        ))}
      </div>
    </div>
  )
}
