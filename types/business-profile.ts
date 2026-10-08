export interface WorkspaceBusinessProfile {
  businessName?: string;
  tagline?: string;
  logoUrl?: string | null;
  phone?: string;
  email?: string;
  address?: string;
  socialTwitter?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
}

export function emptyBusinessProfile(): WorkspaceBusinessProfile {
  return {};
}

export function hasBusinessName(profile: WorkspaceBusinessProfile | undefined): boolean {
  return Boolean(profile?.businessName?.trim());
}
