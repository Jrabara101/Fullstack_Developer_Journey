import LZString from 'lz-string';

let worker: Worker | null = null;
const pendingPromises = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>();

function getWorker(): Worker | null {
  if (typeof window === 'undefined') return null;
  if (!worker) {
    try {
      worker = new Worker(new URL('../workers/compressor.worker.ts', import.meta.url), {
        type: 'module'
      });
      worker.onmessage = (e: MessageEvent) => {
        const { id, type, compressed, payload, error } = e.data;
        const pending = pendingPromises.get(id);
        if (!pending) return;

        if (type === 'COMPRESS_SUCCESS') {
          pending.resolve(compressed);
        } else if (type === 'DECOMPRESS_SUCCESS') {
          pending.resolve(payload);
        } else {
          pending.reject(new Error(error || 'Worker error'));
        }
        pendingPromises.delete(id);
      };
      worker.onerror = () => {
        // Fall back to main thread on error
        console.warn('[WebWorker] Worker encountered error; falling back to synchronous LZ-string.');
      };
    } catch (err) {
      console.warn('[WebWorker] Unable to initialize compressor worker. Falling back to main-thread processing.', err);
      worker = null;
    }
  }
  return worker;
}

export async function compressReplayPayloadAsync(data: any): Promise<string> {
  const activeWorker = getWorker();
  if (activeWorker) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 9);
      pendingPromises.set(id, { resolve, reject });
      activeWorker.postMessage({ type: 'COMPRESS', id, data });
    });
  }

  // Synchronous fallback
  const jsonStr = JSON.stringify(data);
  return LZString.compressToUTF16(jsonStr);
}

export async function decompressReplayPayloadAsync(compressedStr: string): Promise<any> {
  const activeWorker = getWorker();
  if (activeWorker) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 9);
      pendingPromises.set(id, { resolve, reject });
      activeWorker.postMessage({ type: 'DECOMPRESS', id, data: compressedStr });
    });
  }

  // Synchronous fallback
  const decompressed = LZString.decompressFromUTF16(compressedStr) || LZString.decompress(compressedStr) || compressedStr;
  return JSON.parse(decompressed);
}
