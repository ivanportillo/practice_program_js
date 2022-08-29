export const getPaymentRepository = ({ previousMonthPayments, currentMonthPayments }) => (_userId, startDate, endDate) => {
  const startDateIsCurrentMonthStartDate = startDate.getTime() === new Date("2022-07-01T00:00:00").getTime();
  const endDateIsCurrentMonthEndDate = endDate.getTime() === new Date("2022-07-28T00:00:00").getTime();

  if (startDateIsCurrentMonthStartDate && endDateIsCurrentMonthEndDate) {
    return currentMonthPayments;
  }

  const isPreviousMonthDates = startDate.getTime() === new Date("2022-06-01T00:00:00").getTime() &&
    endDate.getTime() === new Date("2022-06-30T00:00:00").getTime();
  if (isPreviousMonthDates) {
    return previousMonthPayments;
  }
};
