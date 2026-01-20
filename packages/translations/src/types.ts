// Export the message type from the default locale (en-US)
// This allows other packages to use the strongly-typed message structure
export type Messages = typeof import("./messages/en-US.json");

// Export IntlMessages type for use in global declarations
export type IntlMessages = Messages;
