import { task, taskName } from './task.server';
import { workingPlaces, workingPlacesName } from './workingPlaces.server';

const VN = { task, workingPlaces };
export const VNName = { task: taskName, workingPlaces: workingPlacesName };

export default VN;
