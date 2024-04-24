import { Schema } from 'mongoose';
import { mongoClientApp } from '~/utils/db.server';

const TasksSchema = new Schema(
  {
    _id: {
      $type: String,
      required: true,
    },
    createdAt: { $type: Date, default: Date.now },
    updatedAt: {
      $type: Date,
    },
    status: {
      $type: String,
      required: true,
    },
  },
  { typeKey: '$type', collection: 'task' },
);

const TasksModel = mongoClientApp.model('vn_tasks', TasksSchema);

export const task = TasksModel;
