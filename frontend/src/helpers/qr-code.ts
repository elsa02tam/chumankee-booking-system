import QRCode from 'qrcode'

export function toQRCode(text: string | number) {
  return QRCode.toDataURL(String(text), { errorCorrectionLevel: 'H' })
}
