import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Request.module.css";
import { useAuth } from "react-oidc-context";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const COLORS = [
  'red', 'blue', 'green', 'yellow', 'orange',
  'purple', 'pink', 'brown', 'black'
];

const SHAPES = ['square', 'circle', 'hypnotic squares', 'tiled lines'];

interface RequestRequirements {
  shape: string;
  color: string;
}

export default function Request() {
  const auth = useAuth();
  const router = useRouter();
  const [shape, setShape] = useState<string>('circle');
  const [color, setColor] = useState<string>('blue');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.user?.profile?.sub) {
      setSubmitError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const requestId = uuidv4();
      const requirements: RequestRequirements = { shape, color };

      const response = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.user?.access_token}`
        },
        body: JSON.stringify({
          requestId,
          requirements,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }

      setSubmitSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        setShape('circle');
        setColor('blue');
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (auth.isLoading) {
    return (
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <div>Loading...</div>
        </main>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return null; // Will redirect to home
  }

  return (
    <>
      <Head>
        <title>Create Request - Let Them Draw</title>
        <meta name="description" content="Create a new artwork request" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <h1 className={styles.title}>Create New Request</h1>
          <p className={styles.description}>
            Specify the requirements for your custom artwork
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="shape" className={styles.label}>
                Shape
              </label>
              <div className={styles.radioGroup}>
                {SHAPES.map((shapeOption) => (
                  <label key={shapeOption} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="shape"
                      value={shapeOption}
                      checked={shape === shapeOption}
                      onChange={(e) => setShape(e.target.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>
                      {shapeOption}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="color" className={styles.label}>
                Color
              </label>
              <select
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={styles.select}
              >
                {COLORS.map((colorOption) => (
                  <option key={colorOption} value={colorOption}>
                    {colorOption.charAt(0).toUpperCase() + colorOption.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {submitError && (
              <div className={styles.error}>
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className={styles.success}>
                Request created successfully! You can create another request or go back to view your requests.
              </div>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => router.push('/')}
                className={styles.secondary}
                disabled={isSubmitting}
              >
                Back to Home
              </button>
              <button
                type="submit"
                className={styles.primary}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
