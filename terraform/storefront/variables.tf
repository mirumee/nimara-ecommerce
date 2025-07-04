variable "vercel_api_token" {
  description = "Vercel API token for authentication. Can be found in your Vercel account settings."
  type        = string
  sensitive   = true
  ephemeral   = true
}

variable "vercel_team_id" {
  description = "Vercel team ID for team-specific resources. Can be found in your Vercel team settings."
  type        = string
  sensitive   = true
  ephemeral   = true
}

variable "github_repository" {
  description = "GitHub repository for the Vercel project. This should be in the format 'owner/repo'."
  type        = string

  validation {
    condition     = can(regex("^[^/]+/[^/]+$", var.github_repository))
    error_message = "GitHub repository must be in the format 'owner/repo'."
  }
}

variable "github_production_branch" {
  description = "Repository branch to deploy to production. Defaults to 'main'."
  type        = string
  default     = "main"
}

variable "vercel_project_name" {
  description = "Name of the project visible in Vercel. Must be unique within the team."
  type        = string
  default     = "nimara-ecommerce"
  validation {
    condition     = can(regex("^[a-zA-Z0-9-]+$", var.vercel_project_name))
    error_message = "Project name must contain only alphanumeric characters and hyphens."
  }
}

variable "additional_environments" {
  description = "List of additional environments with their configurations. Each environment must have a name, git branch, and domain."
  type = list(object({
    name       = string
    git_branch = string
    domain     = string
  }))
  default = []
}

variable "public_environment_variables" {
  description = "Map of public environment variables to be set in the Vercel project. Each key is the variable name, and the value is an object containing comments and environment-specific values."
  type = map(object({
    comment   = optional(string)
    sensitive = optional(bool, false)
    envs_values = list(object({
      value      = string
      target     = optional(list(string), ["production", "preview", "development"])
      git_branch = optional(string, null)
    }))
  }))
  default = {}
}

variable "private_environment_variables" {
  description = "Map of private environment variables to be set in the Vercel project. Each key is the variable name, and the value is an object containing comments and environment-specific values."
  type = map(object({
    comment   = optional(string)
    sensitive = optional(bool, true)
    envs_values = list(object({
      value      = string
      target     = optional(list(string), ["production", "preview", "development"])
      git_branch = optional(string, null)
    }))
  }))
  default = {}
}
