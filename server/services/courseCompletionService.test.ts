import CourseCompletionClient from '../data/courseCompletionClient'
import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'
import pagedModelCourseCompletionEventFactory from '../testutils/factories/pagedModelCourseCompletionEventFactory'
import CourseCompletionService from './courseCompletionService'

jest.mock('../data/courseCompletionClient')

describe('CourseCompletionService', () => {
  const courseCompletionClient = new CourseCompletionClient(null) as jest.Mocked<CourseCompletionClient>
  let courseCompletionService: CourseCompletionService

  beforeEach(() => {
    jest.resetAllMocks()
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

  it('should call getCourseCompletions on the api client and return its result', async () => {
    const courseCompletionsPagedResponse = pagedModelCourseCompletionEventFactory.build()

    courseCompletionClient.getCourseCompletions.mockResolvedValue(courseCompletionsPagedResponse)

    const result = await courseCompletionService.searchCourseCompletions({
      username: 'some-username',
      providerCode: 'A1234',
      dateFrom: '2025-09-01',
      dateTo: '2025-09-02',
      sort: ['someField,desc'],
    })

    expect(courseCompletionClient.getCourseCompletions).toHaveBeenCalledTimes(1)
    expect(courseCompletionClient.getCourseCompletions).toHaveBeenCalledWith({
      username: 'some-username',
      providerCode: 'A1234',
      dateFrom: '2025-09-01',
      dateTo: '2025-09-02',
      sort: ['someField,desc'],
      page: 0,
      size: 10,
    })
    expect(result).toEqual({
      ...courseCompletionsPagedResponse,
      page: { ...courseCompletionsPagedResponse.page, number: courseCompletionsPagedResponse.page.number + 1 },
    })
  })

  it('should call getCourseCompletions with a default value for sort and size, and reduce the page number by 1 to pass to the API', async () => {
    const courseCompletionsPagedResponse = pagedModelCourseCompletionEventFactory.build()

    courseCompletionClient.getCourseCompletions.mockResolvedValue(courseCompletionsPagedResponse)

    await courseCompletionService.searchCourseCompletions({
      username: 'some-username',
      providerCode: 'A1234',
      dateFrom: '2025-09-01',
      dateTo: '2025-09-02',
      page: 2,
    })

    expect(courseCompletionClient.getCourseCompletions).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: ['completionDate'],
        page: 1,
        size: 10,
      }),
    )
  })
})
