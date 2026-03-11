import { Factory } from 'fishery'
import { faker, fakerEN_GB as fakerEngb } from '@faker-js/faker'
import { CommunityCampusPduDto, CommunityCampusPdusDto } from '../../@types/shared'

export const communityCampusPduFactory = Factory.define<CommunityCampusPduDto>(() => ({
  id: faker.string.uuid(),
  name: fakerEngb.location.county(),
  providerCode: faker.string.alpha(8),
}))

export const communityCampusPdusFactory = Factory.define<CommunityCampusPdusDto>(() => ({
  pdus: communityCampusPduFactory.buildList(3),
}))
