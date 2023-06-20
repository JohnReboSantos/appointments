import React from 'react';
import { observer } from 'mobx-react-lite';
import { Route, Routes } from 'react-router-dom';
import AppointmentRequestForm from './components/AppointmentRequestForm';
import AppointmentList from './components/AppointmentList';
import { createRootStore, StoreProvider } from './stores/RootStore';

const rootStore = createRootStore();

const App = () => {
  return (
    <StoreProvider value={rootStore}>
      <Routes>
        <Route path="/" element={<AppointmentRequestForm />} />
        <Route path="/appointments" element={<AppointmentList />} />
      </Routes>
    </StoreProvider>
  );
};

export default observer(App);
