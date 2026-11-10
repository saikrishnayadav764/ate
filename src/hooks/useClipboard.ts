import { useState, useCallback } from 'react';

export function useClipboard(timeout = 2000) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, id: string) => {
      let succeeded = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(text);
            succeeded = true;
          } catch {
            // fallback if permission denied
          }
        }

        if (!succeeded) {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          succeeded = document.execCommand('copy');
          document.body.removeChild(textArea);
        }
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
      }

      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, timeout);
      return true;
    },
    [timeout]
  );

  return { copiedId, copy };
}
