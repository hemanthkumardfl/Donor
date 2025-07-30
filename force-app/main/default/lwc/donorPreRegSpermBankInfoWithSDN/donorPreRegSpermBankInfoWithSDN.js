import { LightningElement, track, api } from 'lwc';
import WARNING_ICON_LOGO from '@salesforce/resourceUrl/warningIcon';
import createSpermBankWithSDN from '@salesforce/apex/SpermDonorPreRegistrationController.createSpermBankWithSDN'
import fetchSpermDonorDetails from '@salesforce/apex/SpermDonorWithCodesController.fetchSpermDonorDetails';
import deleteSpermBank from '@salesforce/apex/SpermDonorPreRegistrationController.deleteSpermBank';

export default class DonorPreRegSpermBankInfoWithSDN extends LightningElement {
    @track warningIcon = WARNING_ICON_LOGO;
    @track primaryBanksListFromApex = [];
    @track additionalBanks = [];
    @track noOtherBanks = false;
    @track dontRememberBanks = false;
    @track showNumberedHeadings = false;
    @track showDeletePopup = false;
    @track deleteIndex = null;
    @track deleteBankNumber = null;
    @track showInformation = false;
    @api spermBankUserInput;
    @api contactObj;
    @api additionals;
    @track deleteSpermbankDetails = {'deleteId' : null};
    @track primaryshowDonorCodeInput = false;
    @track deleteSpermBankId = '';
    @track deleteSpermbankNumber='';
    @track primaryIncorrect = null;
    @track primaryConfirmed = null;
    @track didYouWorkAnyOtherSpermBank = null;
    @track showErrorMsg = false;
    
    get options() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }

    bankObject = {
        id: 0,
        index: 0,
        bankNumber: 1,
        bankHeading: 'Sperm Bank Info',
        bankName: '',
        website: '',
        phone: '',
        email: '',
        coordinator: '',
        donorCode: '',
        showDonorCodeInput: false,
        hideDonorCodeInput: true,
        noBankChecked: false,
        incorrectBankChecked: false,
        primaryConfirmed: false,
        spermbankId : '',
        accountId : ''
    };

    spermBanksWithSDN;

    async fetchSpermDonorBankDetails(){
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj || {}));
        let spermBankResponse = await fetchSpermDonorDetails({ contactObj: JSON.stringify(this.contactObj) });
        if (spermBankResponse.isSuccess) {
            console.log(JSON.parse(spermBankResponse.message));
            this.primaryBanksListFromApex = JSON.parse(spermBankResponse.message);
            this.contactObj['spermBanksWithSDN'] = JSON.parse(spermBankResponse.message);
            console.log('FROM CONTACTOBJ RECORD >>>>>>>>>' + JSON.stringify(this.contactObj));
        }

    }

    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        if(this.contactObj && this.contactObj.spermBanksWithSDN && this.contactObj['spermBanksWithSDN']['didYouWorkAnyOtherSpermBank']){
            this.didYouWorkAnyOtherSpermBank = this.contactObj['spermBanksWithSDN']['didYouWorkAnyOtherSpermBank'];
        }
       
        if(this.contactObj && this.contactObj.spermBanksWithSDN && this.contactObj.spermBanksWithSDN['additionalBanks'].length > 0) {
            this.additionalBanks = [...this.contactObj.spermBanksWithSDN['additionalBanks']];
            this.noOtherBanks = this.contactObj.spermBanksWithSDN['noOtherBanks'] || false;
            //this.didYouWorkAnyOtherSpermBank = this.contactObj.spermBanksWithSDN['didYouWorkAnyOtherSpermBank'] || false;
            this.dontRememberBanks = this.contactObj.spermBanksWithSDN['dontRememberBanks'] || false;
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
        this.primaryConfirmed = this.contactObj['spermWithSDNBankprimaryConfirmed'];
        this.primaryIncorrect = this.contactObj['spermWithSDNclinicprimaryIncorrect'];
         this.fetchSpermDonorBankDetails();
         console.log('CONTACTOBJ RECORD >>>>>>>>>' + JSON.stringify(this.contactObj));
    }

    get noOtherBanksOrDontRemember() {
        return this.noOtherBanks || this.dontRememberBanks;
    }

    get checkboxStatus() {
        return this.additionalBanks.length > 1 ; //|| this.hasBankDetails();
    }

    hasBankDetails() {
        return this.additionalBanks.some(bank =>
            bank.bankName || bank.website || bank.phone || bank.email || bank.coordinator ||
            (bank.showDonorCodeInput && bank.donorCode)
        );
    }

    handlePrimaryInputChange(event) {
        console.log(event.target.name +'__'+ event.target.dataset.spermbankid + '__' + event.target.value);
        const field = event.target.name;
        let spermId =  event.target.dataset.spermbankid;
        console.log('INPUT CHANGE' + JSON.stringify(this.primaryBanksListFromApex));
        let recodslist = [];
        this.primaryBanksListFromApex.forEach(record => {
            let obj = {... record}
            if(record.spermbankId == spermId){
                obj[field] = event.target.value;
                console.log(JSON.stringify(obj))
            }
            recodslist.push(obj);
        })
        console.log('recodslist' + JSON.stringify(recodslist));
        this.primaryBanksListFromApex = [... recodslist];
        console.log('primaryBanksListFromApex' + JSON.stringify(this.primaryBanksListFromApex));
        const input = event.target;
        if (input.validity.valid) {
            input.setCustomValidity('');
            input.reportValidity();
        }
       
    }

    get disableAutoPoulateInputs(){
        return this.primaryIncorrect;
    }

    handlePrimaryRadioChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const value = event.target.value;
        if(value == 'yes'){
            this.primaryshowDonorCodeInput = true;
        }
        else{
            this.primaryshowDonorCodeInput = false;
        }
        /*this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank =>
            bank.index === index
                ? {
                    ...bank,
                    showDonorCodeInput: value === 'yes',
                    hideDonorCodeInput: value === 'no'
                }
                : bank
        );*/
    }

    handlePrimaryIncorrectChange(event){
        this.primaryIncorrect = event.target.checked;
        if (this.primaryIncorrect) {
            this.primaryConfirmed = false;
            this.contactObj['spermWithSDNclinicprimaryIncorrect'] = true;
            this.contactObj['spermWithSDNBankprimaryConfirmed'] = false;
        }
        else{
             this.primaryIncorrect = null;
        }
        
    }

    handlePrimaryConfirmedChange(event) {
       /* const index = parseInt(event.target.dataset.index, 10);
        this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank =>
            bank.index === index
                ? {
                    ...bank,
                    primaryConfirmed: event.target.checked,
                    incorrectBankChecked: event.target.checked ? false : bank.incorrectBankChecked,
                    noBankChecked: event.target.checked ? false : bank.noBankChecked
                }
                : bank
        );*/
             this.primaryConfirmed = event.target.checked;
            if (this.primaryConfirmed) {
                this.primaryIncorrect = false;
                this.contactObj['spermWithSDNBankprimaryConfirmed'] = true;
                this.contactObj['spermWithSDNclinicprimaryIncorrect'] = false;
            }
            else{
                this.primaryConfirmed = null;
                this.contactObj['spermWithSDNBankprimaryConfirmed'] = false;
            }
    }

    handleNoBankChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank =>
            bank.index === index
                ? {
                    ...bank,
                    noBankChecked: event.target.checked,
                    incorrectBankChecked: event.target.checked ? false : bank.incorrectBankChecked,
                    primaryConfirmed: event.target.checked ? false : bank.primaryConfirmed,
                    bankName: event.target.checked ? '' : bank.bankName,
                    website: event.target.checked ? '' : bank.website,
                    phone: event.target.checked ? '' : bank.phone,
                    email: event.target.checked ? '' : bank.email,
                    coordinator: event.target.checked ? '' : bank.coordinator,
                    donorCode: event.target.checked ? '' : bank.donorCode,
                    showDonorCodeInput: event.target.checked ? false : bank.showDonorCodeInput,
                    hideDonorCodeInput: event.target.checked ? true : bank.hideDonorCodeInput
                }
                : bank
        );
    }

    handleIncorrectBankChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank =>
            bank.index === index
                ? {
                    ...bank,
                    incorrectBankChecked: event.target.checked,
                    noBankChecked: event.target.checked ? false : bank.noBankChecked,
                    primaryConfirmed: event.target.checked ? false : bank.primaryConfirmed
                }
                : bank
        );
    }

    handleNoOtherBanksChange(event) {
        this.noOtherBanks = event.target.checked;
        if (this.noOtherBanks) {
            this.dontRememberBanks = false;
            if (this.hasBankDetails()) {
                this.template.querySelectorAll('.checkboxPrimaryCls').forEach(checkbox => {
                    if (checkbox.checked && checkbox.type === 'checkbox') {
                        checkbox.checked = false;
                    }
                });
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

    handleDontRememberBanksChange(event) {
        this.dontRememberBanks = event.target.checked;
        if (this.dontRememberBanks) {
            this.noOtherBanks = false;
            if (this.hasBankDetails()) {
                this.template.querySelectorAll('.checkboxPrimaryCls').forEach(checkbox => {
                    if (checkbox.checked && checkbox.type === 'checkbox') {
                        checkbox.checked = false;
                    }
                });
                this.dontRememberBanks = false;
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
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.dataset.field;
        const value = event.target.value;
        this.additionalBanks = this.additionalBanks.map((bank, i) =>
            i === index ? { ...bank, [field]: value } : bank
        );
        console.log('this.additionalBanks @@@@' + JSON.stringify(this.additionalBanks));
        const input = event.target;
        if (input.validity.valid) {
            input.setCustomValidity('');
            input.reportValidity();
        }
    }

    handleAdditionalRadioChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
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
        console.log(JSON.stringify(this.contactObj));
    }

    addAnotherBank() {
        this.showNumberedHeadings = true;
        const newBank = {
            ...this.bankObject,
            id: Date.now() + Math.random(),
            index: this.additionalBanks.length,
            bankNumber: this.additionalBanks.length + 1
        };
        this.additionalBanks = [
            ...this.additionalBanks.map((bank, i) => ({
                ...bank,
                index: i,
                bankNumber: i + 1,
                bankHeading: i === 0 ? 'Sperm Bank Info' : ''
            })),
            newBank
        ];
    }

    handleDeleteBank(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.deleteIndex = index;
        /*const bank = this.additionalBanks[index];
        this.deleteIndex = index;
        this.deleteBankNumber = bank ? bank.bankNumber : null;
        this.showDeletePopup = true;
        let deleteBankId = event.target.dataset.spermbankid;
        if(deleteBankId){
            this.deleteSpermbankDetails['deleteId'] = deleteBankId;
        }*/
       /* alert('spermbankId' + event.target.dataset.spermbankid);
        alert('accountid' + event.target.dataset.accountid);
        alert('bankId' + event.target.dataset.bankid);*/
        this.deleteSpermBankId = event.target.dataset.accountid;
        this.deleteSpermbankNumber = event.target.dataset.bankid;

        const bank = this.additionalBanks.find(b => b.index === index);
        this.deleteIndex = index;
        this.deleteBankNumber = bank ? bank.bankNumber : null;
        this.showDeletePopup = true;

    }

    async handleDeleteYes() {


        if(this.deleteSpermBankId){
            let resultData = await deleteSpermBank({ spermbankId: this.deleteSpermBankId }); 
            //alert('Delete Agency >>> ' + JSON.stringify(resultData));
            if (resultData.isSuccess) {
                //outcomesList.splice(index, 1);
            }
           
        }

        const index = this.deleteIndex;
        //alert(index);
        let updatedBanks = [...this.additionalBanks];
        updatedBanks.splice(index, 1); 

        updatedBanks = updatedBanks.map((bank, i) => ({
            ...bank,
            bankNumber: i + 1,
            bankHeading: i === 0 ? 'Sperm Bank Info' : ''
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

        


        
       
       
        /*if(this.deleteSpermbankDetails['deleteId'] != null){
            deleteSpermBank({'spermbankId' : this.deleteSpermbankDetails['deleteId']})
            .then(result => {
                console.log(result);
            }).catch(error => {
                console.log(error);
            })
        }*/
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteBankNumber = null;
    }

    handleInputBlur(event) {
        const input = event.target;
        const fieldName = input.name || input.dataset.field;
        const value = input.value;
        const fieldsMap = new Map([
            ['bankName', 'Please enter sperm bank name'],
            ['website', 'Please enter website'],
            ['phone', 'Please enter phone number'],
            ['email', 'Please enter email'],
            ['coordinator', 'Please enter coordinator name'],
            ['donorCode', 'Please enter donor code']
        ]);

        if (fieldsMap.has(fieldName) && !this.noOtherBanksOrDontRemember) {
            if (value === '' && fieldName !== 'donorCode' && fieldName !== 'coordinator') {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else if (fieldName === 'donorCode' && value === '' && input.closest('.spermbank')?.querySelector('lightning-input[value="yes"]')?.checked) {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        }
    }

    handleSpermBankInfoWithSDNBack() {
        this.updateContactObj();
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }

    async handleSpermBankInfoWithSDNNext() {
        //alert();
        const fieldsMap = new Map([
            ['bankName', 'Please enter sperm bank name'],
            ['donorCode', 'Please enter donor code']
        ]);
         console.log('contactObjApex >>>' + JSON.stringify(this.contactObj));

        let isValid = true;
        //alert('TEst 11');
        if (!this.noOtherBanksOrDontRemember) {
             this.template.querySelectorAll('lightning-input[data-index]').forEach(input => {
                const fieldName = input.dataset.field;
                const value = input.value;
                if (fieldsMap.has(fieldName) && value === '' && (!this.noSpermBankChecked  || this.spermBanks[input.dataset.index].knowDonorCode === 'Yes')) {
                    input.setCustomValidity(fieldsMap.get(fieldName));
                    input.reportValidity();
                    isValid = false;
                }
                else {
                    input.setCustomValidity('');
                    input.reportValidity();
                }
            });
        }
        let isWorkWithOtherSpermBank = true;
        if(this.didYouWorkAnyOtherSpermBank == null){
            isWorkWithOtherSpermBank = false;
            this.showErrorMsg = true;
        }
        else{
            isWorkWithOtherSpermBank = true;
            this.showErrorMsg = false;
        }
        console.log('TEst 14');
          let inputValidityList = [];
            this.template.querySelectorAll('.donorcodeinputcls').forEach(input => {
                if (input.classList.contains('slds-has-error')) {
                    inputValidityList.push('Error class is present');
                }
            })
            console.log('inputValidityList' + JSON.stringify(inputValidityList));

        if (isValid && inputValidityList.length == 0 && isWorkWithOtherSpermBank) {
            this.updateContactObj();
            //alert();
            console.log('primaryBanksListFromApex' + JSON.stringify(this.primaryBanksListFromApex));
             console.log('contactObjApex' + JSON.stringify(this.contactObj));
            //alert();
            
            this.contactObj.spermBanksWithSDN['additionalBanks'] = this.additionalBanks;
            this.contactObj.spermBanksWithSDN['primaryBanksListFromApex'] = this.primaryBanksListFromApex;
            if(this.didYouWorkAnyOtherSpermBank != null && this.didYouWorkAnyOtherSpermBank == "Yes"){
                 this.contactObj.spermBanksWithSDN['noOtherSpermBanks'] = true;
            }
            else{
                this.contactObj.spermBanksWithSDN['noOtherSpermBanks'] = false;
            }
           
           // this.contactObj.spermBanksWithSDN['didYouWorkAnyOtherSpermBank'] = this.didYouWorkAnyOtherSpermBank;
            //this.contactObj['didYouWorkAnyOtherSpermBank'] = this.didYouWorkAnyOtherSpermBank;
             
              this.contactObj.spermBanksWithSDN['isAutoSpermBanksAllowedToDml'] = this.primaryConfirmed
            
            let result = await createSpermBankWithSDN({ contactObj: JSON.stringify(this.contactObj) })
            console.log('result >>> ' + JSON.stringify(result));
            if (result.isSuccess) {
              try{
                const responseMessage = JSON.parse(result.message);
               

                 if (responseMessage.responseList) {
                    const allBanks = [
                        ...responseMessage.responseList
                    // ...responseMessage.autoPopulateList
                    ];
                        
                    this.additionalBanks = allBanks.map((item, index) => ({
                                id: index,                        
                                index: index,                     
                                bankNumber: index + 1,             
                                bankHeading: 'Sperm Bank Info',    
                                bankName: item.bankName || '',      
                                website: item.website || '',
                                phone: item.phone || '',
                                email: item.email || '',
                                coordinator: item.coordinator || '',
                                donorCode: item.donorCode || '',
                                showDonorCodeInput: item.showDonorCodeInput,          
                                hideDonorCodeInput: item.hideDonorCodeInput,           
                                noBankChecked: item.noSpermBankChecked || false,
                                incorrectBankChecked: false,       
                                primaryConfirmed: false,            
                                spermbankId: item.spermbankId || '' ,
                                accountId : item.accountId || ''
                                }));
                    console.log('result' +JSON.stringify(this.additionalBanks));
                 }

                this.contactObj['spermBanksWithSDN']['additionalBanks'] = this.additionalBanks;
                this.contactObj['spermBanksWithSDN']['didYouWorkAnyOtherSpermBank'] = this.didYouWorkAnyOtherSpermBank;
                console.log('this.contactObj additional banks>>> '+JSON.stringify(this.contactObj));
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
              }
              catch(e){
                console.log(e.stack)
                console.log(e.message);
              }
            }
        }
    }

    updateContactObj() {
        let primarySectionList = this.template.querySelectorAll('.spermbank');
        let additionalSectionList = this.template.querySelectorAll('.spermbankcls');
        let primaryResultArray = [];
        let additionalResultArray = [];
        console.log('TEst 1101');
        Array.from(primarySectionList).forEach(section => {
            let obj = {};
            let allInputList = section.querySelectorAll('lightning-input');
            Array.from(allInputList).forEach(input => {
                if (input.type !== 'checkbox' && input.type !== 'radio') {
                    obj[input.name || input.dataset.field] = input.value;
                } /*else if (input.type === 'checkbox') {
                    console.log('input.name >>> '+input.name);
                    console.log('input.dataset.field >>> '+input.dataset.field);
                    obj[input.name || input.dataset.field] = input.checked;
                }*/
            });
            obj.showDonorCodeInput = section.querySelector('lightning-input[value="yes"]')?.checked || false;
            obj.hideDonorCodeInput = section.querySelector('lightning-input[value="no"]')?.checked || true;
            primaryResultArray.push(obj);
        });
        console.log('TEst 1102');
        Array.from(additionalSectionList).forEach(section => {
            let obj = {};
            let allInputList = section.querySelectorAll('lightning-input');
            Array.from(allInputList).forEach(input => {
                if (input.type !== 'checkbox' && input.type !== 'radio') {
                    obj[input.name] = input.value;
                }
            });
            obj.showDonorCodeInput = section.querySelector('lightning-input[value="yes"]')?.checked || false;
            obj.hideDonorCodeInput = section.querySelector('lightning-input[value="no"]')?.checked || true;
            additionalResultArray.push(obj);
        });
        console.log('TEst 1103');
        this.contactObj['spermBanksWithSDN'] = {
            primaryBanksListFromApex: primaryResultArray,
            additionalBanks: additionalResultArray,
            noOtherBanks: this.noOtherBanks,
            dontRememberBanks: this.dontRememberBanks
        };
        console.log('Completed >>>> ' + JSON.stringify(this.contactObj));
    }

    handleBankConfirmation(event){
        if(event.target.value == "Yes"){
            this.didYouWorkAnyOtherSpermBank = "Yes";
        }
        else{
            this.didYouWorkAnyOtherSpermBank = "No";
        }
        this.showErrorMsg = false;
    }

    get showAdditionalBanks(){
        let result = false;
        if(this.didYouWorkAnyOtherSpermBank != null && this.didYouWorkAnyOtherSpermBank == "No"){
            result = false;
        }
        if(this.didYouWorkAnyOtherSpermBank != null  && this.didYouWorkAnyOtherSpermBank == "Yes"){
            result = true;
        }
        return result;
    }
}