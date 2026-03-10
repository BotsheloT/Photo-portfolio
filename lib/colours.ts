import sharp from 'sharp'

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return [h * 360, s * 100, l * 100]
}

/**
 * Extracts the dominant hue (0–360) from an image buffer.
 * Returns null for monochrome/near-greyscale images.
 */
export async function extractDominantHue(imageBuffer: Buffer): Promise<number | null> {
  try {
    const { data, info } = await sharp(imageBuffer)
      .resize(100, 100, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Bucket hues into 10-degree ranges and find the most frequent
    const hueMap = new Map<number, number>()
    const ch = info.channels

    for (let i = 0; i < data.length; i += ch) {
      const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
      // Skip near-grey pixels (low saturation) and near-black/white pixels
      if (s > 18 && l > 8 && l < 92) {
        const bucket = Math.round(h / 10) * 10 % 360
        hueMap.set(bucket, (hueMap.get(bucket) ?? 0) + 1)
      }
    }

    if (hueMap.size === 0) return null

    let maxCount = 0
    let dominantHue = 0
    hueMap.forEach((count, hue) => {
      if (count > maxCount) {
        maxCount = count
        dominantHue = hue
      }
    })

    return dominantHue
  } catch {
    return null
  }
}

/**
 * Generates a tiny base64-encoded JPEG for use as a Next.js blur placeholder.
 */
export async function generateBlurDataUrl(imageBuffer: Buffer): Promise<string> {
  const blurBuffer = await sharp(imageBuffer)
    .resize(10, 15, { fit: 'cover' })
    .toFormat('jpeg', { quality: 50 })
    .toBuffer()
  return `data:image/jpeg;base64,${blurBuffer.toString('base64')}`
}

/**
 * Returns the pixel dimensions of an image buffer.
 */
export async function getImageDimensions(
  imageBuffer: Buffer
): Promise<{ width: number; height: number }> {
  const meta = await sharp(imageBuffer).metadata()
  return { width: meta.width ?? 0, height: meta.height ?? 0 }
}
