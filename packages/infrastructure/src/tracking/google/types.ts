export type DataLayerEntry = Record<string, unknown> | unknown[];

export type DataLayerWindow = Window & {
  dataLayer?: DataLayerEntry[];
};
