import { LightningElement, track, api } from 'lwc';
import WARNING_ICON_LOGO from '@salesforce/resourceUrl/warningIcon';
import createSpermBankWithSDN from '@salesforce/apex/SpermDonorPreRegistrationController.createSpermBankWithSDN'
import fetchSpermDonorDetails from '@salesforce/apex/SpermDonorWithCodesController.fetchSpermDonorDetails';
import deleteSpermBank from '@salesforce/apex/SpermDonorPreRegistrationController.deleteSpermBank';
import createCoordinator from '@salesforce/apex/UtilityClass.createCoordinator';


export default class DonorPreRegSpermBankInfoWithSDN extends LightningElement {
    @track warningIcon = WARNING_ICON_LOGO;
    @track primaryBanksListFromApex = [];
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
    @track addCoordinators = false;
    //for coordinator user input
    @track coordinatorUserInputsObj = {'firstName' : '', 'lastName' : '', 'phone' : '', 'coordinatorId' : '', 'parentId' : '', 'fullName' : '', isAllow : false, 'isCoordinatorFirstNameBlank' : false} 
    @track showAddIcon = false;
    @track loadSpinner = false;
    
    get options() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }

    displayInfo = {
        primaryField: 'Name',
        //additionalFields: ['Industry'],
    };

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
            this.primaryBanksListFromApex.forEach(bank => {
                bank['coordinatorUserInputsObj'] = this.coordinatorUserInputsObj;
                bank['isAdditionalCoordinators'] = this.addCoordinators;
                bank['coordinator'] = '';
                bank['showAddIcon'] = false;
                bank['disableIcon'] = true;
                bank['primaryConfirmed'] = false;
                bank['incorrectSpermBankChecked'] = false;
                bank['showNoContactRecordsErrorMessage'] = false;
            })

            if (this.contactObj && this.contactObj.spermBanksWithSDNrecordsCopy && this.contactObj.spermBanksWithSDNrecordsCopy.length > 0) {
                //alert();
                let clonedList = [...this.contactObj.spermBanksWithSDNrecordsCopy];
                console.log(JSON.stringify(clonedList));
                
                this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
                    let clonedBank = clonedList.find(cb => cb.spermbankId == bank.spermbankId);
                    if (clonedBank) {
                        return {
                            ...bank,
                            primaryConfirmed: clonedBank.primaryConfirmed,
                            incorrectSpermBankChecked: clonedBank.incorrectSpermBankChecked,
                            coordinatorUserInputsObj: clonedBank.coordinatorUserInputsObj,
                        };
                    }
                    return bank;
                });

                this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
                    if(bank.primaryConfirmed == false){
                        return {
                            ...bank,
                            incorrectSpermBankChecked: true,
                            showNoContactRecordsErrorMessage : false
                        };
                    }
                    return bank;
                })
            }

            this.primaryBanksListFromApex = [...this.primaryBanksListFromApex];
            console.log('Cloned FROM CONTACTOBJ RECORD >>>>>>>>> ' + JSON.stringify(this.contactObj));
             console.log('Cloned primaryBanksListFromApex>>>>>>>>> ' + JSON.stringify(this.primaryBanksListFromApex));

           
        }

    }

    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        if(this.contactObj && this.contactObj.spermBanksWithSDN && this.contactObj['spermBanksWithSDN']['didYouWorkAnyOtherSpermBank']){
            this.didYouWorkAnyOtherSpermBank = this.contactObj['spermBanksWithSDN']['didYouWorkAnyOtherSpermBank'];
        }
        this.primaryConfirmed = this.contactObj['spermWithSDNBankprimaryConfirmed'];
        this.primaryIncorrect = this.contactObj['spermWithSDNclinicprimaryIncorrect'];
        this.fetchSpermDonorBankDetails();
        
        console.log('radio CONTACTOBJ RECORD >>>>>>>>>' + JSON.stringify(this.contactObj));
    }

    get primaryBanksList(){
        return this.primaryBanksListFromApex;
    }
    
   handleRadioChange(event){
    //alert(event.target.dataset.spermbankid);

        let spermbankId = event.target.dataset.spermbankid;
        this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
            if(bank.spermbankId == spermbankId){
                if(event.target.label == "Yes"){
                    return { ... bank, 
                            primaryConfirmed : true,
                            incorrectSpermBankChecked : false
                        }
                }
                else{
                    return { ... bank, 
                            primaryConfirmed : false,
                            incorrectSpermBankChecked : true
                        }
                }
                
            }
            return bank;
        });
        console.log('>>>' +JSON.stringify(this.primaryBanksListFromApex));
       // alert();
    }
    
    /************************Coordinator logic starts*********************/


    //if there are no records from coordinator search this function will handle
    /*handleNoLookUpData(event){
        let spermbankId = event.target.dataset.spermbankid;
        this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
            if(bank.spermbankId == spermbankId){
                return { ... bank, showAddIcon : true}
            }
        });
        console.log('lookup >>> ' + event.detail);
    }*/

     //if there are records from coordinator search this function will handle
    /*handleLookupSelection(event) {
        const selectedId = event.detail.recordId;
        const selectedName = event.detail.recordName;
        let spermbankId = event.target.dataset.spermbankid;
        this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
            if(bank.spermbankId == spermbankId){
                return { ... bank, 
                        coordinatorContactAvailable : selectedId,
                            coordinatorUserInputsObj : {
                                ...bank.coordinatorUserInputsObj, fullName : selectedName
                            }
                        }
            }
            return bank;
        });

    }*/


    //this function tells records available or not.
    handleLookupData(event) {
        console.log('Lookup Data:', JSON.stringify(event.detail));
        const spermbankId = event.target.dataset.spermbankid;
        this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
            if (bank.spermbankId == spermbankId) {
                if(event.detail == true){
                    return {
                        ...bank,
                        disableIcon: event.detail,
                         showNoContactRecordsErrorMessage: false, 
                    };
                }
                else{
                     return {
                        ...bank,
                        disableIcon: event.detail,
                         showNoContactRecordsErrorMessage: true, 
                    };
                }
            }
            return bank;
        });
         console.log('Lookup Data primaryBanksListFromApex:', JSON.stringify(this.primaryBanksListFromApex));
    }


    handleValueSelectedOnAccount(event) {
        //this.parentAccountSelectedRecord = event.detail;
        console.log('parentAccountSelectedRecord >>> ' + JSON.stringify(event.detail));
        let spermbankId = event.target.dataset.spermbankid;
        this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
            if(bank.spermbankId == spermbankId){
                return { ... bank, 
                        coordinatorContactAvailable : event.detail.id,
                            coordinatorUserInputsObj : {
                                ...bank.coordinatorUserInputsObj, 
                                coordinatorId : event.detail.id,
                                fullName : event.detail.mainField,
                                isAllow : true
                            }
                        }
            }
            return bank;
        });
    }

    //function enables inputs section
    handleAddCoordinator(event){
        let spermbankId = event.target.dataset.spermbankid;
        this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
            if(bank.spermbankId == spermbankId){
                return { ... bank, isAdditionalCoordinators : !bank.isAdditionalCoordinators}
            }
            return bank;
        }); 
    }

    //this function will collect the user entered info
    handleCoordinatorInputs(event){
        let spermbankId = event.target.dataset.spermbankid;
        this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
            if (bank.spermbankId == spermbankId) {
                return {
                    ...bank,
                    coordinatorUserInputsObj: {
                        ...bank.coordinatorUserInputsObj,
                        [event.target.name]: event.target.value,
                        parentId: spermbankId,
                         isAllow : false,
                         isCoordinatorFirstNameBlank : false
                    }
                };
            }
            return bank;
        });
        console.log(JSON.stringify(this.primaryBanksListFromApex));
    }

    //this function will save additional coordinator record
    async handleCoordinatorSave(event){
        try{
            let spermbankId = event.target.dataset.spermbankid;
            let coordinatorUserInputs = {};
            this.primaryBanksListFromApex.forEach(bank => {
                if(bank.spermbankId == spermbankId){
                    coordinatorUserInputs = {... bank.coordinatorUserInputsObj};
                }
            });
            if(coordinatorUserInputs.firstName != null && coordinatorUserInputs.firstName.trim() != ''){
                console.log('  >>> '+JSON.stringify(this.primaryBanksListFromApex))  
                let result = await createCoordinator({coordinateData : JSON.stringify(coordinatorUserInputs)})
                if (result.isSuccess) {
                    this.loadSpinner = true;
                    let response = JSON.parse(result.message)

                    this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
                        if (bank.spermbankId == spermbankId) {
                            return {
                                ...bank,
                                coordinator: response.coordinatorId,
                                isAdditionalCoordinators : false,
                                coordinatorUserInputsObj : {... response,  isAllow : true},
                                showAddIcon : false
                            };
                        }
                        return bank;
                    });
                

                    this.primaryBanksListFromApex = [... this.primaryBanksListFromApex];

                    console.log(' primaryBanksListFromApex >>> '+JSON.stringify(this.primaryBanksListFromApex))  

                }
                setTimeout(() => {
                    this.loadSpinner = false
                }, 3000)
            }
            else{
                this.primaryBanksListFromApex = this.primaryBanksListFromApex.map(bank => {
                    if(bank.spermbankId == spermbankId){
                        return {
                            ... bank,
                            coordinatorUserInputsObj : {
                                ...bank.coordinatorUserInputsObj,
                                isCoordinatorFirstNameBlank : true
                            }
                        }
                    }
                    return bank
                });
            }
        }
        catch(e){
            console.log(e.stack)
            console.log(e.message)
            setTimeout(() => {
                this.loadSpinner = false
            }, 3000)
        }
    }



     /************************Coordinator logic ends*********************/

    get noOtherBanksOrDontRemember() {
        return this.noOtherBanks || this.dontRememberBanks;
    }

    get checkboxStatus() {
       
    }

    hasBankDetails() {
      
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
          
        }
    }

    handleAdditionalChange(event) {

    }

    handleAdditionalRadioChange(event) {
    
    }

    addAnotherBank() {

    }

    handleDeleteBank(event) {


    }

    async handleDeleteYes() {

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
        this.updateContactObj();;
        console.log('primaryBanksListFromApex' + JSON.stringify(this.primaryBanksListFromApex));
        console.log('contactObjApex' + JSON.stringify(this.contactObj));
        
        this.contactObj.spermBanksWithSDN['primaryBanksListFromApex'] = this.primaryBanksListFromApex;
        this.contactObj['spermBanksWithSDNrecordsCopy'] = this.primaryBanksListFromApex;
        
        console.log('contactObjApex' + JSON.stringify(this.contactObj));
            
        this.contactObj.spermBanksWithSDN['isAutoSpermBanksAllowedToDml'] = true; //this.primaryConfirmed
        
        let result = await createSpermBankWithSDN({ contactObj: JSON.stringify(this.contactObj) })
        
        
        console.log('result >>> ' + JSON.stringify(result));
        if (result.isSuccess) {
            try{
                console.log('this.contactObj additional banks>>> '+JSON.stringify(this.contactObj));
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
            }
            catch(e){
            console.log(e.stack)
            console.log(e.message);
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