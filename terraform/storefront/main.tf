terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 3.7.0"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}
