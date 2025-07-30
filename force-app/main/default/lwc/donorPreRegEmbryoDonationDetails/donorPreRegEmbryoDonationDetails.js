import { LightningElement, track, api } from 'lwc';

export default class DonorPreRegSpermDonationDetails extends LightningElement {
  @track spermBank = '';
  @track independentDonation = '';
  @track spermBankOutcomes = [];
  @track independentOutcomes = [];
  @track showNumberedHeadings = false;

  connectedCallback() {
    this.spermBankOutcomes = [{ id: Date.now(), index: 1, bankName: '', bankWebsite: '', bankPhone: '', bankEmail: '', coordinatorName: '' }];
    this.independentOutcomes = [{ id: Date.now(), index: 1, firstName: '', lastName: '', email: '', phone: '' }];
  }

  handleSpermBankChange(event) {
    this.spermBank = event.target.value;
  }

  handleIndependentDonationChange(event) {
    this.independentDonation = event.target.value;
  }

  handleInputChange(event) {
    const { index, field } = event.target.dataset;
    const value = event.target.value;
    const outcomes = field.includes('firstName') ? this.independentOutcomes : this.spermBankOutcomes;
    this[outcomes === this.independentOutcomes ? 'independentOutcomes' : 'spermBankOutcomes'] = outcomes.map(outcome =>
      outcome.index === parseInt(index, 10) ? { ...outcome, [field]: value } : outcome
    );
  }

  handleAddAnotherSpermBank() {
    this.showNumberedHeadings = true;
    const newOutcome = { id: Date.now(), index: this.spermBankOutcomes.length + 1, bankName: '', bankWebsite: '', bankPhone: '', bankEmail: '', coordinatorName: '' };
    this.spermBankOutcomes = [...this.spermBankOutcomes, newOutcome];
  }

  handleAddAnotherRecipient() {
    this.showNumberedHeadings = true;
    const newOutcome = { id: Date.now(), index: this.independentOutcomes.length + 1, firstName: '', lastName: '', email: '', phone: '' };
    this.independentOutcomes = [...this.independentOutcomes, newOutcome];
  }

  handleDeleteClick(event) {
    const index = parseInt(event.target.dataset.index, 10);
    if (this.spermBankOutcomes.some(outcome => outcome.index === index)) {
      this.spermBankOutcomes = this.spermBankOutcomes.filter(outcome => outcome.index !== index);
    } else if (this.independentOutcomes.some(outcome => outcome.index === index)) {
      this.independentOutcomes = this.independentOutcomes.filter(outcome => outcome.index !== index);
    }
    this.showNumberedHeadings = this.spermBankOutcomes.length > 1 || this.independentOutcomes.length > 1;
  }

  handleBack() {
    this.dispatchEvent(new CustomEvent('back'));
  }

  handleNext() {
    this.dispatchEvent(new CustomEvent('next'));
  }
}