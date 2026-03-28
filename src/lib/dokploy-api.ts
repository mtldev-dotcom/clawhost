type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getNestedValue(value: unknown, path: string[]): unknown {
  let current: unknown = value

  for (const key of path) {
    if (!isRecord(current) || !(key in current)) {
      return undefined
    }
    current = current[key]
  }

  return current
}

function findString(value: unknown, paths: string[][]): string | null {
  for (const path of paths) {
    const candidate = getNestedValue(value, path)
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate
    }
  }

  return null
}

function findEnvironmentCollection(value: unknown): unknown[] {
  const collectionPaths = [
    ['environments'],
    ['data', 'environments'],
    ['project', 'environments'],
    ['data', 'project', 'environments'],
    ['environment'],
    ['data', 'environment'],
    ['project', 'environment'],
    ['data', 'project', 'environment'],
  ]

  for (const path of collectionPaths) {
    const candidate = getNestedValue(value, path)
    if (Array.isArray(candidate)) {
      return candidate
    }
    if (isRecord(candidate)) {
      return [candidate]
    }
  }

  return []
}

function pickPreferredEnvironment(environments: unknown[]): unknown {
  const preferred = environments.find((environment) => {
    if (!isRecord(environment)) return false
    return environment.default === true || environment.isDefault === true || environment.primary === true
  })

  return preferred ?? environments[0]
}

export function extractProjectId(value: unknown): string | null {
  return findString(value, [
    ['projectId'],
    ['id'],
    ['project', 'projectId'],
    ['project', 'id'],
    ['data', 'projectId'],
    ['data', 'id'],
    ['data', 'project', 'projectId'],
    ['data', 'project', 'id'],
  ])
}

export function extractComposeId(value: unknown): string | null {
  return findString(value, [
    ['composeId'],
    ['id'],
    ['compose', 'composeId'],
    ['compose', 'id'],
    ['app', 'composeId'],
    ['app', 'id'],
    ['data', 'composeId'],
    ['data', 'id'],
    ['data', 'compose', 'composeId'],
    ['data', 'compose', 'id'],
    ['data', 'app', 'composeId'],
    ['data', 'app', 'id'],
  ])
}

export function extractEnvironmentId(value: unknown): string | null {
  const directMatch = findString(value, [
    ['environmentId'],
    ['id'],
    ['environment', 'environmentId'],
    ['environment', 'id'],
    ['data', 'environmentId'],
    ['data', 'id'],
    ['data', 'environment', 'environmentId'],
    ['data', 'environment', 'id'],
  ])

  if (directMatch) {
    return directMatch
  }

  const environments = findEnvironmentCollection(value)
  if (environments.length === 0) {
    return null
  }

  const preferred = pickPreferredEnvironment(environments)
  return findString(preferred, [
    ['environmentId'],
    ['id'],
  ])
}
