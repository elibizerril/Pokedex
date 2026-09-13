$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$site = 'dist/pokedex/browser'
$deployBranch = 'gh-pages'
$worktree = '.deploy-ghpages'
$siteUrl = 'https://elibizerril.github.io/Pokedex/'

Set-Location $repo

# 1) Build apontando os assets para o caminho do GitHub Pages
npm run build -- --base-href /Pokedex/
if ($LASTEXITCODE -ne 0) { throw 'Build falhou' }

# 2) Cria a branch gh-pages se ainda não existir
git rev-parse --verify $deployBranch *> $null
if ($LASTEXITCODE -ne 0) {
  git checkout --orphan $deployBranch
  git rm -rf -q . *> $null
  git commit --allow-empty -m "deploy: base"
  git checkout main
}

# 3) Worktree temporário da branch gh-pages
if (Test-Path $worktree) { git worktree remove $worktree --force *> $null }
git worktree prune
git worktree add $worktree $deployBranch

# 4) Substitui o conteúdo pelo site novo + fallback do SPA (404.html)
Get-ChildItem -Path $worktree -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force
Copy-Item "$site/*" $worktree -Recurse
Copy-Item "$site/index.html" "$worktree/404.html"
Copy-Item ".gitattributes" "$worktree/"

# 5) Commit e push apenas se houve mudança
$changed = (git -C $worktree status --porcelain 2>$null | Measure-Object -Line).Lines -gt 0
if ($changed) {
  git -C $worktree add -A
  git -C $worktree commit -m "deploy: atualizar site"
  git -C $worktree push origin $deployBranch
} else {
  Write-Host "Nada mudou - site já está atualizado."
}

# 6) Limpeza
git worktree remove $worktree --force *> $null
git worktree prune

Write-Host "Deploy concluído: $siteUrl"