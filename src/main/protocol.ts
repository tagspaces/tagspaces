// Custom app protocol handler for Electron
// https://www.electronjs.org/docs/latest/api/protocol
// https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app

import { protocol, net } from 'electron';
import * as fs from 'fs-extra';
import { createReadStream } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { Readable } from 'stream';
import { ReadStream } from 'node:fs';
import { Writable } from 'node:stream';
//import { PROTOCOL } from '../config/config';
//import { __assets } from './paths';

const PROTOCOL = 'video';

const register = () => {
  //Logger.status(`Registering file protocol: ${PROTOCOL}`);
  protocol.registerSchemesAsPrivileged([
    {
      scheme: PROTOCOL,
      privileges: {
        supportFetchAPI: true,

        // Don't trigger mixed content warnings (see https://stackoverflow.com/a/75988466)
        //secure: true,

        // Allows loading localStorage/sessionStorage and similar APIs
        //standard: true,

        // Allows loading <video>/<audio> streaming elements
        stream: true,

        corsEnabled: true,
        // codeCache: true, Code cache can only be enabled when the custom scheme is registered as standard scheme.
        // allowServiceWorkers: true,
        //bypassCSP: true,
      },
    },
  ]);
};

const initialize = () => {
  if (!protocol?.handle) {
    // Old versions of Electron don't have protocol.handle
    return null;
  }

  // By default, we serve files from the assets folder
  protocol.handle(PROTOCOL, (request: any) => {
    // list all files in the directory
    const filepath = request.url
      .slice(`${PROTOCOL}://`.length)
      .replace(/\/$/, ''); // remove trailing slash  //decodeURIComponent
    const asFileUrl = `file://${filepath}`; //pathToFileURL(filepath).toString();
    console.log('protocol handler: Fetch file URL' + request.url, asFileUrl);

    const rangeHeader = request.headers.get('Range');
    if (!rangeHeader) {
      return net.fetch(asFileUrl);
    } else {
      return handleRangeRequest(request, filepath);
    }

    /*const mimeType = getMimeType(path.extname(filepath));
		const file =nodeUrl.pathToFileURL(filepath).toString(); //`file://${filepath}`;
		console.log(`Protocol request: ${request.url}; File: ${file}`);
		return net.fetch(file);*/

    /*return fetchReadableStream(file).then(stream => {
			return new Response(
				stream, // Could also be a string or ReadableStream.
				{ status: 200, headers: { 'content-type': mimeType } }
			)
		}).catch(error => {
			console.error('Error fetching local video file:', error);
			return new Response(
				null,
				{ status: 400, headers: { 'content-type': 'text/html' } }
			);
		});*/
    // fileStream returns an "old style" NodeJS.ReadableStream. We then write it
    // to the writable end of the web stream pipe, the readable end of which is
    // relayed back to the renderer as the response.
    //const { writable, readable } = new TransformStream();
    //const nodeWritable = Writable.fromWeb(writable);
    //fileStream.pipe(nodeWritable);

    //return net.fetch(nodeUrl.pathToFileURL(filepath).toString())
    // Create a readable stream for the file
    /*const mimeType = getMimeType(path.extname(filepath));
		const fileStream = fs.createReadStream(filepath) as Readable;

		return {
			status: 200,
			statusText: 'OK',
			headers: { 'Content-Type': mimeType },
			data: fileStream, // Directly pass the file stream
		};*/
    /*	const file = `file://${filepath}`;
		console.log(`Protocol request: ${request.url}; File: ${file}`);
		return net.fetch(file);*/
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
    ['Content-Type', getMimeType(path.extname(targetPath))], //fromFilename(targetPath)],
    ['Content-Length', `${endByte + 1 - startByte}`],
    ['Content-Range', `bytes ${startByte}-${endByte}/${stat.size}`],
  ]);

  return new Response(nodeStreamToWeb(resultStream), { headers, status: 206 });
};

/*function fetchReadableStream(url): Promise<ReadableStream> {
	return new Promise((resolve, reject) => {
		const request = net.request(url);

		request.on('response', (response) => {
			if (response.statusCode === 200) {
				const readableStream = response;
				resolve(readableStream);
			} else {
				reject(new Error(`Request failed with status code: ${response.statusCode}`));
			}
		});

		request.on('error', (error) => {
			reject(error);
		});

		request.end();
	});
}*/

/*function fetchLocalVideoFile(filePath) {
	return fetchReadableStream(`file://${filePath}`)
		.then(readable => {
			return new Response(
				readable,
				{ status: 200, headers: { 'content-type': 'video/mp4' } }
			);
		})
		.catch(error => {
			console.error('Error fetching local video file:', error);
			return new Response(
				null,
				{ status: 400, headers: { 'content-type': 'text/html' } }
			);
		});
}*/

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
