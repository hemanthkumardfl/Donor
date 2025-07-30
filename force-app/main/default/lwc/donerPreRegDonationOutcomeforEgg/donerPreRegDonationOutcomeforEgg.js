import { LightningElement, track } from 'lwc';

export default class DonorPreRegDonationOutComeForEgg extends LightningElement {
    @track cycles = [];
    totalCycles = 6; 

    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    connectedCallback() {
        // Initialize cycles array with empty data for each cycle
        this.cycles = Array.from({ length: this.totalCycles }, (_, index) =>
            this.createCycleData(index + 1)
        );
    }

    createCycleData(number) {
        return {
            id: `${Date.now()}-${Math.random()}-${number}`,
            number,
            eggs: '',
            embryos: '',
            pgd: '',
            pregnancy: '',
            liveBirth: '',
            genderInfo: ''
        };
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        const index = parseInt(event.target.dataset.index, 10);
        this.cycles[index][field] = event.target.value;
        this.cycles = [...this.cycles]; // Ensure reactivity
    }
}