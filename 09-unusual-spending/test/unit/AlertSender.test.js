import { AlertSender } from '../../src/AlertSender';

describe('AlertSender', () => {
  let notifier;
  let usersRepository;
  let alertSender;

  beforeEach(() => {
    notifier = {
      send: jest.fn(),
    };
    usersRepository = {
      getUser: jest.fn(),
    };
    alertSender = new AlertSender(notifier, usersRepository)
  });

  const userId = 'user1';

  const user = {
    userId,
    contactDetails: {
      email: "user1@gmail.com",
    },
  };

  it('notifies user a spending', () => {
    const unusualSpendings = [
      {
        category: 'groceries',
        price: 14800
      }
    ];

    usersRepository.getUser.mockReturnValue(user);

    alertSender.sendAlert(userId, unusualSpendings)

    const expectedNotification = {
      title: "Unusual spending of $148 detected!",
      body: `Hello card user!

We have detected unusually high spending on your card in these categories:

* You spent $148 on groceries

Love,

The Credit Card Company`,
    };

    expect(usersRepository.getUser).toHaveBeenCalledWith(userId);

    expect(notifier.send).toHaveBeenCalledWith(
      user.contactDetails,
      expectedNotification
    );
  })


  it('notifies user multiple spendings', () => {
    const unusualSpendings = [
      {
        category: 'groceries',
        price: 14800
      },
      {
        category: 'travel',
        price: 92800
      }
    ];

    usersRepository.getUser.mockReturnValue(user);

    alertSender.sendAlert(userId, unusualSpendings)

    const expectedNotification = {
      title: "Unusual spending of $1076 detected!",
      body: `Hello card user!

We have detected unusually high spending on your card in these categories:

* You spent $148 on groceries
* You spent $928 on travel

Love,

The Credit Card Company`,
    };
    expect(usersRepository.getUser).toHaveBeenCalledWith(userId);
    expect(notifier.send).toHaveBeenCalledWith(
      user.contactDetails,
      expectedNotification
    );
  })
})