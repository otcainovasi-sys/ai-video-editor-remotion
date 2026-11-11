param([Parameter(ValueFromRemainingArguments=$true)][string[]]$CliArgs)
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$env:TEMP = Join-Path $repoRoot '.sementara'
$env:TMP = $env:TEMP
$env:HYPERFRAMES_NO_TELEMETRY = '1'
$env:HYPERFRAMES_NO_UPDATE_CHECK = '1'
$env:HYPERFRAMES_CONFIG_DIR = Join-Path $repoRoot '.sementara/hyperframes-config'
$env:HYPERFRAMES_CACHE_DIR = Join-Path $repoRoot '.sementara/hyperframes-cache'
$env:HYPERFRAMES_BROWSER_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:npm_config_cache = Join-Path $repoRoot '.sementara/npm-cache'
$cli = Join-Path $repoRoot '.sementara/npm-cache/_npx/702923228c2ce1e6/node_modules/hyperframes/dist/cli.js'
& node $cli @CliArgs
exit $LASTEXITCODE
