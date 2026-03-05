import qs from 'qs'
import { createQueryString } from './utils'
import { AriaSortDirection, SortDirection, TableCell } from '../@types/user-defined'

export default function sortHeader<T extends string>(
  text: string,
  targetField: T,
  currentSortField: T,
  currentSortDirection: SortDirection,
  hrefPrefix: string,
  tableDivId?: string,
): TableCell {
  let sortDirection: SortDirection
  let ariaSort: AriaSortDirection = 'none'

  const [basePath, queryString] = hrefPrefix.split('?')
  const qsArgs = qs.parse(queryString)

  if (targetField === currentSortField) {
    if (currentSortDirection === 'desc') {
      sortDirection = 'asc'
      ariaSort = 'descending'
    } else {
      sortDirection = 'desc'
      ariaSort = 'ascending'
    }
  }

  const tableLocator = tableDivId ? `#${tableDivId}` : ''

  return {
    html: `<a class="moj-sortable-table__button" href="${basePath}?${createQueryString({
      ...qsArgs,
      sortBy: targetField,
      sortDirection,
    })}${tableLocator}">${text}</a>`,
    attributes: {
      'aria-sort': ariaSort,
      'data-cy-sort-field': targetField,
    },
  }
}
