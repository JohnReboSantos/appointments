import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { formatISOToSchedule } from './utils';
import { useStore } from '../stores/RootStore';
import { Link } from 'react-router-dom';
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const client = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

const AppointmentList = () => {
  const [currentUser, setCurrentUser] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const rootStore = useStore();

  useEffect(() => {
    client
      .get('/auth/user/')
      .then(function (res) {
        console.log(res);
        setCurrentUser(true);
      })
      .catch(function (error) {
        console.log(error);
        setCurrentUser(false);
      });
  }, []);

  function submitLogin(e: any) {
    e.preventDefault();
    client
      .post('/auth/login/', {
        email: email,
        password: password,
      })
      .then(function (res) {
        console.log(res);
        setCurrentUser(true);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function submitLogout(e: any) {
    e.preventDefault();
    client
      .post('/auth/logout/', { withCredentials: true })
      .then(function (res) {
        console.log(res);
        setCurrentUser(false);
      });
  }

  type Appointment = {
    id: number;
    patient_name: string;
    email: string;
    procedure: number;
    schedule: string;
    status: string;
    created_at: string;
  };

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

  const getProcedureName = (procedureId: number) => {
    const procedure = rootStore.procedures.procedures.find(
      (procedure) => procedure.id === procedureId,
    );
    return procedure ? procedure.name : '';
  };

  const sendEmailToPatient = async (appointment: {
    id: number;
    status: string;
  }) => {
    const appointmentId = appointment.id;
    const myAppointment = rootStore.appointments.appointments.find(
      (appointment) => appointment.id === appointmentId,
    );
    appointment.status === 'approved'
      ? await axios
          .post('http://localhost:5000/send_email', {
            recipient_email: myAppointment ? myAppointment.email : '',
            subject: 'Appointment Request Approved',
            message: 'Congrats! Your appointment has been approved.',
          })
          .then(() => console.log('Status update email sent to patient'))
          .catch(() =>
            console.log('Oops status update email not sent to patient...'),
          )
      : await axios
          .post('http://localhost:5000/send_email', {
            recipient_email: myAppointment ? myAppointment.email : '',
            subject: 'Appointment Request Denied',
            message:
              'Sorry but your appointment has been denied. Please book another appointment.',
          })
          .then(() => console.log('Status update email sent to patient'))
          .catch(() =>
            console.log('Oops status update email not sent to patient...'),
          );
  };

  const changeAppointmentStatus = async (
    appointmentId: number,
    newStatus: string,
  ) => {
    const appointment = { id: appointmentId, status: newStatus };
    try {
      await rootStore.appointments.updateAppointmentStatus(appointment);
      await rootStore.appointments.getAppointments();
      await sendEmailToPatient(appointment);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  if (currentUser) {
    return (
      <div>
        <Link to="/">
          <form onSubmit={(e) => submitLogout(e)}>
            <button type="submit">Log out</button>
          </form>
        </Link>
        <h2>Appointment List</h2>
        {rootStore.appointments.appointments.length > 0 ? (
          <ul>
            {rootStore.appointments.appointments.map(
              (appointment: Appointment) => (
                <li key={appointment.id}>
                  <p>ID: {appointment.id}</p>
                  <p>Name: {appointment.patient_name}</p>
                  <p>Email: {appointment.email}</p>
                  <p>Procedure: {getProcedureName(appointment.procedure)}</p>
                  <p>Schedule: {formatISOToSchedule(appointment.schedule)}</p>
                  <p>Status: {appointment.status}</p>

                  {appointment.status === 'pending' && (
                    <div>
                      <button
                        onClick={() =>
                          changeAppointmentStatus(appointment.id, 'approved')
                        }
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          changeAppointmentStatus(appointment.id, 'rejected')
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ),
            )}
          </ul>
        ) : (
          <h2>No Appointments</h2>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={(e) => submitLogin(e)}>
      <label htmlFor="email">Email: </label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <br />

      <label htmlFor="password">Password: </label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <br />

      <button type="submit">Login</button>
    </form>
  );
};

export default observer(AppointmentList);
