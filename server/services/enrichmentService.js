import fetch from "node-fetch";

/** Google Maps needs no API key for a basic query link or embed. */
export function buildMapLinks(latitude, longitude, label) {
  const q = encodeURIComponent(label || `${latitude},${longitude}`);
  return {
    viewUrl: `https://www.google.com/maps?q=${q}`,
    embedUrl: `https://maps.google.com/maps?q=${latitude},${longitude}&z=11&output=embed`,
  };
}

/**
 * A handful of relevant YouTube videos for the location. Uses the YouTube
 * Data API when YOUTUBE_API_KEY is set; otherwise falls back to a plain
 * search link so the feature still degrades gracefully without a key.
 */
export async function getYoutubeVideos(locationName) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${locationName} travel guide`
  )}`;

  if (!apiKey) {
    return { videos: [], searchUrl, source: "fallback-link" };
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", `${locationName} travel guide`);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "4");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API returned ${res.status}`);
    const data = await res.json();

    const videos = (data.items || []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return { videos, searchUrl, source: "api" };
  } catch (err) {
    console.error("[youtube] falling back to search link:", err.message);
    return { videos: [], searchUrl, source: "fallback-link" };
  }
}
