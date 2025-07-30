import { LightningElement, track, api } from 'lwc';
import createSpermClinicWithSDN from '@salesforce/apex/SpermDonorPreRegistrationController.createSpermClinicWithSDN'
//import fetchSpermDonorClinicDetails from '@salesforce/apex/EggDonorPreRegistrationController.fetchSpermDonorClinicDetails'
import fetchSpermDonorClinicDetails from '@salesforce/apex/SpermDonorWithCodesController.fetchSpermDonorClinicDetails';
import deleteSpermBank from '@salesforce/apex/SpermDonorPreRegistrationController.deleteSpermBank';

export default class DonorPreRegClinicInfoWithSDN extends LightningElement {
    //  @track warningIcon = WARNING_ICON_LOGO;
    @track primaryBank = {

    };

    @track primaryClinicsListFromApex = [];
    @track primaryConfirmed = null;
    @track primaryIncorrect = null;
    @track noOtherBanks = false;
    @track showNumberedHeadings = false;
    @track showDeletePopup = false;
    @track deleteIndex = null;
    @track deleteBankNumber = null;
    @track showInformation = false;
    @track additionalBanks = [
        {
            id: Date.now() + Math.random(),
            bankNumber: 1,
            bankHeading: '',
            bankName: '',
            website: '',
            phone: '',
            email: '',
            coordinator: '',
            donorCode: '',
            showDonorCodeInput: false,
            hideDonorCodeInput: true,
            spermclinicId : '',
            accountId : '',
            spermbankId : ''
        }
    ];
    @api clinicUserInput;
    @api contactObj;
    @track deleteSpermBankId = '';
    @track didYouWorkAnyOtherClinic = null;
    @track showErrorMsg = false;

    get options() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }


    handlePrimaryInputChange(event) {
        const field = event.target.name;
        let recodslist = [];
        this.primaryClinicsListFromApex.forEach(record => {
            let obj = {... record}
            if(record.spermclinicId == event.target.dataset.spermclinicid){
                obj[field] = event.target.value;
                console.log(JSON.stringify(obj))
            }
            recodslist.push(obj);
        })
        console.log('recodslist' + JSON.stringify(recodslist));
        this.primaryClinicsListFromApex = [... recodslist];
        console.log('primaryClinicsListFromApex' + JSON.stringify(this.primaryClinicsListFromApex));
        const input = event.target;
        if (input.validity.valid) {
            input.setCustomValidity('');
            input.reportValidity();
        }
    }



     async fetchSpermDonorClinics(){
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj || {}));
        let spermdonorClinicResponse = await fetchSpermDonorClinicDetails({ contactObj: JSON.stringify(this.contactObj) });
        if (spermdonorClinicResponse.isSuccess) {
            console.log(JSON.parse(spermdonorClinicResponse.message));
            this.primaryClinicsListFromApex = JSON.parse(spermdonorClinicResponse.message);
            this.contactObj['clinicInfoWithSDN'] = JSON.parse(spermdonorClinicResponse.message);
            // if(this.additionalBanks){
            //     this.contactObj.clinicInfoWithSDN['additionalBanks'] = this.additionalBanks
            // }
           if(this.contactObj.selectedDisabledForSDNclinicAdditionalInputs){
                this.noOtherBanks = true;
           }
            
            console.log('FROM CONTACTOBJ RECORD CLINIC >>>>>>>>>' + JSON.stringify(this.contactObj));
        }

    }

    connectedCallback() {

        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        console.log(JSON.stringify(this.contactObj));
        

        console.log('Test Strated');
         console.log(JSON.stringify(this.contactObj));

        /*********************************************** */
         
        /******************************************** */
        if(this.contactObj && this.contactObj.clinicInfoWithSDN && this.contactObj['clinicInfoWithSDN']['didYouWorkAnyOtherClinic']){
            this.didYouWorkAnyOtherClinic = this.contactObj['clinicInfoWithSDN']['didYouWorkAnyOtherClinic'];
        }


        if(this.contactObj && this.contactObj.clinicInfoWithSDN && this.contactObj.clinicInfoWithSDN['additionalBanks'].length > 0) {
             console.log('contactObj Recod >>>>' + JSON.stringify(this.contactObj))
            this.additionalBanks = [...this.contactObj.clinicInfoWithSDN['additionalBanks']];
            this.primaryBank = { ...this.contactObj.clinicInfoWithSDN['primaryBank'] };
            this.primaryConfirmed = this.contactObj.clinicInfoWithSDN['primaryConfirmed'] || false;
            this.primaryIncorrect = this.contactObj.clinicInfoWithSDN['primaryIncorrect'] || false;
            this.noOtherBanks = this.contactObj.clinicInfoWithSDN['noOtherBanks'] || false;
            this.showNumberedHeadings = this.additionalBanks.length > 1;
        }
        else {
            let objList = [{
                ...this.bankObject,
                id: Date.now() + Math.random(),
                index: 0,
                bankNumber: 1
            }];
            if(this.additionalBanks && this.additionalBanks.length > 0){
            }
            else{
                this.additionalBanks = [...objList];
            }

        }
         this.primaryConfirmed = this.contactObj['spermWithSDNclinicprimaryConfirmed'];
         this.primaryIncorrect = this.contactObj['spermWithSDNclinicprimaryIncorrect'];
        //alert();
        console.log('contactObj >>>>' + JSON.stringify(this.contactObj))

        this.fetchSpermDonorClinics();
    }

    get checkboxStatus() {
        return this.additionalBanks.length > 1 ; // || this.hasBankDetails();
    }

    hasBankDetails() {
        return this.additionalBanks.some(bank =>
            bank.bankName || bank.website || bank.phone || bank.email || bank.coordinator ||
            (bank.showDonorCodeInput && bank.donorCode)
        );
    }

    handlePrimaryChange(event) {
        const field = event.currentTarget.dataset.field;
        this.primaryBank[field] = event.target.value;
        const input = event.target;
        if (input.validity.valid) {
            input.setCustomValidity('');
            input.reportValidity();
        }
    }

    handlePrimaryConfirmedChange(event) {
        this.primaryConfirmed = event.target.checked;
        if (this.primaryConfirmed) {
            this.primaryIncorrect = false;
            this.contactObj['spermWithSDNclinicprimaryConfirmed'] = true;
            this.contactObj['spermWithSDNclinicprimaryIncorrect'] = false;
        }
        //this.contactObj['spermWithSDNclinicprimaryConfirmed'] = this.primaryConfirmed;
       
    }

    handlePrimaryIncorrectChange(event) {
        this.primaryIncorrect = event.target.checked;
        if (this.primaryIncorrect) {
            this.primaryConfirmed = false;
            this.contactObj['spermWithSDNclinicprimaryConfirmed'] = false;
            this.contactObj['spermWithSDNclinicprimaryIncorrect'] = true;
        }
        //this.contactObj['spermWithSDNclinicprimaryIncorrect'] = this.primaryIncorrect;
    }

    handleNoOtherBanksChange(event) {
        this.noOtherBanks = event.target.checked;
        if (this.noOtherBanks) {
            if (this.hasBankDetails()) {
                this.template.querySelector('lightning-input[label="Check here if you did not work with any other clinics"]').checked = false;
                this.noOtherBanks = false;
                this.showInformation = true;
                return;
            }
            this.showInformation = false;
            this.additionalBanks = this.additionalBanks.map(bank => ({
                ...bank,
                bankName: '',
                website: '',
                phone: '',
                email: '',
                coordinator: '',
                donorCode: '',
                showDonorCodeInput: false,
                hideDonorCodeInput: true
            }));
        }
    }

    handleAdditionalChange(event) {
        const index = parseInt(event.currentTarget.dataset.index, 10);
        if (isNaN(index)) {
            console.error('Invalid index in handleAdditionalChange:', event.currentTarget.dataset.index);
            return;
        }
        const field = event.currentTarget.dataset.field;
        const value = event.target.value;
        this.additionalBanks = this.additionalBanks.map((bank, i) =>
            i === index ? { ...bank, [field]: value } : bank
        );
        const input = event.target;
        if (input.validity.valid) {
            input.setCustomValidity('');
            input.reportValidity();
        }
        console.log(JSON.stringify(this.additionalBanks))
         console.log(JSON.stringify(this.contactObj))
    }

    handleRadioChange(event) {
        const index = parseInt(event.currentTarget.dataset.index, 10);
        if (isNaN(index)) {
            console.error('Invalid index in handleRadioChange:', event.currentTarget.dataset.index);
            return;
        }
        const value = event.target.value;
        this.additionalBanks = this.additionalBanks.map((bank, i) =>
            i === index
                ? {
                    ...bank,
                    showDonorCodeInput: value === 'yes',
                    hideDonorCodeInput: value === 'no'
                }
                : bank
        );
    }

    addAnotherBank() {
        this.showNumberedHeadings = true;
        const newBank = {
            id: Date.now() + Math.random(),
            bankNumber: this.additionalBanks.length + 1,
            bankHeading: '',
            bankName: '',
            website: '',
            phone: '',
            email: '',
            coordinator: '',
            donorCode: '',
            showDonorCodeInput: false,
            hideDonorCodeInput: true
        };
        this.additionalBanks = [
            ...this.additionalBanks.map((bank, i) => ({
                ...bank,
                bankNumber: i + 1,
                bankHeading: ''
            })),
            newBank
        ];
    }

    handleDeleteBank(event) {
        const index = parseInt(event.currentTarget.dataset.index, 10);
       // alert(index);
        if (isNaN(index)) {
            console.error('Invalid index in handleDeleteBank:', event.currentTarget.dataset.index);
            return;
        }
        const bank = this.additionalBanks.find(b => b.index === index);
        this.deleteIndex = index;
        this.deleteBankNumber = bank ? bank.bankNumber : null;
        this.deleteSpermBankId = event.target.dataset.accountid;
        //alert(event.target.dataset.accountid);
        this.showDeletePopup = true;
    }

    async handleDeleteYes() {
        console.log(JSON.stringify(this.additionalBanks[this.deleteIndex]));
        
        if(this.additionalBanks[this.deleteIndex].accountId){
            let resultData = await deleteSpermBank({ spermbankId: this.additionalBanks[this.deleteIndex].accountId }); 
            //alert('Delete Clinic >>> ' + JSON.stringify(resultData));
        }
       
        const index = this.deleteIndex;
        let updatedBanks = [...this.additionalBanks];
        updatedBanks.splice(index, 1);
        updatedBanks = updatedBanks.map((bank, i) => ({
            ...bank,
            bankNumber: i + 1,
            bankHeading: ''
        }));
        if (updatedBanks.length === 0) {
            updatedBanks.push({
                id: Date.now() + Math.random(),
                bankNumber: 1,
                bankHeading: '',
                bankName: '',
                website: '',
                phone: '',
                email: '',
                coordinator: '',
                donorCode: '',
                showDonorCodeInput: false,
                hideDonorCodeInput: true
            });
        }
        this.additionalBanks = updatedBanks;
        this.showNumberedHeadings = this.additionalBanks.length > 1;
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteBankNumber = null;
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteBankNumber = null;
    }

    handleInputBlur(event) {
        const input = event.target;
        const fieldName = input.dataset.field;
        const value = input.value;
        const fieldsMap = new Map([
            ['bankName', 'Please enter clinic name'],
            /*['website', 'Please enter website'],
            ['phone', 'Please enter phone number'],
            ['email', 'Please enter email'],
            ['coordinator', 'Please enter coordinator name'],
            ['donorCode', 'Please enter donor code']*/
        ]);

        if (fieldsMap.has(fieldName) && !this.noOtherBanks) {
            if (value === '' && fieldName !== 'donorCode' && fieldName !== 'coordinator') {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else if (fieldName === 'donorCode' && value === '' && input.closest('.clinic')?.querySelector('lightning-input[value="yes"]')?.checked) {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        }
    }

    get disableAutoPoulateInputs(){
        return this.primaryIncorrect;
    }


    handleClinicInfoWithSDNBack() {
        console.log('Back start');
        console.log('contact back @@@ >>>>' + JSON.stringify(this.contactObj));
        this.updateContactObj();
        console.log('Test Hello')
        this.contactObj.clinicInfoWithSDN['additionalBanks'] = this.additionalBanks;
        this.contactObj.clinicInfoWithSDN['noOtherBanks'] = this.noOtherBanks
         this.contactObj['selectedDisabledForSDNclinicAdditionalInputs'] = this.noOtherBanks;
        this.contactObj['clinicInfoWithSDN']['didYouWorkAnyOtherClinic'] = this.didYouWorkAnyOtherClinic;
        console.log('contact back >>>>' + JSON.stringify(this.contactObj));
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }

    async handleClinicInfoWithSDNNext() {
        console.log('next 1')
        const fieldsMap = new Map([
            ['bankName', 'Please enter clinic name'],
            /*['website', 'Please enter website'],
            ['phone', 'Please enter phone number'],
            ['email', 'Please enter email'],
            ['coordinator', 'Please enter coordinator name'],
            ['donorCode', 'Please enter donor code']*/
        ]);
        console.log('next 2')
        let isValid = true;
        if (!this.noOtherBanks) {
            this.contactObj.clinicInfoWithSDN['noOtherBanks'] = this.noOtherBanks
            console.log('next 3')
            this.template.querySelectorAll('lightning-input[data-index]').forEach(input => {
                const fieldName = input.dataset.field;
                const value = input.value;
                if (fieldsMap.has(fieldName) && value === '' && fieldName !== 'donorCode' && fieldName !== 'coordinator') {
                    input.setCustomValidity(fieldsMap.get(fieldName));
                    input.reportValidity();
                    isValid = false;
                } else if (fieldName === 'donorCode' && value === '' && input.closest('.clinic')?.querySelector('lightning-input[value="yes"]')?.checked) {
                    input.setCustomValidity(fieldsMap.get(fieldName));
                    input.reportValidity();
                    isValid = false;
                } else {
                    input.setCustomValidity('');
                    input.reportValidity();
                }
            });
            console.log('next 4')
        }
        console.log('next 5')
        let isWorkWithOtherSpermBank = true;
        if(this.didYouWorkAnyOtherClinic == null){
            isWorkWithOtherSpermBank = false;
            this.showErrorMsg = true;
        }
        else{
            isWorkWithOtherSpermBank = true;
            this.showErrorMsg = false;
        }
        if (isValid && isWorkWithOtherSpermBank) {
            console.log('next 6')
            this.updateContactObj();
            console.log('Clinic With Code Add >>> ' + JSON.stringify(this.contactObj))
            if(this.didYouWorkAnyOtherClinic != null && this.didYouWorkAnyOtherClinic == "Yes"){
                 this.contactObj.clinicInfoWithSDN['noOtherBanks'] = false;
            }
            else{
                 this.contactObj.clinicInfoWithSDN['noOtherBanks'] = true;
            }
            this.contactObj['clinicInfoWithSDN']['additionalBanks'] = this.additionalBanks;
            this.contactObj['clinicInfoWithSDN']['primaryBanksListFromApex'] = this.primaryClinicsListFromApex;
            this.contactObj.clinicInfoWithSDN['isAutoSpermClinicsAllowedToDml'] = this.primaryConfirmed;
            this.contactObj['selectedDisabledForSDNclinicAdditionalInputs'] = this.noOtherBanks;
            console.log('Clinic With Code >>> ' + JSON.stringify(this.contactObj))
            let result = await createSpermClinicWithSDN({ contactObj: JSON.stringify(this.contactObj) });
            if (result.isSuccess) {
                console.log('Result >>> ' + result.message);
                
                /*let parseData = JSON.parse(result.message);
                this.contactObj.clinicInfoWithSDN.primaryBank = parseData.spermBank;
                this.contactObj.clinicInfoWithSDN.additionalBanks = parseData.spermBankList;
                this.contactObj.clinicInfoWithSDN['noOtherBanks'] = this.noOtherBanks
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));*/
                const responseMessage = JSON.parse(result.message);
                this.primaryConfirmed = responseMessage.primaryCheckBoxOptions['primaryConfirmed'];
                this.primaryIncorrect = responseMessage.primaryCheckBoxOptions['primaryIncorrect'];
                   
                console.log(responseMessage.primaryCheckBoxOptions['primaryIncorrect']);
                console.log(responseMessage.primaryCheckBoxOptions['primaryConfirmed']);
                 if (responseMessage.spermBankList) {
                    const allBanks = [
                        ...responseMessage.spermBankList
                    // ...responseMessage.autoPopulateList
                    ];
                  this.additionalBanks = allBanks.map((item, index) => ({
                                        id: index,                        
                                        index: index,                     
                                        bankHeading: '',     
                                        bankName: item.bankName || '',      
                                        website: item.website || '',
                                        phone: item.phone || '',
                                        email: item.email || '',
                                        coordinator: item.coordinator || '',
                                        donorCode: item.donorCode || '',
                                        showDonorCodeInput: item.showDonorCodeInput,          
                                        hideDonorCodeInput: item.hideDonorCodeInput,           
                                        noSpermBankChecked: item.noBankChecked || false, // Changed to match Apex expectation      
                                        spermbankId: item.spermbankId || '',
                                        accountId: item.accountId || ''
                                    }));

                    console.log('result ' +JSON.stringify(this.additionalBanks));
                    this.contactObj.clinicInfoWithSDN.additionalBanks = this.additionalBanks;
                    this.contactObj.clinicInfoWithSDN['noOtherBanks'] = this.noOtherBanks
                     this.contactObj['clinicInfoWithSDN']['didYouWorkAnyOtherClinic'] = this.didYouWorkAnyOtherClinic;
                    // alert();
                    
                    this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                     console.log('result ' +JSON.stringify(this.contactObj));
                   
                }
              

            }
            else {
                console.log('Error >>> ' + result.message);
            }
            // 
        }
    }

    updateContactObj() {
        const primarySection = this.template.querySelector('.slds-box');
        const additionalSections = this.template.querySelectorAll('.clinic');

        console.log('additionalSections length >>> ' + additionalSections.length);
        console.log('primarySection length >>> ' + primarySection);

        let primaryResult = {};
        if (primarySection) {
            primarySection.querySelectorAll('lightning-input').forEach(input => {
                if (!['checkbox', 'radio'].includes(input.type)) {
                    console.log('input.name >>> ' + input.name);
                    primaryResult[input.name] = input.value;
                }
            });
        }
        primaryResult.primaryConfirmed = this.primaryConfirmed;
        primaryResult.primaryIncorrect = this.primaryIncorrect;
        console.log('Test one');
        const additionalResultArray = [];
        additionalSections.forEach(section => {
            const obj = {};
            section.querySelectorAll('lightning-input').forEach(input => {
                if (!['checkbox', 'radio'].includes(input.type)) {
                    obj[input.dataset.field] = input.value;
                }
            });

            const yesRadio = section.querySelector('lightning-input[value="yes"]');
            const noRadio = section.querySelector('lightning-input[value="no"]');

            obj.showDonorCodeInput = yesRadio ? yesRadio.checked : false;
            obj.hideDonorCodeInput = noRadio ? noRadio.checked : true;

            additionalResultArray.push(obj);
        });
        console.log('Test Two');
        additionalResultArray.shift();

        this.contactObj['clinicInfoWithSDN'] = {
            primaryBank: primaryResult,
            additionalBanks: additionalResultArray,
            noOtherBanks: this.noOtherBanks,
            primaryConfirmed: this.primaryConfirmed,
            primaryIncorrect: this.primaryIncorrect
        };
        console.log('Test three');
    }

     handleClinicConfirmation(event){
        if(event.target.value == "Yes"){
            this.didYouWorkAnyOtherClinic = "Yes";
            this.noOtherBanks = false;
        }
        else{
            this.didYouWorkAnyOtherClinic = "No";
        }
        this.showErrorMsg = false;
    }

    get showAdditionalClinics(){
        let result = false;
        if(this.didYouWorkAnyOtherClinic != null && this.didYouWorkAnyOtherClinic == "No"){
            result = false;
        }
        if(this.didYouWorkAnyOtherClinic != null  && this.didYouWorkAnyOtherClinic == "Yes"){
            result = true;
        }
        return result;
    }

}