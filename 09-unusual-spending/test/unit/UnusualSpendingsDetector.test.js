import { UnusualSpendingsDetector } from "../../src/UnusualSpendingsDetector";
import { getPaymentRepository } from "../utils/getPaymentRepository";

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
  });

  it('returns empty array when there is no payments', () => {
    calendar.getDate.mockReturnValue(new Date("2022-07-28"));
    paymentsRepository.getPaymentsBetweenDates.mockImplementation(
      getPaymentRepository({ previousMonthPayments: [], currentMonthPayments: [] })
    );

    expect(unusualSpendingsDetector.detect(userId)).toEqual([]);
  });

  it("returns empty array when there is no unusual spendings", () => {
    calendar.getDate.mockReturnValue(new Date("2022-07-28"));
    const currentMonthPayments = [
      aPayment({ price: 500, category: "groceries" }),
    ];

    const previousMonthPayments = [
      aPayment({ price: 600, category: "groceries" }),
    ];
    paymentsRepository.getPaymentsBetweenDates.mockImplementation(
      getPaymentRepository({ previousMonthPayments, currentMonthPayments })
    );

    expect(unusualSpendingsDetector.detect(userId)).toEqual([]);
  });

  it("should detect unusual spendings", () => {
    calendar.getDate.mockReturnValue(new Date("2022-07-28"));
    const currentMonthPayments = [
      aPayment({ price: 14800, category: "groceries" }),
      aPayment({ price: 92800, category: "travel" }),
      aPayment({ price: 1000, category: "supermarket" })
    ];

    const previousMonthPayments = [
      aPayment({ price: 600, category: "groceries" }),
      aPayment({ price: 40000, category: "travel" }),
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

  it('should detect unusual spendings when there are more than one spendings per category in current month', () => {
    calendar.getDate.mockReturnValue(new Date("2022-07-28"));
    const currentMonthPayments = [
      aPayment({ price: 5000, category: "groceries" }),
      aPayment({ price: 4000, category: "groceries" }),
      aPayment({ price: 100, category: "travel" }),
      aPayment({ price: 1000, category: "supermarket" }),
    ];

    const previousMonthPayments = [
      aPayment({ price: 6000, category: "groceries" }),
      aPayment({ price: 40000, category: "travel" }),
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

  it('return no unusual spendings when there are more than one spendings per category in previous month', () => {
    calendar.getDate.mockReturnValue(new Date("2022-07-28"));
    const currentMonthPayments = [
      aPayment({ price: 4500, category: "groceries" }),
    ];

    const previousMonthPayments = [
      aPayment({ price: 200, category: "groceries" }),
      aPayment({ price: 4300, category: "groceries" })
    ]
    paymentsRepository.getPaymentsBetweenDates.mockImplementation(
      getPaymentRepository({ previousMonthPayments, currentMonthPayments })
    );


    expect(unusualSpendingsDetector.detect(userId)).toEqual([]);
  });
});

function aPayment({ price, category }) {
  return {
    price,
    description: "Payment description",
    category,
  }
}