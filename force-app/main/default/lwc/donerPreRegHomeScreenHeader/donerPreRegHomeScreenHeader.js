import { LightningElement, track, api } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
i//mport myStyles from '@salesforce/resourceUrl/donorPreRegHeaderCSS';

export default class DonorPreRegHeader extends LightningElement {
    @track isCancel = false;
    @track isShowDonorIntro  = false; 
    @track isHeaderScreen = true;
    tooglesidebar;

    connectedCallback() {
        loadStyle(this, myStyles)
    }

    handleHomeButtonClick(event) {
       this.isShowDonorIntro = false;
       this.isHeaderScreen = true;
    
    }

    handleMobileNavbar(){
        var ele = this.template.querySelector('.sidebar');
        ele.style.display = "block" 
        ele.style.transform = "translateX(" + (0) + ")";
        ele.style.transition = "transition: opacity 0.3s ease, visibility 0.2s ease, transform 0.3s ease;"
        this.isCancel = true;
    }
    handleMobileNavbarCancel(){
        var ele = this.template.querySelector('.sidebar');
        ele.style.display = "none" 
        ele.style.transform = "translateX(" + (-100) + ")";
        ele.style.transition = "transition: opacity 0.3s ease, visibility 0.2s ease, transform 0.3s ease;"
        this.isCancel = false;
    }
    handleHomeClick(){
        this.dispatchEvent(new CustomEvent('homebuttonclick', {
            detail:true
        }));
        this.isShowDonorIntro = true;
        this.isHeaderScreen = false;
    }

    @api toggleHeader(){
        if(this.isCancel){
             var ele = this.template.querySelector('.sidebar');
            ele.style.display = "none" 
            ele.style.transform = "translateX(" + (-100) + ")";
            ele.style.transition = "transition: opacity 0.3s ease, visibility 0.2s ease, transform 0.3s ease;"
            this.isCancel = false;
        }
    }
}