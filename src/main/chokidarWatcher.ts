export interface Changed {
  path: string;
  eventName: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
}
