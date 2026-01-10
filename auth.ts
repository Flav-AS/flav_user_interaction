import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        console.log("=== JWT Callback - Account Info ===");
        console.log("Access Token:", account.access_token);
        console.log("Token Type:", account.token_type);
        console.log("Expires At:", account.expires_at);
        console.log("Refresh Token:", account.refresh_token ? "Present" : "Not present");
        console.log("===================================");

        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      console.log("=== Session Callback ===");
      console.log("Access Token from JWT:", token.accessToken);
      console.log("User:", session.user?.email);
      console.log("========================");

      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.expiresAt = token.expiresAt as number;
      return session;
    }
  }
})