import { LightningElement, api, track } from 'lwc';

export default class DonorPreRegDonationBasics extends LightningElement {
    @api donorType;
    @track liveBirths = 0;
    @track spermBank = '';
    @track agencyDonation = false;
    @track clinicDonation = false;
    @track independentDonation = false;

    connectedCallback() {
        // Initialize component
    }

   
    handleSpermBankChange(event) {
        this.spermBank = event.target.value;
    }

    handleNoAgencyChange(event) {
        const { name, checked } = event.target;
        this[name] = checked;
    }

    handleDonationBasicsBack() {
        this.dispatchEvent(new CustomEvent('back'));    
    }

    handleDonationBasicsNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }

    handleRemove() {
        if (this.liveBirths > 0) {
            this.liveBirths--;
        }
    }

    handleAddNew() {
        this.liveBirths++;
    }
}