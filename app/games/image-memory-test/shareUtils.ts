export interface ShareBadgeOptions {
  mode:      string
  mainStat:  string
  subLabel:  string
  score:     number
}

export function downloadShareBadge({ mode, mainStat, subLabel, score }: ShareBadgeOptions) {
  const canvas  = document.createElement('canvas')
  canvas.width  = 600
  canvas.height = 300
  const ctx = canvas.getContext('2d')!

  // Background
  const grad = ctx.createLinearGradient(0, 0, 600, 300)
  grad.addColorStop(0, '#1e1b4b')
  grad.addColorStop(1, '#3b0764')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 600, 300)

  // Border
  ctx.strokeStyle = 'rgba(168,85,247,0.6)'
  ctx.lineWidth   = 3
  ctx.strokeRect(2, 2, 596, 296)

  // Site name
  ctx.fillStyle = 'rgba(168,85,247,0.9)'
  ctx.font      = 'bold 16px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('ANTBREAK.COM', 30, 40)

  // Mode
  ctx.fillStyle = 'rgba(196,181,253,0.7)'
  ctx.font      = '14px system-ui, sans-serif'
  ctx.fillText(mode.toUpperCase(), 30, 65)

  // Main stat
  ctx.fillStyle = '#f9a8d4'
  ctx.font      = 'bold 72px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(mainStat, 300, 175)

  // Sub label
  ctx.fillStyle = 'rgba(196,181,253,0.7)'
  ctx.font      = '18px system-ui, sans-serif'
  ctx.fillText(subLabel, 300, 215)

  // Score
  if (score > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font      = '14px system-ui, sans-serif'
    ctx.fillText(`${score} pts`, 300, 248)
  }

  const url = canvas.toDataURL('image/png')
  const a   = document.createElement('a')
  a.href     = url
  a.download = `antbreak-memory-${Date.now()}.png`
  a.click()
}
