import Image from 'next/image'

export default function Header() {
  return (
    <header className="border-b border-line bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="Seas the Day" width={32} height={32} className="h-8 w-auto" />
          <span className="text-2xl title-font text-text">Seas the Day</span>
        </div>
      </div>
    </header>
  )
}
