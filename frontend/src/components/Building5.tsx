import type { ComponentProps } from 'react';
import { building5 } from '../data/buildings';
import { BuildingShared } from './BuildingShared';
import './Building5.css';

type BuildingSharedProps = Omit<ComponentProps<typeof BuildingShared>, 'building'>;

const Building5: React.FC<BuildingSharedProps> = (props) => (
  <BuildingShared building={building5} {...props} />
);

export default Building5;

