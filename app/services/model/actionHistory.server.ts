import { Schema } from 'mongoose';
import { mongoClientBE } from '~/utils/db.server';

const ActionsHistorySchema = new Schema(
  {
    actorId: {
      $type: String,
      required: true,
    },
    action: { $type: String, required: true },
    requestFormData: { $type: Schema.Types.Mixed, required: true },
    createdAt: { $type: Date, required: true },
  },
  { typeKey: '$type', collection: 'actionHistory' },
);

const ActionsHistoryModel = mongoClientBE.model(
  'ActionsHistory',
  ActionsHistorySchema,
);

export default ActionsHistoryModel;
