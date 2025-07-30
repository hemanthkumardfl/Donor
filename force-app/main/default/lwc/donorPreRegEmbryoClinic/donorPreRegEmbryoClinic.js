import { LightningElement, track, api } from 'lwc';

export default class DonorPreRegEggClinic extends LightningElement {
    @api totalDonationsCount = 9;
    @track donationOutcomes = [];
    @track noClinicChecked = false;
    @track showNumberedHeadings = false;

    clinicInfoDonationOutcomeObject = {
        id: Date.now(),
        index: 1,
        clinicHeading: 'Clinic #1',
        ClinicName: '',
        DoctorName: '',
        Website: '',
        CityStateOfClinic: '',
        Phone: '',
        Email: '',
        CoordinatorName: '',
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
        this.clinicInfoDonationOutcomeObject.cycles = [...cyclesList];
        this.donationOutcomes = [{ ...this.clinicInfoDonationOutcomeObject }];
    }

    get donationOutcomes() {
        return this.donationOutcomes;
    }

    handleAddAnotherClinic() {
        this.showNumberedHeadings = true;
        const newOutcome = {
            ...this.clinicInfoDonationOutcomeObject,
            id: Date.now(),
            index: this.donationOutcomes.length + 1,
            clinicHeading: '',
            cycles: [...this.clinicInfoDonationOutcomeObject.cycles],
            selectedCycles: []
        };
        this.donationOutcomes = [...this.donationOutcomes, newOutcome].map((outcome, i) => ({
            ...outcome,
            index: i + 1,
            clinicHeading: this.donationOutcomes.length === 1 ? 'Fertility Clinic Info' : ''
        }));
    }

    handleDeleteClick(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.donationOutcomes = this.donationOutcomes
            .filter(outcome => outcome.index !== index)
            .map((outcome, i) => ({
                ...outcome,
                index: i + 1,
                clinicHeading: this.donationOutcomes.length === 1 ? 'Fertility Clinic Info' : ''
            }));
        this.showNumberedHeadings = this.donationOutcomes.length > 1;
    }

    handleNoClinicChange(event) {
        this.noClinicChecked = event.target.checked;
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

    handleEggClinicWithoutEDNBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    handleEggClinicWithoutEDNNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }
}