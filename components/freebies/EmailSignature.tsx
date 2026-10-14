'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  buildSignatureHtml,
  previewHtml,
  type SignatureOptions,
} from '@/lib/email-signature';
import styles from './Freebies.module.css';

type Copy = {
  previewTitle: string;
  options: { logo: string; emergency: string; confidentiality: string };
  codeTitle: string;
  copy: string;
  copied: string;
  copyFormatted: string;
  copiedFormatted: string;
  placeholdersNote: string;
  stepsTitle: string;
  outlookNote: string;
  steps: { id: string; label: string; steps: string[] }[];
  help: { title: string; body: string; button: string; href: string };
};

/** The clipboard API where the browser allows it, else the older select-and-copy, which works in a
    page that is not allowed the clipboard API (an embedded view, an older browser). */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

/**
 * The email signature tool: a live preview, three optional extras, the code with a copy button, a
 * second button that copies the signature as formatted text (what Gmail, Outlook and Apple Mail
 * take when you paste), short setup steps per app, and a band offering to install it. The code
 * block scrolls inside itself, so nothing makes the page scroll sideways.
 */
export default function EmailSignature({ copy }: { copy: Copy }) {
  const [options, setOptions] = useState<SignatureOptions>({
    logo: false,
    confidentiality: false,
    emergency: false,
  });
  const [copied, setCopied] = useState<'code' | 'formatted' | null>(null);
  const [tab, setTab] = useState(copy.steps[0].id);
  const previewRef = useRef<HTMLDivElement>(null);

  const html = buildSignatureHtml(options);

  const flash = (which: 'code' | 'formatted') => {
    setCopied(which);
    window.setTimeout(() => setCopied(null), 2000);
  };

  async function copyCode() {
    if (await copyText(html)) flash('code');
    /* If both ways are blocked, the code is on screen to select by hand. */
  }

  async function copyFormatted() {
    const node = previewRef.current;
    if (!node) return;

    /* Formatted text where the clipboard API allows it; otherwise select the preview and copy. */
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([node.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([node.innerText], { type: 'text/plain' }),
        }),
      ]);
      flash('formatted');
      return;
    } catch {
      /* fall through */
    }

    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    if (document.execCommand('copy')) flash('formatted');
  }

  const toggle = (key: keyof SignatureOptions) =>
    setOptions((current) => ({ ...current, [key]: !current[key] }));

  const active = copy.steps.find((item) => item.id === tab) ?? copy.steps[0];

  return (
    <div className={styles.sig}>
      <div className={styles.sigBlock}>
        <h3 className={styles.sigTitle}>{copy.previewTitle}</h3>

        <ul className={styles.options}>
          {(['logo', 'emergency', 'confidentiality'] as const).map((key) => (
            <li key={key}>
              <label>
                <input type="checkbox" checked={options[key]} onChange={() => toggle(key)} />
                {copy.options[key]}
              </label>
            </li>
          ))}
        </ul>

        <div
          className={styles.sigPreview}
          ref={previewRef}
          dangerouslySetInnerHTML={{ __html: previewHtml(html) }}
        />

        <div className={styles.sigActions}>
          <button type="button" className={styles.copyButton} onClick={copyFormatted}>
            {copied === 'formatted' ? copy.copiedFormatted : copy.copyFormatted}
          </button>
        </div>
      </div>

      <div className={styles.sigBlock}>
        <h3 className={styles.sigTitle}>{copy.codeTitle}</h3>
        <pre className={styles.code} tabIndex={0}>
          <code data-signature-code>{html}</code>
        </pre>
        <div className={styles.sigActions}>
          <button type="button" className={styles.copyButtonAlt} onClick={copyCode}>
            {copied === 'code' ? copy.copied : copy.copy}
          </button>
        </div>
        <p className={styles.sigNote}>{copy.placeholdersNote}</p>
      </div>

      <div className={styles.sigBlock}>
        <h3 className={styles.sigTitle}>{copy.stepsTitle}</h3>
        <div className={styles.tabs} role="tablist" aria-label={copy.stepsTitle}>
          {copy.steps.map((item) => (
            <button
              type="button"
              role="tab"
              id={`sig-tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`sig-panel-${item.id}`}
              className={styles.tab}
              onClick={() => setTab(item.id)}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`sig-panel-${active.id}`} aria-labelledby={`sig-tab-${active.id}`}>
          <ol className={styles.steps}>
            {active.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <p className={styles.sigNote}>{copy.outlookNote}</p>
      </div>

      <div className={styles.help}>
        <div>
          <p className={styles.helpTitle}>{copy.help.title}</p>
          <p className={styles.helpBody}>{copy.help.body}</p>
        </div>
        <Link href={copy.help.href} className={styles.helpButton}>
          {copy.help.button}
        </Link>
      </div>
    </div>
  );
}
