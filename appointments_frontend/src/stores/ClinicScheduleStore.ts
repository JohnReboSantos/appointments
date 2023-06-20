import { model, Model, prop, modelFlow, _async, _await } from 'mobx-keystone';

interface ClinicSchedule {
  day: string;
  start_time: string;
  end_time: string;
}

@model('ClinicScheduleStore')
export class ClinicScheduleStore extends Model({
  clinic_schedules: prop<ClinicSchedule[]>(() => []),
}) {
  @modelFlow
  getClinicSchedules = _async(function* (this: ClinicScheduleStore) {
    try {
      const response = yield* _await(
        fetch('http://127.0.0.1:8000/api/clinic_schedules/'),
      );
      const data = yield* _await(response.json());
      this.clinic_schedules = data.sort(
        (a: ClinicSchedule, b: ClinicSchedule) => {
          const dayOrder = a.day.localeCompare(b.day);
          if (dayOrder === 0) {
            const startTimeA = new Date(`1970-01-01T${a.start_time}`);
            const startTimeB = new Date(`1970-01-01T${b.start_time}`);
            return startTimeA.getTime() - startTimeB.getTime();
          }
          return dayOrder;
        },
      );
    } catch (error) {
      console.log('Error fetching clinic schedules:', error);
      this.clinic_schedules = [];
    }
  });
}
