export const TRANSACTION_REFUND_REQUESTED_SUBSCRIPTION = `
  subscription TransactionRefundRequestedSubscription {
    event {
      ... on TransactionRefundRequested {
        recipient {
          id
          privateMetadata {
            key
            value
          }
          metadata {
            key
            value
          }
        }
        action {
          actionType
          amount
        }
        transaction {
          id
          pspReference
          sourceObject: order {
            id
            languageCodeEnum
            userEmail
            channel {
              id
              slug
              name
              currencyCode
            }
            total {
              gross {
                currency
                amount
              }
            }
          }
        }
      }
    }
  }
`;
