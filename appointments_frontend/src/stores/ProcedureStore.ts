import { model, Model, prop, modelFlow, _async, _await } from 'mobx-keystone';

interface Procedure {
  id: number;
  name: string;
}

@model('ProcedureStore')
export class ProcedureStore extends Model({
  procedures: prop<Procedure[]>(() => []),
}) {
  @modelFlow
  getProcedures = _async(function* (this: ProcedureStore) {
    try {
      const response = yield* _await(
        fetch('http://127.0.0.1:8000/api/procedures/'),
      );
      const data = yield* _await(response.json());
      this.procedures = data;
    } catch (error) {
      console.log('Error fetching procedures:', error);
      this.procedures = [];
    }
  });
}
