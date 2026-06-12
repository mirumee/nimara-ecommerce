import type {
  ConsentCategories,
  ConsentCategory,
} from "@nimara/infrastructure/use-cases/tracking/types/update-consent";

export type { ConsentCategories, ConsentCategory };

export const CONSENT_VERSION = 1;

export type ConsentRecord = {
  categories: ConsentCategories;
  version: number;
};

export const DEFAULT_CONSENT: ConsentCategories = {
  necessary: true,
  analytics: false,
};

export const ACCEPT_ALL_CONSENT: ConsentCategories = {
  necessary: true,
  analytics: true,
};

export const REJECT_ALL_CONSENT: ConsentCategories = {
  necessary: true,
  analytics: false,
};
