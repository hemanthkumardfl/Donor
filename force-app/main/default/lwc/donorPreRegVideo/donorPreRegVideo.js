import { LightningElement } from 'lwc';

export default class DonorPreRegVideo extends LightningElement {

    handleVideoContinue() {
        this.dispatchEvent(new CustomEvent('continue'));
    }

    handleVideoBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }
}