class TimeUtil {
  static toUnix(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }

  static isExpired(exp: number): boolean {
    return TimeUtil.toUnix(new Date()) > exp;
  }
}

export default TimeUtil;
