import { UnusualSpendingsDetector } from "../../src/UnusualSpendingsDetector";

describe("UnusualSpendingsDetector", () => {
  it("should detect unusual spendings", () => {
    const userId = "userId";

    const calendar = {
      getDate: jest.fn(),
    };

    const paymentsRepository = {
      getPaymentsBetweenDates: jest.fn(),
    };

    calendar.getDate.mockReturnValue(new Date("2022-07-28"));
    paymentsRepository.getPaymentsBetweenDates.mockImplementation(
      returnMockPaymentsForDates
    );

    const unusualSpendingsDetector = new UnusualSpendingsDetector(
      paymentsRepository,
      calendar
    );

    expect(unusualSpendingsDetector.detect(userId)).toEqual([
      {
        price: 14800,
        description: "Payment description",
        category: "groceries",
      },
      {
        price: 92800,
        description: "Payment description",
        category: "travel",
      },
    ]);
  });

  function returnMockPaymentsForDates(_userId, startDate, endDate) {
    const startDateIsCurrentMonthStartDate =
      startDate.getTime() === new Date("2022-07-01T00:00:00").getTime();
    const endDateIsCurrentMonthEndDate =
      endDate.getTime() === new Date("2022-07-28T00:00:00").getTime();

    if (startDateIsCurrentMonthStartDate && endDateIsCurrentMonthEndDate) {
      return [
        {
          price: 14800,
          description: "Payment description",
          category: "groceries",
        },
        {
          price: 92800,
          description: "Payment description",
          category: "travel",
        },
        {
          price: 1000,
          description: "Mercadona",
          category: "supermarket"
        }
      ];
    }

    const isPreviousMonthDates =
      startDate.getTime() === new Date("2022-06-01T00:00:00").getTime() &&
      endDate.getTime() === new Date("2022-06-30T00:00:00").getTime();
    if (isPreviousMonthDates) {
      return [
        {
          price: 6000,
          description: "Payment description",
          category: "groceries",
        },
        {
          price: 40000,
          description: "Payment description",
          category: "travel",
        },
      ];
    }
  }
});
