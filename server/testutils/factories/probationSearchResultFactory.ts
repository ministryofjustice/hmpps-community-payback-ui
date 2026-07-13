import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import type { ProbationSearchResult } from '@ministryofjustice/probation-search-frontend/data/probationSearchClient'

export default Factory.define<ProbationSearchResult>(() => {
  const surname = faker.person.lastName()

  return {
    offenderId: faker.number.int({ min: 1000000, max: 9999999 }),
    firstName: faker.person.firstName(),
    surname,
    dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
    otherIds: {
      crn: `X${faker.string.numeric(6)}`,
    },
    highlight: {
      surname: [surname],
    },
  }
})
