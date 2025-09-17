import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useAuth } from "react-oidc-context";
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface RequestRequirements {
  shape: string;
  color: string;
}

interface Request {
  userId: string;
  requestId: string;
  status: string;
  requestDate: string;
  requirements: RequestRequirements;
}


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const auth = useAuth();
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [requests, setRequests] = useState<Request[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setRequestsError(null);

    try {
      const response = await fetch(`/api/request`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.user?.access_token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch requests: ${response.statusText}`);
      }
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      setRequestsError(error instanceof Error ? error.message : 'Failed to fetch requests');
      console.error('Error fetching requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      fetchRequests();
    }
  }, [auth.isLoading, auth.isAuthenticated])

  if (auth.isLoading) {
    return (
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <div>Loading...</div>
        </main>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <div>Encountering error... {auth.error.message}</div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Let Them Draw</title>
        <meta name="description" content="An app to request custom artworks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <h1 className={styles.title}>Let Them Draw</h1>
          <p className={styles.description}>
            An app to request custom artworks
          </p>

          <div className={styles.ctas}>
            {auth.isAuthenticated ? (
              <>
                <button
                  className={styles.primary}
                  onClick={() => router.push('/request')}
                >
                  Create Request
                </button>
                <button
                  className={styles.secondary}
                  onClick={() => auth.removeUser()}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                className={styles.primary}
                onClick={() => auth.signinRedirect()}
              >
                Sign up / Sign in
              </button>
            )}
          </div>

          {auth.isAuthenticated && (
            <div className={styles.requestsSection}>
              <h2 className={styles.sectionTitle}>Your Requests</h2>

              {requestsLoading && (
                <div className={styles.loading}>Loading your requests...</div>
              )}

              {requestsError && (
                <div className={styles.error}>
                  Error: {requestsError}
                  <button
                    className={styles.retryButton}
                    onClick={() => fetchRequests()}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!requestsLoading && !requestsError && requests.length === 0 && (
                <div className={styles.noRequests}>No requests found.</div>
              )}

              {!requestsLoading && !requestsError && requests.length > 0 && (
                <div className={styles.requestsList}>
                  {requests.map((request) => (
                    <div
                      key={request.requestId}
                      className={styles.requestCard}
                      onClick={() => router.push(`/artwork/${request.requestId}`)}
                    >
                      <div className={styles.requestHeader}>
                        <span className={styles.requestId}>#{request.requestId}</span>
                        <span className={`${styles.status} ${styles[`status-${request.status.replace(' ', '-')}`]}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className={styles.requestDate}>
                        {new Date(request.requestDate).toLocaleString()}
                      </div>
                      <div className={styles.requirements}>
                        <strong>Requirements:</strong>
                        <ul>
                          <li>Shape: {request.requirements.shape}</li>
                          <li>Color: {request.requirements.color}</li>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
