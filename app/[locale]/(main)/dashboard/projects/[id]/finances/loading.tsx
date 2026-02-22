export default function FinancesLoading() {
  return (
    <div className='p-4 md:p-6 space-y-6 animate-pulse'>
      {/* KPI cards skeleton */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='border border-[#e0e0e0] p-5 space-y-2'>
            <div className='h-4 w-20 bg-[#f0f0f0] rounded' />
            <div className='h-7 w-24 bg-[#f0f0f0] rounded' />
          </div>
        ))}
      </div>

      {/* Payment schedule skeleton */}
      <div className='border border-[#e0e0e0]'>
        <div className='border-b border-[#e0e0e0] px-6 py-4'>
          <div className='h-5 w-40 bg-[#f0f0f0] rounded' />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='flex items-center gap-4 px-6 py-4 border-b border-[#e0e0e0] last:border-0'>
            <div className='h-5 w-5 bg-[#f0f0f0] rounded-full shrink-0' />
            <div className='flex-1 space-y-1'>
              <div className='h-4 w-48 bg-[#f0f0f0] rounded' />
              <div className='h-3 w-32 bg-[#f0f0f0] rounded' />
            </div>
            <div className='h-5 w-20 bg-[#f0f0f0] rounded' />
          </div>
        ))}
      </div>
    </div>
  )
}
