import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "react-oidc-context";
import { User } from "oidc-client-ts";

const cognitoAuthConfig = {
  authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  redirect_uri: process.env.NEXT_PUBLIC_LOGOUT_URL,
  response_type: "code",
  scope: "email openid profile",
  onSigninCallback: (_user: User | void): void => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    )
  }
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider {...cognitoAuthConfig}>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
