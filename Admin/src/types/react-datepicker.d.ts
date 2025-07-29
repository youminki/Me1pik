// src/types/react-datepicker.d.ts
declare module 'react-datepicker' {
  import React from 'react';
  import { Locale } from 'date-fns';

  export interface ReactDatePickerProps {
    selected?: Date;
    onChange?: (date: Date | [Date, Date] | null, event?: any) => void;
    dateFormat?: string;
    locale?: string | Locale;
    inline?: boolean;
    selectsRange?: boolean;
    startDate?: Date;
    endDate?: Date;
    monthsShown?: number;
    dayClassName?: (date: Date) => string;
    placeholderText?: string;
  }

  const ReactDatePicker: React.ComponentType<ReactDatePickerProps>;
  export default ReactDatePicker;

  /** 한글 등 로케일 등록 함수 */
  export function registerLocale(localeName: string, locale: Locale): void;
}
