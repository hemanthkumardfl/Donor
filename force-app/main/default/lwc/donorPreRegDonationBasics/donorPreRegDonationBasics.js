import { LightningElement, api, track } from 'lwc';

export default class DonorPreRegDonationBasics extends LightningElement {
    @api donorType;
    @track liveBirths = 0;
    @api contactObj;
    @track currentOrFutureDonationYes = false;
    @track currentOrFutureDonationNo = false;
    @track workWithAnyAgencyOrEggBankYes = false;
    @track workWithAnyAgencyOrEggBankNo = false;
    @track workWithAttorneyYes = false;
    @track workWithAttorneyNo = false;
    @track haveIntendedParentDetailsYes = false;
    @track haveIntendedParentDetailsNo = false;
    @track workWithAnySpermBankYes = false;
    @track notworkWithAnySpermBankYes = false;
    @track workWithAnyClinic = false;
    @track notworkWithAnyClinic = false;
    @track haveIntendedParentDetailsForSperm = false;
    @track nothaveIntendedParentDetailsForSperm = false;
    @track showError = false;

    get isEggDonation() {
        return this.donorType === 'egg';
    }

    get isSpermDonation() {
        return this.donorType === 'sperm';
    }

    connectedCallback() {
        console.log('Donation Basics >>> ' + JSON.stringify(this.contactObj));
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        if (this.contactObj && this.contactObj.donationBasics) {
            if (this.contactObj.donationBasics.egg.liveBirths) {
                this.liveBirths = this.contactObj.donationBasics.egg.liveBirths;
            } else {
                this.liveBirths = 0;
            }
            this.currentOrFutureDonationYes = this.contactObj.donationBasics.egg.currentOrFutureDonation;
            this.currentOrFutureDonationNo = !this.contactObj.donationBasics.egg.currentOrFutureDonation;
            this.workWithAnyAgencyOrEggBankYes = this.contactObj.donationBasics.egg.workWithAnyAgencyOrEggBank;
            this.workWithAnyAgencyOrEggBankNo = !this.contactObj.donationBasics.egg.workWithAnyAgencyOrEggBank;
            this.workWithAttorneyYes = this.contactObj.donationBasics.egg.workWithAttorney;
            this.workWithAttorneyNo = !this.contactObj.donationBasics.egg.workWithAttorney;
            this.haveIntendedParentDetailsYes = this.contactObj.donationBasics.egg.haveIntendedParentDetails;
            this.haveIntendedParentDetailsNo = !this.contactObj.donationBasics.egg.haveIntendedParentDetails;
            if (this.contactObj.donationBasics.sperm && Object.keys(this.contactObj.donationBasics.sperm).length == 3) {
                this.workWithAnySpermBankYes = this.contactObj.donationBasics.sperm.workWithAnySpermBank;
                this.notworkWithAnySpermBankYes = !this.contactObj.donationBasics.sperm.workWithAnySpermBank;
                this.workWithAnyClinic = this.contactObj.donationBasics.sperm.workWithAnyClinic;
                this.notworkWithAnyClinic = !this.contactObj.donationBasics.sperm.workWithAnyClinic;
                this.haveIntendedParentDetailsForSperm = this.contactObj.donationBasics.sperm.haveIntendedParentDetailsForSperm;
                this.nothaveIntendedParentDetailsForSperm = !this.contactObj.donationBasics.sperm.haveIntendedParentDetailsForSperm;
            }
        }
        else {
            this.contactObj['donationBasics'] = { egg: {}, sperm: {} };
        }
    }

    handleInputValidate(event) {
        if (['e', 'E', '+', '-', '.', 'b', 'B', 't', 'T', 'k', 'K', 'm', 'M'].includes(event.key)) {
            event.preventDefault();
        }
        if (parseInt(event.target.value) > 15) {
            event.target.value = 15;
        }
    }

    handleInputChange(event) {
        this.liveBirths = parseInt(event.target.value);
    }

    handleRadioChange(event) {
        let { name, label } = event.target;
        this.contactObj.donationBasics[this.donorType][name] = (label == 'Yes');
    }

    handleDonationBasicsBack() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }

    handleDonationBasicsNext() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        let donorType = this.contactObj.donorType;
        if (donorType === 'sperm') {
            if (Object.keys(this.contactObj.donationBasics[donorType]).length == 3) {
                this.showError = false;
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
            }
            else {
                this.showError = true;
            }

        }
        else {
            if (this.liveBirths <= 15) {
                this.contactObj.donationBasics.egg['liveBirths'] = this.liveBirths;
                const eggBasics = this.contactObj.donationBasics.egg;
                const allEmpty = Object.values(eggBasics).every(value => !value);
                if (!allEmpty) {
                    this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                }
            }
            else {
                let numberInput = this.template.querySelector('[data-id="NumberInput"]');
                if (numberInput) {
                    numberInput.reportValidity();
                    numberInput.setCustomValidity('Please enter a value less than 15')
                }
            }
        }
    }

    handleUpdateLiveBirths(event) {
        let action = event.target.dataset.name;
        if (action === 'add') {
            this.liveBirths++;
        } else if (action === 'remove' && this.liveBirths > 0) {
            this.liveBirths--;
        }
        this.contactObj.donationBasics.egg['liveBirths'] = this.liveBirths;
    }

    handleInputIPChange(event) {
        let field = event.target.dataset.name;
        this.intendedParentObj[field] = event.target.value
    }
}