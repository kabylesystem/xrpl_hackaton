// Ensures crypto.getRandomValues and Buffer exist for XRPL wallet generation.
// react-native-get-random-values polyfills global.crypto.getRandomValues.
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
