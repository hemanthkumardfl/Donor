import { LightningElement, api } from 'lwc';
import DONOR_APP_LOGO  from '@salesforce/resourceUrl/DonorAppLogo';
export default class D21_CustomSpinner extends LightningElement {
    @api loadSpinner;
    logoUrl = DONOR_APP_LOGO;
}