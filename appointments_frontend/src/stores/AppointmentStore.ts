import { model, Model, prop, modelFlow, _async, _await } from 'mobx-keystone';

interface Appointment {
  id: number;
  patient_name: string;
  email: string;
  procedure: number;
  schedule: string;
  status: string;
  created_at: string;
}

@model('AppointmentStore')
export class AppointmentStore extends Model({
  appointments: prop<Appointment[]>(() => []),
}) {
  @modelFlow
  getAppointments = _async(function* (this: AppointmentStore) {
    try {
      const response = yield* _await(
        fetch('http://127.0.0.1:8000/api/appointments/'),
      );
      const data = yield* _await(response.json());
      this.appointments = data;
    } catch (error) {
      console.log('Error fetching appointments:', error);
      this.appointments = [];
    }
  });

  @modelFlow
  postAppointment = _async(function* (appointment: {
    patient_name: string;
    email: string;
    procedure: number;
    schedule: string;
  }) {
    try {
      const response = yield* _await(
        fetch('http://127.0.0.1:8000/api/appointments/', {
          body: JSON.stringify(appointment),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }),
      );
      const data = yield* _await(response.json());
      if (response.ok) {
        console.log('Booked appointment successfully:', data);
      } else {
        console.log('Failed Network Request');
      }
    } catch (error) {
      console.log('Error posting appointment:', error);
    }
  });

  @modelFlow
  updateAppointmentStatus = _async(function* (appointment: {
    id: number;
    status: string;
  }) {
    try {
      const response = yield* _await(
        fetch(`http://127.0.0.1:8000/api/appointments/${appointment.id}/`, {
          body: JSON.stringify({ status: appointment.status }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
        }),
      );
      const data = yield* _await(response.json());
      if (response.ok) {
        console.log('Updated appointment status:', data);
      } else {
        console.log('Failed Network Request');
        console.log('patch data:', data);
      }
    } catch (error) {
      console.log('Error patching appointment:', error);
    }
  });
}
