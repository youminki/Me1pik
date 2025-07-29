// src/types/date-holidays.d.ts
declare module 'date-holidays' {
  interface Holiday {
    date: string;
    name: string;
    // 필요한 속성만 추가로 선언해 주세요
  }
  interface HolidaysConstructor {
    new (
      country: string,
      state?: string,
      region?: string,
    ): {
      getHolidays(year: number): Holiday[];
      isHoliday(date: Date | string): boolean;
      // 필요 메서드만 선언
    };
  }
  const Holidays: HolidaysConstructor;
  export = Holidays;
}
