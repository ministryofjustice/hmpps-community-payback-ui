import { Factory } from 'fishery'
import type { ProbationSearchResponse } from '@ministryofjustice/probation-search-frontend/data/probationSearchClient'
import probationSearchResultFactory from './probationSearchResultFactory'

export default Factory.define<ProbationSearchResponse>(() => ({
  content: probationSearchResultFactory.buildList(3),
  probationAreaAggregations: [{ code: 'N07', description: 'London', count: 81 }],
  size: 10,
  totalElements: 30,
  totalPages: 3,
}))
