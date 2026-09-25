#!/usr/bin/env bash
set -e

echo "Creating temporary directory..."
cd "$(dirname "$0")/../../"
mkdir -p .temp

echo "Copying repo into temporary directory..."
cp -r ../hmpps-probation-integration-e2e-tests/. .temp

echo "Building package..."
cd .temp
npm ci
npm run build

echo "Copying package into node_modules..."
cd ../
rm -r node_modules/@ministryofjustice/hmpps-probation-integration-e2e-tests
mkdir -p node_modules/@ministryofjustice/hmpps-probation-integration-e2e-tests
cp -r .temp/dist/. node_modules/@ministryofjustice/hmpps-probation-integration-e2e-tests

echo "Cleaning up..."
rm -rf .temp

echo "Done!"
