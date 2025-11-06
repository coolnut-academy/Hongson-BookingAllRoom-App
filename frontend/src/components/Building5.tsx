import { building5 } from '../data/buildings';
import { BuildingShared } from './BuildingShared';
import './Building5.css';

type BookingsMap = Record<string, { am?: boolean; pm?: boolean }>;
type SelectionsMap = Record<string, { am?: boolean; pm?: boolean }>;

interface Building5Props {
  bookings: BookingsMap;
  selections: SelectionsMap;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
}

const Building5: React.FC<Building5Props> = (props) => {
  return <BuildingShared building={building5} {...props} />;
};

export default Building5;

