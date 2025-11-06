import { building4 } from '../data/buildings';
import { BuildingShared } from './BuildingShared';
import './Building4.css';

type BookingsMap = Record<string, { am?: boolean; pm?: boolean }>;
type SelectionsMap = Record<string, { am?: boolean; pm?: boolean }>;

interface Building4Props {
  bookings: BookingsMap;
  selections: SelectionsMap;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
}

const Building4: React.FC<Building4Props> = (props) => {
  return <BuildingShared building={building4} {...props} />;
};

export default Building4;

