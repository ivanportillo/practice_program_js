export class AlertSender {
  constructor(notifier, userRepository) {
    this.notifier = notifier;
    this.userRepository = userRepository;
  }

  sendAlert(userId, unusualSpendings) {
    const user = this.userRepository.getUser(userId);

    const totalSpendings = unusualSpendings.reduce((acc, curr) => {
      return acc + curr.price;
    }, 0);

    const paymentLines = unusualSpendings
      .map(
        (spending) =>
          `* You spent $${parseInt(spending.price / 100)} on ${
            spending.category
          }`
      )
      .join("\n");

    const notification = {
      title: `Unusual spending of $${parseInt(totalSpendings / 100)} detected!`,
      body: `Hello card user!

We have detected unusually high spending on your card in these categories:

${paymentLines}

Love,

The Credit Card Company`,
    };

    this.notifier.send(user.contactDetails, notification);
  }
}
