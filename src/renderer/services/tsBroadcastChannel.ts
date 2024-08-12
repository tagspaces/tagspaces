const broadcast = new BroadcastChannel('ts-sync-channel');

export interface BroadcastMessage {
  type: string;
  payload?: any;
}

export const sendMessage = (type: string, payload?: any): void => {
  const message: BroadcastMessage = { type, payload };
  broadcast.postMessage(message);
};

export default broadcast;
