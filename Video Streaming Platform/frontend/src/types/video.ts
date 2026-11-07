export type VideoVisibility = 'public' | 'unlisted' | 'members_only' | 'draft';
export type VideoStatus = 
  | 'uploading' 
  | 'queued' 
  | 'transcoding_fast_proxy' 
  | 'playable_hd_pending' 
  | 'ready_all_renditions' 
  | 'failed';

export type QualityResolution = '360p' | '480p' | '720p' | '1080p' | '1440p' | '4k';

export interface VideoRendition {
  id: string;
  videoId: string;
  resolutionLabel: QualityResolution;
  width: number;
  height: number;
  bitrateKbps: number;
  codec: string;
  playlistPath: string;
  fileSizeBytes: number;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  progressPercent: number;
  completedAt?: string;
}

export interface VideoChapter {
  id: string;
  videoId: string;
  title: string;
  startMs: number;
  endMs: number;
  thumbnailXywh?: string;
  thumbnailUrl?: string;
}

export interface TranscriptWord {
  text: string;
  startMs: number;
  endMs: number;
}

export interface TranscriptSegment {
  id: string;
  videoId: string;
  languageCode: string;
  startMs: number;
  endMs: number;
  speakerLabel?: string;
  textContent: string;
  words?: TranscriptWord[];
}

export interface TimedComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestampMs: number;
  body: string;
  upvotesCount: number;
  isCreatorPinned?: boolean;
  createdAt: string;
  replies?: TimedComment[];
}

export interface UserNote {
  id: string;
  videoId: string;
  timestampMs: number;
  content: string;
  createdAt: string;
}

export interface VideoClip {
  id: string;
  videoId: string;
  title: string;
  startMs: number;
  endMs: number;
  shareUrl: string;
  createdAt: string;
}

export interface HeatmapBucket {
  bucketIndex: number; // 0 to 99
  watchIntensityScore: number; // 0.0 to 1.0 (relative replay intensity)
  label?: string;
}

export interface Video {
  id: string;
  ulid: string;
  title: string;
  slug: string;
  description: string;
  channelName: string;
  channelAvatar: string;
  channelSubscribers: string;
  visibility: VideoVisibility;
  status: VideoStatus;
  durationSeconds: number;
  aspectRatio: string;
  masterPlaylistPath: string;
  storyboardVttPath: string;
  storyboardImageUrl?: string;
  posterUrl: string;
  motionPreviewUrl: string;
  audioOnlyM4aPath: string;
  maxResolution: QualityResolution;
  viewsCount: number;
  likesCount: number;
  publishedAt: string;
  renditions: VideoRendition[];
  chapters: VideoChapter[];
  transcript: TranscriptSegment[];
  comments: TimedComment[];
  heatmap: HeatmapBucket[];
  retentionStats?: {
    averagePercentageViewed: number;
    completionRate: number;
    peakReplayTimeMs: number;
    totalWatchHours: number;
    deviceBreakdown: { name: string; percentage: number }[];
  };
}

export interface UploadChunkSession {
  id: string;
  originalFilename: string;
  totalSizeBytes: number;
  chunkSizeBytes: number;
  totalChunks: number;
  uploadedChunks: number[];
  progressPercent: number;
  uploadSpeedMbps: number;
  status: 'idle' | 'uploading' | 'paused' | 'transcoding' | 'ready';
  checksumVerified: boolean;
}
