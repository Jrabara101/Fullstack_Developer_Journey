import LZString from 'lz-string';

// Worker context
self.onmessage = (event: MessageEvent) => {
  const { type, id, data } = event.data;

  try {
    if (type === 'COMPRESS') {
      const jsonStr = JSON.stringify(data);
      const compressed = LZString.compressToUTF16(jsonStr);
      self.postMessage({ type: 'COMPRESS_SUCCESS', id, compressed });
    } else if (type === 'DECOMPRESS') {
      const decompressed = LZString.decompressFromUTF16(data) || LZString.decompress(data) || data;
      const parsed = JSON.parse(decompressed);
      self.postMessage({ type: 'DECOMPRESS_SUCCESS', id, payload: parsed });
    }
  } catch (error: any) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: error.message || 'Worker processing failed'
    });
  }
};
