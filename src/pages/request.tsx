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

interface Shape {
  shape: string;
  price: string;
}

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
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [shapesLoading, setShapesLoading] = useState(true);
  const [shapesError, setShapesError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  useEffect(() => {
    const fetchShapes = async () => {
      try {
        setShapesLoading(true);
        setShapesError(null);

        const response = await fetch('/api/shapes', {
          headers: {
            'Authorization': `Bearer ${auth.user?.access_token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch shapes');
        }

        const shapesData = await response.json();
        setShapes(shapesData);

        if (shapesData.length > 0) {
          setShape(shapesData[0].shape);
        }
      } catch (error) {
        setShapesError(error instanceof Error ? error.message : 'Failed to load shapes');
        setShapes([]);
      } finally {
        setShapesLoading(false);
      }
    };

    if (auth.isAuthenticated && auth.user?.access_token) {
      fetchShapes();
    }
  }, [auth.isAuthenticated, auth.user?.access_token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.user?.profile?.sub) {
      setSubmitError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create request');
      }
      router.push(data.url);
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
              {shapesLoading ? (
                <div className={styles.loading}>Loading shapes...</div>
              ) : shapesError ? (
                <div className={styles.error}>Error loading shapes: {shapesError}</div>
              ) : (
                <select
                  id="shape"
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                  className={styles.select}
                >
                  {shapes.map((shapeOption) => (
                    <option key={shapeOption.shape} value={shapeOption.shape}>
                      {shapeOption.shape} - {shapeOption.price === '0' ? 'Free' : `$${(parseInt(shapeOption.price) / 100).toFixed(2)}`}
                    </option>
                  ))}
                </select>
              )}
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
