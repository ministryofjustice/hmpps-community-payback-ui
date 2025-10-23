import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { ProjectLocationDto } from '../../@types/shared'

export default Factory.define<ProjectLocationDto>(() => ({
  buildingName: faker.company.name(),
  addressNumber: faker.location.buildingNumber(),
  streetName: faker.location.street(),
  townCity: faker.location.city(),
  county: faker.location.county(),
}))
