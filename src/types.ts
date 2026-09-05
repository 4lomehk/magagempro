export interface ResourceAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // Text content or Base64
  uploadedAt: string;
}

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
  docType?: 'html' | 'html5' | 'web_app' | 'markdown' | 'gem' | 'skill' | 'link';
  codePayload?: string;
  attachments?: ResourceAttachment[];
  createdAt?: string;
  enEquivalentId?: string;
}

export interface GemSkillPackage {
  id: string;
  type: 'gem' | 'prompt' | 'skill';
  title: string;
  description: string;
  content: string; // System instructions, prompt markdown, or skill YAML+MD
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  author?: string;
  version?: string;
}

export interface GenerationRecord {
  id: string;
  timestamp: string;
  code: string;
  title: string;
  enTitle?: string;
  category: 'free' | 'premium';
  docType: 'html' | 'html5' | 'web_app' | 'markdown' | 'gem' | 'skill' | 'link';
  status: 'saved' | 'exported';
  hasCoding: boolean;
  hasAttachment: boolean;
  attachmentName?: string;
  url?: string;
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
