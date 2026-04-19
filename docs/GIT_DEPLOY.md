# Git-based deploy

## Flow

```txt
local branch -> push staging -> staging deploy -> merge main -> production deploy
```

```mermaid
flowchart LR
  Local["Local changes"] --> StagingBranch["staging branch"]
  StagingBranch --> StagingDeploy["GitHub Actions deploy staging"]
  StagingDeploy --> Check["Check staging.chainso.ru"]
  Check --> Main["main branch"]
  Main --> ProdDeploy["GitHub Actions deploy production"]
```

## Branches

```txt
staging
Deploys to https://staging.chainso.ru

main
Deploys to production:
https://chainso.ru
https://golover.chainso.ru
https://lover.chainso.ru
```

## GitHub Secrets

Repository secrets required by `.github/workflows/deploy.yml`:

```txt
VPS_HOST
2.26.28.68

VPS_USER
deploy

VPS_SSH_KEY
Private SSH key allowed to connect as deploy.
```

The private key for GitHub Actions is stored locally at:

```txt
/Users/giovanni/.ssh/chainso_github_actions
```

Its public key is already added to:

```txt
deploy@2.26.28.68:~/.ssh/authorized_keys
```

## Daily workflow

Deploy staging:

```bash
git switch staging
git merge your-feature-branch
git push origin staging
```

Deploy production after staging is checked:

```bash
git switch main
git merge staging
git push origin main
```

## Manual deploy

GitHub also supports manual deploy from the Actions tab:

```txt
Actions -> Deploy -> Run workflow -> staging or production
```

## Local emergency deploy

If GitHub Actions is unavailable, local deploy scripts still work:

```bash
VPS_HOST=2.26.28.68 ./scripts/deploy-staging-vps.sh
VPS_HOST=2.26.28.68 ./scripts/deploy-production-vps.sh
```
