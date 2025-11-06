import type { RoomData } from '../components/Room';

export interface BuildingData {
  id: string;
  title: string;
  subtitle?: string;
  layout: 'grid' | 'table';
  columns?: number;
  rooms: (RoomData | RoomData[])[];
}

// Building 1 - Grid Layout (6 columns)
export const building1: BuildingData = {
  id: 'building-1',
  title: '[ อาคาร 1 ] ผังการจองห้อง',
  layout: 'grid',
  columns: 6,
  rooms: [
    { roomId: '131', roomName: 'ห้อง 131' },
    { roomId: '132', roomName: 'ห้อง 132', subtitle: 'ห้องพักครู', isBlocked: true, blockedType: 'red' },
    { roomId: '133', roomName: 'ห้อง 133' },
    { roomId: '134', roomName: 'ห้อง 134', subtitle: 'ห้องเก็บสารเคมี', isBlocked: true, blockedType: 'red' },
    { roomId: '135', roomName: 'ห้อง 135' },
    { roomId: '136', roomName: 'ห้อง 136' },
    { roomId: '121', roomName: 'ห้อง 121', subtitle: 'ห้องธุรการ', isBlocked: true, blockedType: 'red' },
    { roomId: '122', roomName: 'ห้อง 122', subtitle: 'ห้องการเงิน', isBlocked: true, blockedType: 'red' },
    { roomId: '123', roomName: 'ห้อง 123' },
    { roomId: '124', roomName: 'ห้อง 124', subtitle: 'ห้องพักครู', isBlocked: true, blockedType: 'red' },
    { roomId: '125', roomName: 'ห้อง 125' },
    { roomId: '126', roomName: 'ห้อง 126' },
    { roomId: '111', roomName: 'ห้อง 111', subtitle: 'ห้องแผนผัง', isBlocked: true, blockedType: 'red' },
    { roomId: '112', roomName: 'ห้อง 112', subtitle: 'ห้องพักครู', isBlocked: true, blockedType: 'red' },
    { roomId: '113', roomName: 'ห้อง 113' },
    { roomId: '114', roomName: 'ห้อง 114', subtitle: 'ห้องเก็บของ', isBlocked: true, blockedType: 'red' },
    { roomId: '115', roomName: 'ห้อง 115' },
    { roomId: '116', roomName: 'ห้อง 116' },
  ],
};

// Building 2 - Table Layout
export const building2: BuildingData = {
  id: 'building-2',
  title: '[ อาคาร 2 ] ผังการจองห้อง',
  layout: 'table',
  rooms: [
    [
      { roomId: '231', roomName: 'ห้อง 231', subtitle: 'ม.4/1' },
      { roomId: '232', roomName: 'ห้อง 232', subtitle: 'ม.4/2' },
      { roomId: '233', roomName: 'ห้อง 233', subtitle: 'ม.4/3' },
      { roomId: '234', roomName: 'ห้อง 234', subtitle: 'ม.4/4' },
      { roomId: '235', roomName: 'ห้อง 235', subtitle: 'ม.4/5' },
      { roomId: '236', roomName: 'ห้อง 236', subtitle: 'ม.4/6' },
    ],
    [
      { roomId: '221', roomName: 'ห้อง 221', subtitle: 'คณิตศาสตร์', isBlocked: true, blockedType: 'blue', colspan: 3 },
      { roomId: 'english', roomName: 'ภาษาอังกฤษ', isBlocked: true, blockedType: 'red', colspan: 3 },
    ],
    [
      { roomId: '211', roomName: 'ห้อง 211', subtitle: 'ม.6/1' },
      { roomId: '212', roomName: 'ห้อง 212', subtitle: 'ม.6/2' },
      { roomId: '213', roomName: 'ห้อง 213', subtitle: 'ม.6/3' },
      { roomId: '214', roomName: 'ห้อง 214', subtitle: 'ม.6/4' },
      { roomId: '215', roomName: 'ห้อง 215', subtitle: 'ม.6/5' },
      { roomId: '216', roomName: 'ห้อง 216', subtitle: 'ม.6/6' },
    ],
  ],
};

// Building 3 - Table Layout (จะสร้างให้ครบทุกห้อง)
export const building3: BuildingData = {
  id: 'building-3',
  title: '[ อาคาร 3 ] ผังการจองห้อง',
  layout: 'table',
  rooms: [
    [
      { roomId: '331', roomName: 'ห้อง 331', subtitle: 'ม.5/1' },
      { roomId: '332', roomName: 'ห้อง 332', subtitle: 'ม.5/2' },
      { roomId: '333', roomName: 'ห้อง 333', subtitle: 'สังคม', isBlocked: true, blockedType: 'red' },
      { roomId: '334', roomName: 'ห้อง 334', subtitle: 'ม.5/3' },
      { roomId: '335', roomName: 'ห้อง 335', subtitle: 'ม.5/4' },
      { roomId: '336', roomName: 'ห้อง 336', subtitle: 'ม.5/5' },
      { roomId: '337', roomName: 'ห้อง 337', subtitle: 'ม.5/6' },
      { roomId: '338', roomName: 'ห้อง 338', subtitle: 'ห้องพระพุทธ', isBlocked: true, blockedType: 'red' },
    ],
    [
      { roomId: '321', roomName: 'ห้อง 321', subtitle: 'ภาษาไทย', isBlocked: true, blockedType: 'red' },
      { roomId: '322', roomName: 'ห้อง 322', subtitle: 'ม.4/7' },
      { roomId: '323', roomName: 'ห้อง 323', subtitle: 'ม.4/8' },
      { roomId: '324', roomName: 'ห้อง 324', subtitle: 'ม.4/9' },
      { roomId: '325', roomName: 'ห้อง 325', subtitle: 'ม.4/10' },
      { roomId: '326', roomName: 'ห้อง 326', subtitle: 'ม.3/6' },
      { roomId: '327', roomName: 'ห้อง 327', subtitle: 'ม.3/7' },
      { roomId: '328', roomName: 'ห้อง 328', subtitle: 'ม.3/8' },
    ],
    [
      { roomId: '311', roomName: '311', subtitle: 'คอมฯ' },
      { roomId: '312', roomName: '312', subtitle: 'คอมฯ' },
      { roomId: 'library', roomName: 'ห้องสมุด', isBlocked: true, blockedType: 'green', colspan: 2 },
      { roomId: 'innovation', roomName: 'ห้องนวัตกรรม', isBlocked: true, blockedType: 'green', colspan: 2 },
      { roomId: '317', roomName: '317', subtitle: 'คอมฯ' },
      { roomId: '318', roomName: '318', subtitle: 'คอมฯ' },
    ],
  ],
};

// Building 4 - Table Layout
export const building4: BuildingData = {
  id: 'building-4',
  title: '[ อาคาร 4 ]',
  subtitle: '(อาคารนิเสสเวศ)',
  layout: 'table',
  rooms: [
    [
      { roomId: '441', roomName: 'ห้อง 441', subtitle: 'ม.3/1' },
      { roomId: '442', roomName: 'ห้อง 442', subtitle: 'ม.3/2' },
      { roomId: '443', roomName: 'ห้อง 443', subtitle: 'ม.3/3' },
      { roomId: '444', roomName: 'ห้อง 444', subtitle: 'ม.3/4' },
      { roomId: '445', roomName: 'ห้อง 445', subtitle: 'ม.3/5' },
      { roomId: '446', roomName: 'ห้อง 446', subtitle: 'ม.2/9' },
      { roomId: '447', roomName: 'ห้อง 447', subtitle: 'ม.2/8' },
      { roomId: '448', roomName: 'ห้อง 448', subtitle: 'ม.2/7' },
    ],
    [
      { roomId: '431', roomName: 'ห้อง 431', subtitle: 'ห้องศูนย์สอบ', isBlocked: true, blockedType: 'red' },
      { roomId: '432', roomName: 'ห้อง 432', subtitle: 'ม.1/9' },
      { roomId: '433', roomName: 'ห้อง 433', subtitle: 'ม.2/6' },
      { roomId: '434', roomName: 'ห้อง 434', subtitle: 'ม.2/5' },
      { roomId: '435', roomName: 'ห้อง 435', subtitle: 'ม.2/4' },
      { roomId: '436', roomName: 'ห้อง 436', subtitle: 'ม.2/3' },
      { roomId: '437', roomName: 'ห้อง 437', subtitle: 'ม.2/2' },
      { roomId: '438', roomName: 'ห้อง 438', subtitle: 'ม.2/1' },
    ],
    [
      { roomId: '421', roomName: 'ห้อง 421', subtitle: 'ม.1/1' },
      { roomId: '422', roomName: 'ห้อง 422', subtitle: 'ม.1/2' },
      { roomId: '423', roomName: 'ห้อง 423', subtitle: 'ม.1/3' },
      { roomId: '424', roomName: 'ห้อง 424', subtitle: 'ม.1/4' },
      { roomId: '425', roomName: 'ห้อง 425', subtitle: 'ม.1/5' },
      { roomId: '426', roomName: 'ห้อง 426', subtitle: 'ม.1/6' },
      { roomId: '427', roomName: 'ห้อง 427', subtitle: 'ม.1/7' },
      { roomId: '428', roomName: 'ห้อง 428', subtitle: 'ม.1/8' },
    ],
    [
      { roomId: 'fablab', roomName: 'ห้อง FABLAB', colspan: 2 },
      { roomId: 'meeting1', roomName: 'ห้องประชุมนิเสสเวศ 1', colspan: 2 },
      { roomId: 'meeting2', roomName: 'ห้องประชุมนิเสสเวศ 2', colspan: 2 },
      { roomId: 'hcec', roomName: 'ห้อง HCEC', colspan: 2 },
    ],
  ],
};

// Building 5 - Table Layout
export const building5: BuildingData = {
  id: 'building-5',
  title: '[ อาคารใหม่ ]',
  subtitle: '(ข้างอาคารกิจการนักเรียน (ห้องรหัส A))',
  layout: 'table',
  rooms: [
    [
      { roomId: 'A4', roomName: 'A4', subtitle: 'ม.6/7' },
      { roomId: 'A3', roomName: 'A3', subtitle: 'ม.6/8' },
      { roomId: 'A2', roomName: 'A2', subtitle: 'ม.6/9' },
      { roomId: 'A1', roomName: 'A1', subtitle: 'ม.6/10' },
    ],
  ],
};

// Building 6 - Table Layout
export const building6: BuildingData = {
  id: 'building-6',
  title: '[ อาคารอื่นๆ ]',
  layout: 'table',
  rooms: [
    [
      { roomId: 'music1', roomName: 'ห้องดนตรี 1' },
      { roomId: 'music2', roomName: 'ห้องดนตรี 2' },
      { roomId: 'home1', roomName: 'ห้องคหกรรม 1' },
      { roomId: 'home2', roomName: 'ห้องคหกรรม 2' },
    ],
    [
      { roomId: 'canteen', roomName: 'โรงอาหาร', colspan: 2 },
      { roomId: 'phet', roomName: 'อาคารเพชรพลบดี' },
      { roomId: 'phet-canteen', roomName: 'โรงอาหารเพชรพลบดี' },
    ],
    [
      { roomId: 'industry1', roomName: 'ห้องอุตสาหกรรม 1', subtitle: 'ม.5/9', colspan: 2 },
      { roomId: 'industry2', roomName: 'ห้องอุตสาหกรรม 2', subtitle: 'ม.5/10', colspan: 2 },
    ],
  ],
};

export const allBuildings: BuildingData[] = [
  building1,
  building2,
  building3,
  building4,
  building5,
  building6,
];

