export class UnusualSpendingsDetector {
  constructor(paymentsRepository, calendar ){
    this.paymentsRepository = paymentsRepository;
    this.calendar = calendar;
  }

  detect(userId) {
    const date = this.calendar.getDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month, date.getDate());

    const previousStartDate = new Date(year, month - 1);
    const previousEndDate = new Date(year, month, 0);

    const payments = this.paymentsRepository.getPaymentsBetweenDates(userId, startDate, endDate);
    const previousPayments = this.paymentsRepository.getPaymentsBetweenDates(userId, previousStartDate, previousEndDate);


    const unusualSpendings = payments.filter(payment => {
      const paymentWithSameCategory = previousPayments.find(previousPayment => previousPayment.category === payment.category);
      if (paymentWithSameCategory) {
        const increase = payment.price - paymentWithSameCategory.price;
       const incrementPercentage = (increase / paymentWithSameCategory.price) * 100;
       return incrementPercentage >= 50;
      }

      return false;
    });
    
    return unusualSpendings;
  }
}