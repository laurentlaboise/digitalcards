import { SubscriptionTier } from '../../entities';

export const TIER_QUOTAS: Record<
  SubscriptionTier,
  {
    maxProfiles: number;
    analyticsRetentionDays: number;
    storageGb: number;
    leadForms: boolean;
    autoFollowups: boolean;
    crmIntegrations: boolean;
    customDomains: number;
    bulkOperations: boolean;
    auditLogs: boolean;
    directorySync: boolean;
    removeBranding: boolean;
  }
> = {
  [SubscriptionTier.FREE]: {
    maxProfiles: 3,
    analyticsRetentionDays: 30,
    storageGb: 1,
    leadForms: false,
    autoFollowups: false,
    crmIntegrations: false,
    customDomains: 0,
    bulkOperations: false,
    auditLogs: false,
    directorySync: false,
    removeBranding: false,
  },
  [SubscriptionTier.PRO]: {
    maxProfiles: -1, // unlimited
    analyticsRetentionDays: 365,
    storageGb: 10,
    leadForms: true,
    autoFollowups: true,
    crmIntegrations: true,
    customDomains: 1,
    bulkOperations: false,
    auditLogs: false,
    directorySync: false,
    removeBranding: true,
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxProfiles: -1, // unlimited
    analyticsRetentionDays: 365,
    storageGb: 100,
    leadForms: true,
    autoFollowups: true,
    crmIntegrations: true,
    customDomains: -1, // unlimited
    bulkOperations: true,
    auditLogs: true,
    directorySync: true,
    removeBranding: true,
  },
};
