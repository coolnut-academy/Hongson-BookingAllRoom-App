import type { ComponentProps } from 'react';
import { building4 } from '../data/buildings';
import { BuildingShared } from './BuildingShared';
import './Building4.css';

type BuildingSharedProps = Omit<ComponentProps<typeof BuildingShared>, 'building'>;

const Building4: React.FC<BuildingSharedProps> = (props) => (
  <BuildingShared building={building4} {...props} />
);

export default Building4;

