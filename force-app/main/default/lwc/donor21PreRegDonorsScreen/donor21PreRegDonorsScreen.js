import { LightningElement, track } from 'lwc';
import DONOR_PRE_REG_TYPES_IMG from "@salesforce/resourceUrl/donorPreRegTypesIMG";
export default class Donor21PreRegDonorsScreen extends LightningElement {
    
    donorLogo = DONOR_PRE_REG_TYPES_IMG;
    @track showDonorTypes = true;
    @track showDonorVideo = false;
    @track selectedDonorType = '';
    @track screenType;
    @track isMobile = false;

    connectedCallback() {
        const width = window.innerWidth;

        if (width <= 480) {
            this.screenType = 'mobile'; // small mobile
            this.isMobile = true;
        } else if (width <= 768) {
            this.screenType = 'tablet'; // tablets or large phones
        } else if (width <= 1024) {
            this.screenType = 'desktop'; // small laptop
        } else {
            this.screenType = 'large-desktop'; // full desktop
        }
    }

    handleNext() {
        if (!this.selectedDonorType) {
            console.error('Please select a donor type before proceeding.');
            return;
        }
        this.showDonorTypes = false;
        this.showDonorVideo = true;
    }

    handleHomeButtonClick() {
        this.showDonorTypes = true;
        this.showDonorVideo = false;
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

    handleEggDonorClick(event) {
        this.selectedDonorType = event.target.dataset.name;
    }

    handleSpermDonorClick(event) {
        this.selectedDonorType = event.target.dataset.name;
    }

    handleEmbryoDonorClick(event) {
        this.selectedDonorType = event.target.dataset.name;
    }

    handleDonorVideoContinue() {
        this.showDonorVideo = false;
        // this.preRegistrationScreens = true;
    }

    handleDonorVideoBack() {
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