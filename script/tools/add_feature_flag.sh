#!/usr/bin/env bash
set -e
# shellcheck disable=SC3040
set -o pipefail

# Add Feature Flag
#
# Adds a boolean feature flag to the config, local env files and helm values.
#
# Values per location:
#   server/config.ts                                    default 'false'
#   .env.example, feature.env                           true
#   helm_deploy/hmpps-community-payback-ui/values.yaml  'true'
#   helm_deploy/values-prod.yaml                        'false'
#
# The config key is the camelCased env var name, so include _ENABLED in the
# name if the key should end in 'Enabled'.
#
# $1 env var name, e.g. TRAVEL_TIME_ENABLED

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

usage() {
  echo "Usage: $0 FLAG_NAME (e.g. TRAVEL_TIME_ENABLED)" >&2
  exit 1
}

[ "$#" -eq 1 ] || usage
flag="$1"
[[ "$flag" =~ ^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$ ]] || { echo "Flag name must be UPPER_SNAKE_CASE" >&2; usage; }

key="$(echo "$flag" | awk -F_ '{ out = tolower($1); for (i = 2; i <= NF; i++) out = out toupper(substr($i, 1, 1)) tolower(substr($i, 2)); print out }')"

config="$root/server/config.ts"
env_files=("$root/.env.example" "$root/feature.env")
values="$root/helm_deploy/hmpps-community-payback-ui/values.yaml"
values_prod="$root/helm_deploy/values-prod.yaml"

for file in "$config" "${env_files[@]}" "$values" "$values_prod"; do
  if grep -qFw "$flag" "$file"; then
    echo "Flag $flag already exists in $file" >&2
    exit 1
  fi
done

if grep -qE "^[[:space:]]+$key:" "$config"; then
  echo "Config key $key already exists in $config" >&2
  exit 1
fi

# $1 file, $2 line to insert, $3 awk regex of the line to insert after
insert_after_last_match() {
  local tmp
  tmp="$(mktemp)"
  awk -v line="$2" -v pattern="$3" '
    { lines[NR] = $0; if ($0 ~ pattern) last = NR }
    END {
      if (!last) exit 1
      for (i = 1; i <= NR; i++) { print lines[i]; if (i == last) print line }
    }' "$1" > "$tmp" || { rm -f "$tmp"; echo "Could not find insertion point in $1" >&2; exit 1; }
  cat "$tmp" > "$1"
  rm -f "$tmp"
}

echo ""
echo "==> Adding feature flag $flag (config key '$key')"

echo "==> $config"
tmp="$(mktemp)"
awk -v line="    $key: get('$flag', 'false') === 'true'," '
  /featureFlags: \{/ { inFlags = 1 }
  inFlags && /^  \},?$/ { print line; inFlags = 0; done = 1 }
  { print }
  END { if (!done) exit 1 }' "$config" > "$tmp" || { rm -f "$tmp"; echo "Could not find featureFlags block in $config" >&2; exit 1; }
cat "$tmp" > "$config"
rm -f "$tmp"

for file in "${env_files[@]}"; do
  echo "==> $file"
  [ -z "$(tail -c1 "$file")" ] || echo "" >> "$file"
  echo "$flag=true" >> "$file"
done

echo "==> $values"
insert_after_last_match "$values" "    $flag: 'true'" "^    [A-Z_]+: '(true|false)'$"

echo "==> $values_prod"
insert_after_last_match "$values_prod" "    $flag: 'false'" "^    [A-Z_]+: '(true|false)'$"

echo ""
echo "==> Done. You can now use the feature flag in the application code: \`"config.featureFlags.$key"\`"
echo ""
echo "==> Feature flags should also be added manually to the relevant cp-stack .env template to enable new features in local development."
