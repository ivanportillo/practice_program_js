import { UnusualSpendingsDetector } from "../../src/UnusualSpendingsDetector";

describe("UnusualSpendingsDetector", () => {
  const userId = "userId";
  let calendar;
  let paymentsRepository;
  let unusualSpendingsDetector;

  beforeEach(() => {
    calendar = {
      getDate: jest.fn(),
    };

    paymentsRepository = {
      getPaymentsBetweenDates: jest.fn(),
    };

    unusualSpendingsDetector = new UnusualSpendingsDetector(
      paymentsRepository,
      calendar
    );
  })

  it("should detect unusual spendings", () => {
    calendar.getDate.mockReturnValue(new Date("2022-07-28"));
    const currentMonthPayments = [
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

    const previousMonthPayments = [
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
    paymentsRepository.getPaymentsBetweenDates.mockImplementation(
      getPaymentRepository({ previousMonthPayments, currentMonthPayments })
    );

    expect(unusualSpendingsDetector.detect(userId)).toEqual([
      {
        price: 14800,
        category: "groceries",
      },
      {
        price: 92800,
        category: "travel",
      },
    ]);
  });

  it('should detect unusual spendings when there are more than one spendings per category', () => {
    calendar.getDate.mockReturnValue(new Date("2022-07-28"));
    const currentMonthPayments = [
      {
        price: 5000,
        description: "First groceries payment",
        category: "groceries",
      },
      {
        price: 4000,
        description: "Second groceries payment",
        category: "groceries",
      },
      {
        price: 100,
        description: "Payment description",
        category: "travel",
      },
      {
        price: 1000,
        description: "Mercadona",
        category: "supermarket"
      }
    ];

    const previousMonthPayments = [
      {
        price: 6000,
        description: "First previous",
        category: "groceries",
      },
      {
        price: 40000,
        description: "Payment description",
        category: "travel",
      },
    ]
    paymentsRepository.getPaymentsBetweenDates.mockImplementation(
      getPaymentRepository({ previousMonthPayments, currentMonthPayments })
    );


    expect(unusualSpendingsDetector.detect(userId)).toEqual([
      {
        price: 9000,
        category: "groceries",
      }
    ]);
  });
});

const getPaymentRepository = ({ previousMonthPayments, currentMonthPayments }) => (_userId, startDate, endDate) => {
  const startDateIsCurrentMonthStartDate =
    startDate.getTime() === new Date("2022-07-01T00:00:00").getTime();
  const endDateIsCurrentMonthEndDate =
    endDate.getTime() === new Date("2022-07-28T00:00:00").getTime();

  if (startDateIsCurrentMonthStartDate && endDateIsCurrentMonthEndDate) {
    return currentMonthPayments;
  }

  const isPreviousMonthDates =
    startDate.getTime() === new Date("2022-06-01T00:00:00").getTime() &&
    endDate.getTime() === new Date("2022-06-30T00:00:00").getTime();
  if (isPreviousMonthDates) {
    return previousMonthPayments;
  }
}