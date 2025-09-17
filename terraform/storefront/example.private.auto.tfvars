# Rename this file to `private.auto.tfvars` and fill in the values.
# This file cannot be committed to version control as it contains sensitive information.

# Can be found in your Vercel team settings - https://vercel.com/YOUR_TEAM_NAME/~/settings.
# Look for the `Team ID` section and copy the ID. Example: `team_1234567890abcdef`.
# Keep it secure and do not share it publicly.
vercel_team_id = "CHANGE_ME"

# Can be generated in your Vercel account settings - https://vercel.com/account/settings/tokens
# Give it a descriptive name, assign a proper scope and expiration date.
# Keep it secure and do not share it publicly.
vercel_api_token = "CHANGE_ME"

# Map of private environment variables to be set in the Vercel project. Put sensitive information here.
private_environment_variables = {
  "SALEOR_APP_TOKEN": {
    comment = "Required. Saleor app token for the storefront."
    sensitive = true
    envs_values = [
      {
        value = "CHANGE_ME"
        target = ["production", "preview"]
      }
    ]
  },
  "AUTH_SECRET": {
    comment = "Required. Secret key for authentication."
    sensitive = true
    envs_values = [
      {
        value = "CHANGE_ME"
        target = ["production", "preview"]
      }
    ]
  },
  "STRIPE_SECRET_KEY": {
    comment = "Required. Secret key for Stripe payments."
    sensitive = true
    envs_values = [
      {
        value = "CHANGE_ME"
        target = ["production", "preview"]
      }
    ]
  }
}
