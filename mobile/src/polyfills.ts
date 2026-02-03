// Polyfills for matrix-js-sdk to work in React Native

// Must be first - provides crypto.getRandomValues
import 'react-native-get-random-values';

// URL polyfill
import 'react-native-url-polyfill/auto';

// TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'text-encoding';
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}

// Buffer polyfill
import { Buffer } from '@craftzdog/react-native-buffer';
if (typeof global.Buffer === 'undefined') {
  (global as any).Buffer = Buffer;
}

// btoa/atob for base64
if (typeof global.btoa === 'undefined') {
  global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof global.atob === 'undefined') {
  global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

console.log('[Polyfills] Matrix SDK polyfills loaded');
