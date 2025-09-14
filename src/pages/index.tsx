import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useAuth } from "react-oidc-context";
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'


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

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && (searchParams.has('code') || searchParams.has('state'))) {
      const nextSearchParams = new URLSearchParams(searchParams.toString())
      nextSearchParams.delete('code')
      nextSearchParams.delete('state')
      const paramsString = nextSearchParams.toString();
      router.replace(paramsString ? `${pathname}?${paramsString}` : pathname);
    }
  }, [auth.isLoading, auth.isAuthenticated, router, pathname, searchParams])

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
              <button
                className={styles.primary}
                onClick={() => auth.removeUser()}
              >
                Sign out
              </button>
            ) : (
              <button
                className={styles.primary}
                onClick={() => auth.signinRedirect()}
              >
                Sign up / Sign in
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
