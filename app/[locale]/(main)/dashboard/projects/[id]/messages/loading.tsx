export default function MessagesLoading() {
  return (
    <div className='flex flex-col h-full animate-pulse'>
      {/* Channel tabs skeleton */}
      <div className='border-b border-[#e0e0e0] px-4 pt-3 pb-2'>
        <div className='flex items-center gap-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='h-8 w-20 bg-[#f0f0f0] rounded' />
          ))}
        </div>
      </div>

      {/* Messages skeleton */}
      <div className='flex-1 p-4 md:p-6 space-y-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
            <div className='max-w-[75%] space-y-1'>
              <div className='h-3 w-24 bg-[#f0f0f0] rounded' />
              <div className='h-12 w-48 bg-[#f0f0f0] rounded' />
            </div>
          </div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className='border-t border-[#e0e0e0] p-4'>
        <div className='h-10 w-full bg-[#f0f0f0] rounded' />
      </div>
    </div>
  )
}
