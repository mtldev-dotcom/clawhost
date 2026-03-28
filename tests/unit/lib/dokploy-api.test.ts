import { describe, it, expect } from 'vitest'
import {
  extractProjectId,
  extractComposeId,
  extractEnvironmentId,
} from '@/lib/dokploy-api'

describe('dokploy-api', () => {
  describe('extractProjectId', () => {
    it('extracts projectId from root level', () => {
      expect(extractProjectId({ projectId: 'proj-123' })).toBe('proj-123')
    })

    it('extracts id from root level', () => {
      expect(extractProjectId({ id: 'proj-456' })).toBe('proj-456')
    })

    it('extracts from nested project object', () => {
      expect(extractProjectId({ project: { projectId: 'proj-789' } })).toBe('proj-789')
    })

    it('extracts from data wrapper', () => {
      expect(extractProjectId({ data: { projectId: 'proj-abc' } })).toBe('proj-abc')
    })

    it('returns null for missing projectId', () => {
      expect(extractProjectId({})).toBeNull()
      expect(extractProjectId({ other: 'value' })).toBeNull()
    })

    it('returns null for non-object', () => {
      expect(extractProjectId(null)).toBeNull()
      expect(extractProjectId(undefined)).toBeNull()
      expect(extractProjectId('string')).toBeNull()
    })
  })

  describe('extractComposeId', () => {
    it('extracts composeId from root level', () => {
      expect(extractComposeId({ composeId: 'comp-123' })).toBe('comp-123')
    })

    it('extracts id from root level', () => {
      expect(extractComposeId({ id: 'comp-456' })).toBe('comp-456')
    })

    it('extracts from nested compose object', () => {
      expect(extractComposeId({ compose: { composeId: 'comp-789' } })).toBe('comp-789')
    })

    it('extracts from app object', () => {
      expect(extractComposeId({ app: { id: 'comp-abc' } })).toBe('comp-abc')
    })

    it('returns null for missing composeId', () => {
      expect(extractComposeId({})).toBeNull()
    })
  })

  describe('extractEnvironmentId', () => {
    it('extracts environmentId from root level', () => {
      expect(extractEnvironmentId({ environmentId: 'env-123' })).toBe('env-123')
    })

    it('extracts from environments array', () => {
      expect(
        extractEnvironmentId({
          environments: [{ id: 'env-456' }, { id: 'env-789' }],
        })
      ).toBe('env-456')
    })

    it('prefers default environment', () => {
      expect(
        extractEnvironmentId({
          environments: [
            { id: 'env-1', default: false },
            { id: 'env-2', default: true },
          ],
        })
      ).toBe('env-2')
    })

    it('extracts from nested project.environments', () => {
      expect(
        extractEnvironmentId({
          project: { environments: [{ id: 'env-nested' }] },
        })
      ).toBe('env-nested')
    })

    it('returns null for empty environments', () => {
      expect(extractEnvironmentId({ environments: [] })).toBeNull()
    })

    it('returns null for missing data', () => {
      expect(extractEnvironmentId({})).toBeNull()
    })
  })
})
