import CourseCompletionClient from '../data/courseCompletionClient'
import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import CourseCompletionService from './courseCompletionService'

jest.mock('../data/courseCompletionClient')

describe('CourseCompletionService', () => {
  const courseCompletionClient = new CourseCompletionClient(null) as jest.Mocked<CourseCompletionClient>
  let courseCompletionService: CourseCompletionService

  beforeEach(() => {
    courseCompletionService = new CourseCompletionService(courseCompletionClient)
  })

  it('should call getCourseCompletion on the api client and return its result', async () => {
    const courseCompletion = courseCompletionFactory.build()

    courseCompletionClient.find.mockResolvedValue(courseCompletion)

    const result = await courseCompletionService.getCourseCompletion({
      id: 'abc-123',
      username: 'some-username',
    })

    expect(courseCompletionClient.find).toHaveBeenCalledTimes(1)
    expect(result).toEqual(courseCompletion)
  })
})
