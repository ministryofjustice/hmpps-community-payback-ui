#!/usr/bin/env bash
set -e
# shellcheck disable=SC3040
set -o pipefail

# Add Feature Flag
#
# Adds a boolean feature flag to the config, local env files and helm values.
# See utils/addFeatureFlag.js for the value set in each file.
#
# $1 env var name, e.g. TRAVEL_TIME_ENABLED


if ! command -v npm &> /dev/null; then
  echo "npm is required to run this script" >&2
  exit 1
fi

cd "$(dirname "$0")/../.."
node script/tools/utils/addFeatureFlag.js "$@"
