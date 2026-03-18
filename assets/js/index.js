import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import initTeamFilter from './teamFilter'
import initPduFilter from './pduFilter'

govukFrontend.initAll()
mojFrontend.initAll()
initTeamFilter()
initPduFilter()
