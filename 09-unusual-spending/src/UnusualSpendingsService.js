export class UnusualSpendingsService {
  constructor(unusualSpendingsDetector, alertSender) {
    this.unusualSpendingsDetector = unusualSpendingsDetector;
    this.alertSender = alertSender;
  }

  alert(userId) {
    const unusualSpendings = this.unusualSpendingsDetector.detect(userId);
    this.alertSender.sendAlert(userId, unusualSpendings);
  }
}