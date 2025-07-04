# Rename this file to `private.auto.tfvars` and fill in the values.
# This file cannot be committed to version control as it contains sensitive information.

# Vercel team ID. Can be found in your Vercel team settings.
vercel_team_id = ""

# Vercel API token. Can be generated in your Vercel account settings.
vercel_api_token = ""

# Map of private environment variables to be set in the Vercel project. Put sensitive information here.
private_environment_variables = {
  "SALEOR_APP_TOKEN": {
    comment = "Required. Saleor app token for the storefront."
    envs_values = [
      {
        value = "CHANGE_ME"
        target = ["production", "preview", "development"]
      }
    ]
  },
  "AUTH_SECRET": {
    comment = "Required. Secret key for authentication."
    envs_values = [
      {
        value = "CHANGE_ME"
        target = ["production", "preview", "development"]
      }
    ]
  },
  "STRIPE_SECRET_KEY": {
    comment = "Required. Secret key for Stripe payments."
    envs_values = [
      {
        value = "CHANGE_ME"
        target = ["production", "preview", "development"]
      }
    ]
  }
}
