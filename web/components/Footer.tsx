import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-card/50 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Seas the Day" width={24} height={24} className="h-6 w-auto" />
          </div>
          
          <div className="text-xs text-subtext">
            <p>© 2025 Seas the Day</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
