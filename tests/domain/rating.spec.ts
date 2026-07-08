import { describe, expect, it } from 'vitest'
import { applyRating, divisionOf, localRatingDelta } from '@/domain/rating'
import { constantRng, sequenceRng } from './support/rng'

describe('divisionOf', () => {
  it('picks the highest division at or below the rating', () => {
    expect(divisionOf(0).name).toBe('Bronze')
    expect(divisionOf(1099).name).toBe('Bronze')
    expect(divisionOf(1100).name).toBe('Silver')
    expect(divisionOf(1999).name).toBe('Gladiator')
    expect(divisionOf(2000).name).toBe('Emperor')
  })
})

describe('localRatingDelta', () => {
  it('returns a positive base plus randomness on a win', () => {
    expect(localRatingDelta(true, constantRng(0))).toBe(14)
    expect(localRatingDelta(true, sequenceRng([0.99]))).toBe(23)
  })

  it('returns a negative delta on a loss', () => {
    expect(localRatingDelta(false, constantRng(0))).toBe(-9)
  })
})

describe('applyRating', () => {
  it('never drops below zero', () => {
    expect(applyRating(5, -9)).toBe(0)
    expect(applyRating(1000, 14)).toBe(1014)
  })
})
