import TimeUtil from 'src/utils/time/time';

describe('Time util', () => {
  describe('toUnix', () => {
    it('Expect return correct number', () => {
      expect(TimeUtil.toUnix(new Date('2022.07.08'))).toEqual(1657213200);
    });

    it('Expect return incorrect number', () => {
      expect(TimeUtil.toUnix(new Date('2022.07.08'))).not.toEqual(1657213201);
    });
  });

  describe('expiredTimestamp', () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 1000 * 60 * 60 * 24);
    const yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);

    it('Should return true', () => {
      expect(
        TimeUtil.expiredTimestamp(TimeUtil.toUnix(yesterday)),
      ).toBeTruthy();
    });

    it('Should return false', () => {
      expect(TimeUtil.expiredTimestamp(TimeUtil.toUnix(tomorrow))).toBeFalsy();
    });
  });
});
