'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
/* Cloudflare's published always-pass test key, used only on localhost. */
const TEST_SITE_KEY = '1x00000000000000000000AA';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};

/** The Cloudflare Turnstile check for a form: mounts the widget into `ref` once `active`, and hands back the token. Same site key as the scorecard. */
export function useTurnstile(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState('');
  const [available, setAvailable] = useState(true);

  const mount = useCallback((key: string) => {
    const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
    if (!ref.current || !api || widget.current) return;
    widget.current = api.render(ref.current, {
      sitekey: key,
      callback: (t: string) => setToken(t),
      'expired-callback': () => setToken(''),
      'error-callback': () => setToken(''),
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    const key = SITE_KEY || (window.location.hostname === 'localhost' ? TEST_SITE_KEY : '');
    if (!key) {
      setAvailable(false);
      return;
    }
    if ((window as unknown as { turnstile?: TurnstileApi }).turnstile) {
      mount(key);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => mount(key);
    document.head.appendChild(s);
  }, [active, mount]);

  const reset = useCallback(() => {
    const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
    if (widget.current) api?.reset(widget.current);
    setToken('');
  }, []);

  return { ref, token, reset, available };
}
