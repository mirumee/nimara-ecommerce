# Rename this file to `public.auto.tfvars` and fill in the values.
# This file can be committed to version control as it should contain only public information.

# GitHub repository for the Vercel project.
github_repository = ""

# Repository branch to deploy to production. Defaults to "main".
github_production_branch = "main"

# Vercel project name. If not set, it will default to "nimara-ecommerce".
vercel_project_name = "nimara-ecommerce"

# Optional. List of additional environments with their configurations.
additional_environments = []

# Map of public environment variables to be set in the Vercel project.
public_environment_variables = {
  "NEXT_PUBLIC_SALEOR_API_URL" = {
    comment = "Required. Public Saleor API URL for the storefront."
    envs_values = [
      {
        value = "https://{YOUR_SALEOR_DOMAIN}/graphql/"
        target = ["production", "preview", "development"]
      }
    ]
  },
  "NEXT_PUBLIC_DEFAULT_CHANNEL" = {
    comment = "Required. Default channel slug for the storefront."
    envs_values = [
      {
        value = "CHANGE_ME"
        target = ["production", "preview", "development"]
      }]
  },
  "NEXT_PUBLIC_STOREFRONT_URL" = {
    comment = "Required. Public URL of the storefront"
    envs_values = [
      {
        value = "https://{YOUR_STOREFRONT_DOMAIN}"
        target = ["production", "preview", "development"]
      }
    ]
  }
  "NEXT_PUBLIC_STRIPE_PUBLIC_KEY" = {
    comment = "Required. Public Stripe key for the storefront"
    envs_values = [
      {
        value = "CHANGE_ME"
        target = ["production", "preview", "development"]
      }
    ]
  },
}
