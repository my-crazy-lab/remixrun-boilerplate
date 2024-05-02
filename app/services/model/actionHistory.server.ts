import { Schema } from 'mongoose';
import { mongoClientBE } from '~/utils/db.server';

const ActionsHistorySchema = new Schema(
  {
    actorId: {
      $type: String,
    },
    action: { $type: String },
    requestFormData: { $type: Schema.Types.Mixed },
    createdAt: { $type: Date, required: true },
  },
  { typeKey: '$type', collection: 'actionHistory' },
);

const ActionsHistoryModel = mongoClientBE.model(
  'ActionsHistory',
  ActionsHistorySchema,
);

export default ActionsHistoryModel;
