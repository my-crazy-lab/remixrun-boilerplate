import { Schema } from 'mongoose';
import { mongoClientApp } from '~/utils/db.server';

export const taskName = 'id_task';
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
  { typeKey: '$type', collection: taskName },
);

const TasksModel = mongoClientApp.model('id_tasks', TasksSchema);

export const task = TasksModel;
