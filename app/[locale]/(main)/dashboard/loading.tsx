export default function DashboardLoading() {
  return (
    <div className='p-4 md:p-6 space-y-6 animate-pulse'>
      {/* Header skeleton */}
      <div className='flex items-center justify-between'>
        <div className='h-8 w-48 bg-[#f0f0f0] rounded' />
        <div className='h-10 w-36 bg-[#f0f0f0] rounded' />
      </div>

      {/* KPI cards skeleton */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='border border-[#e0e0e0] p-4 space-y-2'>
            <div className='h-4 w-24 bg-[#f0f0f0] rounded' />
            <div className='h-8 w-16 bg-[#f0f0f0] rounded' />
          </div>
        ))}
      </div>

      {/* Project cards skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='border border-[#e0e0e0] p-5 space-y-3'>
            <div className='h-5 w-3/4 bg-[#f0f0f0] rounded' />
            <div className='h-4 w-1/2 bg-[#f0f0f0] rounded' />
            <div className='h-4 w-2/3 bg-[#f0f0f0] rounded' />
            <div className='h-8 w-full bg-[#f0f0f0] rounded mt-4' />
          </div>
        ))}
      </div>
    </div>
  )
}
