export default function BackgroundBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40 blur-[80px]">
      <div className="blob left-[-150px] top-[-150px]" />
      <div className="blob right-[-200px] top-[30%]" style={{ animationDelay: '-7s' }} />
      <div className="blob bottom-[-200px] left-[35%]" style={{ animationDelay: '-14s' }} />
    </div>
  )
}
