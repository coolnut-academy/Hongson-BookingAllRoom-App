// Mapping username to display name
const userDisplayMap: Record<string, string> = {
  'hs-thai': 'กลุ่มสาระภาษาไทย',
  'hs-social': 'กลุ่มสาระสังคมศึกษา',
  'hs-inter': 'กลุ่มสาระต่างประเทศ',
  'hs-art': 'กลุ่มสาระศิลปะ',
  'hs-sci': 'กลุ่มสาระวิทยาศาสตร์และเทคโนฯ',
  'hs-sport': 'กลุ่มสาระพละศึกษา',
  'hs-worker': 'กลุ่มสาระการงานอาชีพ',
  'hs-tcas': 'กลุ่มสาระแนะแนว',
  'hs-math': 'กลุ่มสาระคณิตศาสตร์',
  'adminhongson': 'ผู้ดูแลระบบ',
};

/**
 * Get display name from username
 * @param username - Username to get display name for
 * @returns Display name or username if not found
 */
export function getUserDisplayName(username: string): string {
  return userDisplayMap[username] || username;
}

