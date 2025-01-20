export async function getVideoComments(videoId: string, p0: { maxResults: number }) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${process.env.YOUTUBE_API_KEY}`
  )

  if (!response.ok) {
    throw new Error(`YouTube API Error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.items || []
}

export function extractVideoId(url: string) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

