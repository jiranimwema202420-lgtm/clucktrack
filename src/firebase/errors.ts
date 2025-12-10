'use client';

/**
 * Defines the context for a security rule violation.
 */
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

/**
 * A custom error class for Firestore permission errors.
 * It enriches the standard error with contextual information about the failed request.
 */
export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  public readonly rulesDenyReason?: string;

  constructor(context: SecurityRuleContext, serverError?: Error) {
    const message = `Firestore permission denied for ${context.operation} on ${context.path}`;
    super(message);

    this.name = 'FirestorePermissionError';
    this.context = context;

    // Preserve the original stack trace if available
    if (serverError) {
      this.stack = serverError.stack;
    }

    // A more specific reason if the rules explicitly provide one.
    // This is a placeholder for potential future enhancements in Firebase.
    this.rulesDenyReason = undefined; 
  }

  /**
   * Generates a detailed string representation of the error, useful for debugging.
   */
  public toString(): string {
    const requestDataString = this.context.requestResourceData
      ? `
Request Data:
${JSON.stringify(this.context.requestResourceData, null, 2)}`
      : '';

    return `
Firestore Permission Error:
---------------------------
Operation: ${this.context.operation.toUpperCase()}
Path:      ${this.context.path}${requestDataString}
`;
  }
}
