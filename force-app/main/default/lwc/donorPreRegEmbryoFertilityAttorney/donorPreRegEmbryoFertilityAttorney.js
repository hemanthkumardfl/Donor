import { LightningElement, track, api } from 'lwc';

export default class DonorPreRegEggFertilityAttorney extends LightningElement {
    @api totalDonationsCount = 9;
    @track attorneyDonationOutcomes = [];
    @track noAttorneyChecked = false;
    @track dontRememberChecked = false;
    @track showNumberedHeadings = false;
    @track showIntendedParentDetails = false;
    @track intendedParentDetails = '';

    attorneyDonationOutcomeObject = {
        id: Date.now(),
        index: 1,
        attorneyHeading: '',
        AttorneyName: '',
        LawFirm: '',
        State: '',
        Phone: '',
        Email: '',
        cycles: [],
        selectedCycles: []
    };

    connectedCallback() {
        const cyclesList = Array(this.totalDonationsCount)
            .fill()
            .map((_, index) => ({
                cycleId: index + 1,
                cycleName: `Cycle ${index + 1}`
            }));
        this.attorneyDonationOutcomeObject.cycles = [...cyclesList];
        this.attorneyDonationOutcomes = [{ ...this.attorneyDonationOutcomeObject }];
    }

    get attorneyDonationOutcomes() {
        return this.attorneyDonationOutcomes;
    }

    get noAttorneyOrDontRemember() {
        return this.noAttorneyChecked || this.dontRememberChecked;
    }

    handleAddAnotherClinic() {
        this.showNumberedHeadings = true;
        const newOutcome = {
            ...this.attorneyDonationOutcomeObject,
            id: Date.now(),
            index: this.attorneyDonationOutcomes.length + 1,
            attorneyHeading: '',
            cycles: [...this.attorneyDonationOutcomeObject.cycles],
            selectedCycles: []
        };
        this.attorneyDonationOutcomes = [...this.attorneyDonationOutcomes, newOutcome].map((outcome, i) => ({
            ...outcome,
            index: i + 1,
            attorneyHeading: this.attorneyDonationOutcomes.length === 1 ? 'Fertility Attorney Info' : ''
        }));
    }

    handleDeleteClick(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.attorneyDonationOutcomes = this.attorneyDonationOutcomes
            .filter(outcome => outcome.index !== index)
            .map((outcome, i) => ({
                ...outcome,
                index: i + 1,
                attorneyHeading: this.attorneyDonationOutcomes.length === 1 ? 'Fertility Attorney Info' : ''
            }));
        this.showNumberedHeadings = this.attorneyDonationOutcomes.length > 1;
    }

    handleNoAttorneyChange(event) {
        this.noAttorneyChecked = event.target.checked;
        if (this.noAttorneyChecked) {
            this.dontRememberChecked = false;
        }
    }

    handleDontRememberChange(event) {
        this.dontRememberChecked = event.target.checked;
        if (this.dontRememberChecked) {
            this.noAttorneyChecked = false;
        }
    }

    handleInputChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.name;
        this.attorneyDonationOutcomes = this.attorneyDonationOutcomes.map(outcome =>
            outcome.index === index
                ? { ...outcome, [field]: event.target.value }
                : outcome
        );
    }

    handleCycleChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const cycleId = event.target.value;
        this.attorneyDonationOutcomes = this.attorneyDonationOutcomes.map(outcome => {
            if (outcome.index === index) {
                const selectedCycles = event.target.checked
                    ? [...outcome.selectedCycles, cycleId]
                    : outcome.selectedCycles.filter(id => id !== cycleId);
                return { ...outcome, selectedCycles };
            }
            return outcome;
        });
    }

    handleIntendedParentChange(event) {
        this.showIntendedParentDetails = event.target.value === 'yes';
        if (!this.showIntendedParentDetails) {
            this.intendedParentDetails = '';
        }
    }

    handleIntendedParentDetailsChange(event) {
        this.intendedParentDetails = event.target.value;
    }

    handleEggFertilityAttorneyWithoutEDNBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    handleEggFertilityAttorneyWithoutEDNNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }
}