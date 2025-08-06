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
    @track showFinalConfirmation = false;
    @track firstQuestionPlaceHolder = '';
    @track secondQuestionPlaceHolder = '';
    @track thirdQuestionPlaceHolder = '';
    @track firstQuestion = 'For your donations, did you ever work with an agency or egg bank at any point?';
    @track secondQuestion = 'For your donations, did you ever work with a fertility attorney at any point?';
    @track thirdQuestion = 'Do you have the contact information (phone or email) for any of the Intended Parents that you worked with? (for independent or known matches)';
    @track forthQuestion = 'For your upcoming donation, are you planning to work with an agency or egg bank?';
    @track fifthQuestion = 'For your upcoming donation, have you been assigned a fertility attorney?';
    @track sixthQuestion = 'For your upcoming donation, have you been provided the contact information (name, phone, or email) for any of the Intended Parents you plan to work with?';

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
            if (this.liveBirths == 0 && this.contactObj.donationBasics.egg.currentOrFutureDonation) {
                this.firstQuestionPlaceHolder = this.forthQuestion;
                this.secondQuestionPlaceHolder = this.fifthQuestion;
                this.thirdQuestionPlaceHolder = this.sixthQuestion;
            }
            else {
                this.firstQuestionPlaceHolder = this.firstQuestion;
                this.secondQuestionPlaceHolder = this.secondQuestion;
                this.thirdQuestionPlaceHolder = this.thirdQuestion;
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
            this.firstQuestionPlaceHolder = this.firstQuestion;
            this.secondQuestionPlaceHolder = this.secondQuestion;
            this.thirdQuestionPlaceHolder = this.thirdQuestion;
        }
    }

    handleInputValidate(event) {
        if (['e', 'E', '+', '-', '.', 'b', 'B', 't', 'T', 'k', 'K', 'm', 'M'].includes(event.key)) {
            event.preventDefault();
        }
        // if (parseInt(event.target.value) > 15) {
        //     event.target.value = 15;
        // }
    }

    handleInputChange(event) {
        this.liveBirths = parseInt(event.target.value);
        const useFutureQuestions =
            this.contactObj.donationBasics.egg.currentOrFutureDonation &&
            this.liveBirths === 0;

        [this.firstQuestionPlaceHolder, this.secondQuestionPlaceHolder, this.thirdQuestionPlaceHolder] =
            useFutureQuestions
                ? [this.forthQuestion, this.fifthQuestion, this.sixthQuestion]
                : [this.firstQuestion, this.secondQuestion, this.thirdQuestion];
    }


    handleFinalConfirm() {
        location.reload();
    }

    handleRadioChange(event) {
        const { name, label } = event.target;
        this.contactObj.donationBasics[this.donorType][name] = (label === 'Yes');

        if (name === 'currentOrFutureDonation' && this.liveBirths === 0) {
            const useFutureQuestions = (label === 'Yes');
            [this.firstQuestionPlaceHolder, this.secondQuestionPlaceHolder, this.thirdQuestionPlaceHolder] =
                useFutureQuestions
                    ? [this.forthQuestion, this.fifthQuestion, this.sixthQuestion]
                    : [this.firstQuestion, this.secondQuestion, this.thirdQuestion];
        }
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
                else {
                    this.showFinalConfirmation = true;
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