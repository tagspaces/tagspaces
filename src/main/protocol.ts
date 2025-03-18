// Custom app protocol handler for Electron
// https://www.electronjs.org/docs/latest/api/protocol
// https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app

import { protocol, net } from 'electron';
import * as fs from 'fs-extra';
import { createReadStream } from 'fs';
import { extname, normalize } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { mediaProtocol } from '@tagspaces/tagspaces-common/AppConfig';

const register = () => {
  //Logger.status(`Registering file protocol: ${mediaProtocol}`);
  protocol.registerSchemesAsPrivileged([
    {
      scheme: mediaProtocol,
      privileges: {
        supportFetchAPI: true,

        // Don't trigger mixed content warnings (see https://stackoverflow.com/a/75988466)
        //secure: true,

        // Allows loading localStorage/sessionStorage and similar APIs
        //standard: true,

        // Allows loading <video>/<audio> streaming elements
        stream: true,

        // corsEnabled: true,
        // codeCache: true, Code cache can only be enabled when the custom scheme is registered as standard scheme.
        // allowServiceWorkers: true,
        // bypassCSP: true,
      },
    },
  ]);
  // console.log('protocol register');
};

const initialize = () => {
  if (!protocol?.handle) {
    // Old versions of Electron don't have protocol.handle
    console.error('Protocol handler not available.');
    return null;
  }

  protocol.handle(mediaProtocol, (request: any) => {
    // Get the file path from the URL without the trailing slash
    let filepath = request.url
      .slice(`${mediaProtocol}://`.length)
      .replace(/\/$/, '');
    filepath = decodeURIComponent(filepath);
    // Re-encode '#' characters to preserve them in the file URL
    filepath = filepath.replace(/#/g, '%23');
    const pathname = normalize(fileURLToPath(`file://${filepath}`)); //pathToFileURL(filepath).toString();
    const asFileUrl = pathToFileURL(pathname).toString();
    console.log(
      'protocol handler: Fetch file param ' +
        filepath +
        ' as local path: ' +
        pathname +
        ' as: ' +
        asFileUrl,
    );

    const rangeHeader = request.headers.get('Range');
    if (!rangeHeader) {
      return net.fetch(asFileUrl);
    } else {
      return handleRangeRequest(request, pathname);
    }
  });
};

// In some cases, the NodeJS built-in adapter (Readable.toWeb) closes its controller twice,
// leading to an error dialog. See:
// - https://github.com/nodejs/node/blob/e578c0b1e8d3dd817e692a0c5df1b97580bc7c7f/lib/internal/webstreams/adapters.js#L454
// - https://github.com/nodejs/node/issues/54205
// We work around this by creating a more-error-tolerant custom adapter.
const nodeStreamToWeb = (resultStream: fs.ReadStream) => {
  resultStream.pause();

  let closed = false;

  return new ReadableStream(
    {
      start: (controller) => {
        resultStream.on('data', (chunk) => {
          if (closed) {
            return;
          }

          if (Buffer.isBuffer(chunk)) {
            controller.enqueue(new Uint8Array(chunk));
          } else {
            controller.enqueue(chunk);
          }

          if (controller.desiredSize <= 0) {
            resultStream.pause();
          }
        });

        resultStream.on('error', (error) => {
          controller.error(error);
        });

        resultStream.on('end', () => {
          if (!closed) {
            closed = true;
            controller.close();
          }
        });
      },
      pull: (_controller) => {
        if (closed) {
          return;
        }

        resultStream.resume();
      },
      cancel: () => {
        if (!closed) {
          closed = true;
          resultStream.close();
        }
      },
    },
    { highWaterMark: resultStream.readableHighWaterMark },
  );
};

// Allows seeking videos.
// See https://github.com/electron/electron/issues/38749 for why this is necessary.
const handleRangeRequest = async (request: Request, targetPath: string) => {
  const makeUnsupportedRangeResponse = () => {
    return new Response('unsupported range', {
      status: 416, // Range Not Satisfiable
    });
  };

  const rangeHeader = request.headers.get('Range');
  if (!rangeHeader.startsWith('bytes=')) {
    return makeUnsupportedRangeResponse();
  }
  console.log('handleRangeRequest:' + targetPath);

  const stat = await fs.stat(targetPath);
  // Ranges are requested using one of the following formats
  //  bytes=1234-5679
  //  bytes=-5678
  //  bytes=1234-
  // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range
  const startByte = Number(rangeHeader.match(/(\d+)-/)?.[1] || '0');
  const endByte = Number(
    rangeHeader.match(/-(\d+)/)?.[1] || `${stat.size - 1}`,
  );

  if (endByte > stat.size || startByte < 0) {
    return makeUnsupportedRangeResponse();
  }

  // Note: end is inclusive.
  const resultStream = createReadStream(targetPath, {
    start: startByte,
    end: endByte,
  });

  // See the HTTP range requests guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
  const headers = new Headers([
    ['Accept-Ranges', 'bytes'],
    ['Content-Type', getMimeType(extname(targetPath))], //fromFilename(targetPath)],
    ['Content-Length', `${endByte + 1 - startByte}`],
    ['Content-Range', `bytes ${startByte}-${endByte}/${stat.size}`],
  ]);

  return new Response(nodeStreamToWeb(resultStream), { headers, status: 206 });
};

/**
 * Returns the MIME type for a given file extension.
 * @param ext - The file extension (e.g., ".html", ".mp4").
 * @returns The MIME type string or a default fallback if not found.
 */
function getMimeType(ext: string): string {
  const mimeTypes: { [key: string]: string } = {
    // Text and document types
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',

    // Image types
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',

    // Video types
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
    '.3gp': 'video/3gpp',

    // Audio types
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',

    // Compressed file types
    '.zip': 'application/zip',
    '.tar': 'application/x-tar',
    '.gz': 'application/gzip',
    '.rar': 'application/vnd.rar',
    '.7z': 'application/x-7z-compressed',

    // Default fallback
    '.bin': 'application/octet-stream',
  };

  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

export default { initialize, register };
