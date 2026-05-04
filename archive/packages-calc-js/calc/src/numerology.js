// 靈數 (Pythagorean Numerology)
//
// 演算規則（採用 Hans Decoz / Dan Millman 主流派）：
// 1. 生日的年/月/日各自先化簡到單位數，但保留大師數 (11, 22, 33)
// 2. 將三個化簡後的數字相加，再化簡到單位數，保留大師數
// 3. 「天賦數」= 出生「日」的數字化簡（保留大師數）
//
// 此演算法為「確定性」：同一輸入必然得到同一輸出。

const MASTER_NUMBERS = [11, 22, 33];

/** 將一個整數的各位數字相加 */
function sumDigits(n) {
  return String(Math.abs(n))
    .split('')
    .reduce((acc, ch) => acc + Number(ch), 0);
}

/** 化簡到單位數，但若中途遇到大師數（11/22/33）則停止並保留 */
function reduceWithMaster(n) {
  let cur = n;
  while (cur > 9 && !MASTER_NUMBERS.includes(cur)) {
    cur = sumDigits(cur);
  }
  return cur;
}

function validateDate({ year, month, day }) {
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new Error(`Invalid year: ${year}`);
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`);
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day}`);
  }
  // Check day-month validity (incl. leap year)
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) {
    throw new Error(`Invalid date: ${year}-${month}-${day}`);
  }
}

/**
 * 計算生命靈數（Life Path Number）
 * @param {{year:number,month:number,day:number}} date
 * @returns {{
 *   lifePath: number,
 *   isMaster: boolean,
 *   birthDay: number,
 *   isBirthDayMaster: boolean,
 *   breakdown: { yearReduced:number, monthReduced:number, dayReduced:number, total:number }
 * }}
 */
export function calculateLifePath({ year, month, day }) {
  validateDate({ year, month, day });

  const yearReduced = reduceWithMaster(sumDigits(year));
  const monthReduced = reduceWithMaster(month);
  const dayReduced = reduceWithMaster(day);

  const total = yearReduced + monthReduced + dayReduced;
  const lifePath = reduceWithMaster(total);

  return {
    lifePath,
    isMaster: MASTER_NUMBERS.includes(lifePath),
    birthDay: dayReduced,
    isBirthDayMaster: MASTER_NUMBERS.includes(dayReduced),
    breakdown: { yearReduced, monthReduced, dayReduced, total },
  };
}

export const __internal = { sumDigits, reduceWithMaster, MASTER_NUMBERS };
