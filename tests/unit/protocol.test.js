import { describe, expect, test } from '@playwright/test';

import {
  requestUrlToFilesystemPath,
  withCors,
} from '../../src/main/protocol-utils';

// Duck-typed Request-like stub. Avoids Node's undici Request being picky about
// the forbidden Origin header in some Node versions.
const fakeRequest = (origin) => ({
  headers: {
    get: (name) =>
      name.toLowerCase() === 'origin' && origin !== undefined ? origin : null,
  },
});

const isWindows = process.platform === 'win32';

describe('requestUrlToFilesystemPath', () => {
  const scheme = 'tsfile';

  test('Windows path with literal backslashes is accepted (TST regression for the CORS/video bug)', () => {
    // Repro of the user-reported URL shape:
    //   tsfile:///E:\test\video_2026-05-24_03-26-06.mp4
    // The media-player extension preserves backslashes when building the URL,
    // and the handler must accept that — fileURLToPath itself only takes
    // forward slashes, so a missing normalization step throws.
    expect(() =>
      requestUrlToFilesystemPath(
        'tsfile:///E:\\test\\video_2026-05-24_03-26-06.mp4',
        scheme,
      ),
    ).not.toThrow();
    const out = requestUrlToFilesystemPath(
      'tsfile:///E:\\test\\video_2026-05-24_03-26-06.mp4',
      scheme,
    );
    if (isWindows) {
      expect(out).toBe('E:\\test\\video_2026-05-24_03-26-06.mp4');
    } else {
      // On POSIX we still need a non-empty deterministic string; the exact
      // shape is platform-dependent but the call must not blow up.
      expect(typeof out).toBe('string');
      expect(out.length).toBeGreaterThan(0);
    }
  });

  test('square brackets in filename are accepted (regression for ERR_FAILED on fetch)', () => {
    // Repro: user has files like `Skinshape - Filoxiny [Full Album].webm`.
    // Chromium delivers the URL with brackets percent-encoded as %5B / %5D.
    // Pre-decoding to literal `[`/`]` made fileURLToPath fail because those
    // chars are reserved in URL paths (IPv6 literal syntax in the authority).
    if (isWindows) return;
    expect(
      requestUrlToFilesystemPath(
        'tsfile:///Users/na/Music/Skinshape%20-%20Filoxiny%20%5BFull%20Album%5D-fdCupyYt_BA.webm',
        scheme,
      ),
    ).toBe(
      '/Users/na/Music/Skinshape - Filoxiny [Full Album]-fdCupyYt_BA.webm',
    );
  });

  test('parentheses and spaces in filename round-trip', () => {
    if (isWindows) return;
    expect(
      requestUrlToFilesystemPath(
        'tsfile:///tmp/Album%20(2020)%20-%20mix.mp4',
        scheme,
      ),
    ).toBe('/tmp/Album (2020) - mix.mp4');
  });

  test('Windows path with forward slashes round-trips identically', () => {
    const out = requestUrlToFilesystemPath(
      'tsfile:///E:/test/video.mp4',
      scheme,
    );
    if (isWindows) {
      expect(out).toBe('E:\\test\\video.mp4');
    } else {
      expect(typeof out).toBe('string');
    }
  });

  test('POSIX absolute path round-trips', () => {
    if (isWindows) return; // skip — file:// without drive is ambiguous on Win
    expect(
      requestUrlToFilesystemPath(
        'tsfile:///Users/me/Documents/video.mp4',
        scheme,
      ),
    ).toBe('/Users/me/Documents/video.mp4');
  });

  test('decodes percent-encoded characters (spaces)', () => {
    if (isWindows) return;
    expect(
      requestUrlToFilesystemPath(
        'tsfile:///tmp/file%20with%20spaces.mp4',
        scheme,
      ),
    ).toBe('/tmp/file with spaces.mp4');
  });

  test('preserves # in filenames (not treated as URL fragment delimiter)', () => {
    if (isWindows) return;
    // The media-player extension percent-encodes `#` to `%23` before building
    // the URL, so it arrives as `%23` and fileURLToPath decodes it back. If
    // a `#` ever arrived literal it would be treated as a fragment by
    // fileURLToPath and the rest of the filename would be dropped — pre-
    // decoding the URL is what caused that regression and is why we leave
    // percent-encoded bytes alone now.
    expect(
      requestUrlToFilesystemPath('tsfile:///tmp/foo%23bar.txt', scheme),
    ).toBe('/tmp/foo#bar.txt');
  });

  test('strips trailing slash from URL', () => {
    if (isWindows) return;
    expect(requestUrlToFilesystemPath('tsfile:///tmp/foo/', scheme)).toBe(
      '/tmp/foo',
    );
  });
});

describe('withCors', () => {
  test('echoes Origin header back when present', () => {
    const res = withCors(new Response('x'), fakeRequest('file://'));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('file://');
    expect(res.headers.get('Vary')).toContain('Origin');
  });

  test('omits Allow-Origin when Origin header is absent (no-CORS request)', () => {
    const res = withCors(new Response('x'), fakeRequest(undefined));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(null);
  });

  test('does not fall back to wildcard when Origin is missing (security)', () => {
    // Important: tsfile:// must NOT return Access-Control-Allow-Origin: * —
    // that would allow any caller to read arbitrary local files via fetch.
    const res = withCors(new Response('x'), fakeRequest(undefined));
    expect(res.headers.get('Access-Control-Allow-Origin')).not.toBe('*');
  });

  test('sets Allow-Headers and Allow-Methods on every response', () => {
    const res = withCors(
      new Response('x'),
      fakeRequest('http://localhost:1212'),
    );
    expect(res.headers.get('Access-Control-Allow-Headers')).toBe('*');
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe(
      'GET, HEAD, OPTIONS',
    );
  });

  test('preserves response status code (404 path used by missing thumbnails)', () => {
    const res = withCors(
      new Response('', { status: 404 }),
      fakeRequest('file://'),
    );
    expect(res.status).toBe(404);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('file://');
  });

  test('preserves response status code (206 partial used by range requests)', () => {
    const res = withCors(
      new Response('chunk', { status: 206 }),
      fakeRequest('file://'),
    );
    expect(res.status).toBe(206);
  });

  test('preserves pre-existing response headers (Content-Type, Content-Range)', () => {
    const res = withCors(
      new Response('', {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Range': 'bytes 0-1023/2048',
        },
      }),
      fakeRequest('file://'),
    );
    expect(res.headers.get('Content-Type')).toBe('video/mp4');
    expect(res.headers.get('Content-Range')).toBe('bytes 0-1023/2048');
  });

  test('echoes the dev-server origin (http://localhost:1212)', () => {
    const res = withCors(
      new Response('x'),
      fakeRequest('http://localhost:1212'),
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://localhost:1212',
    );
  });

  test('echoes a sandboxed null origin without falling back to *', () => {
    // Sandboxed iframes without allow-same-origin report Origin: null.
    const res = withCors(new Response('x'), fakeRequest('null'));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('null');
  });
});
