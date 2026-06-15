export interface AppFile {
  name: string;
  path: string;
  content: string; // Base64 or plain-text representation
  type: string;     // e.g. 'text/html', 'text/css', 'application/javascript'
}

export type AppType = 'html' | 'web';

export type ScreenOrientation = 'portrait' | 'landscape' | 'auto';

export interface AppConfig {
  id: string;
  name: string;
  type: AppType;
  icon: string | null;         // Base64 image
  version: string;
  description: string;
  author: string;             // Company or individual
  swipeToRefresh: boolean;
  orientation: ScreenOrientation;
  url?: string;               // Only for web apps
  files?: AppFile[];          // Only for HTML apps
  packageName: string;        // e.g. com.company.appname
  createdAt: string;
  keystoreAlias: string;
}

export interface BuildLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
