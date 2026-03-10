import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import exampleApi from './integration_tests/mockApis/exampleApi'
import providers from './integration_tests/mockApis/providers'
import projects from './integration_tests/mockApis/projects'
import sessions from './integration_tests/mockApis/sessions'
import courseCompletions from './integration_tests/mockApis/courseCompletions'
import appointments from './integration_tests/mockApis/appointments'
import referenceData from './integration_tests/mockApis/referenceData'
import accessibilityViolations from './integration_tests/tasks/accessibilityViolations'
import appointmentForms from './integration_tests/mockApis/appointmentForms'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'test_results/cypress/results-[hash].xml',
  },
  taskTimeout: 60000,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...tokenVerification,
        ...exampleApi,
        ...providers,
        ...projects,
        ...sessions,
        ...courseCompletions,
        ...appointments,
        ...referenceData,
        ...accessibilityViolations,
        ...appointmentForms,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/tests/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
