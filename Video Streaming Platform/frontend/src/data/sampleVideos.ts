import { Video } from '../types/video';

// Generate 100 heatmap buckets simulating real viewer engagement replay curve
const generateHeatmapBuckets = (peaks: number[]): { bucketIndex: number; watchIntensityScore: number }[] => {
  return Array.from({ length: 100 }, (_, i) => {
    // Base engagement with natural drop-off curve
    let score = Math.max(0.15, 0.95 - (i * 0.007));
    
    // Add peak replay spikes
    for (const peak of peaks) {
      const dist = Math.abs(i - peak);
      if (dist < 8) {
        score += (1 - dist / 8) * 0.65;
      }
    }
    
    // Gentle organic jitter
    score += Math.sin(i * 0.4) * 0.04;
    return {
      bucketIndex: i,
      watchIntensityScore: Math.min(1.0, Math.max(0.05, Math.round(score * 100) / 100))
    };
  });
};

export const SAMPLE_VIDEOS: Video[] = [
  {
    id: 'vid-101',
    ulid: '01JBCDEF849204928174928401',
    title: 'Building Ultra-Scale Video Architecture: Chunked Ingestion, Multi-Rendition HLS & Edge CDN',
    slug: 'building-ultra-scale-video-architecture',
    description: `A masterclass in modern streaming media architecture. We break down the end-to-end engineering behind petabyte-scale video platforms: from resumable 5MB chunked multipart uploads with SHA-256 verification, to automated FFmpeg transcoding pipelines with fast-start 720p proxies, hot-swapping master .m3u8 playlists, and Redis-buffered heartbeat telemetry.`,
    channelName: 'Systems & Media Engineering',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    channelSubscribers: '342K subscribers',
    visibility: 'public',
    status: 'ready_all_renditions',
    durationSeconds: 1542, // ~25:42
    aspectRatio: '16:9',
    // Using a reliable public HLS master stream test and high-quality MP4 fallback
    masterPlaylistPath: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    storyboardVttPath: '/assets/storyboards/vid-101.vtt',
    posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=85',
    motionPreviewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    audioOnlyM4aPath: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    maxResolution: '4k',
    viewsCount: 148520,
    likesCount: 12400,
    publishedAt: '2 days ago',
    renditions: [
      {
        id: 'ren-4k',
        videoId: 'vid-101',
        resolutionLabel: '4k',
        width: 3840,
        height: 2160,
        bitrateKbps: 18400,
        codec: 'avc1.640028',
        playlistPath: '/streams/vid-101/4k.m3u8',
        fileSizeBytes: 3548291072,
        status: 'ready',
        progressPercent: 100,
        completedAt: '2026-11-03T10:14:00Z'
      },
      {
        id: 'ren-1080p',
        videoId: 'vid-101',
        resolutionLabel: '1080p',
        width: 1920,
        height: 1080,
        bitrateKbps: 8400,
        codec: 'avc1.640028',
        playlistPath: '/streams/vid-101/1080p.m3u8',
        fileSizeBytes: 1618492000,
        status: 'ready',
        progressPercent: 100,
        completedAt: '2026-11-03T09:58:00Z'
      },
      {
        id: 'ren-720p',
        videoId: 'vid-101',
        resolutionLabel: '720p',
        width: 1280,
        height: 720,
        bitrateKbps: 3200,
        codec: 'avc1.4d401f',
        playlistPath: '/streams/vid-101/720p.m3u8',
        fileSizeBytes: 618492000,
        status: 'ready',
        progressPercent: 100,
        completedAt: '2026-11-03T09:42:00Z'
      },
      {
        id: 'ren-480p',
        videoId: 'vid-101',
        resolutionLabel: '480p',
        width: 854,
        height: 480,
        bitrateKbps: 1400,
        codec: 'avc1.4d401f',
        playlistPath: '/streams/vid-101/480p.m3u8',
        fileSizeBytes: 270492000,
        status: 'ready',
        progressPercent: 100,
        completedAt: '2026-11-03T09:40:00Z'
      }
    ],
    chapters: [
      {
        id: 'ch-1',
        videoId: 'vid-101',
        title: 'Platform Vision & Streaming Pitfalls',
        startMs: 0,
        endMs: 142000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=320&auto=format&fit=crop&q=80'
      },
      {
        id: 'ch-2',
        videoId: 'vid-101',
        title: 'Resumable 5MB Chunked Multipart Ingestion',
        startMs: 142000,
        endMs: 380000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=320&auto=format&fit=crop&q=80'
      },
      {
        id: 'ch-3',
        videoId: 'vid-101',
        title: 'Designing the Adaptive Bitrate Ladder (ABR)',
        startMs: 380000,
        endMs: 650000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=320&auto=format&fit=crop&q=80'
      },
      {
        id: 'ch-4',
        videoId: 'vid-101',
        title: 'Fast-Start 720p Proxy & Dynamic Manifest Hot-Swap',
        startMs: 650000,
        endMs: 980000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=320&auto=format&fit=crop&q=80'
      },
      {
        id: 'ch-5',
        videoId: 'vid-101',
        title: 'Redis-Buffered Heartbeats & Engagement Heatmap Math',
        startMs: 980000,
        endMs: 1260000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=320&auto=format&fit=crop&q=80'
      },
      {
        id: 'ch-6',
        videoId: 'vid-101',
        title: 'Edge CloudFront Signed Manifests & Final Architecture',
        startMs: 1260000,
        endMs: 1542000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=320&auto=format&fit=crop&q=80'
      }
    ],
    transcript: [
      {
        id: 't-1',
        videoId: 'vid-101',
        languageCode: 'en',
        startMs: 2500,
        endMs: 12000,
        speakerLabel: 'Alex Rivera (Lead Architect)',
        textContent: 'Welcome to this deep dive into building cinema-grade, resilient video streaming platforms at scale.',
        words: [
          { text: 'Welcome', startMs: 2500, endMs: 3200 },
          { text: 'to', startMs: 3200, endMs: 3400 },
          { text: 'this', startMs: 3400, endMs: 3700 },
          { text: 'deep', startMs: 3700, endMs: 4200 },
          { text: 'dive', startMs: 4200, endMs: 4600 },
          { text: 'into', startMs: 4600, endMs: 4900 },
          { text: 'building', startMs: 4900, endMs: 5500 },
          { text: 'cinema-grade,', startMs: 5500, endMs: 6500 },
          { text: 'resilient', startMs: 6500, endMs: 7200 },
          { text: 'video', startMs: 7200, endMs: 7800 },
          { text: 'streaming', startMs: 7800, endMs: 8500 },
          { text: 'platforms', startMs: 8500, endMs: 9300 },
          { text: 'at', startMs: 9300, endMs: 9600 },
          { text: 'scale.', startMs: 9600, endMs: 10400 }
        ]
      },
      {
        id: 't-2',
        videoId: 'vid-101',
        languageCode: 'en',
        startMs: 13500,
        endMs: 26000,
        speakerLabel: 'Alex Rivera',
        textContent: 'Most platforms stumble on brittle browser uploads that fail at 90% and opaque FFmpeg transcoding queues that leave users in the dark.',
        words: [
          { text: 'Most', startMs: 13500, endMs: 14000 },
          { text: 'platforms', startMs: 14000, endMs: 14700 },
          { text: 'stumble', startMs: 14700, endMs: 15300 },
          { text: 'on', startMs: 15300, endMs: 15600 },
          { text: 'brittle', startMs: 15600, endMs: 16100 },
          { text: 'browser', startMs: 16100, endMs: 16600 },
          { text: 'uploads', startMs: 16600, endMs: 17200 },
          { text: 'that', startMs: 17200, endMs: 17500 },
          { text: 'fail', startMs: 17500, endMs: 18000 },
          { text: 'at', startMs: 18000, endMs: 18300 },
          { text: '90%', startMs: 18300, endMs: 19100 },
          { text: 'and', startMs: 19100, endMs: 19400 },
          { text: 'opaque', startMs: 19400, endMs: 20000 },
          { text: 'FFmpeg', startMs: 20000, endMs: 20800 },
          { text: 'transcoding', startMs: 20800, endMs: 21800 },
          { text: 'queues.', startMs: 21800, endMs: 22800 }
        ]
      },
      {
        id: 't-3',
        videoId: 'vid-101',
        languageCode: 'en',
        startMs: 145000,
        endMs: 162000,
        speakerLabel: 'Alex Rivera',
        textContent: 'To solve this, we architected a 5MB chunked multipart pipeline where every segment is verified with SHA-256 before disk persistence.',
        words: [
          { text: 'To', startMs: 145000, endMs: 145400 },
          { text: 'solve', startMs: 145400, endMs: 146000 },
          { text: 'this,', startMs: 146000, endMs: 146600 },
          { text: 'we', startMs: 146600, endMs: 147000 },
          { text: 'architected', startMs: 147000, endMs: 147900 },
          { text: 'a', startMs: 147900, endMs: 148100 },
          { text: '5MB', startMs: 148100, endMs: 149000 },
          { text: 'chunked', startMs: 149000, endMs: 149800 },
          { text: 'multipart', startMs: 149800, endMs: 150600 },
          { text: 'pipeline', startMs: 150600, endMs: 151500 },
          { text: 'with', startMs: 151500, endMs: 152000 },
          { text: 'SHA-256', startMs: 152000, endMs: 153200 },
          { text: 'verification.', startMs: 153200, endMs: 154500 }
        ]
      },
      {
        id: 't-4',
        videoId: 'vid-101',
        languageCode: 'en',
        startMs: 382000,
        endMs: 405000,
        speakerLabel: 'Alex Rivera',
        textContent: 'Notice how the adaptive bitrate ladder maintains exact 4-second keyframe alignment across 360p, 720p, 1080p, and 4K renditions.',
        words: [
          { text: 'Notice', startMs: 382000, endMs: 382600 },
          { text: 'how', startMs: 382600, endMs: 383000 },
          { text: 'the', startMs: 383000, endMs: 383300 },
          { text: 'adaptive', startMs: 383300, endMs: 384000 },
          { text: 'bitrate', startMs: 384000, endMs: 384700 },
          { text: 'ladder', startMs: 384700, endMs: 385300 },
          { text: 'maintains', startMs: 385300, endMs: 386100 },
          { text: 'exact', startMs: 386100, endMs: 386700 },
          { text: '4-second', startMs: 386700, endMs: 387800 },
          { text: 'keyframe', startMs: 387800, endMs: 388600 },
          { text: 'alignment.', startMs: 388600, endMs: 389800 }
        ]
      },
      {
        id: 't-5',
        videoId: 'vid-101',
        languageCode: 'en',
        startMs: 654000,
        endMs: 678000,
        speakerLabel: 'Alex Rivera',
        textContent: 'Instead of forcing creators to wait 45 minutes, we generate the fast-start 720p proxy in 15 seconds so viewers can stream immediately.',
        words: [
          { text: 'Instead', startMs: 654000, endMs: 654600 },
          { text: 'of', startMs: 654600, endMs: 654900 },
          { text: 'waiting,', startMs: 654900, endMs: 655800 },
          { text: 'we', startMs: 655800, endMs: 656100 },
          { text: 'generate', startMs: 656100, endMs: 656800 },
          { text: 'the', startMs: 656800, endMs: 657100 },
          { text: 'fast-start', startMs: 657100, endMs: 658000 },
          { text: '720p', startMs: 658000, endMs: 658800 },
          { text: 'proxy', startMs: 658800, endMs: 659500 },
          { text: 'within', startMs: 659500, endMs: 660100 },
          { text: 'seconds.', startMs: 660100, endMs: 661200 }
        ]
      },
      {
        id: 't-6',
        videoId: 'vid-101',
        languageCode: 'en',
        startMs: 985000,
        endMs: 1012000,
        speakerLabel: 'Alex Rivera',
        textContent: 'Viewer heartbeats are written to Redis hashes using HINCRBY for duration bucket slices and batch-flushed to PostgreSQL every 60 seconds.',
        words: [
          { text: 'Viewer', startMs: 985000, endMs: 985600 },
          { text: 'heartbeats', startMs: 985600, endMs: 986400 },
          { text: 'are', startMs: 986400, endMs: 986700 },
          { text: 'written', startMs: 986700, endMs: 987300 },
          { text: 'to', startMs: 987300, endMs: 987600 },
          { text: 'Redis', startMs: 987600, endMs: 988200 },
          { text: 'hashes', startMs: 988200, endMs: 988900 },
          { text: 'and', startMs: 988900, endMs: 989200 },
          { text: 'batch-flushed', startMs: 989200, endMs: 990400 },
          { text: 'to', startMs: 990400, endMs: 990700 },
          { text: 'PostgreSQL.', startMs: 990700, endMs: 991800 }
        ]
      }
    ],
    comments: [
      {
        id: 'c-1',
        videoId: 'vid-101',
        userId: 'usr-88',
        userName: 'Elena Rostova',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        timestampMs: 148500, // 02:28
        body: 'The SHA-256 chunk bitmap verification is so smart! Does this handle mobile backgrounding during network handoffs?',
        upvotesCount: 142,
        isCreatorPinned: true,
        createdAt: '1 day ago',
        replies: [
          {
            id: 'c-1-r1',
            videoId: 'vid-101',
            userId: 'usr-creator',
            userName: 'Alex Rivera (Author)',
            userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            timestampMs: 152000,
            body: 'Yes! The client uses IndexedDB to persist chunk state, so even if the browser process is killed by iOS/Android, resuming recalculates missing hashes seamlessly.',
            upvotesCount: 89,
            createdAt: '22 hours ago'
          }
        ]
      },
      {
        id: 'c-2',
        videoId: 'vid-101',
        userId: 'usr-92',
        userName: 'Marcus Vance',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        timestampMs: 388000, // 06:28
        body: 'The 4-second GOP constraint `-g 120 -sc_threshold 0` is the single most important rule for stutter-free ABR transitions.',
        upvotesCount: 78,
        createdAt: '18 hours ago'
      },
      {
        id: 'c-3',
        videoId: 'vid-101',
        userId: 'usr-77',
        userName: 'Samantha Chen',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        timestampMs: 658000, // 10:58
        body: 'Hot-swapping the master.m3u8 manifest dynamically while the client player continues playing 720p without a reload is absolute black magic.',
        upvotesCount: 95,
        createdAt: '12 hours ago'
      },
      {
        id: 'c-4',
        videoId: 'vid-101',
        userId: 'usr-45',
        userName: 'David K.',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        timestampMs: 992000, // 16:32
        body: 'How do you handle Redis cluster partition if one shard with heartbeat counters goes down during a live viral spike?',
        upvotesCount: 31,
        createdAt: '6 hours ago'
      }
    ],
    heatmap: generateHeatmapBuckets([10, 25, 42, 65, 80]),
    retentionStats: {
      averagePercentageViewed: 74.2,
      completionRate: 61.8,
      peakReplayTimeMs: 654000,
      totalWatchHours: 4210,
      deviceBreakdown: [
        { name: 'Desktop Cinema (4K/1440p)', percentage: 58 },
        { name: 'Mobile / Tablet', percentage: 29 },
        { name: 'Living Room TV (AirPlay/Cast)', percentage: 13 }
      ]
    }
  },
  {
    id: 'vid-102',
    ulid: '01JBCDEF849204928174928402',
    title: 'Atmospheric Cinema & Color Science: ACES Workflow and Dolby Vision HDR Mastering',
    slug: 'atmospheric-cinema-and-color-science',
    description: 'An immersive cinematic journey exploring color transforms, wide color gamuts (Rec.2020), tone-mapping curves, and frame-accurate mastering in modern streaming workflows.',
    channelName: 'Cinema Lab & Colorworks',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    channelSubscribers: '185K subscribers',
    visibility: 'public',
    status: 'ready_all_renditions',
    durationSeconds: 1120, // ~18:40
    aspectRatio: '2.39:1',
    masterPlaylistPath: 'https://test-streams.mux.dev/test_001/stream.m3u8',
    storyboardVttPath: '/assets/storyboards/vid-102.vtt',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=85',
    motionPreviewUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    audioOnlyM4aPath: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    maxResolution: '4k',
    viewsCount: 92400,
    likesCount: 8900,
    publishedAt: '4 days ago',
    renditions: [
      {
        id: 'ren-102-4k',
        videoId: 'vid-102',
        resolutionLabel: '4k',
        width: 3840,
        height: 1608,
        bitrateKbps: 22000,
        codec: 'hev1.2.4.L153.B0',
        playlistPath: '/streams/vid-102/4k.m3u8',
        fileSizeBytes: 2980000000,
        status: 'ready',
        progressPercent: 100
      },
      {
        id: 'ren-102-1080p',
        videoId: 'vid-102',
        resolutionLabel: '1080p',
        width: 1920,
        height: 804,
        bitrateKbps: 9200,
        codec: 'avc1.640028',
        playlistPath: '/streams/vid-102/1080p.m3u8',
        fileSizeBytes: 1240000000,
        status: 'ready',
        progressPercent: 100
      }
    ],
    chapters: [
      { id: 'ch-102-1', videoId: 'vid-102', title: 'The Physics of Light & Perception', startMs: 0, endMs: 240000, thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=320&auto=format&fit=crop&q=80' },
      { id: 'ch-102-2', videoId: 'vid-102', title: 'ACES Color Transforms in Practice', startMs: 240000, endMs: 620000, thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=320&auto=format&fit=crop&q=80' },
      { id: 'ch-102-3', videoId: 'vid-102', title: 'Dolby Vision Dynamic Metadata', startMs: 620000, endMs: 1120000, thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=320&auto=format&fit=crop&q=80' }
    ],
    transcript: [
      {
        id: 't-102-1',
        videoId: 'vid-102',
        languageCode: 'en',
        startMs: 2000,
        endMs: 14000,
        speakerLabel: 'Julian Thorne (Color Scientist)',
        textContent: 'In cinematic storytelling, color is not an aesthetic afterthought—it is the psychological bedrock of the frame.',
        words: [
          { text: 'In', startMs: 2000, endMs: 2300 },
          { text: 'cinematic', startMs: 2300, endMs: 3100 },
          { text: 'storytelling,', startMs: 3100, endMs: 4000 },
          { text: 'color', startMs: 4000, endMs: 4600 },
          { text: 'is', startMs: 4600, endMs: 4900 },
          { text: 'not', startMs: 4900, endMs: 5300 },
          { text: 'an', startMs: 5300, endMs: 5500 },
          { text: 'afterthought.', startMs: 5500, endMs: 6500 }
        ]
      }
    ],
    comments: [
      {
        id: 'c-102-1',
        videoId: 'vid-102',
        userId: 'usr-33',
        userName: 'Aria Sterling',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        timestampMs: 245000,
        body: 'The split-screen comparison between Rec.709 clamp and ACEScc tone mapping is staggering.',
        upvotesCount: 64,
        createdAt: '3 days ago'
      }
    ],
    heatmap: generateHeatmapBuckets([22, 54, 78]),
    retentionStats: {
      averagePercentageViewed: 81.4,
      completionRate: 69.2,
      peakReplayTimeMs: 245000,
      totalWatchHours: 2890,
      deviceBreakdown: [
        { name: 'OLED / High-Gamut Display', percentage: 71 },
        { name: 'Standard Cinema Screen', percentage: 29 }
      ]
    }
  },
  {
    id: 'vid-103',
    ulid: '01JBCDEF849204928174928403',
    title: 'Inside Next-Gen Operating Systems: Memory Virtualization, Zero-Copy I/O & eBPF Telemetry',
    slug: 'inside-next-gen-operating-systems',
    description: 'Demystifying the Linux kernel internals that make 100Gbps network ingress possible: page tables, TLB shootdowns, io_uring ring buffers, and non-intrusive eBPF tracing.',
    channelName: 'Kernel & Systems Engineering',
    channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    channelSubscribers: '512K subscribers',
    visibility: 'public',
    status: 'ready_all_renditions',
    durationSeconds: 2240, // ~37:20
    aspectRatio: '16:9',
    masterPlaylistPath: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    storyboardVttPath: '/assets/storyboards/vid-103.vtt',
    posterUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1600&auto=format&fit=crop&q=85',
    motionPreviewUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    audioOnlyM4aPath: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    maxResolution: '4k',
    viewsCount: 231400,
    likesCount: 19800,
    publishedAt: '1 week ago',
    renditions: [
      {
        id: 'ren-103-4k',
        videoId: 'vid-103',
        resolutionLabel: '4k',
        width: 3840,
        height: 2160,
        bitrateKbps: 16000,
        codec: 'avc1.640028',
        playlistPath: '/streams/vid-103/4k.m3u8',
        fileSizeBytes: 4200000000,
        status: 'ready',
        progressPercent: 100
      }
    ],
    chapters: [
      { id: 'ch-103-1', videoId: 'vid-103', title: 'Kernel Ring Buffers & Hardware Interrupts', startMs: 0, endMs: 480000, thumbnailUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=320&auto=format&fit=crop&q=80' },
      { id: 'ch-103-2', videoId: 'vid-103', title: 'Zero-Copy Networking with io_uring', startMs: 480000, endMs: 1200000, thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=320&auto=format&fit=crop&q=80' },
      { id: 'ch-103-3', videoId: 'vid-103', title: 'eBPF Live Tracing in Production', startMs: 1200000, endMs: 2240000, thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=320&auto=format&fit=crop&q=80' }
    ],
    transcript: [
      {
        id: 't-103-1',
        videoId: 'vid-103',
        languageCode: 'en',
        startMs: 1000,
        endMs: 11000,
        speakerLabel: 'Dr. Evelyn Cross',
        textContent: 'Context switching between user space and kernel space is the hidden performance bottleneck of high-throughput web services.',
        words: [
          { text: 'Context', startMs: 1000, endMs: 1600 },
          { text: 'switching', startMs: 1600, endMs: 2300 },
          { text: 'is', startMs: 2300, endMs: 2600 },
          { text: 'the', startMs: 2600, endMs: 2800 },
          { text: 'hidden', startMs: 2800, endMs: 3400 },
          { text: 'bottleneck.', startMs: 3400, endMs: 4500 }
        ]
      }
    ],
    comments: [
      {
        id: 'c-103-1',
        videoId: 'vid-103',
        userId: 'usr-19',
        userName: 'Tariq Al-Mansoor',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        timestampMs: 495000,
        body: 'The breakdown of memory barriers with io_uring submission queues explained so much.',
        upvotesCount: 44,
        createdAt: '5 days ago'
      }
    ],
    heatmap: generateHeatmapBuckets([15, 48, 72]),
    retentionStats: {
      averagePercentageViewed: 68.9,
      completionRate: 54.3,
      peakReplayTimeMs: 495000,
      totalWatchHours: 6120,
      deviceBreakdown: [
        { name: 'Developer Workstation', percentage: 74 },
        { name: 'Mobile / Tablet', percentage: 26 }
      ]
    }
  }
];

// Helper to find video by ULID or ID
export const getVideoByUlid = (ulid: string): Video => {
  return SAMPLE_VIDEOS.find(v => v.ulid === ulid || v.id === ulid) || SAMPLE_VIDEOS[0];
};
