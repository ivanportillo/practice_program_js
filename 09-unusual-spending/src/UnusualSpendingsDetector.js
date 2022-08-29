export class UnusualSpendingsDetector {
  constructor(paymentsRepository, calendar ){
    this.paymentsRepository = paymentsRepository;
    this.calendar = calendar;
  }

  detect(userId) {
    const date = this.calendar.getDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const currentStartDate = new Date(year, month, 1);
    const currentEndDate = new Date(year, month, date.getDate());

    const previousStartDate = new Date(year, month - 1);
    const previousEndDate = new Date(year, month, 0);

    const currentPayments = this.paymentsRepository.getPaymentsBetweenDates(userId, currentStartDate, currentEndDate);
    const previousPayments = this.paymentsRepository.getPaymentsBetweenDates(userId, previousStartDate, previousEndDate);
    
    const aggregatedCurrentPayments = this.aggregatePayments(currentPayments);
    const aggregatedPreviousPayments = this.aggregatePayments(previousPayments);

    return this.findUnusualSpendings(aggregatedCurrentPayments, aggregatedPreviousPayments);
  }

  findUnusualSpendings = (aggregatedCurrentPayments, aggregatedPreviousPayments) => {
    return aggregatedCurrentPayments.filter(payment => {
      const paymentWithSameCategory = aggregatedPreviousPayments.find(previousPayment => previousPayment.category === payment.category);
      if (paymentWithSameCategory) {
        const increase = payment.price - paymentWithSameCategory.price;
       const incrementPercentage = (increase / Math.abs(paymentWithSameCategory.price)) * 100;
       return incrementPercentage >= 50;
      }

      return false;
    });
  }

  aggregatePayments = (payments) => {
    return payments.reduce((acc, current) => {
      const categoryPaymentIndex = acc.findIndex(aggregate => aggregate.category === current.category)
      if(categoryPaymentIndex > -1) {
        const existingAggregatedPayment = acc[categoryPaymentIndex];
        return [
          ...acc.slice(0, categoryPaymentIndex),
          {
            ...existingAggregatedPayment,
            price: existingAggregatedPayment.price + current.price
          },
          ...acc.slice(categoryPaymentIndex + 1),
        ];
      }

      return [
        ...acc,
        {
          category: current.category,
          price: current.price
        }
      ]
    }, [])
  }
}