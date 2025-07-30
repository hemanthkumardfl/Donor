import { LightningElement } from 'lwc';
import getstartedIcon from '@salesforce/resourceUrl/getstartedicon';
import supportIcon from '@salesforce/resourceUrl/supporticon';

export default class DonorPreRegMobileFooter extends LightningElement {
    
    getstartedIcon = getstartedIcon;
    supportIcon = supportIcon;

    handlePrevious() {
        this.dispatchEvent(new CustomEvent('previous'));
    }
}