import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Artwork.module.css";
import { useAuth } from "react-oidc-context";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface RequestRequirements {
  shape: string;
  color: string;
}


interface ArtworkResponse {
  userId: string;
  requestId: string;
  status: string;
  requestDate: string;
  requirements: RequestRequirements;
  artworkUrl: string;
}

export default function Artwork() {
  const auth = useAuth();
  const router = useRouter();
  const { requestId } = router.query;

  const [artworkData, setArtworkData] = useState<ArtworkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/');
      return;
    }

    if (auth.isAuthenticated && auth.user?.profile?.sub && requestId) {
      fetchArtworkData();
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user?.profile?.sub, requestId]);

  const fetchArtworkData = async () => {
    if (!auth.user?.profile?.sub || !requestId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/request/${encodeURIComponent(auth.user.profile.sub)}/${encodeURIComponent(requestId as string)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.user?.access_token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch artwork: ${response.statusText}`);
      }
      const data: ArtworkResponse = await response.json();
      setArtworkData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch artwork data');
      console.error('Error fetching artwork data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (auth.isLoading || loading) {
    return (
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <div className={styles.loading}>Loading artwork...</div>
        </main>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <div className={styles.error}>Authentication error: {auth.error.message}</div>
        </main>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    router.push('/');
    return null;
  }

  if (error) {
    return (
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <div className={styles.error}>
            Error: {error}
            <button
              className={styles.retryButton}
              onClick={fetchArtworkData}
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!artworkData) {
    return (
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <div className={styles.error}>Artwork not found</div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Artwork #{artworkData.requestId} - Let Them Draw</title>
        <meta name="description" content={`View artwork for request #${artworkData.requestId}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>Artwork #{artworkData.requestId}</h1>
            <button
              className={styles.backButton}
              onClick={() => router.push('/')}
            >
              ← Back to Requests
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.artworkSection}>
              <h2 className={styles.sectionTitle}>Generated Artwork</h2>
              {artworkData.artworkUrl ? (
                <div className={styles.imageContainer}>
                  <Image
                    src={artworkData.artworkUrl}
                    alt={`Generated artwork for request #${artworkData.requestId}`}
                    width={400}
                    height={400}
                    className={styles.artworkImage}
                    priority
                  />
                </div>
              ) : (
                <div className={styles.noImage}>
                  No image available for this request
                </div>
              )}
            </div>

            <div className={styles.detailsSection}>
              <h2 className={styles.sectionTitle}>Request Details</h2>
              <div className={styles.detailsCard}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Request ID:</span>
                  <span className={styles.detailValue}>#{artworkData.requestId}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status:</span>
                  <span className={`${styles.status} ${styles[`status-${artworkData.status}`]}`}>
                    {artworkData.status}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Request Date:</span>
                  <span className={styles.detailValue}>
                    {new Date(artworkData.requestDate).toLocaleString()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Shape:</span>
                  <span className={styles.detailValue}>
                    {artworkData.requirements.shape.charAt(0).toUpperCase() + artworkData.requirements.shape.slice(1)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Color:</span>
                  <span className={styles.detailValue}>
                    {artworkData.requirements.color.charAt(0).toUpperCase() + artworkData.requirements.color.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
