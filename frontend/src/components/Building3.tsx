import type { ComponentProps } from 'react';
import { building3 } from '../data/buildings';
import { BuildingShared } from './BuildingShared';
import './Building3.css';

type BuildingSharedProps = Omit<ComponentProps<typeof BuildingShared>, 'building'>;

const Building3: React.FC<BuildingSharedProps> = (props) => (
  <BuildingShared building={building3} {...props} />
);

export default Building3;

