export {}; // ensure this file is treated as a module

declare global {
  interface File {
    /** Electron‐loader will populate this for you */
    path?: string;
  }
}
