export default function DocumentsLoading() {
  return (
    <div className='p-4 md:p-6 space-y-6 animate-pulse'>
      {/* Category filters skeleton */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-1'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='h-8 w-16 bg-[#f0f0f0] rounded' />
          ))}
        </div>
        <div className='h-8 w-24 bg-[#f0f0f0] rounded' />
      </div>

      {/* Documents grid skeleton */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='border border-[#e0e0e0] p-4 space-y-2'>
            <div className='flex items-start gap-3'>
              <div className='h-9 w-9 bg-[#f0f0f0] rounded shrink-0' />
              <div className='flex-1 space-y-1'>
                <div className='h-4 w-3/4 bg-[#f0f0f0] rounded' />
                <div className='h-3 w-1/2 bg-[#f0f0f0] rounded' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
