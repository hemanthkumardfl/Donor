import { LightningElement } from 'lwc';
export default class DonorPreRegDonorVideos extends LightningElement {
    
    handleDonorVdeoContinue(){
         this.dispatchEvent(new CustomEvent('continue'));
    }

    handleDonorVdeoBack(){
         this.dispatchEvent(new CustomEvent('back'));
    }
}