import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatScheduleToISO } from './utils';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/RootStore';
import axios from 'axios';

interface ClinicSchedule {
  day: string;
  start_time: string;
  end_time: string;
}

const AppointmentRequestForm = () => {
  const rootStore = useStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [procedure, setProcedure] = useState('');
  const [schedule, setSchedule] = useState('');
  const [availableSchedules, setAvailableSchedules] = useState<
    ClinicSchedule[]
  >([]);

  useEffect(() => {
    const getClinicSchedules = async () => {
      try {
        await rootStore.clinic_schedules.getClinicSchedules();
      } catch (error) {
        console.error('Error fetching clinic schedules:', error);
      }
    };

    getClinicSchedules();
  }, [rootStore.clinic_schedules]);

  useEffect(() => {
    const getAppointments = async () => {
      try {
        await rootStore.appointments.getAppointments();
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    getAppointments();
  }, [rootStore.appointments]);

  useEffect(() => {
    const getProcedures = async () => {
      try {
        await rootStore.procedures.getProcedures();
      } catch (error) {
        console.error('Error fetching procedures:', error);
      }
    };

    getProcedures();
  }, [rootStore.procedures]);

  const getProcedureId = (procedureName: string) => {
    const procedure = rootStore.procedures.procedures.find(
      (procedure) => procedure.name === procedureName,
    );
    return procedure ? procedure.id : '';
  };

  const sendEmailToDentist = async (appointment: {
    patient_name: string;
    email: string;
    procedure: number;
    schedule: string;
  }) => {
    await axios
      .post('http://localhost:5000/send_email', {
        recipient_email: process.env.REACT_APP_DENTIST_EMAIL,
        subject: 'New Appointment Request',
        message: `A new appointment request has been made. \n ${appointment.patient_name} \n ${appointment.email} \n ${appointment.procedure} \n ${appointment.schedule} \n Please review the details at http://localhost:3000/appointments.`,
      })
      .then(() => console.log('Email sent to dentist'))
      .catch(() => console.log('Oops email not sent to dentist...'));
  };

  const sendEmailToPatient = async (appointment: {
    patient_name: string;
    email: string;
    procedure: number;
    schedule: string;
  }) => {
    await axios
      .post('http://localhost:5000/send_email', {
        recipient_email: appointment.email,
        subject: 'Appointment Request Confirmation',
        message: `Thank you for requesting an appointment. \n ${appointment.patient_name} \n ${appointment.email} \n ${appointment.procedure} \n ${appointment.schedule} \n We will review your request and get back to you shortly.`,
      })
      .then(() => console.log('Email sent to patient'))
      .catch(() => console.log('Oops email not sent to patient...'));
  };

  useEffect(() => {
    const getAvailableSchedules = () => {
      const existingAppointments = rootStore.appointments.appointments.filter(
        (appointment) =>
          appointment.status === 'pending' || appointment.status === 'approved',
      );

      const filteredSchedules =
        rootStore.clinic_schedules.clinic_schedules.filter((schedule) => {
          const start = new Date(`1970-01-01T${schedule.start_time}`);
          const end = new Date(`1970-01-01T${schedule.end_time}`);

          for (const appointment of existingAppointments) {
            const appointmentStart = new Date(appointment.schedule);
            const appointmentEnd = new Date(
              appointmentStart.getTime() + 60 * 60 * 1000,
            );

            if (
              appointmentStart >= start &&
              appointmentStart < end &&
              appointmentEnd > start &&
              appointmentEnd <= end
            ) {
              return false;
            }
          }

          return true;
        });

      setAvailableSchedules(filteredSchedules);
    };

    getAvailableSchedules();
  }, [
    rootStore.appointments.appointments,
    rootStore.clinic_schedules.clinic_schedules,
  ]);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    type Appointment = {
      patient_name: string;
      email: string;
      procedure: number;
      schedule: string;
    };

    const appointment: Appointment = {
      patient_name: fullName,
      email,
      procedure: getProcedureId(procedure) as number,
      schedule: formatScheduleToISO(schedule),
    };

    const postAppointment = async (appointment: Appointment) => {
      try {
        await rootStore.appointments.postAppointment(appointment);
        await sendEmailToDentist(appointment);
        await sendEmailToPatient(appointment);
      } catch (error) {
        console.error('Error submitting appointments:', error);
      }
    };

    postAppointment(appointment);
    console.log('Appointment:', appointment);
    setFullName('');
    setEmail('');
    setProcedure('');
    setSchedule('');
  };

  return (
    <React.Fragment>
      <div>
        <Link to="/appointments">
          <button type="submit">Login</button>
        </Link>
        <h2>Book a dentist appointment</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="fullName">Full Name: </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <br />

        <label htmlFor="email">Email: </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br />

        <label htmlFor="procedure">Procedure: </label>
        <select
          id="procedure"
          value={procedure}
          onChange={(e) => setProcedure(e.target.value)}
          required
        >
          <option value="">Select a procedure</option>
          {rootStore.procedures.procedures.map((procedure) => (
            <option key={procedure.id} value={procedure.name}>
              {procedure.name}
            </option>
          ))}
        </select>

        <br />

        <label htmlFor="schedule">Schedule:</label>
        <select
          id="schedule"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          required
        >
          <option value="">Select a schedule</option>
          {availableSchedules.map((schedule) => {
            const start = new Date(`1970-01-01T${schedule.start_time}`);
            const end = new Date(`1970-01-01T${schedule.end_time}`);
            const timeSlots = [];

            while (start < end) {
              const startTime = start.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              });
              const endTime = new Date(
                start.getTime() + 60 * 60 * 1000,
              ).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              });
              const timeSlot = `${startTime}-${endTime}`;

              timeSlots.push(
                <option key={timeSlot} value={`${schedule.day} ${timeSlot}`}>
                  {`${schedule.day} ${timeSlot}`}
                </option>,
              );

              start.setHours(start.getHours() + 1);
            }

            return timeSlots;
          })}
        </select>

        <br />

        <button type="submit">Submit</button>
      </form>
    </React.Fragment>
  );
};

export default observer(AppointmentRequestForm);
