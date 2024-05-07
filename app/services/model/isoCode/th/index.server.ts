import { task, taskName } from './task.server';
import { workingPlaces, workingPlacesName } from './workingPlaces.server';

const TH = { task, workingPlaces };
export const THName = { task: taskName, workingPlaces: workingPlacesName };

export default TH;
