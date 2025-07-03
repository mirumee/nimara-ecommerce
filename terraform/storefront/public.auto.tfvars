# GitHub repository for the Vercel project.
github_repository = ""

# Vercel project name. If not set, it will default to "nimara-ecommerce".
vercel_project_name = ""

# Optional. List of additional environments with their configurations.
additional_environments = []

# Map of public environment variables to be set in the Vercel project.
public_environment_variables = {
  "NEXT_PUBLIC_SALEOR_API_URL" = {
    comment = "Public Saleor API URL for the storefront"
    envs_values = [
      {
        value = "https://{YOUR_SALEOR_DOMAIN}/graphql/"
        target = ["production", "preview", "development"]
      }
    ]
  },
  "NEXT_PUBLIC_DEFAULT_CHANNEL" = {
    comment = "Default channel slug for the storefront"
    envs_values = [
      {
        value = "default-channel"
        target = ["production", "preview", "development"]
      }]
  },
  "NEXT_PUBLIC_STOREFRONT_URL" = {
    comment = "Public URL of the storefront"
    envs_values = [
      {
        value = "https://{YOUR_STOREFRONT_DOMAIN}"
        target = ["production", "preview", "development"]
      }
    ]
  }
  "NEXT_PUBLIC_STRIPE_PUBLIC_KEY" = {
    comment = "Public Stripe key for the storefront"
    envs_values = [
      {
        value = "CHANGE_ME"
        target = ["production", "preview", "development"]
      }
    ]
  },
  "NEXT_PUBLIC_PAYMENT_APP_ID": {
    comment = "Public ID of the payment app for the storefront"
    envs_values = [
      {
        value = "CHANGE_ME"
        target = ["production", "preview", "development"]
      }
    ]
  }
}
