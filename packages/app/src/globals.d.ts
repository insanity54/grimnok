// globals.d.ts

import { WindowNostr } from "nostr-tools";

interface WnjParams {
  position: 'top' | 'bottom'; // Accepted values
  accent: 'cyan' | 'green' | 'purple' | 'red' | 'orange' | 'neutral' | 'stone'; // Supported values
  startHidden: boolean;
  compactMode: boolean;
  disableOverflowFix: boolean; // Should be true/false
}


declare module 'svelte' {
  interface SvelteDocumentAttributes {
    onnlAuth?: (e: Event) => Promise<void>;
    onnlEnd?: (e: Event) => void;
  }
}


declare global {
  interface Window {
    nostr: WindowNostr;
    wnjParams: WnjParams;
  }
}
