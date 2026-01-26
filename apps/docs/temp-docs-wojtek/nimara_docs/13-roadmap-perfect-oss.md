# Roadmap to a “Perfect Open Source Repo”

## Milestone 1: Thin storefront
- finish extracting features from app into packages
- remove bad imports in packages
- normalize actions into `.core.ts` + app wrappers

## Milestone 2: Clean architecture layers
- introduce `application` layer with ports
- move provider-specific code to integrations/adapters
- enforce boundaries with ESLint

## Milestone 3: Profiles and dummy providers
- local dev profile works without real keys
- health endpoints + smoke tests

## Milestone 4: Manifests + recipes
- declarative integration manifests
- recipe validation

## Milestone 5: CLI v0 + examples
- `init`, `add`, `override`
- 1–2 example projects

## Milestone 6: v0-like builder MVP
- compose storefront/marketplace blocks
- pick providers
- generate repo + instructions

## Milestone 7: Docs + marketing alignment
- docs follow developer journey
- website pages match architecture narrative
