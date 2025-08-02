import { LightningElement, track, api } from 'lwc';
import createSpermClinicWithSDN from '@salesforce/apex/SpermDonorPreRegistrationController.createSpermClinicWithSDN'
//import fetchSpermDonorClinicDetails from '@salesforce/apex/EggDonorPreRegistrationController.fetchSpermDonorClinicDetails'
import fetchSpermDonorClinicDetails from '@salesforce/apex/SpermDonorWithCodesController.fetchSpermDonorClinicDetails';
import deleteSpermBank from '@salesforce/apex/SpermDonorPreRegistrationController.deleteSpermBank';
import createCoordinator from '@salesforce/apex/UtilityClass.createCoordinator';


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
    @api clinicUserInput;
    @api contactObj;
    @track deletespermclinicid = '';
    @track didYouWorkAnyOtherClinic = null;
    @track showErrorMsg = false;
    @track addCoordinators = false;
    //for coordinator user input
    @track coordinatorUserInputsObj = {'firstName' : '', 'lastName' : '', 'phone' : '', 'coordinatorId' : '', 'parentId' : '', 'fullName' : ''} 

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
            this.primaryClinicsListFromApex.forEach(clinic => {
                clinic['coordinatorUserInputsObj'] = this.coordinatorUserInputsObj;
                clinic['isAdditionalCoordinators'] = this.addCoordinators;
                clinic['coordinator'] = '';
                clinic['showAddIcon'] = false,
                clinic['primaryConfirmed'] = false;
                clinic['incorrectClinicChecked'] = false;
                clinic['disableIcon'] = true;
            });

           if (this.contactObj && this.contactObj.spermClinicsWithSDNrecordsCopy && this.contactObj.spermClinicsWithSDNrecordsCopy.length > 0) {
                //alert();
                let clonedList = [...this.contactObj.spermClinicsWithSDNrecordsCopy];
                console.log(JSON.stringify(clonedList));
                
                this.primaryClinicsListFromApex = this.primaryClinicsListFromApex.map(bank => {
                    let clonedBank = clonedList.find(cb => cb.spermclinicId == bank.spermclinicId);
                    if (clonedBank) {
                        return {
                            ...bank,
                            primaryConfirmed: clonedBank.primaryConfirmed,
                            incorrectClinicChecked: clonedBank.incorrectClinicChecked,
                            coordinatorUserInputsObj: clonedBank.coordinatorUserInputsObj
                        };
                    }
                    return bank;
                });

                //for validating radio buttons
                this.primaryClinicsListFromApex = this.primaryClinicsListFromApex.map(bank => {
                    if(bank.primaryConfirmed == false){
                        return {
                            ...bank,
                            incorrectClinicChecked: true
                        };
                    }
                    return bank;
                })
            }

            this.primaryClinicsListFromApex = [...this.primaryClinicsListFromApex];
            console.log('Cloned FROM CONTACTOBJ RECORD >>>>>>>>> ' + JSON.stringify(this.contactObj));
            console.log('Cloned primaryClinicsListFromApex>>>>>>>>> ' + JSON.stringify(this.primaryClinicsListFromApex));
        }

    }

    connectedCallback() {

        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        console.log(JSON.stringify(this.contactObj));
        console.log('Test Strated');
         console.log(JSON.stringify(this.contactObj));
        this.fetchSpermDonorClinics();
    }

    handleClinicRadioChange(event){
        //alert();
        //debugger;
        console.log(event.target.label)
        let spermclinicid = event.target.dataset.spermclinicid;
        this.primaryClinicsListFromApex = this.primaryClinicsListFromApex.map(bank => {
            console.log(bank.spermclinicId +'____'+ spermclinicid)
            if(bank.spermclinicId == spermclinicid){
                if(event.target.label == "Yes"){
                    return { ... bank, 
                            primaryConfirmed : true,
                            incorrectClinicChecked : false
                        }
                }
                else{
                    return { ... bank, 
                            primaryConfirmed : false,
                            incorrectClinicChecked : true
                        }
                }
                
            }
            return bank; 
        });
        console.log(event.target.label)
        console.log(JSON.stringify(this.primaryClinicsListFromApex))
    }

     /************************Coordinator logic starts*********************/


    //if there are no records from coordinator search this function will handle
    handleNoLookUpData(event){
        let spermclinicid = event.target.dataset.spermclinicid;
        this.primaryClinicsListFromApex = this.primaryClinicsListFromApex.map(bank => {
            if(bank.spermclinicId == spermclinicid){
                return { ... bank, showAddIcon : true} 
            }
        });
        console.log('lookup >>> ' + event.detail);
    }

     //if there are records from coordinator search this function will handle
    /*handleLookupSelection(event) {
        const selectedId = event.detail.recordId;
        const selectedName = event.detail.recordName;
        let spermclinicid = event.target.dataset.spermclinicid;
        this.primaryClinicsListFromApex = this.primaryClinicsListFromApex.map(bank => {
            if(bank.spermclinicId == spermclinicid){
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

    handleLookupData(event) {
        console.log('Lookup Data:', JSON.stringify(event.detail));
        let spermclinicid = event.target.dataset.spermclinicid;
        this.primaryClinicsListFromApex = this.primaryClinicsListFromApex.map(bank => {
             if(bank.spermclinicId == spermclinicid){
                return {
                    ...bank,
                    disableIcon: event.detail 
                };
            }
            return bank;
        });
         console.log('Lookup Data primaryBanksListFromApex:', JSON.stringify(this.primaryBanksListFromApex));
    }

     handleValueSelectedOnAccount(event) {
        //this.parentAccountSelectedRecord = event.detail;
        console.log('parentAccountSelectedRecord >>> ' + JSON.stringify(event.detail));
        let spermclinicid = event.target.dataset.spermclinicid;
        this.primaryClinicsListFromApex = this.primaryClinicsListFromApex.map(bank => {
            if(bank.spermclinicId == spermclinicid){
                return { ... bank, 
                        coordinatorContactAvailable : event.detail.id,
                            coordinatorUserInputsObj : {
                                ...bank.coordinatorUserInputsObj, 
                                coordinatorId : event.detail.id,
                                fullName : event.detail.mainField
                            }
                        }
            }
            return bank;
        });
    }

    //function enables inputs section
    handleAddCoordinator(event){
        let spermclinicid = event.target.dataset.spermclinicid;
        this.primaryClinicsListFromApex = this.primaryClinicsListFromApex.map(bank => {
            if(bank.spermclinicId == spermclinicid){
                return { ... bank, isAdditionalCoordinators : !bank.isAdditionalCoordinators}
            }
            return bank;
        }); 
    }

    //this function will collect the user entered info
    handleCoordinatorInputs(event){
        let spermclinicid = event.target.dataset.spermclinicid;
        this.primaryClinicsListFromApex = this.primaryClinicsListFromApex.map(bank => {
            if (bank.spermclinicId == spermclinicid) {
                return {
                    ...bank,
                    coordinatorUserInputsObj: {
                        ...bank.coordinatorUserInputsObj,
                        [event.target.name]: event.target.value,
                        parentId: spermclinicid
                    }
                };
            }
            return bank;
        });
        console.log(JSON.stringify(this.primaryClinicsListFromApex));
    }

    //this function will save additional coordinator record
    async handleCoordinatorSave(event){
        let spermclinicid = event.target.dataset.spermclinicid;
        let coordinatorUserInputs = {};
        this.primaryClinicsListFromApex.forEach(bank => {
            if(bank.spermclinicId == spermclinicid){
                coordinatorUserInputs = {... bank.coordinatorUserInputsObj};
            }
        });

        console.log('  >>> '+JSON.stringify(this.primaryClinicsListFromApex))  
        let result = await createCoordinator({coordinateData : JSON.stringify(coordinatorUserInputs)})
        if (result.isSuccess) {
            let response = JSON.parse(result.message)

            this.primaryClinicsListFromApex = this.primaryClinicsListFromApex.map(bank => {
                if (bank.spermclinicId == spermclinicid) {
                    return {
                        ...bank,
                        coordinator: response.coordinatorId,
                        isAdditionalCoordinators : false,
                        coordinatorUserInputsObj : {... response},
                        showAddIcon : false
                    };
                }
                return bank;
            });
           

            this.primaryClinicsListFromApex = [... this.primaryClinicsListFromApex];

            console.log(' primaryClinicsListFromApex >>> '+JSON.stringify(this.primaryClinicsListFromApex))  

        }
    }



     /************************Coordinator logic ends*********************/

    hasBankDetails() {
       
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
          
        }
    }

    handleAdditionalChange(event) {
      
    }

    handleRadioChange(event) {
       
    }

    addAnotherBank() {
     
    }

    handleDeleteBank(event) {
      
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
        this.contactObj.clinicInfoWithSDN['noOtherBanks'] = this.noOtherBanks
         this.contactObj['selectedDisabledForSDNclinicAdditionalInputs'] = this.noOtherBanks;
        this.contactObj['clinicInfoWithSDN']['didYouWorkAnyOtherClinic'] = this.didYouWorkAnyOtherClinic;
        console.log('contact back >>>>' + JSON.stringify(this.contactObj));
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }

    async handleClinicInfoWithSDNNext() {
        debugger;
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj))
        this.updateContactObj();
        this.contactObj['clinicInfoWithSDN']['primaryClinicsListFromApex'] = this.primaryClinicsListFromApex;
        this.contactObj['spermClinicsWithSDNrecordsCopy'] = this.primaryClinicsListFromApex;

       // this.contactObj.clinicInfoWithSDN['isAutoSpermClinicsAllowedToDml'] = this.primaryConfirmed;

        console.log('Clinic With Code >>> ' + JSON.stringify(this.contactObj))
         try{
            let result = await createSpermClinicWithSDN({ contactObj: JSON.stringify(this.contactObj) });
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
        catch(e){
            console.log(e.stack)
            console.log(e.message);
        }
        
    }

  updateContactObj() {
    try {
        // Always initialize the object
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));

        let primaryResult = {};
        const primarySection = this.template.querySelector('.slds-box');
        if (primarySection) {
            primarySection.querySelectorAll('lightning-input')?.forEach(input => {
                if (!['checkbox', 'radio'].includes(input.type)) {
                    primaryResult[input.name] = input.value;
                }
            });
        }

        const additionalSections = this.template.querySelectorAll('.clinic');
        const additionalResultArray = [];

        if (additionalSections?.length > 0) {
            additionalSections.forEach(section => {
                const obj = {};
                section.querySelectorAll('lightning-input')?.forEach(input => {
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

            additionalResultArray.shift(); // remove the first if it's primary
        }

        // Fallback structure if no DOM present
        this.contactObj['clinicInfoWithSDN'] = {
            primaryBank: primaryResult,
            additionalBanks: additionalResultArray
        };

    } catch (e) {
        console.error('[updateContactObj] Error:', e.message);
        // Ensure fallback so Apex doesn’t crash
        this.contactObj['clinicInfoWithSDN'] = this.contactObj['clinicInfoWithSDN'] || {
            primaryBank: {},
            additionalBanks: []
        };
    }
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