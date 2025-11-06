import { building3 } from '../data/buildings';
import { BuildingShared } from './BuildingShared';
import './Building3.css';

type BookingsMap = Record<string, { am?: boolean; pm?: boolean }>;
type SelectionsMap = Record<string, { am?: boolean; pm?: boolean }>;

interface Building3Props {
  bookings: BookingsMap;
  selections: SelectionsMap;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
}

const Building3: React.FC<Building3Props> = (props) => {
  return <BuildingShared building={building3} {...props} />;
};

export default Building3;

