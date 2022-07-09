import TimeUtil from './time';

describe('Time util', () => {
  describe('toUnix', () => {
    it('Expect return correct number', () => {
      expect(TimeUtil.toUnix(new Date('2022.07.08'))).toEqual(1657213200);
    });

    it('Expect return incorrect number', () => {
      expect(TimeUtil.toUnix(new Date('2022.07.08'))).not.toEqual(1657213201);
    });
  });
});
