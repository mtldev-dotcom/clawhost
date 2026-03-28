import test from 'node:test'
import assert from 'node:assert/strict'

import { extractComposeId, extractEnvironmentId, extractProjectId } from './dokploy-api'

test('extractProjectId supports top-level projectId responses', () => {
  assert.equal(extractProjectId({ projectId: 'proj_123' }), 'proj_123')
})

test('extractProjectId supports nested project responses', () => {
  assert.equal(extractProjectId({ data: { project: { id: 'proj_nested' } } }), 'proj_nested')
})

test('extractProjectId returns null for malformed responses', () => {
  assert.equal(extractProjectId({ ok: true }), null)
})

test('extractEnvironmentId prefers default environments from project details', () => {
  assert.equal(
    extractEnvironmentId({
      environments: [
        { id: 'env_secondary' },
        { id: 'env_default', default: true },
      ],
    }),
    'env_default'
  )
})

test('extractEnvironmentId supports environment.byProjectId responses', () => {
  assert.equal(
    extractEnvironmentId({
      data: {
        environments: [
          { environmentId: 'env_1' },
        ],
      },
    }),
    'env_1'
  )
})

test('extractEnvironmentId supports direct environment resources', () => {
  assert.equal(extractEnvironmentId({ environment: { id: 'env_direct' } }), 'env_direct')
})

test('extractComposeId supports top-level composeId responses', () => {
  assert.equal(extractComposeId({ composeId: 'cmp_123' }), 'cmp_123')
})

test('extractComposeId supports nested compose responses', () => {
  assert.equal(extractComposeId({ data: { compose: { id: 'cmp_nested' } } }), 'cmp_nested')
})

test('extractComposeId returns null for malformed responses', () => {
  assert.equal(extractComposeId({ success: true }), null)
})
