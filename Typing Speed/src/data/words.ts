export const COMMON_WORDS: string[] = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "great", "between", "need", "feel", "state", "never", "high", "last", "long", "keep",
  "flow", "speed", "focus", "mind", "stream", "cadence", "rhythm", "buffer", "habit",
  "system", "drive", "build", "world", "light", "space", "power", "clear", "point",
  "smooth", "finger", "stroke", "screen", "pulse", "target", "vision", "learn",
  "shift", "level", "quick", "frame", "track", "press", "click", "board", "touch",
  "align", "syntax", "logic", "simple", "vector", "tempo", "motion", "dynamo",
  "memory", "action", "signal", "react", "engine", "matrix", "future", "metric",
  "always", "master", "record", "better", "active", "number", "sound", "thock",
  "clean", "rapid", "stable", "subtle", "linear", "silent", "switch", "zenith",
  "ground", "source", "craft", "course", "object", "detail", "modern", "design",
  "native", "stride", "reflex", "instant", "balance", "visual", "minimal", "elegance"
]

export function getRandomWords(count: number): string[] {
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * COMMON_WORDS.length)
    result.push(COMMON_WORDS[randomIndex])
  }
  return result
}
