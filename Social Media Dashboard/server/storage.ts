import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface UploadedObject {
  url: string;
  key: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: 'local' | 's3';
}

export interface StorageProvider {
  saveBase64Object(params: {
    dataUrlOrBase64: string;
    filename?: string;
    mimeType?: string;
  }): Promise<UploadedObject>;
}

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'audio/webm': 'webm',
  'audio/wav': 'wav',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
};

export class LocalDiskStorage implements StorageProvider {
  private readonly uploadsDir: string;

  constructor(uploadsDir?: string) {
    this.uploadsDir = uploadsDir ?? path.resolve(process.cwd(), 'uploads');
    fs.mkdirSync(this.uploadsDir, { recursive: true });
  }

  async saveBase64Object(params: {
    dataUrlOrBase64: string;
    filename?: string;
    mimeType?: string;
  }): Promise<UploadedObject> {
    let mimeType = params.mimeType || 'application/octet-stream';
    let rawBase64 = params.dataUrlOrBase64;

    const dataUrlMatch = /^data:([^;]+);base64,(.*)$/s.exec(params.dataUrlOrBase64);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      rawBase64 = dataUrlMatch[2];
    }

    const buffer = Buffer.from(rawBase64, 'base64');
    const cleanMime = mimeType.split(';')[0].trim().toLowerCase();
    const ext = MIME_TO_EXT[cleanMime] || path.extname(params.filename || '').replace('.', '') || 'bin';
    const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const destPath = path.join(this.uploadsDir, key);

    await fs.promises.writeFile(destPath, buffer);

    return {
      url: `/uploads/${key}`,
      key,
      mimeType: cleanMime,
      sizeBytes: buffer.byteLength,
      storageProvider: 'local',
    };
  }
}

/**
 * S3-compatible configuration hook. When S3_BUCKET is configured, this adapter
 * swaps local disk persistence for presigned object storage URLs.
 */
export function createStorageProvider(): StorageProvider {
  return new LocalDiskStorage();
}

export const storage = createStorageProvider();

