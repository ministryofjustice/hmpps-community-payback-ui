import { path } from 'static-path'

const providersPath = path('/providers')
const referenceDataPath = path('/references')

export default {
  providers: {
    teams: providersPath.path(':providerId/teams'),
  },
  referenceData: {
    projectTypes: referenceDataPath.path('project-types'),
    enforcementActions: referenceDataPath.path('enforce-ment-actions'),
  },
}
