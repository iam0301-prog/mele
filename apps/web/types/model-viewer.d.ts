import type React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        poster?: string;
        alt?: string;
        ar?: boolean | string;
        'ar-modes'?: string;
        'ar-placement'?: string;
        'camera-controls'?: boolean | string;
        'auto-rotate'?: boolean | string;
        'camera-orbit'?: string;
        'min-camera-orbit'?: string;
        'max-camera-orbit'?: string;
        'camera-target'?: string;
        'field-of-view'?: string;
        'shadow-intensity'?: string;
        exposure?: string;
        'environment-image'?: string;
        'interaction-prompt'?: string;
        'touch-action'?: string;
        'ios-src'?: string;
        slot?: string;
      };
    }
  }
}

export {};
