import QRCode from "qrcode";

/** Server-side QR as data URI — no external services. */
export async function qrDataUri(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
    color: {
      dark: "#0e1f1c",
      light: "#ffffff",
    },
  });
}
