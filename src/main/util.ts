/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { BrowserWindow } from 'electron';
import http from 'http';
import { callWorker, isWorkerAttached, pingWorker } from './wsClient';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

/**
 * Translate the endpoint string the renderer uses into a worker operation.
 *
 * The renderer still speaks in paths ('/indexer', '/thumb-gen?pdfContent=true')
 * because that is what its call sites and the IPC allowlist in mainEvents.ts
 * are written against. There is no HTTP behind them any more: the request goes
 * over the worker's message port. Returns undefined for anything unrecognised.
 */
// The worker used to parse the renderer's JSON itself and carried both of
// these guards there. Now that the parse happens here, the guards come along:
// dropping one silently when the code moved would have been a quiet regression.

// Worker payloads are path lists and config objects. The old HTTP transport
// capped the request body at 1 MB; keep an equivalent ceiling so a runaway (or
// compromised) renderer cannot make the main process parse an unbounded string.
const MAX_WORKER_PAYLOAD_BYTES = 2 * 1024 * 1024;

/** JSON.parse that drops prototype-polluting keys. */
function safeJsonParse(jsonString: string): any {
  return JSON.parse(jsonString, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });
}

function toWorkerCall(
  endpoint: string,
  payload: string,
): { op: string; params: any } | undefined {
  const url = new URL(endpoint, 'http://127.0.0.1');
  if (
    payload &&
    Buffer.byteLength(payload, 'utf8') > MAX_WORKER_PAYLOAD_BYTES
  ) {
    throw new Error('worker payload too large');
  }
  const body = payload ? safeJsonParse(payload) : undefined;

  if (url.pathname === '/indexer') {
    return { op: 'indexer', params: body };
  }
  if (url.pathname === '/thumb-gen') {
    return {
      op: 'thumbGen',
      params: {
        paths: body,
        pdf: url.searchParams.has('pdf') ? url.searchParams.get('pdf') : false,
        pdfContent: url.searchParams.has('pdfContent')
          ? url.searchParams.get('pdfContent')
          : false,
      },
    };
  }
  return undefined;
}

/**
 * Run a worker operation, addressed by the endpoint string the renderer uses.
 *
 * @param payload JSON string — the operation's arguments
 * @param endpoint '/indexer' or '/thumb-gen' (with optional query parameters)
 * @param signal cancels the operation inside the worker too
 */
export function postRequest(payload, endpoint, signal = undefined) {
  if (!isWorkerAttached()) {
    return Promise.reject(new Error('no Worker Available!'));
  }
  let call;
  try {
    call = toWorkerCall(endpoint, payload);
  } catch (e) {
    return Promise.reject(new Error(`malformed worker payload: ${e.message}`));
  }
  if (!call) {
    return Promise.reject(new Error(`unknown worker endpoint: ${endpoint}`));
  }
  return callWorker(call.op, call.params, signal);
}

/**
 * @param payload: string
 * @param endpoint: string
 * @param ollamaApiUrl string url
 */
export function ollamaGetRequest(endpoint, ollamaApiUrl) {
  const url = new URL(ollamaApiUrl);
  return new Promise((resolve, reject) => {
    const option = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : '80'),
      method: 'GET',
      path: endpoint,
      headers: {
        'Content-Type': 'application/json',
        //'Content-Length': Buffer.byteLength(payload, 'utf8'),
      },
    };
    const reqPost = http
      .request(option, (resp) => {
        // .get('http://127.0.0.1:8888/thumb-gen?' + search.toString(), resp => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          if (data) {
            console.log('ollama data' + data);
            try {
              resolve(JSON.parse(data));
            } catch (ex) {
              reject(ex);
            }
          } else {
            reject(new Error('Error: no data'));
          }
        });
      })
      .on('error', (err) => {
        console.log('Error: ' + err.message);
        reject(err);
      });
    //reqPost.write(payload);
    reqPost.end();
  });
}
export function ollamaDeleteRequest(
  payload,
  endpoint,
  ollamaApiUrl,
  responseCallback,
) {
  const url = new URL(ollamaApiUrl);
  return new Promise((resolve, reject) => {
    const option = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : '80'),
      method: 'DELETE',
      path: endpoint,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload, 'utf8'),
      },
    };
    const reqPost = http
      .request(option, (resp) => {
        console.log('ollamaDeleteRequest: ' + resp.statusCode);
        if (resp.statusCode === 200) {
          responseCallback('Model deleted successful!');
          resolve(true);
        }
        if (resp.statusCode === 400) {
          responseCallback('Model not deleted!');
          resolve(false);
        }
      })
      .on('error', (err) => {
        console.log('Error: ' + err.message);
        reject(err);
      });
    reqPost.write(payload);
    reqPost.end();
  });
}

export function ollamaPostRequest(
  payload,
  endpoint,
  ollamaApiUrl,
  responseCallback,
) {
  const url = new URL(ollamaApiUrl);
  return new Promise((resolve, reject) => {
    const option = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : '80'),
      method: 'POST',
      path: endpoint,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload, 'utf8'),
      },
    };
    //console.log('Ollama option: ', option);
    console.log('Ollama payload: ', payload);
    const reqPost = http
      .request(option, (resp) => {
        const dataChunks: string[] = [];

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
          try {
            const msgChunk = chunk.toString('utf-8');
            console.log('Ollama data: ', msgChunk);
            const message = JSON.parse(msgChunk);

            if (message.error) {
              reject(message.error);
            } else if (!message.done || message.status !== 'success') {
              if (message.message) {
                dataChunks.push(message.message.content);
                responseCallback(message.message.content, false); // Stream message to renderer process
              } else if (message.status) {
                // download model
                /*const progress =
                  message.completed && message.total
                    ? ' ' +
                      Math.floor((message.completed / message.total) * 100) +
                      '%'
                    : '';
                responseCallback(message.status + progress, true);*/
                responseCallback(message);
              }
            }
          } catch (e) {
            console.error('Ollama data err:', e);
          }
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          resolve(dataChunks.join(''));
        });
      })
      .on('error', (err) => {
        console.log('Error: ', err);
        reject(err);
      });
    reqPost.write(payload);
    reqPost.end();
  });
}

/**
 * Probe whether the worker process is up and answering.
 *
 * Checks the message loop rather than just process liveness, since a forked
 * process that never got as far as registering its handler is of no use.
 */
export function isWorkerAvailable(): Promise<boolean> {
  return pingWorker();
}

export function newProgress(key, total) {
  return {
    loaded: 0,
    total: total,
    key,
  };
}
export function getOnProgress(key, progress) {
  const controller = new AbortController();
  const signal = controller.signal;

  progress[key].abort = () => {
    controller.abort();
    //reject(new Error('Promise aborted'));
  };
  signal.addEventListener('abort', progress[key].abort);
  const onProgress = (newProgress, abortFunc, fileName) => {
    signal.removeEventListener('abort', progress[key].abort);
    progress[key].abort = () => {
      if (abortFunc) {
        abortFunc();
      }
      controller.abort();
      //reject(new Error('Promise aborted'));
    };
    signal.addEventListener('abort', progress[key].abort);
    try {
      const mainWindow = BrowserWindow.getFocusedWindow();
      mainWindow.webContents.send('progress', fileName, newProgress);
    } catch (ex) {
      console.error(ex);
    }
  };
  return onProgress;
}

export function stringifyMaxDepth(obj, depth = 1) {
  // recursion limited by depth arg
  if (!obj || typeof obj !== 'object') return JSON.stringify(obj);

  let curDepthResult = '"<?>"'; // too deep
  if (depth > 0) {
    curDepthResult = Object.keys(obj)
      .map((key) => {
        let val = stringifyMaxDepth(obj[key], depth - 1);
        if (val === undefined) val = 'null';
        return `"${key}": ${val}`;
      })
      .join(', ');
    curDepthResult = `{${curDepthResult}}`;
  }

  return JSON.stringify(JSON.parse(curDepthResult));
}
