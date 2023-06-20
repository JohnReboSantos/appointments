export const formatISOToSchedule = (schedule: string) => {
  const start = new Date(schedule);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const formattedStart = start.toLocaleTimeString('en-US', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
  });
  const formattedEnd = end.toLocaleTimeString('en-US', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
  });

  const day = start.toLocaleDateString('en-US', { weekday: 'long' });
  return `${day} ${formattedStart}-${formattedEnd}`;
};

// example: convert the schedule "monday 8:00 AM-9:00 AM" to the format "2023-06-19T08:00:00Z"

export const formatScheduleToISO = (schedule: string) => {
  const now = new Date();
  const currentWeekday = (now.getDay() + 6) % 7;
  const [weekday, timeRange] = schedule.split(' ');
  const targetWeekday = convertWeekday(weekday);
  const daysAhead = 1 + ((targetWeekday - currentWeekday + 7) % 7);
  const nearestDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const [startTime] = timeRange.split('-');
  const formattedDate = formatDate(nearestDate);
  const formattedTime = convertTime(startTime);

  return `${formattedDate}T${formattedTime}:00Z`;
};

const convertWeekday = (weekday: string) => {
  const weekdays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  return (weekdays.indexOf(weekday.toLowerCase()) + 6) % 7;
};

const formatDate = (date: any) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const convertTime = (timeStr: any) => {
  const [time, meridian] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  hours = Number(hours);
  if (meridian === 'PM' && hours < 12) {
    hours += 12;
  }
  if (meridian === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
};
