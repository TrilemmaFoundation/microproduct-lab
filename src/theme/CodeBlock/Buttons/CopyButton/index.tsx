import { useEffect, useRef, useState } from 'react';
import { useCodeBlockContext } from '@docusaurus/theme-common/internal';
import Button from '@theme/CodeBlock/Buttons/Button';
import type { Props } from '@theme/CodeBlock/Buttons/CopyButton';

export default function CopyButton({ className }: Props) {
  const { metadata: { code } } = useCodeBlockContext();
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; clearTimeout(timer.current); }, []);
  async function copy() {
    const request = ++generation.current;
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      if (request !== generation.current) return;
      setState('copied');
      timer.current = setTimeout(() => setState('idle'), 2000);
    } catch {
      if (request === generation.current) setState('error');
    }
  }
  const message = state === 'copied' ? 'Code copied to clipboard.' : state === 'error' ? 'Copy failed. Select the code and copy it manually, or try again.' : '';
  return <>
    <Button className={`${className ?? ''} code-copy-button`} onClick={copy} aria-label={state === 'error' ? 'Try copying code again' : 'Copy code to clipboard'} title={message || 'Copy code to clipboard'}>
      {state === 'copied' ? 'Copied' : state === 'error' ? 'Try again' : 'Copy'}
    </Button>
    <span className="foundation-sr-only" role="status" aria-live="polite">{message}</span>
  </>;
}
