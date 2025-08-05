import { LightningElement, track, api } from 'lwc';
import ERROR_LOGO from '@salesforce/resourceUrl/Error_Icon';
import checkPMCEmailAndPhone from '@salesforce/apex/EggDonorPreRegistrationController.checkPMCEmailAndPhone';


export default class DonorPreRegErrorCodeSubmission extends LightningElement {

    @track errorLogo = ERROR_LOGO;
    @track alternateEmail = '';
    @track alternatePhone = '';
    @track isOptOut = false;
    @api contactObj;
    @track selectedOption = '';
    @api unmatchedCodes = [];
    @track optionName = "Option2";

    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        this.unmatchedCodes = JSON.parse(JSON.stringify(this.unmatchedCodes));
    }

    handleErrorCodeSubmissionBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    async handleErrorCodeSubmissionNext() {
        // ✅ Validate unmatched codes in one line
        if (this.unmatchedCodes.some(ele => !ele.isOptOut && !ele.email && !ele.phone)) return;
    
        console.log(' this.unmatchedCodes >> ', JSON.stringify(this.unmatchedCodes));
        const result = await checkPMCEmailAndPhone({
            codeData: JSON.stringify(this.unmatchedCodes),
            donorType: this.contactObj.donorType
        });
    
        console.log('Result >>> ', JSON.stringify(result));
    
        if (result.isSuccess) {
            const codeCategories = ['PMC', 'EDN', 'SDN', 'EMB', 'REC'];
    
            // ✅ Remove opted-out codes from all categories dynamically
            this.unmatchedCodes
                .filter(i => i.isOptOut)
                .forEach(i => {
                    codeCategories.forEach(cat => {
                        const arr = this.contactObj.codes[cat];
                        const idx = arr.indexOf(i.code);
                        if (idx !== -1) arr.splice(idx, 1);
                    });
                });
    
            this.contactObj.unmatchedCodes = this.unmatchedCodes;
    
            // ✅ Build combined list dynamically
            const codeList = codeCategories.flatMap(cat => this.contactObj.codes[cat]);
            this.contactObj.isSkipped = (codeList.length === 0);
    
            console.log('this.contactObj >>> ', JSON.stringify(this.contactObj));
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }
    }
    

    handleInput(event) {
        try {
            let index = parseInt(event.target.dataset.index);
            let name = event.target.name;
            this.unmatchedCodes[index][name] = event.target.value;
        }
        catch (e) {
            console.log('handleInput Error: ' + e?.stack + ' - ' + e?.message);
        }
    }

    handleDiv(event) {
        try {
            const { name, index } = event.currentTarget.dataset;
            const idx = parseInt(index);
            this.unmatchedCodes[idx].isOptOut = (name === 'Option2');
            const selectedCard = this.template.querySelectorAll('.slds-card')[idx];
            if (selectedCard) {
                const [option1, option2] = selectedCard.querySelectorAll('.section-box');
                option1.classList.toggle('divSelected', name !== 'Option2');
                option2.classList.toggle('divSelected', name === 'Option2');
            }
        } catch (e) {
            console.error('HandleOption Error:', e);
        }
    }
    

}