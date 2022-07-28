import { UnusualSpendingsService } from "../../src/UnusualSpendingsService";
import { UnusualSpendingsDetector } from "../../src/UnusualSpendingsDetector";
import { AlertSender } from "../../src/AlertSender";

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
    paymentsRepository.getPaymentsBetweenDates.mockImplementation(
      returnMockPaymentsForDates
    );

    usersRepository.getUser.mockReturnValue(user);

    const unusualSpendingsDetector = new UnusualSpendingsDetector(
      calendar,
      paymentsRepository
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
      "2022-07-01",
      "2022-07-28"
    );
    expect(paymentsRepository.getPaymentsBetweenDates).toHaveBeenCalledWith(
      user.userId,
      "2022-06-01",
      "2022-06-30"
    );

    const expectedNotification = {
      title: "Unusual spending of $1076 detected!",
      body: `Hello card user! 
 
        We have detected unusually high spending on your card in these categories: 
         
        * You spent $148 on groceries 
        * You spent $928 on travel 
         
        Love, 
         
        The Credit Card Company
        `,
    };

    expect(notifier.send).toHaveBeenCalledWith(
      user.contactDetails.email,
      expectedNotification
    );

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
});
