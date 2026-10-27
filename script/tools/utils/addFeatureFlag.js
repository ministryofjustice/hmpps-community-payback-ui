/* eslint no-console: "off" -- CLI script prints its result */
const { readFileSync, writeFileSync } = require('node:fs')
const path = require('node:path')

const FLAG_PATTERN = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/
const HELM_ENV_LINE = /^ {4}[A-Z_]+: '(true|false)'$/

const files = {
  config: 'server/config.ts',
  envFiles: ['.env.example', 'feature.env'],
  helmValues: 'helm_deploy/hmpps-community-payback-ui/values.yaml',
  helmProdValues: 'helm_deploy/values-prod.yaml',
}

function toConfigKey(flag) {
  const [first, ...rest] = flag.toLowerCase().split('_')
  return first + rest.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

function validateFlagName(flag) {
  if (!FLAG_PATTERN.test(flag)) {
    throw new Error('Flag name must be UPPER_SNAKE_CASE')
  }
}

function containsFlag(content, flag) {
  return new RegExp(`(^|[^A-Z0-9_])${flag}([^A-Z0-9_]|$)`, 'm').test(content)
}

function containsConfigKey(content, key) {
  return new RegExp(`^\\s+${key}:`, 'm').test(content)
}

function insertAfterLastMatch(content, pattern, line) {
  const lines = content.split('\n')
  const lastMatch = lines.map(l => pattern.test(l)).lastIndexOf(true)
  if (lastMatch === -1) {
    throw new Error('Could not find insertion point')
  }
  lines.splice(lastMatch + 1, 0, line)
  return lines.join('\n')
}

function addToConfig(content, flag, key) {
  const lines = content.split('\n')
  const start = lines.findIndex(l => /featureFlags: \{/.test(l))
  const end = start === -1 ? -1 : lines.findIndex((l, i) => i > start && /^ {2}\},?$/.test(l))
  if (end === -1) {
    throw new Error('Could not find featureFlags block')
  }
  lines.splice(end, 0, `    ${key}: get('${flag}', 'false') === 'true',`)
  return lines.join('\n')
}

function addToEnvFile(content, flag) {
  const separator = content.endsWith('\n') || content === '' ? '' : '\n'
  return `${content}${separator}${flag}=true\n`
}

function addToHelmValues(content, flag, value) {
  return insertAfterLastMatch(content, HELM_ENV_LINE, `    ${flag}: '${value}'`)
}

function addFeatureFlag(flag, root) {
  validateFlagName(flag)
  const key = toConfigKey(flag)
  const resolve = file => path.join(root, file)

  const targets = [files.config, ...files.envFiles, files.helmValues, files.helmProdValues]
  const contents = Object.fromEntries(targets.map(file => [file, readFileSync(resolve(file), 'utf8')]))

  targets.forEach(file => {
    if (containsFlag(contents[file], flag)) {
      throw new Error(`Flag ${flag} already exists in ${file}`)
    }
  })
  if (containsConfigKey(contents[files.config], key)) {
    throw new Error(`Config key ${key} already exists in ${files.config}`)
  }

  const updated = {
    [files.config]: addToConfig(contents[files.config], flag, key),
    [files.helmValues]: addToHelmValues(contents[files.helmValues], flag, 'true'),
    [files.helmProdValues]: addToHelmValues(contents[files.helmProdValues], flag, 'false'),
    ...Object.fromEntries(files.envFiles.map(file => [file, addToEnvFile(contents[file], flag)])),
  }

  Object.entries(updated).forEach(([file, content]) => writeFileSync(resolve(file), content))

  return key
}

module.exports = { files, addFeatureFlag }

if (require.main === module) {
  const [flag] = process.argv.slice(2)
  if (!flag) {
    console.error('Usage: `script/tools/add-feature-flag.sh FLAG_NAME` (e.g. TRAVEL_TIME_ENABLED)')
    process.exit(1)
  }

  try {
    const key = addFeatureFlag(flag, process.cwd())
    console.log(`==> Added ${flag} (config key '${key}') to:`)
    ;[files.config, ...files.envFiles, files.helmValues, files.helmProdValues].forEach(file =>
      console.log(`    ${file}`),
    )
    console.log(`==> Use it in application code as \`config.featureFlags.${key}\``)
    console.log('==> Also add it manually to the relevant cp-stack .env template for local development.')
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
