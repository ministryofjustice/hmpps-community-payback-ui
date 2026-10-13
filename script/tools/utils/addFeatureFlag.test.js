const { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')
const { addFeatureFlag, files } = require('./addFeatureFlag')

const configContent = `export default {
  other: get('OTHER', 'x'),
  featureFlags: {
    travelTimeEnabled: get('TRAVEL_TIME_ENABLED', 'false') === 'true',
  },
}
`

const helmContent = `generic-service:
  env:
    REDIS_ENABLED: 'true'
    TRAVEL_TIME_ENABLED: 'true'

  other: thing
`

describe('addFeatureFlag', () => {
  let root

  const read = file => readFileSync(path.join(root, file), 'utf8')
  const write = (file, content) => writeFileSync(path.join(root, file), content)

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'add-feature-flag-'))
    mkdirSync(path.join(root, 'server'))
    mkdirSync(path.join(root, 'helm_deploy/hmpps-community-payback-ui'), { recursive: true })
    write(files.config, configContent)
    files.envFiles.forEach(file => write(file, 'A=true\n'))
    write(files.helmValues, helmContent)
    write(files.helmProdValues, helmContent)
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it('updates every file and returns the config key', () => {
    const key = addFeatureFlag('NEW_THING', root)

    expect(key).toEqual('newThing')
    expect(read(files.config)).toEqual(`export default {
  other: get('OTHER', 'x'),
  featureFlags: {
    travelTimeEnabled: get('TRAVEL_TIME_ENABLED', 'false') === 'true',
    newThing: get('NEW_THING', 'false') === 'true',
  },
}
`)
    files.envFiles.forEach(file => expect(read(file)).toEqual('A=true\nNEW_THING=true\n'))
    expect(read(files.helmValues)).toEqual(`generic-service:
  env:
    REDIS_ENABLED: 'true'
    TRAVEL_TIME_ENABLED: 'true'
    NEW_THING: 'true'

  other: thing
`)
    expect(read(files.helmProdValues)).toContain("    NEW_THING: 'false'\n")
  })

  it.each([
    ['TRAVEL_TIME_ENABLED_V2', 'travelTimeEnabledV2'],
    ['DISPLAY_HOURS_DETAILS', 'displayHoursDetails'],
    ['SINGLE', 'single'],
  ])('converts %s to config key %s', (flag, expected) => {
    expect(addFeatureFlag(flag, root)).toEqual(expected)
  })

  it.each(['travel_time', 'FOO-BAR', 'FOO__BAR', '_FOO', ''])('rejects the invalid name %p', flag => {
    expect(() => addFeatureFlag(flag, root)).toThrow('Flag name must be UPPER_SNAKE_CASE')
  })

  it('adds a missing trailing newline to env files first', () => {
    write('feature.env', 'A=true')

    addFeatureFlag('NEW_THING', root)

    expect(read('feature.env')).toEqual('A=true\nNEW_THING=true\n')
  })

  it('does not treat a longer name containing the flag as a duplicate', () => {
    write('feature.env', 'BAR_NEW_THING=true\nNEW_THING_TWO=true\n')

    expect(addFeatureFlag('NEW_THING', root)).toEqual('newThing')
  })

  it('does not treat a longer config key as a duplicate', () => {
    expect(addFeatureFlag('TRAVEL_TIME', root)).toEqual('travelTime')
  })

  it('throws and changes nothing when the flag already exists', () => {
    addFeatureFlag('NEW_THING', root)
    const before = read(files.config)

    expect(() => addFeatureFlag('NEW_THING', root)).toThrow(`Flag NEW_THING already exists in ${files.config}`)
    expect(read(files.config)).toEqual(before)
  })

  it('throws when a different flag maps to an existing config key', () => {
    addFeatureFlag('FOO_1BAR', root)

    expect(() => addFeatureFlag('FOO1BAR', root)).toThrow(`Config key foo1bar already exists in ${files.config}`)
    expect(read(files.config)).not.toContain("'FOO1BAR'")
  })

  it('throws when the config has no featureFlags block', () => {
    write(files.config, 'export default {}\n')

    expect(() => addFeatureFlag('NEW_THING', root)).toThrow('Could not find featureFlags block')
  })

  it('throws when the helm values have no boolean env entry', () => {
    write(files.helmValues, 'a: b\n')

    expect(() => addFeatureFlag('NEW_THING', root)).toThrow('Could not find insertion point')
  })
})
