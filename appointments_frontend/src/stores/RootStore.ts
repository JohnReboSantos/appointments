import React from 'react';
import { AppointmentStore } from './AppointmentStore';
import { ClinicScheduleStore } from './ClinicScheduleStore';
import { ProcedureStore } from './ProcedureStore';
import { model, Model, prop, registerRootStore } from 'mobx-keystone';

@model('RootStore')
class RootStore extends Model({
  appointments: prop<AppointmentStore>(),
  clinic_schedules: prop<ClinicScheduleStore>(),
  procedures: prop<ProcedureStore>(),
}) {}

const StoreContext = React.createContext<RootStore>({} as RootStore);

const useStore = () => React.useContext(StoreContext);
const { Provider: StoreProvider } = StoreContext;

function createRootStore() {
  const appointments = new AppointmentStore({});
  const clinic_schedules = new ClinicScheduleStore({});
  const procedures = new ProcedureStore({});
  const rootStore = new RootStore({
    appointments,
    clinic_schedules,
    procedures,
  });

  registerRootStore(rootStore);

  return rootStore;
}

export { RootStore, StoreProvider, createRootStore, useStore };
