import { LightningElement } from 'lwc';
import GET_STARTED_ICON from '@salesforce/resourceUrl/getstartedicon';
import SUPPORT_ICON from '@salesforce/resourceUrl/supporticon';
export default class DonorPreRegistartionMobileFooter extends LightningElement {
    getstartedIcon = GET_STARTED_ICON;
    supportIcon = SUPPORT_ICON;

    handlePrevious(){
        this.dispatchEvent(new CustomEvent("previous"));
    }

}