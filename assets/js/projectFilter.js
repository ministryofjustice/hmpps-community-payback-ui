import paths from '../../server/paths'

const config = {
  moduleName: 'cpb-project-team-filter',
  fallbackProviderFormId: 'filter-project-team-no-js',
  projectRowId: 'filter-project-row',
  jsTemplateId: 'filter-project-team-js',
  teamInputId: 'team',
  projectInputId: 'project',
  defaultProjectOption: { value: '', text: 'Choose a project team' },
  redirectUrl: '/',
}

export default function initProjectsFilter() {
  document.addEventListener('DOMContentLoaded', initFilterModule)
}

async function initFilterModule() {
  const module = document.querySelector(`[data-module="${config.moduleName}"]`)
  if (!module) {
    return
  }

  const teamForm = document.getElementById(config.fallbackProviderFormId)

  if (teamForm) {
    config.redirectUrl = teamForm.getAttribute('action') || config.redirectUrl
    replaceTeamForm(teamForm)

    const teamSelect = document.getElementById(config.teamInputId)

    teamSelect.addEventListener('change', async () => changeProjects(teamSelect))
  }
}

async function changeProjects(teamSelect) {
  const projectSelect = document.getElementById(config.projectInputId)
  const teamCode = teamSelect.options[teamSelect.selectedIndex].value

  if (teamCode !== '') {
    await populateProjectsForTeam(teamCode, projectSelect) // Needs providerCode
  } else {
    projectSelect.setAttribute('disabled', 'disabled')
    const defaultOption = buildOption(config.defaultProjectOption)
    projectSelect.replaceChildren(defaultOption)
  }
}

async function populateProjectsForTeam(providerCode, teamCode, projectSelect, projectTypeGroup) {
  await fetch(paths.data.projects({ providerCode, teamCode, projectTypeGroup }))
    .then(async result => {
      if (result.status === 401) {
        window.location.href = config.redirectUrl
        return null
      }

      if (!result.ok) {
        return handleError()
      }

      const { projects } = await result.json()
      return projects
    })
    .then(projects => {
      if (projects) {
        projectSelect.removeAttribute('disabled')
        const projectItems = projectSelect.map(buildOption)
        projectSelect.replaceChildren(...projectItems)
      }
    })
    .catch(_ => handleError())
}

function handleError() {
  window.location.href = paths.error.pattern
  return null
}

function buildOption(item) {
  const option = document.createElement('option')
  option.value = item.value
  option.text = item.text
  return option
}

function replaceTeamForm(teamForm) {
  const projectRow = document.getElementById(config.projectRowId)
  const template = document.getElementById(config.jsTemplateId)
  const clone = document.importNode(template.content, true)
  teamForm.parentElement.removeChild(teamForm)
  projectRow.replaceWith(clone)
}
