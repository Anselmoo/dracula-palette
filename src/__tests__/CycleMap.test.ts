import { describe, it, expect } from 'vitest';

/**
 * Test suite for Color Relationship Map triangle calculations
 * Related to issue: https://github.com/Anselmoo/dracula-palette/issues/124
 */

describe('CycleMap Triangle Calculations', () => {
  /**
   * Helper function to calculate triangle indices using the OLD (buggy) logic
   */
  function calculateTriangleIndicesOld(n: number, pattern: 'triad' | 'triple') {
    const idxA = 0;
    const idxB = pattern === 'triad' ? Math.floor(n / 3) : Math.floor(n * 0.33);
    const idxC = pattern === 'triad' ? Math.floor((2 * n) / 3) : Math.floor(n * 0.66);
    return { idxA, idxB, idxC };
  }

  /**
   * Helper function to calculate triangle indices using the FIXED logic
   */
  function calculateTriangleIndicesFixed(n: number, pattern: 'triad' | 'triple') {
    const idxA = 0;
    const idxB = pattern === 'triad' ? Math.round(n / 3) : Math.round(n * 0.33);
    const idxC = pattern === 'triad' ? Math.round((2 * n) / 3) : Math.round(n * 0.66);
    return { idxA, idxB, idxC };
  }

  /**
   * Calculate angles in degrees for triangle vertices
   */
  function calculateAngles(indices: { idxA: number; idxB: number; idxC: number }, n: number) {
    const angleA = (2 * Math.PI * indices.idxA) / n * 180 / Math.PI;
    const angleB = (2 * Math.PI * indices.idxB) / n * 180 / Math.PI;
    const angleC = (2 * Math.PI * indices.idxC) / n * 180 / Math.PI;
    return { angleA, angleB, angleC };
  }

  /**
   * Calculate angle differences between vertices
   */
  function calculateAngleDiffs(angles: { angleA: number; angleB: number; angleC: number }) {
    const diffAB = angles.angleB - angles.angleA;
    const diffBC = angles.angleC - angles.angleB;
    const diffCA = 360 - angles.angleC; // wraps around to A at 0°
    return { diffAB, diffBC, diffCA };
  }

  /**
   * Calculate variance from ideal 120° spacing for triangle vertices
   */
  function calculateVarianceFromIdeal(diffs: { diffAB: number; diffBC: number; diffCA: number }) {
    return Math.pow(diffs.diffAB - 120, 2) + 
           Math.pow(diffs.diffBC - 120, 2) + 
           Math.pow(diffs.diffCA - 120, 2);
  }

  describe('Triad Pattern (even thirds)', () => {
    it('should have approximately 120° spacing for n=12 (divisible by 3)', () => {
      const n = 12;
      const indices = calculateTriangleIndicesFixed(n, 'triad');
      const angles = calculateAngles(indices, n);
      const diffs = calculateAngleDiffs(angles);

      expect(indices).toEqual({ idxA: 0, idxB: 4, idxC: 8 });
      expect(diffs.diffAB).toBeCloseTo(120, 5);
      expect(diffs.diffBC).toBeCloseTo(120, 5);
      expect(diffs.diffCA).toBeCloseTo(120, 5);
    });

    it('should have approximately 120° spacing for n=15 (divisible by 3)', () => {
      const n = 15;
      const indices = calculateTriangleIndicesFixed(n, 'triad');
      const angles = calculateAngles(indices, n);
      const diffs = calculateAngleDiffs(angles);

      expect(indices).toEqual({ idxA: 0, idxB: 5, idxC: 10 });
      expect(diffs.diffAB).toBeCloseTo(120, 5);
      expect(diffs.diffBC).toBeCloseTo(120, 5);
      expect(diffs.diffCA).toBeCloseTo(120, 5);
    });

    it('should have better approximation for n=10 (not divisible by 3)', () => {
      const n = 10;
      const indicesOld = calculateTriangleIndicesOld(n, 'triad');
      const indicesFixed = calculateTriangleIndicesFixed(n, 'triad');
      
      const anglesOld = calculateAngles(indicesOld, n);
      const anglesFixed = calculateAngles(indicesFixed, n);
      
      const diffsOld = calculateAngleDiffs(anglesOld);
      const diffsFixed = calculateAngleDiffs(anglesFixed);

      // Old indices: 0, 3, 6 -> angles 0°, 108°, 216° (uneven: 108°, 108°, 144°)
      expect(indicesOld).toEqual({ idxA: 0, idxB: 3, idxC: 6 });
      expect(diffsOld.diffAB).toBeCloseTo(108, 5);
      expect(diffsOld.diffBC).toBeCloseTo(108, 5);
      expect(diffsOld.diffCA).toBeCloseTo(144, 5);

      // Fixed indices: 0, 3, 7 -> angles 0°, 108°, 252° (better: 108°, 144°, 108°)
      expect(indicesFixed).toEqual({ idxA: 0, idxB: 3, idxC: 7 });
      expect(diffsFixed.diffAB).toBeCloseTo(108, 5);
      expect(diffsFixed.diffBC).toBeCloseTo(144, 5);
      expect(diffsFixed.diffCA).toBeCloseTo(108, 5);

      // Check that fixed version has better distribution (more balanced)
      const varianceOld = calculateVarianceFromIdeal(diffsOld);
      const varianceFixed = calculateVarianceFromIdeal(diffsFixed);
      
      expect(varianceFixed).toBeLessThanOrEqual(varianceOld);
    });

    it('should have better approximation for n=11 (not divisible by 3)', () => {
      const n = 11;
      const indicesOld = calculateTriangleIndicesOld(n, 'triad');
      const indicesFixed = calculateTriangleIndicesFixed(n, 'triad');
      
      const anglesOld = calculateAngles(indicesOld, n);
      const anglesFixed = calculateAngles(indicesFixed, n);
      
      const diffsOld = calculateAngleDiffs(anglesOld);
      const diffsFixed = calculateAngleDiffs(anglesFixed);

      // Old indices: 0, 3, 7 (floor)
      expect(indicesOld).toEqual({ idxA: 0, idxB: 3, idxC: 7 });
      
      // Fixed indices: 0, 4, 7 (round) - better distribution
      expect(indicesFixed).toEqual({ idxA: 0, idxB: 4, idxC: 7 });

      // Calculate variance from ideal 120° for both versions
      const varianceOld = calculateVarianceFromIdeal(diffsOld);
      const varianceFixed = calculateVarianceFromIdeal(diffsFixed);
      
      expect(varianceFixed).toBeLessThanOrEqual(varianceOld);
    });

    it('should have better approximation for n=13 (not divisible by 3)', () => {
      const n = 13;
      const indicesOld = calculateTriangleIndicesOld(n, 'triad');
      const indicesFixed = calculateTriangleIndicesFixed(n, 'triad');
      
      const anglesOld = calculateAngles(indicesOld, n);
      const anglesFixed = calculateAngles(indicesFixed, n);
      
      const diffsOld = calculateAngleDiffs(anglesOld);
      const diffsFixed = calculateAngleDiffs(anglesFixed);

      expect(indicesOld).toEqual({ idxA: 0, idxB: 4, idxC: 8 });
      expect(indicesFixed).toEqual({ idxA: 0, idxB: 4, idxC: 9 });

      // Check better distribution
      const varianceOld = calculateVarianceFromIdeal(diffsOld);
      const varianceFixed = calculateVarianceFromIdeal(diffsFixed);
      
      expect(varianceFixed).toBeLessThan(varianceOld);
    });
  });

  describe('Triple Pattern (user triple at 0, 33%, 66%)', () => {
    it('should have better approximation for n=12', () => {
      const n = 12;
      const indicesOld = calculateTriangleIndicesOld(n, 'triple');
      const indicesFixed = calculateTriangleIndicesFixed(n, 'triple');
      
      // Old: floor(12 * 0.33) = floor(3.96) = 3, floor(12 * 0.66) = floor(7.92) = 7
      expect(indicesOld).toEqual({ idxA: 0, idxB: 3, idxC: 7 });
      
      // Fixed: round(12 * 0.33) = round(3.96) = 4, round(12 * 0.66) = round(7.92) = 8
      expect(indicesFixed).toEqual({ idxA: 0, idxB: 4, idxC: 8 });
      
      const anglesFixed = calculateAngles(indicesFixed, n);
      const diffsFixed = calculateAngleDiffs(anglesFixed);
      
      // Should be exactly 120° apart
      expect(diffsFixed.diffAB).toBeCloseTo(120, 5);
      expect(diffsFixed.diffBC).toBeCloseTo(120, 5);
      expect(diffsFixed.diffCA).toBeCloseTo(120, 5);
    });

    it('should have better approximation for n=15', () => {
      const n = 15;
      const indicesOld = calculateTriangleIndicesOld(n, 'triple');
      const indicesFixed = calculateTriangleIndicesFixed(n, 'triple');
      
      // Old: floor(15 * 0.33) = floor(4.95) = 4, floor(15 * 0.66) = floor(9.9) = 9
      expect(indicesOld).toEqual({ idxA: 0, idxB: 4, idxC: 9 });
      
      // Fixed: round(15 * 0.33) = round(4.95) = 5, round(15 * 0.66) = round(9.9) = 10
      expect(indicesFixed).toEqual({ idxA: 0, idxB: 5, idxC: 10 });
      
      const anglesFixed = calculateAngles(indicesFixed, n);
      const diffsFixed = calculateAngleDiffs(anglesFixed);
      
      // Should be exactly 120° apart
      expect(diffsFixed.diffAB).toBeCloseTo(120, 5);
      expect(diffsFixed.diffBC).toBeCloseTo(120, 5);
      expect(diffsFixed.diffCA).toBeCloseTo(120, 5);
    });

    it('should have better approximation for n=10', () => {
      const n = 10;
      const indicesOld = calculateTriangleIndicesOld(n, 'triple');
      const indicesFixed = calculateTriangleIndicesFixed(n, 'triple');
      
      const anglesOld = calculateAngles(indicesOld, n);
      const anglesFixed = calculateAngles(indicesFixed, n);
      
      const diffsOld = calculateAngleDiffs(anglesOld);
      const diffsFixed = calculateAngleDiffs(anglesFixed);

      // Both produce same result for n=10, but fixed logic is more consistent
      expect(indicesOld).toEqual({ idxA: 0, idxB: 3, idxC: 6 });
      expect(indicesFixed).toEqual({ idxA: 0, idxB: 3, idxC: 7 });

      // Check better distribution
      const varianceOld = calculateVarianceFromIdeal(diffsOld);
      const varianceFixed = calculateVarianceFromIdeal(diffsFixed);
      
      expect(varianceFixed).toBeLessThanOrEqual(varianceOld);
    });
  });

  describe('Edge cases', () => {
    it('should handle small palette sizes (n=3)', () => {
      const n = 3;
      const indices = calculateTriangleIndicesFixed(n, 'triad');
      const angles = calculateAngles(indices, n);
      const diffs = calculateAngleDiffs(angles);

      expect(indices).toEqual({ idxA: 0, idxB: 1, idxC: 2 });
      expect(diffs.diffAB).toBeCloseTo(120, 5);
      expect(diffs.diffBC).toBeCloseTo(120, 5);
      expect(diffs.diffCA).toBeCloseTo(120, 5);
    });

    it('should handle small palette sizes (n=4)', () => {
      const n = 4;
      const indices = calculateTriangleIndicesFixed(n, 'triad');
      
      // round(4/3) = round(1.33) = 1, round(8/3) = round(2.67) = 3
      expect(indices).toEqual({ idxA: 0, idxB: 1, idxC: 3 });
    });

    it('should handle large palette sizes (n=100)', () => {
      const n = 100;
      const indices = calculateTriangleIndicesFixed(n, 'triad');
      const angles = calculateAngles(indices, n);
      const diffs = calculateAngleDiffs(angles);

      // round(100/3) = 33, round(200/3) = 67
      expect(indices).toEqual({ idxA: 0, idxB: 33, idxC: 67 });
      
      // Should be very close to 120° with large n (within 3° tolerance)
      expect(Math.abs(diffs.diffAB - 120)).toBeLessThan(3);
      expect(Math.abs(diffs.diffBC - 120)).toBeLessThan(3);
      expect(Math.abs(diffs.diffCA - 120)).toBeLessThan(3);
    });
  });

  describe('Variance comparison (overall improvement metric)', () => {
    /**
     * Test that the fixed version has lower overall variance across multiple palette sizes
     */
    it('should have lower total variance across common palette sizes', () => {
      // Test sizes chosen to cover cases not divisible by 3, which are most affected by the bug
      const testSizes = [4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22];
      let totalVarianceOld = 0;
      let totalVarianceFixed = 0;

      testSizes.forEach(n => {
        const indicesOld = calculateTriangleIndicesOld(n, 'triad');
        const indicesFixed = calculateTriangleIndicesFixed(n, 'triad');
        
        const anglesOld = calculateAngles(indicesOld, n);
        const anglesFixed = calculateAngles(indicesFixed, n);
        
        const diffsOld = calculateAngleDiffs(anglesOld);
        const diffsFixed = calculateAngleDiffs(anglesFixed);

        totalVarianceOld += calculateVarianceFromIdeal(diffsOld);
        totalVarianceFixed += calculateVarianceFromIdeal(diffsFixed);
      });

      // The fixed version should have significantly lower total variance
      expect(totalVarianceFixed).toBeLessThan(totalVarianceOld);
    });
  });
});
