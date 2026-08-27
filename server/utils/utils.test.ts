import qs from 'qs'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { Request } from 'express'
import {
  originalPathOr,
  convertToTitleCase,
  initialiseName,
  isWholePositiveNumber,
  pathWithOriginalPath,
  pathWithQuery,
  yesNoDisplayValue,
} from './utils'

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

  it('returns a valid path without query string delimiter when no query params', () => {
    const result = pathWithQuery('/path?', {})
    expect(result).toEqual('/path')
  })

  it.each([{}, undefined])('returns only path if no params', (params?: Record<string, string>) => {
    const path = '/test'
    expect(pathWithQuery(path, params)).toBe(path)
  })
})

describe('path with original path', () => {
  it('returns the path with the original path param', () => {
    const originalPath = 'path'
    const base = '/base'
    expect(pathWithOriginalPath(base, originalPath)).toBe('/base?originalPath=path')
  })

  it('returns the path with encoded original path param', () => {
    const base = '/base'
    expect(pathWithOriginalPath(base, 'path/to?query=1')).toBe('/base?originalPath=path%2Fto%3Fquery%3D1')
  })

  it('includes any previous params on the base', () => {
    const base = '/base?query=test'
    expect(pathWithOriginalPath(base, 'path/to?query=1')).toBe('/base?query=test&originalPath=path%2Fto%3Fquery%3D1')
  })
})

describe('originalPathOr', () => {
  it('returns the original path if present', () => {
    const path = 'path'
    expect(originalPathOr({ originalPath: path })).toBe(path)
  })

  it('returns the original path if present and fallback provided', () => {
    const path = 'path'
    expect(originalPathOr({ originalPath: path }, '/some-other-path')).toBe(path)
  })

  it('handles a query object with original path', () => {
    const path = 'path'

    const request: DeepMocked<Request> = createMock<Request>({
      query: { originalPath: path },
    })
    expect(originalPathOr(request.query, '/some-other-path')).toBe(path)
  })

  it('decodes the original path', () => {
    expect(originalPathOr({ originalPath: 'path%2Fto%3Fquery%3D1' }, '/some-other-path')).toBe('path/to?query=1')
  })

  it('returns the fallback if original path not provided', () => {
    const fallback = '/some-other-path'
    expect(originalPathOr({}, fallback)).toBe(fallback)
  })

  it('returns the default if neither value provided', () => {
    expect(originalPathOr({})).toBe('/')
  })

  it('returns the fallback if the original path is not valid percent-encoding', () => {
    const fallback = '/some-other-path'
    expect(originalPathOr({ originalPath: '%' }, fallback)).toBe(fallback)
  })

  it('returns the fallback if the decoded original path is an absolute URL', () => {
    const fallback = '/some-other-path'
    expect(originalPathOr({ originalPath: 'https%3A%2F%2Fevil.com' }, fallback)).toBe(fallback)
  })

  it('returns the fallback if the decoded original path is protocol-relative', () => {
    const fallback = '/some-other-path'
    expect(originalPathOr({ originalPath: '%2F%2Fevil.com' }, fallback)).toBe(fallback)
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

describe('isWholePositiveNumber', () => {
  it.each(['0', '1', '188888889', '45'])('returns true if %s is 0 or above', (value: string) => {
    const result = isWholePositiveNumber(value)
    expect(result).toBe(true)
  })

  it.each(['-1', '1.1', 'not'])('returns true if %s is not a positive whole number', (value: string) => {
    const result = isWholePositiveNumber(value)
    expect(result).toBe(false)
  })
})
