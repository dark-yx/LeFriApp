import { google } from 'googleapis';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  locale?: string;
}

export class GoogleAuthService {
  private oauth2Client: any;

  constructor() {
    this.initializeOAuth();
  }

  private initializeOAuth() {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "98044249097-nb4uke2c4kqtdpugfh3k7j389lnrpk0u.apps.googleusercontent.com";
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "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";
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || "https://13bdfc0f-2930-480d-ac76-0397ba470571-00-9cq2i952niuv.picard.replit.dev/api/auth/google/callback";

    console.log('Initializing Google OAuth with:', { clientId, redirectUri });

    if (!clientId || !clientSecret || !redirectUri) {
      console.warn('Google OAuth not configured - missing environment variables');
      return;
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    
    console.log('Google OAuth configured successfully');
  }

  getAuthUrl(): string {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true
    });
  }

  async getUserInfo(code: string): Promise<GoogleUserInfo> {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2'
      });

      const { data } = await oauth2.userinfo.get();

      return {
        id: data.id!,
        email: data.email!,
        name: data.name!,
        picture: data.picture || undefined,
        locale: data.locale || undefined
      };
    } catch (error) {
      console.error('Error getting user info from Google:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  isConfigured(): boolean {
    return !!this.oauth2Client;
  }
}

export const googleAuthService = new GoogleAuthService();