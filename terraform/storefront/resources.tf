resource "vercel_project" "storefront" {
  name                         = var.vercel_project_name
  framework                    = "nextjs"
  root_directory               = "apps/storefront"
  node_version                 = "22.x"
  build_command                = "turbo run build --filter=storefront"
  prioritise_production_builds = true
  auto_assign_custom_domains   = false

  git_repository = {
    type              = "github"
    repo              = var.github_repository
    production_branch = var.github_production_branch
  }
}

resource "vercel_project_domain" "branch_specific_domains" {
  for_each = { for env in var.additional_environments : env.domain => env }

  project_id = vercel_project.storefront.id
  domain     = each.value.domain
  git_branch = each.value.git_branch
}

locals {
  all_environment_variables = merge(
    var.public_environment_variables,
    var.private_environment_variables
  )

  flat_env_vars = flatten([
    for env_key, env_details in local.all_environment_variables : [
      for env_value in env_details.envs_values : {
        key        = env_key
        comment    = env_details.comment
        sensitive  = env_details.sensitive
        value      = env_value.value
        target     = env_value.target
        git_branch = env_value.git_branch
      }
    ]
  ])

  env_vars_for_each = {
    for item in local.flat_env_vars :
    "${item.key}-${join("-", item.target)}-${coalesce(item.git_branch, "all-branches")}" => item
  }
}

resource "vercel_project_environment_variable" "env_variables" {
  project_id = vercel_project.storefront.id
  for_each   = local.env_vars_for_each

  key        = each.value.key
  value      = each.value.value
  target     = each.value.target
  git_branch = each.value.git_branch
  sensitive  = each.value.sensitive
}
