import { LightningElement } from 'lwc';
export default class DonorPreRegOffspringVideos extends LightningElement {
    
    handleDonorVdeoContinue(){
         this.dispatchEvent(new CustomEvent('continue'));
    }

    handleDonorVdeoBack(){
         this.dispatchEvent(new CustomEvent('back'));
    }
}