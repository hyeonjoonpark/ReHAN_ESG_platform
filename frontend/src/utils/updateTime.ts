'use client';

import { DATE } from "@/types/DateType";

export const getFormattedCurrentTime = (date: Date = new Date()): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = [
    DATE.SUNDAY,
    DATE.MONDAY,
    DATE.TUESDAY,
    DATE.WEDNESDAY,
    DATE.THURSDAY,
    DATE.FRIDAY,
    DATE.SATURDAY,
  ] as const;
  const weekday = weekdays[date.getDay()];
  const hour = date.getHours();
  const minute = date.getMinutes();
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

  return `${month}월 ${day}일(${weekday}) ${period} ${displayHour}:${minute
    .toString()
    .padStart(2, '0')}`;
}; 