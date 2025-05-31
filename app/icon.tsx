import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon({ id }: { id: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#000000', // Changed to black from green
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '6px',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chart-column-icon lucide-chart-column">
        <path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/>
        <path d="M13 17V5"/><path d="M8 17v-3"/></svg>
        
      </div>
    ),
    {
        ...size
    }
  )
} 