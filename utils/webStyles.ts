import { Platform } from 'react-native';

import { colors } from '@/constants/colors';

const STYLE_ID = 'campusnow-web-base';

/**
 * Browser chrome that no React Native style can reach.
 *
 * Two things draw on top of our own controls on the web and both look like a
 * second, broken input nested inside the real one:
 *  - the focus ring, which Chrome paints with the OS accent colour (amber on
 *    many Windows machines) — it reads as a yellow border around the field;
 *  - the autofill highlight, which repaints the field's background and border.
 *
 * The field already shows focus with its own border, so both are removed here
 * rather than fought per screen.
 */
const CSS = `
  input, textarea, select {
    outline: none !important;
    -webkit-tap-highlight-color: transparent;
  }
  input:focus, input:focus-visible,
  textarea:focus, textarea:focus-visible,
  select:focus, select:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  textarea:-webkit-autofill {
    -webkit-text-fill-color: ${colors.ink} !important;
    -webkit-box-shadow: 0 0 0 1000px ${colors.surface} inset !important;
    box-shadow: 0 0 0 1000px ${colors.surface} inset !important;
    caret-color: ${colors.ink} !important;
    transition: background-color 100000s ease-in-out 0s !important;
  }
  ::selection {
    background: ${colors.primaryTintStrong};
  }
`;

/** Installs the base stylesheet once, on web only. */
export function installWebBaseStyles() {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
