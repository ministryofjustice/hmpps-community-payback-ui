import { Factory } from 'fishery'
import { CaseDetailsSummaryDto } from '../../@types/shared'
import unpaidWorkDetailsFactory from './unpaidWorkDetailsFactory'
import offenderFullFactory from './offenderFullFactory'

export default Factory.define<CaseDetailsSummaryDto>(() => ({
  offender: offenderFullFactory.build(),
  unpaidWorkDetails: unpaidWorkDetailsFactory.buildList(3),
}))
