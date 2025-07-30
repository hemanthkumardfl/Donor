import { LightningElement } from 'lwc';
import DONOR_IMAGE from '@salesforce/resourceUrl/donerimage';
export default class   donorPreRegEmbryoFinish extends LightningElement {
      imageUrl = DONOR_IMAGE; // Adjust this if you have a folder path
    handleMatchVerificationBack(){
        this.dispatchEvent(new CustomEvent('back'));
    }

     handleMatchVerificationNext(){
        this.dispatchEvent(new CustomEvent('next'));
    }
}