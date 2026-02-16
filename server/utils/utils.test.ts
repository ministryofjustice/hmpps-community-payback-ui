import qs from 'qs'
import { convertToTitleCase, initialiseName, pathWithQuery, yesNoDisplayValue } from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('path with query', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('returns path joined with params', () => {
    jest.spyOn(qs, 'stringify').mockReturnValue('form=1')
    const result = pathWithQuery('/path', { form: '1' })
    expect(result).toEqual('/path?form=1')
  })

  it('returns a valid path even if the existing path has a ? in it', () => {
    const result = pathWithQuery('/path?foo=bar', { baz: 'quux' })
    expect(result).toEqual('/path?foo=bar&baz=quux')
  })

  it('returns a valid path even if the existing path has a ? in it and the query object has an empty value', () => {
    const result = pathWithQuery('/path?foo=bar', { baz: undefined })
    expect(result).toEqual('/path?foo=bar')
  })
})

describe('yesNoDisplayValue', () => {
  it.each([
    ['Yes', true],
    ['No', false],
    ['', undefined],
    ['', null],
  ])('Displays "%s" given %s', (expectedString: string, value?: boolean | null) => {
    const result = yesNoDisplayValue(value)
    expect(result).toBe(expectedString)
  })

  it('displays provided value if null or undefined', () => {
    const result = yesNoDisplayValue(undefined, 'Not entered')
    expect(result).toBe('Not entered')
  })
})
