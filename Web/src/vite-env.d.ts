/// <reference types="vite/client" />

interface NativeApp {
  saveLoginInfo: (info: {
    id: string;
    email: string;
    name: string;
    token: string;
    refreshToken: string;
    expiresAt: string;
  }) => void;
}

declare global {
  interface Window {
    nativeApp?: NativeApp;
  }
}

export {};
