export default function ArtisansLoading() {
  return (
    <div className='p-4 md:p-6 space-y-6 animate-pulse'>
      {/* Header skeleton */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='h-7 w-32 bg-[#f0f0f0] rounded' />
          <div className='h-4 w-48 bg-[#f0f0f0] rounded' />
        </div>
        <div className='h-9 w-28 bg-[#f0f0f0] rounded' />
      </div>

      {/* Contractor cards skeleton */}
      <div className='grid gap-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='border border-[#e0e0e0] p-6 space-y-4'>
            <div className='flex items-start gap-4'>
              <div className='size-12 bg-[#f0f0f0] rounded shrink-0' />
              <div className='flex-1 space-y-1'>
                <div className='h-5 w-40 bg-[#f0f0f0] rounded' />
                <div className='h-4 w-32 bg-[#f0f0f0] rounded' />
              </div>
              <div className='h-6 w-20 bg-[#f0f0f0] rounded' />
            </div>
            <div className='bg-[#f5f5f5] p-4 space-y-2'>
              <div className='h-4 w-24 bg-[#e8e8e8] rounded' />
              <div className='grid grid-cols-3 gap-4'>
                <div className='h-10 bg-[#e8e8e8] rounded' />
                <div className='h-10 bg-[#e8e8e8] rounded' />
                <div className='h-10 bg-[#e8e8e8] rounded' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
