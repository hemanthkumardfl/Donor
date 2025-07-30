import { LightningElement } from 'lwc';
import DONOR_IMAGE from '@salesforce/resourceUrl/waitingRoom'
export default class DonorPreRegEmbryoWaitingRoom extends LightningElement {
     imageUrl = DONOR_IMAGE;
    handleCodeErrorBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    handleCodeErrorNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }

    handleInputChange(event) {
        const input = event.target;
        const index = parseInt(input.dataset.index, 10);
        const inputs = this.template.querySelectorAll('.input-box');
        if (event.type === 'input') {
            if (input.value.length > 1) {
                input.value = input.value.slice(0, 1);
            }
            if (input.value !== '' && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
        if (event.key == "Backspace") {
            if (input.value === '' && index > 0) {
                inputs[index-1].focus();
            }
        }
    }
}