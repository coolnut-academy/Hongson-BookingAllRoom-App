import type { ComponentProps } from 'react';
import { building6 } from '../data/buildings';
import { BuildingShared } from './BuildingShared';
import './Building6.css';

type BuildingSharedProps = Omit<ComponentProps<typeof BuildingShared>, 'building'>;

const Building6: React.FC<BuildingSharedProps> = (props) => (
  <BuildingShared building={building6} {...props} />
);

export default Building6;

