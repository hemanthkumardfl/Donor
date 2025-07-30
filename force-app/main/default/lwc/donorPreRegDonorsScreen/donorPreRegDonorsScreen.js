import { LightningElement, track } from 'lwc';
import DONOR_PRE_REG_DONORS_SCREEN_IMG from "@salesforce/resourceUrl/donorPreRegDonorsScreen_IMG";

export default class DonorPreRegDonorsScreen extends LightningElement {

    donorsScreens_Img = DONOR_PRE_REG_DONORS_SCREEN_IMG;
    @track showDonorTypes = true;
    @track showDonorVideo = false;
    @track selectedDonorType = '';
    @track screenType;
    @track isMobile = false;
    @track contactObj;

    connectedCallback() {
        const width = window.innerWidth;
        if (width <= 480) {
            this.screenType = 'mobile';
            this.isMobile = true;
        } else if (width <= 768) {
            this.screenType = 'tablet';
        } else if (width <= 1024) {
            this.screenType = 'desktop';
        } else {
            this.screenType = 'large-desktop';
        }
    }

    handleDonorsScreenNext() {
        if (!this.selectedDonorType) {
            console.error('Please select a donor type before proceeding.');
            return;
        }
        this.showDonorTypes = false;
        this.showDonorVideo = true;
    }

    handleHomeButtonClick(event) {
        this.showDonorTypes = true;
        this.showDonorVideo = false;
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
    }

    handleNavigateToGetStarted() {
        this.showDonorTypes = false;
        this.showDonorVideo = false;
    }

    handleDonorsIntroScreen() {
        this.showDonorTypes = true;
        this.showDonorVideo = false;
    }

    previousHandler() {
        this.showDonorTypes = true;
        this.showDonorVideo = false;
    }

    handleDonorClick(event) {
        this.selectedDonorType = event.target.dataset.name;
    }

    handleVideoContinue() {
        this.showDonorVideo = false;
    }

    handleVideoBack() {
        this.showDonorVideo = false;
        this.showDonorTypes = true
    }

    get eggOptionClass() {
        const classname = 'donorLabelCls';
        return this.selectedDonorType === 'egg' ? `${classname} active-step` : classname;
    }

    get spermOptionClass() {
        const classname = 'donorLabelCls';
        return this.selectedDonorType === 'sperm' ? `${classname} active-step` : classname;
    }

    get embryoOptionClass() {
        const classname = 'donorLabelCls';
        return this.selectedDonorType === 'embryo' ? `${classname} active-step` : classname;
    }

    get preRegistrationScreens() {
        let result = false;
        if (this.showDonorTypes == false && this.showDonorVideo == false) {
            result = true;
        }
        return result;
    }

}