export default function QuestionnaireLoading() {
  return (
    <div className='min-h-screen flex items-center justify-center animate-pulse'>
      <div className='w-full max-w-2xl mx-auto p-6 space-y-8'>
        {/* Progress bar skeleton */}
        <div className='h-1 w-full bg-[#f0f0f0] rounded' />

        {/* Title skeleton */}
        <div className='space-y-2 text-center'>
          <div className='h-7 w-64 bg-[#f0f0f0] rounded mx-auto' />
          <div className='h-4 w-96 bg-[#f0f0f0] rounded mx-auto' />
        </div>

        {/* Form fields skeleton */}
        <div className='space-y-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='h-12 w-full bg-[#f0f0f0] rounded' />
          ))}
        </div>

        {/* Button skeleton */}
        <div className='flex justify-end'>
          <div className='h-11 w-32 bg-[#f0f0f0] rounded' />
        </div>
      </div>
    </div>
  )
}
