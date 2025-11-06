import { building6 } from '../data/buildings';
import { BuildingShared } from './BuildingShared';
import './Building6.css';

type BookingsMap = Record<string, { am?: boolean; pm?: boolean }>;
type SelectionsMap = Record<string, { am?: boolean; pm?: boolean }>;

interface Building6Props {
  bookings: BookingsMap;
  selections: SelectionsMap;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
}

const Building6: React.FC<Building6Props> = (props) => {
  return <BuildingShared building={building6} {...props} />;
};

export default Building6;

