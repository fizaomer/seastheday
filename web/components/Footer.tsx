import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="w-full border-t border-line bg-card/50 py-3 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs text-subtext text-center">
            <p>© 2025 Seas the Day</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
