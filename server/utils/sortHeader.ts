import qs from 'qs'
import { createQueryString } from './utils'
import { AriaSortDirection, SortDirection, TableCell } from '../@types/user-defined'

function fieldEquals<T extends string>(targetField: T | T[], currentSortField: T | T[]): boolean {
  if (typeof targetField === 'string' && typeof currentSortField === 'string') {
    return targetField === currentSortField
  }
  if (Array.isArray(targetField) && Array.isArray(currentSortField)) {
    if (targetField.length !== currentSortField.length) {
      return false
    }

    for (let i = 0; i < targetField.length; i += 1) {
      if (targetField[i] !== currentSortField[i]) {
        return false
      }
    }

    return true
  }

  return false
}

export default function sortHeader<T extends string>(
  text: string,
  targetField: T | T[],
  currentSortField: T | T[],
  currentSortDirection: SortDirection,
  hrefPrefix: string,
  tableDivId?: string,
): TableCell {
  let sortDirection: SortDirection
  let ariaSort: AriaSortDirection = 'none'

  const [basePath, queryString] = hrefPrefix.split('?')
  const qsArgs = qs.parse(queryString)

  if (fieldEquals(targetField, currentSortField)) {
    if (currentSortDirection === 'desc') {
      sortDirection = 'asc'
      ariaSort = 'descending'
    } else {
      sortDirection = 'desc'
      ariaSort = 'ascending'
    }
  }

  const tableLocator = tableDivId ? `#${tableDivId}` : ''
  const formattedQueryString = createQueryString(
    {
      ...qsArgs,
      sortBy: targetField,
      sortDirection,
    },
    { arrayFormat: 'repeat' },
  )

  return {
    html: `<a class="moj-sortable-table__button" href="${basePath}?${formattedQueryString}${tableLocator}">${text}</a>`,
    attributes: {
      'aria-sort': ariaSort,
      'data-cy-sort-field': targetField,
    },
  }
}
