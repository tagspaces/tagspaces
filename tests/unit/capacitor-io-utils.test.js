import { describe, expect, test } from '@playwright/test';
import {
  resolveCapacitorPath,
  normalizePath,
  getDevicePathsForPlatform,
  binaryToBase64,
  classifyWriteContent,
  isResolvedWebViewUrl,
} from '-/services/capacitor-io-utils';

const {
  getThumbFileLocationForFile,
  getMetaFileLocationForFile,
  cleanTrailingDirSeparator,
} = require('@tagspaces/tagspaces-common/paths');

// Injected enums (mock the @capacitor/filesystem values).
const Directory = { Documents: 'DOCUMENTS', ExternalStorage: 'EXTERNAL_STORAGE' };
const Encoding = { UTF8: 'utf8' };

const ios = (p) => resolveCapacitorPath(p, 'ios', Directory);
const android = (p) => resolveCapacitorPath(p, 'android', Directory);

describe('capacitor-io-utils', () => {
  // A. iOS path resolution — the App Documents location stores path "/".
  describe('resolveCapacitorPath — iOS', () => {
    test('file under root maps to Documents (relative, no leading slash)', () => {
      expect(ios('/IMG.jpeg')).toEqual({
        path: 'IMG.jpeg',
        directory: 'DOCUMENTS',
      });
    });
    test('meta/thumb path under root', () => {
      expect(ios('/.ts/IMG.jpeg.jpg')).toEqual({
        path: '.ts/IMG.jpeg.jpg',
        directory: 'DOCUMENTS',
      });
    });
    test('root "/" and "" become "."', () => {
      expect(ios('/')).toEqual({ path: '.', directory: 'DOCUMENTS' });
      expect(ios('')).toEqual({ path: '.', directory: 'DOCUMENTS' });
    });
    test('raw file:// path passes through encoded, no directory', () => {
      expect(ios('file:///var/x.jpg')).toEqual({
        path: 'file:///var/x.jpg',
        directory: undefined,
      });
    });
    test('iCloud "Mobile Documents" path is percent-encoded, no directory', () => {
      const res = ios(
        '/private/var/mobile/Library/Mobile Documents/iCloud~org/Documents/My File.jpg',
      );
      expect(res.directory).toBeUndefined();
      expect(res.path).toBe(
        'file:///private/var/mobile/Library/Mobile%20Documents/iCloud~org/Documents/My%20File.jpg',
      );
    });
  });

  // A2. Idempotency guard for already-resolved WebView URLs.
  // Regression: meta.thumbPath holds a raw native path for files but an
  // already-resolved URL for folders (getDirMeta pre-resolves it). Callers
  // re-resolve it, so without this guard folder thumbnails were converted twice
  // and 404'd on mobile — resolveCapacitorPath treats a URL as a relative path.
  describe('isResolvedWebViewUrl', () => {
    test('true for Capacitor.convertFileSrc output (Android + iOS)', () => {
      expect(
        isResolvedWebViewUrl(
          'https://localhost/_capacitor_file_/storage/emulated/0/Docs/.ts/tst.jpg',
        ),
      ).toBe(true);
      expect(
        isResolvedWebViewUrl('capacitor://localhost/_capacitor_file_/var/.ts/tst.jpg'),
      ).toBe(true);
      expect(isResolvedWebViewUrl('http://localhost/_capacitor_file_/x.jpg')).toBe(
        true,
      );
    });
    test('true for file/blob/data URLs', () => {
      expect(isResolvedWebViewUrl('file:///var/mobile/x.jpg')).toBe(true);
      expect(isResolvedWebViewUrl('blob:http://localhost/abc-123')).toBe(true);
      expect(isResolvedWebViewUrl('data:image/jpeg;base64,AAAA')).toBe(true);
    });
    test('false for raw native paths (which still need resolving)', () => {
      expect(
        isResolvedWebViewUrl('/storage/emulated/0/Docs/sub/.ts/tst.jpg'),
      ).toBe(false);
      expect(isResolvedWebViewUrl('/.ts/tst.jpg')).toBe(false);
      expect(isResolvedWebViewUrl('sdcard/DCIM/.ts/tst.jpg')).toBe(false);
      expect(isResolvedWebViewUrl('.ts/tst.jpg')).toBe(false);
    });
    test('false for empty/undefined input', () => {
      expect(isResolvedWebViewUrl('')).toBe(false);
      expect(isResolvedWebViewUrl(undefined)).toBe(false);
    });
    test('documents WHY the guard is needed: resolveCapacitorPath mangles a URL', () => {
      // Without the guard, an already-converted folder thumb URL is fed back in
      // and treated as a *relative* path under ExternalStorage/Documents.
      const converted =
        'https://localhost/_capacitor_file_/storage/emulated/0/Docs/.ts/tst.jpg';
      expect(android(converted).path).toBe(converted); // relative → file:///…/https:/… → 404
      expect(android(converted).directory).toBe('EXTERNAL_STORAGE');
      // The guard short-circuits before this ever happens.
      expect(isResolvedWebViewUrl(converted)).toBe(true);
    });
  });

  // B. Android path resolution — everything maps to ExternalStorage.
  describe('resolveCapacitorPath — Android', () => {
    test('strips sdcard/ and /sdcard/ prefixes', () => {
      expect(android('sdcard/DCIM/x.jpg')).toEqual({
        path: 'DCIM/x.jpg',
        directory: 'EXTERNAL_STORAGE',
      });
      expect(android('/sdcard/DCIM/x.jpg')).toEqual({
        path: 'DCIM/x.jpg',
        directory: 'EXTERNAL_STORAGE',
      });
    });
    test('strips /storage/emulated/0/ prefix', () => {
      expect(android('/storage/emulated/0/Download/x.jpg')).toEqual({
        path: 'Download/x.jpg',
        directory: 'EXTERNAL_STORAGE',
      });
    });
    test('other absolute paths drop the leading slash', () => {
      expect(android('/some/abs/x.jpg')).toEqual({
        path: 'some/abs/x.jpg',
        directory: 'EXTERNAL_STORAGE',
      });
    });
    test('relative path is unchanged; empty becomes "."', () => {
      expect(android('relative/x.jpg')).toEqual({
        path: 'relative/x.jpg',
        directory: 'EXTERNAL_STORAGE',
      });
      expect(android('')).toEqual({ path: '.', directory: 'EXTERNAL_STORAGE' });
    });
  });

  // C. binaryToBase64 — the "MCwxLDIs..." junk regression.
  describe('binaryToBase64', () => {
    test('Uint8Array view encodes bytes, NOT the stringified array', () => {
      const result = binaryToBase64(new Uint8Array([0, 1, 2, 3]));
      expect(result).toBe('AAECAw=='); // correct
      expect(result).not.toBe('MCwxLDIsMw=='); // btoa(String(view)) junk
    });
    test('ArrayBuffer input encodes the same as its view', () => {
      const view = new Uint8Array([65, 66, 67]); // "ABC"
      expect(binaryToBase64(view)).toBe('QUJD');
      expect(binaryToBase64(view.buffer)).toBe('QUJD');
    });
    test('sub-array view encodes only its own bytes (byteOffset honored)', () => {
      const full = new Uint8Array([9, 9, 65, 66, 67, 9]);
      const sub = full.subarray(2, 5); // bytes 65,66,67 at non-zero offset
      expect(binaryToBase64(sub)).toBe('QUJD');
    });
    test('large payload (> 0x8000) does not throw and round-trips', () => {
      const n = 0x8000 + 123;
      const bytes = new Uint8Array(n);
      for (let i = 0; i < n; i++) bytes[i] = i % 256;
      const b64 = binaryToBase64(bytes);
      const decoded = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      expect(decoded.length).toBe(n);
      expect(decoded[0]).toBe(0);
      expect(decoded[n - 1]).toBe((n - 1) % 256);
    });
  });

  // D. classifyWriteContent — write routing.
  describe('classifyWriteContent', () => {
    test('raw string → text/UTF8', () => {
      expect(classifyWriteContent('hello', true, Encoding)).toEqual({
        mode: 'text',
        data: 'hello',
        encoding: 'utf8',
      });
    });
    test('data: URI → base64 with extracted payload, no encoding', () => {
      expect(
        classifyWriteContent('data:image/jpeg;base64,QUJD', false, Encoding),
      ).toEqual({ mode: 'base64', data: 'QUJD' });
    });
    test('plain string → text/UTF8', () => {
      expect(classifyWriteContent('hello', false, Encoding)).toEqual({
        mode: 'text',
        data: 'hello',
        encoding: 'utf8',
      });
    });
    test('non-string content → binary (raw and non-raw)', () => {
      const bytes = new Uint8Array([1, 2, 3]);
      expect(classifyWriteContent(bytes, false, Encoding)).toEqual({
        mode: 'binary',
      });
      expect(classifyWriteContent(bytes, true, Encoding)).toEqual({
        mode: 'binary',
      });
    });
  });

  // E. normalizePath
  describe('normalizePath', () => {
    test('collapses runs of slashes', () => {
      expect(normalizePath('/a//b///c')).toBe('/a/b/c');
    });
    test('passes through falsy input', () => {
      expect(normalizePath('')).toBe('');
      expect(normalizePath(undefined)).toBe(undefined);
    });
  });

  // F. getDevicePathsForPlatform
  describe('getDevicePathsForPlatform', () => {
    test('iOS exposes the Documents root', () => {
      expect(getDevicePathsForPlatform('ios')).toEqual({
        appDocumentsFolder: '/',
      });
    });
    test('Android exposes the shared-storage folders', () => {
      const p = getDevicePathsForPlatform('android');
      expect(p.downloadsFolder).toBe('sdcard/Download/');
      expect(p.dcimFolder).toBe('sdcard/DCIM/');
    });
  });

  // G. The bare-filename contract (root cause of vanishing thumbnails). The
  // renderer matches with `relativePath.endsWith(metaEntry.path)`, so the
  // Capacitor listMetaDirectoryPromise MUST return bare filenames.
  describe('bare-filename contract (listMetaDirectoryPromise)', () => {
    test('thumb path matches a bare filename, never a full /.ts/ path', () => {
      const thumbPath = getThumbFileLocationForFile('/IMG_9017.jpeg', '/', false);
      expect(thumbPath).toBe('.ts/IMG_9017.jpeg.jpg');
      expect(thumbPath.endsWith('IMG_9017.jpeg.jpg')).toBe(true); // the fix
      expect(thumbPath.endsWith('/.ts/IMG_9017.jpeg.jpg')).toBe(false); // the bug
    });
    test('meta sidecar path matches a bare filename, never a full /.ts/ path', () => {
      const metaPath = getMetaFileLocationForFile('/IMG_9017.jpeg', '/');
      expect(metaPath).toBe('.ts/IMG_9017.jpeg.json');
      expect(metaPath.endsWith('IMG_9017.jpeg.json')).toBe(true);
      expect(metaPath.endsWith('/.ts/IMG_9017.jpeg.json')).toBe(false);
    });
  });

  // H. metaDir rebuild round-trip — io-capacitor rebuilds <dir>/.ts/<name> from
  // the bare filename, and that path resolves back to the Documents directory.
  test('metaDir rebuild round-trips through resolveCapacitorPath', () => {
    const rebuilt =
      cleanTrailingDirSeparator('/') + '/' + '.ts' + '/' + 'IMG.jpeg.json';
    expect(rebuilt).toBe('/.ts/IMG.jpeg.json');
    expect(ios(rebuilt)).toEqual({
      path: '.ts/IMG.jpeg.json',
      directory: 'DOCUMENTS',
    });
  });
});
