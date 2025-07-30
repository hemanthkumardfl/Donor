import { LightningElement, track, api } from 'lwc';
import updateEggCycleDontionOutcomes from '@salesforce/apex/SpermDonorPreRegistrationController.updateEggCycleDontionOutcomes';

export default class DonorPreRegEggCycleOutcome extends LightningElement {

    @track cycles = [];
    @track totalCycles;
    @api donationBasicsInfo;
    @api donationOutcomeUserinput = [];
    @api contactObj;

    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        this.totalCycles = this.contactObj.donationBasics.egg.liveBirths;
        console.log('Outcome Before >>>> '+JSON.stringify(this.contactObj.allCycles));
        for (let i in this.contactObj.allCycles) {
            this.cycles.push({
                Id: this.contactObj.allCycles[i].Id,
                number: parseInt(i) + 1,
                pregnancyGroup: `pregnancy_${i}`,
                liveBirthGroup: `liveBirth_${i}`,
                eggs: this.contactObj.allCycles[i].eggs,
                embryos: this.contactObj.allCycles[i].embryos,
                pgd: this.contactObj.allCycles[i].pgd,
                pregnancy: this.contactObj.allCycles[i].pregnancy,
                liveBirth: this.contactObj.allCycles[i].liveBirth,
                genderInfo: this.contactObj.allCycles[i].genderInfo
            })
        }
    }

    handleChange(event) {
        try {
            const field = event.target.dataset.field;
            const index = parseInt(event.target.dataset.index, 10);
            this.cycles[index][field] = event.target.value;
            this.cycles = [...this.cycles]; // Ensure reactivity
        }
        catch (e) {
            console.log('error')
            console.log(e.message)
            confirm.log(e.stack)
        }
    }
    handleInputBlur(event) {
        const input = event.target;
        const fieldName = input.name;
        const value = input.value;
        const fieldsMap = new Map();
        fieldsMap.set('Eggs', 'Please enter number of Eggs retrieved');

        if (fieldsMap.has(fieldName)) {
            if (value === '') {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        }
    }

    handleRadioChange(event) {
        const field = event.target.dataset.field;
        const index = parseInt(event.target.dataset.index, 10);
        this.cycles[index][field] = event.target.value;
        this.cycles = [...this.cycles];
    }

    handleEggCycleOutcomeBack() {
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }

    async handleEggCycleOutcomeNext() {
        console.log(JSON.stringify(this.cycles))

        const fieldsMap = new Map();
        fieldsMap.set('Eggs', 'Please enter number of Eggs retrieved');

        let isValid = true;
        this.template.querySelectorAll('lightning-input').forEach(input => {
            if (fieldsMap.has(input.name) && input.value === '') {
                input.setCustomValidity(fieldsMap.get(input.name));
                input.reportValidity();
                isValid = false;
            } else {
                input.setCustomValidity('');
                input.reportValidity();
            }
        });
        if (isValid) {
            let result = await updateEggCycleDontionOutcomes({ cyclesData: JSON.stringify(this.cycles) });
            console.log('Result >>> ' + JSON.stringify(result))
            if (result.isSuccess) {
                this.contactObj['allCycles'] = this.cycles;
                console.log('Outcome After >>>> '+JSON.stringify(this.contactObj.allCycles));
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
            }
        }
    }
}