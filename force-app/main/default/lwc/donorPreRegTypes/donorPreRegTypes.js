import { LightningElement, api, track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import DONOR_PRE_REG_TYPES_IMG from "@salesforce/resourceUrl/donorPreRegTypesIMG";
import DONOR_PRE_REG_STYLES from '@salesforce/resourceUrl/donorPreRegTypeCSS';
export default class DonorPreRegTypes extends LightningElement {

   donorLogo = DONOR_PRE_REG_TYPES_IMG;
   backgroundStyle =  `background-image: url(${DONOR_PRE_REG_TYPES_IMG});`
   @track donorType;

    connectedCallback() {
        loadStyle(this, DONOR_PRE_REG_STYLES)
            
    }

   handleNextClick() {
      if (this.donorType) {
         this.dispatchEvent(new CustomEvent('next', {
            detail: {
               donorType: this.donorType
            }
         }));
      }
   }

   handleEggDonorClick() {
      this.donorType = 'eggDonor';
   }

   handleSpermDonorClick() {
      this.donorType = 'spermDonor';
   }

   handleEmbryoDonorClick() {
      this.donorType = 'embryoDonor';
   }
}