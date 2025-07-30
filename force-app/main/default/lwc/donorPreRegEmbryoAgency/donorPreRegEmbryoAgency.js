import { LightningElement, track, api } from 'lwc';

export default class DonorPreRegEggDonorAgency extends LightningElement {
    @api totalDonationsCount = 9;
    @track donationOutcomes = [];
    @track noAgencyChecked = false;
    @track showNumberedHeadings = false;

    donationOutcomeObject = {
        id: Date.now(),
        index: 1,
        agencyHeading: 'Agency/Egg Bank 1',
        AgencyName: '',
        Website: '',
        Phone: '',
        Email: '',
        CoordinatorName: '',
        cycles: [],
        selectedCycles: []
    };

    connectedCallback() {
        // Initialize cycles based on totalDonationsCount
        const cyclesList = Array(this.totalDonationsCount)
            .fill()
            .map((_, index) => ({
                cycleId: index + 1,
                cycleName: `Cycle ${index + 1}`
            }));
        this.donationOutcomeObject.cycles = [...cyclesList];
        this.donationOutcomes = [{ ...this.donationOutcomeObject }];
    }

    get donationOutcomes() {
        return this.donationOutcomes;
    }

    handleAddAnotherClinic() {
        this.showNumberedHeadings = true;
        const newOutcome = {
            ...this.donationOutcomeObject,
            id: Date.now(),
            index: this.donationOutcomes.length + 1,
            agencyHeading: '',
            cycles: [...this.donationOutcomeObject.cycles],
            selectedCycles: []
        };
        this.donationOutcomes = [...this.donationOutcomes, newOutcome].map((outcome, i) => ({
            ...outcome,
            index: i + 1,
            agencyHeading: this.donationOutcomes.length === 1 ? 'Agency/Egg Bank Info' : ''
        }));
    }

    handleDeleteClick(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.donationOutcomes = this.donationOutcomes
            .filter(outcome => outcome.index !== index)
            .map((outcome, i) => ({
                ...outcome,
                index: i + 1,
                agencyHeading: this.donationOutcomes.length === 1 ? 'Agency/Egg Bank Info' : ''
            }));
        this.showNumberedHeadings = this.donationOutcomes.length > 1;
    }

    handleNoAgencyChange(event) {
        this.noAgencyChecked = event.target.checked;
    }

    handleInputChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.name;
        this.donationOutcomes = this.donationOutcomes.map(outcome =>
            outcome.index === index
                ? { ...outcome, [field]: event.target.value }
                : outcome
        );
    }

    handleCycleChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const cycleId = event.target.value;
        this.donationOutcomes = this.donationOutcomes.map(outcome => {
            if (outcome.index === index) {
                const selectedCycles = event.target.checked
                    ? [...outcome.selectedCycles, cycleId]
                    : outcome.selectedCycles.filter(id => id !== cycleId);
                return { ...outcome, selectedCycles };
            }
            return outcome;
        });
    }

    handleEggAgencyOrBankWithoutEDNBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    handleEggAgencyOrBankWithoutEDNNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }
}