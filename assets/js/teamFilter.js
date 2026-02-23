import paths from '../../server/paths'

const config = {
  moduleName: 'cpb-team-filter',
  fallbackProviderFormId: 'filter-provider-no-js',
  teamRowId: 'filter-team-row',
  jsTemplateId: 'filter-provider-team-js',
  providerInputId: 'provider',
  teamInputId: 'team',
}

export default function initTeamFilter() {
  document.addEventListener('DOMContentLoaded', async function () {
    if (document.querySelector(`[data-module="${config.moduleName}"]`)) {
      initFilterModule()
    }
  })
}

function initFilterModule() {
  const providerForm = document.getElementById(config.fallbackProviderFormId)

  if (providerForm) {
    replaceProviderForm(providerForm)

    const providerSelect = document.getElementById(config.providerInputId)

    providerSelect.addEventListener('change', async function () {
      const teamSelect = document.getElementById(config.teamInputId)
      teamSelect.innerHTML = ''
      const providerCode = providerSelect.options[providerSelect.selectedIndex].value

      if (providerCode !== '') {
        await populateTeamsForRegion(providerCode, teamSelect)
      } else {
        teamSelect.disabled = true
        teamSelect.value = ''
        const defaultOption = document.createElement('option')
        defaultOption.value = ''
        defaultOption.text = 'Choose region'
        teamSelect.appendChild(defaultOption)
      }
    })
  }
}

async function populateTeamsForRegion(providerCode, teamSelect) {
  await fetch(paths.data.teams({ provider: providerCode }))
    .then(async result => {
      const { teams } = await result.json()
      return teams
    })
    .then(teams => {
      teamSelect.disabled = false
      const defaultOption = document.createElement('option')
      defaultOption.value = ''
      defaultOption.text = 'Choose team'
      teamSelect.appendChild(defaultOption)

      teams.forEach(item => {
        const option = document.createElement('option')
        option.value = item.value
        option.text = item.text
        teamSelect.appendChild(option)
      })
    })
}

function replaceProviderForm(fallbackProviderSelect) {
  const fallbackTeamSelect = document.getElementById(config.teamRowId)
  const template = document.getElementById(config.jsTemplateId)
  const clone = document.importNode(template.content, true)
  fallbackProviderSelect.parentElement.removeChild(fallbackProviderSelect)
  fallbackTeamSelect.innerHTML = ''
  fallbackTeamSelect.appendChild(clone)
}
