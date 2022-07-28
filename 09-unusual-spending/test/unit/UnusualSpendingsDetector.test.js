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
    const isCurrentMonthDates =
      startDate === new Date("2022-07-01") &&
      endDate === new Date("2022-07-28");
    if (isCurrentMonthDates) {
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
      ];
    }

    const isPreviousMonthDates =
      startDate === new Date("2022-06-01") &&
      endDate === new Date("2022-06-30");
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
