import * as dayjs from 'dayjs';

export default function InstallmentCalculator(value: number, divisor: number, startDate: Date) {
  const result: { amount: number; date: Date }[] = [];
  const quotient = Math.floor(value / divisor);

  const remainder = value % divisor;

  const date = dayjs(startDate);

  for (let i = 0; i < divisor; i++) {
    const resultDate = date.add(i, 'month');
    const amount = quotient;
    result.push({ amount, date: resultDate.toDate() });
  }

  result[0].amount += remainder;

  return result;
}
