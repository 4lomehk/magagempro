export interface ResourceItem {
  id: string;
  code: string;
  badge: string;
  title: string;
  description: string;
  url: string;
  category: 'free' | 'premium';
  isFullWidth?: boolean;
  tag?: string;
  icon?: string;
}

export interface PasskeyConfig {
  masterPasskey: string;
  tempPasskey: string;
  tempExpiry: string; // ISO string like '2026-09-07T00:01:00'
  additionalPasskeys: string[];
}

export interface PyramidLayer {
  id: string;
  layerCode: string;
  layerTag: string;
  title: string;
  description: string;
  badgeType: 'rose' | 'emerald' | 'amber';
  widthClass: string;
}

export interface AppContentConfig {
  heroTag: string;
  heroTitleMain: string;
  heroTitleAccent: string;
  heroDeclaration: string;
  heroDeclarationSub: string;
  pyramidTitle: string;
  pyramidSubtitle: string;
  equationText: string;
  stripeUrl: string;
  engUrl: string;
  freeTiersTitle: string;
  premiumTiersTitle: string;
}
