import { FormEvent, useEffect, useId, useRef, useState } from 'react';

const BUTTONDOWN_USERNAME = import.meta.env.VITE_BUTTONDOWN_USERNAME || 'wraithprotocol';
const BUTTONDOWN_SUBSCRIBE_URL = `https://buttondown.email/${BUTTONDOWN_USERNAME}/subscribe`;

interface NewsletterSignupProps {
  compact?: boolean;
}

type Status = 'idle' | 'loading' | 'success' | 'error' | 'spam';

export default function NewsletterSignup({ compact = false }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const hasLoadedInitialIframe = useRef(false);
  const id = useId();
  const iframeName = `buttondown-subscribe-iframe-${id}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (honeypot.trim()) {
      event.preventDefault();
      setStatus('spam');
      return;
    }

    if (!email.trim()) {
      event.preventDefault();
      setStatus('error');
      setMessage('Enter a valid email to subscribe.');
      return;
    }

    setStatus('loading');
    setMessage('');
    setSubmitted(true);
  };

  const handleIframeLoad = () => {
    if (!hasLoadedInitialIframe.current) {
      hasLoadedInitialIframe.current = true;
      return;
    }

    if (!submitted) {
      return;
    }

    setSubmitted(false);
    setStatus('success');
    setEmail('');
    setMessage('Thanks! Please check your email to confirm your subscription.');
  };

  useEffect(() => {
    if (status !== 'success') {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 12000);

    return () => window.clearTimeout(timeout);
  }, [status]);

  const wrapperClassName = compact
    ? 'flex flex-col gap-3 rounded-none border border-outline-variant bg-surface-container p-5'
    : 'flex flex-col gap-4 rounded-none border border-outline-variant bg-surface-container p-6';

  return (
    <section className={wrapperClassName} aria-labelledby="newsletter-heading">
      <div className="flex flex-col gap-2">
        <h2
          id="newsletter-heading"
          className={`font-heading text-[20px] font-bold tracking-[-0.8px] text-on-surface ${
            compact ? 'text-[18px]' : 'text-[24px]'
          }`}
        >
          Join our updates.
        </h2>
        <p className="max-w-[36rem] font-body text-[13px] leading-[1.7] text-on-surface-variant">
          Get monthly launch news, product updates, and privacy notes. Double opt-in keeps your inbox clean.
        </p>
      </div>

      <form
        action={BUTTONDOWN_SUBSCRIBE_URL}
        method="post"
        target={iframeName}
        className="flex flex-col gap-3"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-2">
          <label className="sr-only" htmlFor={`newsletter-email-${id}`}>
            Email address
          </label>
          <input
            id={`newsletter-email-${id}`}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className="h-12 w-full border border-outline-variant bg-surface px-4 text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
          <input
            id={`newsletter-hp-${id}`}
            name="hp"
            type="text"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute left-[-9999px] h-px w-px opacity-0"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex h-12 items-center justify-center bg-primary px-6 font-heading text-[13px] font-semibold uppercase tracking-[1.5px] text-surface transition duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Subscribe
          </button>
          <span className="font-body text-[12px] leading-[1.6] text-outline">
            We send monthly updates. Unsubscribe anytime. We never share your email.
          </span>
        </div>

        <div aria-live="polite" className="min-h-[1.5rem]">
          {status === 'success' && (
            <p className="font-body text-[13px] leading-[1.6] text-tertiary">
              {message}
            </p>
          )}
          {status === 'error' && (
            <p className="font-body text-[13px] leading-[1.6] text-error">{message}</p>
          )}
          {status === 'spam' && (
            <p className="font-body text-[13px] leading-[1.6] text-outline">
              Thank you.
            </p>
          )}
          {status === 'loading' && (
            <p className="font-body text-[13px] leading-[1.6] text-on-surface-variant">
              Sending your request…
            </p>
          )}
        </div>

        <input type="hidden" name="embed" value="1" />
      </form>

      <iframe
        name={iframeName}
        title="Newsletter signup response"
        className="hidden"
        onLoad={handleIframeLoad}
      />
    </section>
  );
}
