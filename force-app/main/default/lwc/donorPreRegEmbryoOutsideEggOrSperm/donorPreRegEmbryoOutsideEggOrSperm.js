import { LightningElement } from 'lwc';

export default class DonorPreRegEmbryoOutsideEggOrSperm extends LightningElement {

    offspringUpdates = '';
    donorUpdates = '';

    yesNoOptions = [
        { label: 'Yes, I would like updates about children born from my donated embryos', value: 'Yes' },
        { label: 'No, thank you', value: 'No' }
    ];

    secondRadioList = [
        { label: 'Yes, I would like updates from the egg and/or sperm donor(s) who helped create my embryos', value: 'Yes' },
         { label: 'No, thank you', value: 'No' }
    ]

    handleChange(event) {
        this[event.target.name] = event.detail.value;
    }

    handleBack() {
        // Navigate back
    }

    handleNext() {
        // Save or proceed
    }
}