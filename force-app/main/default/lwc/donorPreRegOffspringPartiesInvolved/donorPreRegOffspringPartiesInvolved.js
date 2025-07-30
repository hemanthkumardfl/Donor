import { LightningElement, track } from 'lwc';

export default class DonorPreRegOffspringPartiesInvolved extends LightningElement {
    @track isParent = true;

    handleRemoveParent2(){
        this.isParent = false;
    }
}