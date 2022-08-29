import { UnusualSpendingsService } from "../../src/UnusualSpendingsService";
import { UnusualSpendingsDetector } from "../../src/UnusualSpendingsDetector";
import { AlertSender } from "../../src/AlertSender";
import { getPaymentRepository } from '../utils/getPaymentRepository';

describe("UnusualSpendingsService", () => {
  test("alerting users with unusual spendings in some categories", () => {
    const user = {
      userId: "user1",
      contactDetails: {
        email: "user1@gmail.com",
      },
    };

    const calendar = {
      getDate: jest.fn(),
    };

    const paymentsRepository = {
      getPaymentsBetweenDates: jest.fn(),
    };

    const notifier = {
      send: jest.fn(),
    };

    const usersRepository = {
      getUser: jest.fn(),
    };

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
      getPaymentRepository({ currentMonthPayments, previousMonthPayments })
    );

    usersRepository.getUser.mockReturnValue(user);

    const unusualSpendingsDetector = new UnusualSpendingsDetector(
      paymentsRepository,
      calendar
    );
    const alertSender = new AlertSender(notifier, usersRepository);

    const service = new UnusualSpendingsService(
      unusualSpendingsDetector,
      alertSender
    );

    service.alert(user.userId);

    expect(usersRepository.getUser).toHaveBeenCalledWith(user.userId);
    expect(paymentsRepository.getPaymentsBetweenDates).toHaveBeenCalledWith(
      user.userId,
      new Date("2022-07-01T00:00:00"),
      new Date("2022-07-28T00:00:00")
    );
    expect(paymentsRepository.getPaymentsBetweenDates).toHaveBeenCalledWith(
      user.userId,
      new Date("2022-06-01T00:00:00"),
      new Date("2022-06-30T00:00:00")
    );

    const expectedNotification = {
      title: "Unusual spending of $1076 detected!",
      body: `Hello card user!

We have detected unusually high spending on your card in these categories:

* You spent $148 on groceries
* You spent $928 on travel

Love,

The Credit Card Company`,
    };

    expect(notifier.send).toHaveBeenCalledWith(
      user.contactDetails,
      expectedNotification
    );
  });
});
