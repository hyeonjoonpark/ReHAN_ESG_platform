'use client';

export const getFormattedCurrentTime = (date: Date = new Date()): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'] as const;
  const weekday = weekdays[date.getDay()];
  const hour = date.getHours();
  const minute = date.getMinutes();
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

  return `${month}월 ${day}일(${weekday}) ${period} ${displayHour}:${minute
    .toString()
    .padStart(2, '0')}`;
}; 