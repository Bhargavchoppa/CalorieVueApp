$ErrorActionPreference = 'Stop'
$package = Get-Content package.json -Raw | ConvertFrom-Json
$forbidden = @('@google/genai','@supabase/supabase-js','stripe','@stripe/stripe-js','@stripe/react-stripe-js')
foreach ($name in $forbidden) {
  if ($package.dependencies.PSObject.Properties.Name -contains $name) { throw "Forbidden runtime dependency found: $name" }
}
$source = Get-ChildItem app,src -Recurse -File | Get-Content -Raw | Out-String
foreach ($pattern in @('GoogleGenAI','@google/genai','@supabase/supabase-js','supabase.co','GEMINI_API_KEY')) {
  if ($source.Contains($pattern)) { throw "Forbidden integration found in app source: $pattern" }
}
Write-Host 'Offline source audit passed: no Gemini or Supabase integrations found in runtime source.' -ForegroundColor Green
