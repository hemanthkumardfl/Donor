import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import spermDonor from '@salesforce/apex/DonorPreRegHippaController2222.spermDonor';
import updateDonorName from '@salesforce/apex/DonorPreRegHippaController2222.updateDonorName';
import deleteSpermBank from '@salesforce/apex/DonorPreRegHippaController2222.deleteSpermBank';
import addSpermBank from '@salesforce/apex/DonorPreRegHippaController2222.addSpermBank';
import editSpermBank from '@salesforce/apex/DonorPreRegHippaController2222.editSpermBank';
import deleteAgency from '@salesforce/apex/DonorPreRegHippaController2222.deleteAgency';
import addAgency from '@salesforce/apex/DonorPreRegHippaController2222.addAgency';
import editAgency from '@salesforce/apex/DonorPreRegHippaController2222.editAgency';
import deleteClinic from '@salesforce/apex/DonorPreRegHippaController2222.deleteClinic';
import addClinic from '@salesforce/apex/DonorPreRegHippaController2222.addClinic';
import editClinic from '@salesforce/apex/DonorPreRegHippaController2222.editClinic';
import deleteAttorney from '@salesforce/apex/DonorPreRegHippaController2222.deleteAttorney';
import addAttorney from '@salesforce/apex/DonorPreRegHippaController2222.addAttorney';
import editAttorney from '@salesforce/apex/DonorPreRegHippaController2222.editAttorney';
import deleteRecipient from '@salesforce/apex/DonorPreRegHippaController2222.deleteRecipient';
import addRecipient from '@salesforce/apex/DonorPreRegHippaController2222.addRecipient';
import editRecipient from '@salesforce/apex/DonorPreRegHippaController2222.editRecipient';
import fetchSpermBankRecord from '@salesforce/apex/UtilityClass.fetchSpermBankRecord';
import addlookupSpermBank from '@salesforce/apex/DonorPreRegHippaController2222.addlookupSpermBank';
import addlookupClinic from '@salesforce/apex/DonorPreRegHippaController2222.addlookupClinic';
//import addlookupAttorney from '@salesforce/apex/DonorPreRegHippaController2222.addlookupSpermBank';
//import addlookupRecipient from '@salesforce/apex/DonorPreRegHippaController2222.addlookupSpermBank';
import addlookupAgency from '@salesforce/apex/DonorPreRegHippaController2222.addlookupAgency';
//import fetchContactRecord from '@salesforce/apex/UtilityClass.fetchSpermBankRecord';
import createCoordinator from '@salesforce/apex/UtilityClass.createCoordinator';

export default class DonorPreRegHippa extends LightningElement {
    @api contactObj;
    @track legalName = { firstName: '', lastName: '' };
    @track legalNamesri = { firstName: '', lastName: '' };
    @track dob = '';
    @track address = { state: '', city: '', street: '', pincode: '', additionalInfo: '' };
    @track dobError = '';
    @track isYesChecked = true;
    @track isNoChecked = false;
    @track isDisabled = true;
    @track nameConfirmation = 'Yes';
    @track agencies = [];
    @track sperms = [];
    @track clinics = [];
    @track attorneys = [];
    @track recipients = [];
    @track showagencySection = false;
    @track showSpermBankSection = false;
    @track showclinicSection = false;
    @track showattorneySection = false;
    @track showrecipientSection = false;
    @track showAgencyForm = false;
    @track showAgencyPicker = false;
    @track showSpermForm = false;
    @track showSpermPicker = false;
    @track showClinicForm = false;
    @track showClinicPicker = false;
    @track showAttorneyForm = false;
    @track showAttorneyPicker = false;
    @track showRecipientForm = false;
    @track showRecipientPicker = false;
    @track newAgency = {
        id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '',
        accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
        showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
        coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
        disableAddCoordinatorIcon: true
    };
    @track newSperm = {
        id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '',
        accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
        showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
        coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
        disableAddCoordinatorIcon: true
    };
    @track newClinic = {
        id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '',
        accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
        showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
        coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
        disableAddCoordinatorIcon: true
    };
    @track newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '', disableInputs: false };
    @track newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '', disableInputs: false };
    @track isConfirmed = false;
    @track showDeletePopup = false;
    @track deleteItemType = '';
    @track deleteItemIndex = -1;
    @track deleteItemName = '';
    @track deleteItemId = '';
    @track noAgencyChecked = false;
    @track noSpermChecked = false;
    @track noClinicChecked = false;
   // @track noAttorneyChecked = false;
 //   @track noRecipientChecked = false;
    @track isEditingAgency = false;
    @track isEditingSperm = false;
    @track isEditingClinic = false;
    @track isEditingAttorney = false;
    @track isEditingRecipient = false;
    @track selectedSpermBankId = '';
    @track searchKey = '';
    @track selectedSpermBank = null;
    @track showAddButton = false;
    @track showPlusButton = false;
    @track showClinicAddButton = false;
    @track showClinicPlusButton = false;
    @track selectedClinicId = '';
    @track selectedClinic = null;
    @track showAttorneyAddButton = false;
    @track showAttorneyPlusButton = false;
   // @track selectedAttorneyId = '';
   // @track selectedAttorney = null;
   // @track showRecipientAddButton = false;
   // @track showRecipientPlusButton = false;
    //@track selectedRecipientId = '';
   // @track selectedRecipient = null;
   // @track showAgencyAddButton = false;
   // @track showAgencyPlusButton = false;
    @track selectedAgencyId = '';
    @track selectedAgency = null;
    @track loadSpinner = false;

    get isAddButtonDisabled() {
        return !this.selectedSpermBankId;
    }

    get addAgencyClass() {
        return this.noAgencyChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    }

    get addSpermClass() {
        return this.noSpermChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    }

    get addClinicClass() {
        return this.noClinicChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    }

    // get addAttorneyClass() {
    //     return this.noAttorneyChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    // }

    // get addRecipientClass() {
    //     return this.noRecipientChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    // }

    get agencyButtonLabel() {
        return this.isEditingAgency ? 'Save' : 'Add';
    }

    get spermButtonLabel() {
        return this.isEditingSperm ? 'Save' : 'Add';
    }

    get clinicButtonLabel() {
        return this.isEditingClinic ? 'Save' : 'Add';
    }

    get attorneyButtonLabel() {
        return this.isEditingAttorney ? 'Save' : 'Add';
    }

    get recipientButtonLabel() {
        return this.isEditingRecipient ? 'Save' : 'Add';
    }

    async connectedCallback() {
        try {
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj || {}));
            this.donorId = this.contactObj.donorId || '003QL00000xXfiNYAS';
            this.showagencySection = this.contactObj.donorType === 'egg';
            this.showSpermBankSection = this.contactObj.donorType !== 'egg';
            this.showclinicSection = true;
            this.showattorneySection = this.contactObj.donorType === 'egg';
            this.showrecipientSection = true;

            this.legalNamesri = {
                firstName: this.contactObj.firstName || '',
                lastName: this.contactObj.lastName || ''
            };
            this.legalName = { ...this.legalNamesri };
            this.dob = this.contactObj.dob || '';
            this.address = {
                state: this.contactObj.state || '',
                city: this.contactObj.city || '',
                street: this.contactObj.street || '',
                pincode: this.contactObj.pincode || '',
                additionalInfo: this.contactObj.additionalInfo || ''
            };

            const result = await spermDonor({ donorId: this.donorId });
            console.log('spermDonor result:', JSON.stringify(result));

            if (result.parentdetails) {
                this.legalNamesri = {
                    firstName: result.parentdetails.fristName || this.legalNamesri.firstName,
                    lastName: result.parentdetails.lastName || this.legalNamesri.lastName
                };
                this.legalName = { ...this.legalNamesri };
                this.dob = result.parentdetails.dob || this.dob;
                this.address = {
                    state: result.parentdetails.state || this.address.state,
                    city: result.parentdetails.city || this.address.city,
                    street: result.parentdetails.street || this.address.street,
                    pincode: result.parentdetails.pincode || this.address.pincode,
                    additionalInfo: result.parentdetails.additionalInfo || this.address.additionalInfo
                };
            }

            this.agencies = Array.isArray(result.Agencylist) ? result.Agencylist.map(item => ({
                id: item.Id || `agency_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                agencyName: item.Name || '',
                phone: item.Phone || '',
                coordinatorName: item.coordinatorName || '',
                coordinatorId: item.coordinatorId || '',
                website: item.website || '',
                cityState: item.cityState || '',
                coordinatorEmail: item.email || '',
                pmcNumber: item.pmcNumber || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false,
                accountId: item.AccountId || '',
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: item.coordinatorFirstName || '',
                    lastName: item.coordinatorLastName || '',
                    phone: item.coordinatorPhone || '',
                    coordinatorId: item.coordinatorId || '',
                    parentId: item.AccountId || '',
                    fullName: item.coordinatorName || '',
                    isAllow: !!item.coordinatorId,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: !!item.coordinatorId
            })) : [];

            this.sperms = Array.isArray(result.spermlist) ? result.spermlist.map(item => ({
                id: item.Id || `sperm_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                spermBankName: item.Name || '',
                spermBankPhone: item.Phone || '',
                coordinatorName: item.coordinatorName || '',
                coordinatorId: item.coordinatorId || '',
                spermBankWebsite: item.website || '',
                spermBankEmail: item.email || '',
                pmcNumber: item.pmcNumber || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false,
                accountId: item.AccountId || '',
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: item.coordinatorFirstName || '',
                    lastName: item.coordinatorLastName || '',
                    phone: item.coordinatorPhone || '',
                    coordinatorId: item.coordinatorId || '',
                    parentId: item.AccountId || '',
                    fullName: item.coordinatorName || '',
                    isAllow: !!item.coordinatorId,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: !!item.coordinatorId
            })) : [];

            this.clinics = Array.isArray(result.Cliniclist) ? result.Cliniclist.map(item => ({
                id: item.Id || `clinic_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                clinicName: item.Name || '',
                phone: item.Phone || '',
                coordinatorName: item.coordinatorName || '',
                coordinatorId: item.coordinatorId || '',
                website: item.website || '',
                cityState: item.cityState || '',
                coordinatorEmail: item.email || '',
                pmcNumber: item.pmcNumber || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false,
                accountId: item.AccountId || '',
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: item.coordinatorFirstName || '',
                    lastName: item.coordinatorLastName || '',
                    phone: item.coordinatorPhone || '',
                    coordinatorId: item.coordinatorId || '',
                    parentId: item.AccountId || '',
                    fullName: item.coordinatorName || '',
                    isAllow: !!item.coordinatorId,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: !!item.coordinatorId
            })) : [];

this.attorneys = Array.isArray(result.Attorneylist) ? result.Attorneylist.map(item => ({
    id: item.Id || `attorney_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    attorneyName: item.Name || '',
    phone: item.Phone || '',
    lawFirm: item.lawFirm || item.coordinatorName || '',
    website: item.website || '',
    cityState: item.cityState || '',
    email: item.email || '',
    isEditable: true, // Always editable since no lookup
    isFromPrimaryBanks: false
})) : [];

this.recipients = Array.isArray(result.Recipientlist) ? result.Recipientlist.map(item => ({
    id: item.Id || `recipient_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    firstName: item.firstName || '',
    lastName: item.lastName || '',
    Name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
    phone: item.Phone || '',
    email: item.email || '',
    additionalInfo: item.additionalInfo || '',
    isEditable: true, // Always editable since no lookup
    isFromPrimaryBanks: false
})) : [];
        } catch (error) {
            console.error('Error loading donor data:', error);
            this.showToast('Error', `Failed to load donor data: ${error.body?.message || error.message}`, 'error');
        }
    }

    handleSpermBankChange(event) {
        this.nameConfirmation = event.target.value;
        this.isYesChecked = this.nameConfirmation === 'Yes';
        this.isNoChecked = this.nameConfirmation === 'No';
        this.isDisabled = this.isYesChecked;
        if (this.isYesChecked) {
            this.legalName = { ...this.legalNamesri };
        }
    }

    handleLegalNameChange(event) {
        const field = event.target.name;
        this.legalName[field] = event.target.value;
    }

    handleDobChange(event) {
        this.dob = event.target.value;
        this.dobError = this.validateDob(this.dob) ? '' : 'You must be at least 18 years old.';
    }

    handleAddressChange(event) {
        const field = event.target.dataset.field;
        this.address[field] = event.target.value;
    }

    // handleCoordinatorSelect(event) {
    //     const { id, name, dataType } = event.detail;
    //     const entity = this.getEntity(dataType);
    //     entity.coordinatorId = id || '';
    //     entity.coordinatorName = name || '';
    //     entity.coordinatorUserInputsObj = {
    //         firstName: '',
    //         lastName: '',
    //         phone: '',
    //         coordinatorId: id || '',
    //         parentId: entity.accountId,
    //         fullName: name || '',
    //         isAllow: !!id,
    //         isCoordinatorFirstNameBlank: false
    //     };
    //     entity.disableAddCoordinatorIcon = !!id;
    //     entity.showNoCoordinatorRecordsErrorMessage = false;
    //     entity.isAdditionalCoordinators = false;
    //     this.updateEntity(dataType, entity);
    // }


    handleCoordinatorSelect(event) {
    try {
        const { id, name, dataType } = event.detail;
        const entity = this.getEntity(dataType);

        entity.coordinatorId = id || '';
        entity.coordinatorName = name || '';
        entity.coordinatorUserInputsObj = {
            firstName: '',
            lastName: '',
            phone: '',
            coordinatorId: id || '',
            parentId: entity.accountId,
            fullName: name || '',
            isAllow: !!id,
            isCoordinatorFirstNameBlank: false
        };
        entity.disableAddCoordinatorIcon = !!id;
        entity.showNoCoordinatorRecordsErrorMessage = false;
        entity.isAdditionalCoordinators = false;

        this.updateEntity(dataType, entity);
    } catch (error) {
        console.error('Error in handleCoordinatorSelect:', error);
        // Optionally show a UI error message or handle fallback logic
    }
}


    handleNoCoordinatorData(event) {
        const dataType = event.target.dataset.type;
        const entity = this.getEntity(dataType);
        entity.showNoCoordinatorRecordsErrorMessage = true;
        entity.disableAddCoordinatorIcon = false;
        this.updateEntity(dataType, entity);
        this.showToast('Info', 'No coordinators found. Click the add icon to add a coordinator manually.', 'info');
    }

    handleAddCoordinator(event) {
        const dataType = event.target.dataset.type;
        const entity = this.getEntity(dataType);
        if (!entity.accountId && !entity.isAdditionalCoordinators) {
            this.showToast('Error', `Please select or add a ${dataType} before adding a coordinator.`, 'error');
            return;
        }
        entity.isAdditionalCoordinators = true;
        entity.coordinatorUserInputsObj = {
            firstName: '',
            lastName: '',
            phone: '',
            coordinatorId: '',
            parentId: entity.accountId,
            fullName: '',
            isAllow: false,
            isCoordinatorFirstNameBlank: false
        };
        entity.disableAddCoordinatorIcon = true;
        this.updateEntity(dataType, entity);
    }

    handleCoordinatorInputs(event) {
        const { name, value, dataset: { type: dataType } } = event.target;
        const entity = this.getEntity(dataType);
        entity.coordinatorUserInputsObj[name] = value;
        entity.coordinatorUserInputsObj.isCoordinatorFirstNameBlank = name === 'firstName' && !value;
        entity.coordinatorName = `${entity.coordinatorUserInputsObj.firstName} ${entity.coordinatorUserInputsObj.lastName}`.trim();
        this.updateEntity(dataType, entity);
    }

    async handleCoordinatorSave(event) {
        const dataType = event.target.dataset.type;
        const entity = this.getEntity(dataType);
        if (!entity.coordinatorUserInputsObj.firstName) {
            entity.coordinatorUserInputsObj.isCoordinatorFirstNameBlank = true;
            this.updateEntity(dataType, entity);
            this.showToast('Error', 'Coordinator first name is required.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            const coordinatorId = await createCoordinator({
                firstName: entity.coordinatorUserInputsObj.firstName,
                lastName: entity.coordinatorUserInputsObj.lastName,
                phone: entity.coordinatorUserInputsObj.phone,
                parentId: entity.accountId,
                parentObject: dataType === 'agency' ? 'Account' : dataType === 'sperm' ? 'Account' : 'Account'
            });
            entity.coordinatorId = coordinatorId;
            entity.coordinatorName = `${entity.coordinatorUserInputsObj.firstName} ${entity.coordinatorUserInputsObj.lastName}`.trim();
            entity.coordinatorUserInputsObj.coordinatorId = coordinatorId;
            entity.coordinatorUserInputsObj.fullName = entity.coordinatorName;
            entity.coordinatorUserInputsObj.isAllow = true;
            entity.isAdditionalCoordinators = false;
            entity.disableAddCoordinatorIcon = true;
            entity.showNoCoordinatorRecordsErrorMessage = false;
            this.updateEntity(dataType, entity);
            this.showToast('Success', 'Coordinator added successfully.', 'success');
        } catch (error) {
            console.error(`Error saving coordinator for ${dataType}:`, error);
            this.showToast('Error', `Error saving coordinator: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    getEntity(dataType) {
        switch (dataType) {
            case 'agency': return this.newAgency;
            case 'sperm': return this.newSperm;
            case 'clinic': return this.newClinic;
            default: throw new Error(`Invalid data type: ${dataType}`);
        }
    }

    updateEntity(dataType, entity) {
        switch (dataType) {
            case 'agency': this.newAgency = { ...entity }; break;
            case 'sperm': this.newSperm = { ...entity }; break;
            case 'clinic': this.newClinic = { ...entity }; break;
            default: throw new Error(`Invalid data type: ${dataType}`);
        }
    }

    handleAddAgencyClick() {
        this.showAgencyPicker = true;
        this.showAgencyForm = false;
        this.isEditingAgency = false;
        this.newAgency = {
            id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '',
            accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
            coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
            disableAddCoordinatorIcon: true
        };
        this.selectedAgencyId = '';
        this.selectedAgency = null;
        this.showAgencyAddButton = false;
        this.showAgencyPlusButton = false;
    }

    async handleAgencySelect(event) {
        console.log('Agency select:', JSON.stringify(event.detail));
        this.selectedAgencyId = event.detail.id || '';
        if (this.selectedAgencyId) {
            try {
                const result = await fetchSpermBankRecord({ accountId: this.selectedAgencyId });
                console.log('Selected agency details:', JSON.stringify(result));
                if (result) {
                    this.newAgency = {
                        id: result.Id,
                        agencyName: result.Name || '',
                        phone: result.Phone || '',
                        coordinatorName: result.d21_Coordinator_Name__c || '',
                        website: result.Website || '',
                        cityState: result.City__c || '',
                        coordinatorEmail: result.d21_Email__c || '',
                        accountId: result.Id,
                        coordinatorId: '',
                        disableInputs: true,
                        disableAddIcon: true,
                        showNoCoordinatorRecordsErrorMessage: false,
                        isAdditionalCoordinators: false,
                        coordinatorUserInputsObj: {
                            firstName: '',
                            lastName: '',
                            phone: '',
                            coordinatorId: '',
                            parentId: result.Id,
                            fullName: result.d21_Coordinator_Name__c || '',
                            isAllow: false,
                            isCoordinatorFirstNameBlank: false
                        },
                        disableAddCoordinatorIcon: false
                    };
                    this.selectedAgency = result;
                    this.showAgencyForm = true;
                    this.showAgencyPicker = false;
                    this.showAgencyAddButton = true;
                    this.showAgencyPlusButton = false;
                } else {
                    this.newAgency = {
                        id: this.selectedAgencyId,
                        agencyName: '',
                        phone: '',
                        coordinatorName: '',
                        website: '',
                        cityState: '',
                        coordinatorEmail: '',
                        accountId: this.selectedAgencyId,
                        coordinatorId: '',
                        disableInputs: false,
                        disableAddIcon: false,
                        showNoCoordinatorRecordsErrorMessage: false,
                        isAdditionalCoordinators: false,
                        coordinatorUserInputsObj: {
                            firstName: '',
                            lastName: '',
                            phone: '',
                            coordinatorId: '',
                            parentId: this.selectedAgencyId,
                            fullName: '',
                            isAllow: false,
                            isCoordinatorFirstNameBlank: false
                        },
                        disableAddCoordinatorIcon: true
                    };
                    this.selectedAgency = null;
                    this.showAgencyForm = true;
                    this.showAgencyPicker = false;
                    this.showAgencyAddButton = true;
                    this.showAgencyPlusButton = false;
                }
            } catch (error) {
                console.error('Error fetching agency:', error);
                this.showToast('Error', `Error fetching agency details: ${error.body?.message || error.message}`, 'error');
                this.selectedAgencyId = '';
                this.selectedAgency = null;
                this.showAgencyForm = false;
                this.showAgencyAddButton = false;
                this.showAgencyPlusButton = false;
            }
        } else {
            this.selectedAgency = null;
            this.showAgencyForm = false;
            this.showAgencyAddButton = false;
            this.showAgencyPlusButton = false;
            this.showToast('Info', 'No agency selected.', 'info');
        }
    }

    handleNoAgencyData(event) {
        console.log('No agency data:', event.detail);
        this.showToast('Info', event.detail || 'No agencies found.', 'info');
        this.showAgencyAddButton = false;
        this.showAgencyPlusButton = true;
        this.newAgency = { ...this.newAgency, disableAddIcon: false, showNoCoordinatorRecordsErrorMessage: true, disableAddCoordinatorIcon: false };
    }

    handlePlusAgencyClick() {
        this.showAgencyForm = true;
        this.showAgencyPicker = false;
        this.showAgencyAddButton = true;
        this.showAgencyPlusButton = false;
        this.newAgency = {
            id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '',
            accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
            coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
            disableAddCoordinatorIcon: true
        };
        this.isEditingAgency = false;
        this.selectedAgencyId = '';
        this.selectedAgency = null;
    }

    async handleAddNewAgencyClick() {
        if (!this.newAgency.agencyName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            if (this.isEditingAgency) {
                await editAgency({
                    accountId: this.newAgency.id,
                    agencyName: this.newAgency.agencyName,
                    phone: this.newAgency.phone,
                    coordinatorName: this.newAgency.coordinatorName,
                    coordinatorId: this.newAgency.coordinatorId,
                    website: this.newAgency.website,
                    cityState: this.newAgency.cityState,
                    email: this.newAgency.coordinatorEmail
                });
                this.agencies = this.agencies.map(agency =>
                    agency.id === this.newAgency.id ? {
                        ...this.newAgency,
                        isEditable: true,
                        coordinatorId: this.newAgency.coordinatorId,
                        coordinatorUserInputsObj: { ...this.newAgency.coordinatorUserInputsObj }
                    } : agency
                );
                this.showToast('Success', 'Agency updated successfully', 'success');
                this.handleCancelAgency();
            } else if (this.selectedAgency) {
                await addlookupAgency({ donorId: this.donorId, agencyId: this.selectedAgencyId });
                this.agencies = [...this.agencies, {
                    id: this.selectedAgencyId,
                    agencyName: this.newAgency.agencyName,
                    phone: this.newAgency.phone || '',
                    coordinatorName: this.newAgency.coordinatorName || '',
                    coordinatorId: this.newAgency.coordinatorId || '',
                    website: this.newAgency.website || '',
                    cityState: this.newAgency.cityState || '',
                    coordinatorEmail: this.newAgency.coordinatorEmail || '',
                    isEditable: true,
                    isFromPrimaryBanks: this.newAgency.disableInputs,
                    accountId: this.selectedAgencyId,
                    showNoCoordinatorRecordsErrorMessage: false,
                    isAdditionalCoordinators: false,
                    coordinatorUserInputsObj: { ...this.newAgency.coordinatorUserInputsObj },
                    disableAddCoordinatorIcon: !!this.newAgency.coordinatorId
                }];
                this.showToast('Success', 'Agency added successfully', 'success');
                this.handleCancelAgency();
            } else {
                const result = await addAgency({
                    donorId: this.donorId,
                    agencyName: this.newAgency.agencyName,
                    phone: this.newAgency.phone,
                    coordinatorName: this.newAgency.coordinatorName,
                    coordinatorId: this.newAgency.coordinatorId,
                    website: this.newAgency.website,
                    cityState: this.newAgency.cityState,
                    email: this.newAgency.coordinatorEmail
                });
                this.agencies = [...this.agencies, {
                    ...this.newAgency,
                    id: result,
                    isEditable: true,
                    isFromPrimaryBanks: false,
                    accountId: result,
                    showNoCoordinatorRecordsErrorMessage: false,
                    isAdditionalCoordinators: false,
                    coordinatorUserInputsObj: { ...this.newAgency.coordinatorUserInputsObj },
                    disableAddCoordinatorIcon: !!this.newAgency.coordinatorId
                }];
                this.showToast('Success', 'Agency added successfully', 'success');
                this.handleCancelAgency();
            }
        } catch (error) {
            console.error('Error adding/updating agency:', error);
            this.showToast('Error', `Error adding/updating agency: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleEditAgency(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const agency = this.agencies[index];
        if (!agency || !agency.isEditable) {
            this.showToast('Error', 'This agency cannot be edited.', 'error');
            return;
        }
        this.isEditingAgency = true;
        this.newAgency = { ...agency };
        this.showAgencyForm = true;
        this.showAgencyPicker = false;
        this.showAgencyAddButton = true;
        this.showAgencyPlusButton = false;
        this.selectedAgencyId = agency.accountId;
        this.selectedAgency = { Id: agency.accountId, Name: agency.agencyName };
    }

    handleDeleteAgency(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const agency = this.agencies[index];
        if (!agency) {
            this.showToast('Error', 'Invalid agency selected for deletion.', 'error');
            return;
        }
        this.deleteItemType = 'Agency';
        this.deleteItemIndex = index;
        this.deleteItemName = agency.agencyName;
        this.deleteItemId = agency.id;
        this.showDeletePopup = true;
    }

    async handleDeleteYes() {
        try {
            this.loadSpinner = true;
            if (this.deleteItemType === 'Agency') {
                await deleteAgency({ agencyId: this.deleteItemId });
                this.agencies = this.agencies.filter((_, index) => index !== this.deleteItemIndex);
                this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
            } else if (this.deleteItemType === 'Sperm Bank') {
                await deleteSpermBank({ spermBankId: this.deleteItemId });
                this.sperms = this.sperms.filter((_, index) => index !== this.deleteItemIndex);
                this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
            } else if (this.deleteItemType === 'Clinic') {
                await deleteClinic({ clinicId: this.deleteItemId });
                this.clinics = this.clinics.filter((_, index) => index !== this.deleteItemIndex);
                this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
            } else if (this.deleteItemType === 'Attorney') {
                await deleteAttorney({ attorneyId: this.deleteItemId });
                this.attorneys = this.attorneys.filter((_, index) => index !== this.deleteItemIndex);
                this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
            } else if (this.deleteItemType === 'Recipient') {
                await deleteRecipient({ recipientId: this.deleteItemId });
                this.recipients = this.recipients.filter((_, index) => index !== this.deleteItemIndex);
                this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
            }
            this.showDeletePopup = false;
        } catch (error) {
            console.error(`Error deleting ${this.deleteItemType}:`, error);
            this.showToast('Error', `Error deleting ${this.deleteItemType}: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteItemType = '';
        this.deleteItemIndex = -1;
        this.deleteItemName = '';
        this.deleteItemId = '';
    }

    handleCancelAgency() {
        this.showAgencyForm = false;
        this.showAgencyPicker = false;
        this.isEditingAgency = false;
        this.newAgency = {
            id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '',
            accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
            coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
            disableAddCoordinatorIcon: true
        };
        this.selectedAgencyId = '';
        this.selectedAgency = null;
        this.showAgencyAddButton = false;
        this.showAgencyPlusButton = false;
    }

    handleAgencyFieldChange(event) {
        const field = event.target.dataset.field;
        this.newAgency[field] = event.target.value;
    }

    handleAddSpermClick() {
        this.showSpermPicker = true;
        this.showSpermForm = true;
        this.isEditingSperm = false;
        this.newSperm = {
            id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '',
            accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
            coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
            disableAddCoordinatorIcon: true
        };
        this.selectedSpermBankId = '';
        this.selectedSpermBank = null;
        this.showAddButton = false;
        this.showPlusButton = false;
    }

    async handleSpermBankSelect(event) {
        console.log('Sperm bank select:', JSON.stringify(event.detail));
        this.selectedSpermBankId = event.detail.id || '';
        if (this.selectedSpermBankId) {
            try {
                const result = await fetchSpermBankRecord({ accountId: this.selectedSpermBankId });
                console.log('Selected sperm bank details:', JSON.stringify(result));
                if (result) {
                    this.newSperm = {
                        id: result.Id,
                        spermBankName: result.Name || '',
                        spermBankPhone: result.Phone || '',
                        coordinatorName: result.d21_Coordinator_Name__c || '',
                        spermBankWebsite: result.Website || '',
                        spermBankEmail: result.d21_Email__c || '',
                        accountId: result.Id,
                        coordinatorId: '',
                        disableInputs: true,
                        disableAddIcon: true,
                        showNoCoordinatorRecordsErrorMessage: false,
                        isAdditionalCoordinators: false,
                        coordinatorUserInputsObj: {
                            firstName: '',
                            lastName: '',
                            phone: '',
                            coordinatorId: '',
                            parentId: result.Id,
                            fullName: result.d21_Coordinator_Name__c || '',
                            isAllow: false,
                            isCoordinatorFirstNameBlank: false
                        },
                        disableAddCoordinatorIcon: false
                    };
                    this.selectedSpermBank = result;
                    this.showSpermForm = true;
                    this.showSpermPicker = false;
                    this.showAddButton = true;
                    this.showPlusButton = false;
                } else {
                    this.newSperm = {
                        id: this.selectedSpermBankId,
                        spermBankName: '',
                        spermBankPhone: '',
                        coordinatorName: '',
                        spermBankWebsite: '',
                        spermBankEmail: '',
                        accountId: this.selectedSpermBankId,
                        coordinatorId: '',
                        disableInputs: false,
                        disableAddIcon: false,
                        showNoCoordinatorRecordsErrorMessage: false,
                        isAdditionalCoordinators: false,
                        coordinatorUserInputsObj: {
                            firstName: '',
                            lastName: '',
                            phone: '',
                            coordinatorId: '',
                            parentId: this.selectedSpermBankId,
                            fullName: '',
                            isAllow: false,
                            isCoordinatorFirstNameBlank: false
                        },
                        disableAddCoordinatorIcon: true
                    };
                    this.selectedSpermBank = null;
                    this.showSpermForm = true;
                    this.showSpermPicker = false;
                    this.showAddButton = true;
                    this.showPlusButton = false;
                }
            } catch (error) {
                console.error('Error fetching sperm bank:', error);
                this.showToast('Error', `Error fetching sperm bank details: ${error.body?.message || error.message}`, 'error');
                this.selectedSpermBankId = '';
                this.selectedSpermBank = null;
                this.showSpermForm = false;
                this.showAddButton = false;
                this.showPlusButton = false;
            }
        } else {
            this.selectedSpermBank = null;
            this.showSpermForm = false;
            this.showAddButton = false;
            this.showPlusButton = false;
            this.showToast('Info', 'No sperm bank selected.', 'info');
        }
    }

    handleNoData(event) {
        console.log('No sperm bank data:', event.detail);
        this.showToast('Info', event.detail || 'No sperm banks found.', 'info');
        this.showAddButton = false;
        this.showPlusButton = true;
        this.newSperm = { ...this.newSperm, disableAddIcon: false, showNoCoordinatorRecordsErrorMessage: true, disableAddCoordinatorIcon: false };
    }

    handlePlusIconClick() {
        this.showSpermForm = true;
        this.showSpermPicker = false;
        this.showAddButton = true;
        this.showPlusButton = false;
        this.newSperm = {
            id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '',
            accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
            coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
            disableAddCoordinatorIcon: true
        };
        this.isEditingSperm = false;
        this.selectedSpermBankId = '';
        this.selectedSpermBank = null;
    }

    async handleAddNewSpermBankClick() {
        if (!this.newSperm.spermBankName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            if (this.isEditingSperm) {
                await editSpermBank({
                    accountId: this.newSperm.id,
                    spermBankName: this.newSperm.spermBankName,
                    phone: this.newSperm.spermBankPhone,
                    coordinatorName: this.newSperm.coordinatorName,
                    coordinatorId: this.newSperm.coordinatorId,
                    website: this.newSperm.spermBankWebsite,
                    email: this.newSperm.spermBankEmail
                });
                this.sperms = this.sperms.map(sperm =>
                    sperm.id === this.newSperm.id ? {
                        ...this.newSperm,
                        isEditable: true,
                        coordinatorId: this.newSperm.coordinatorId,
                        coordinatorUserInputsObj: { ...this.newSperm.coordinatorUserInputsObj }
                    } : sperm
                );
                this.showToast('Success', 'Sperm bank updated successfully', 'success');
                this.handleCancelSperm();
            } else if (this.selectedSpermBank) {
                await addlookupSpermBank({ donorId: this.donorId, spermBankId: this.selectedSpermBankId });
                this.sperms = [...this.sperms, {
                    id: this.selectedSpermBankId,
                    spermBankName: this.newSperm.spermBankName,
                    spermBankPhone: this.newSperm.spermBankPhone || '',
                    coordinatorName: this.newSperm.coordinatorName || '',
                    coordinatorId: this.newSperm.coordinatorId || '',
                    spermBankWebsite: this.newSperm.spermBankWebsite || '',
                    spermBankEmail: this.newSperm.spermBankEmail || '',
                    isEditable: false,
                    isFromPrimaryBanks: this.newSperm.disableInputs,
                    accountId: this.selectedSpermBankId,
                    showNoCoordinatorRecordsErrorMessage: false,
                    isAdditionalCoordinators: false,
                    coordinatorUserInputsObj: { ...this.newSperm.coordinatorUserInputsObj },
                    disableAddCoordinatorIcon: !!this.newSperm.coordinatorId
                }];
                this.showToast('Success', 'Sperm bank added successfully', 'success');
                this.handleCancelSperm();
            } else {
                const result = await addSpermBank({
                    donorId: this.donorId,
                    spermBankName: this.newSperm.spermBankName,
                    phone: this.newSperm.spermBankPhone,
                    coordinatorName: this.newSperm.coordinatorName,
                    coordinatorId: this.newSperm.coordinatorId,
                    website: this.newSperm.spermBankWebsite,
                    email: this.newSperm.spermBankEmail
                });
                this.sperms = [...this.sperms, {
                    ...this.newSperm,
                    id: result,
                    isEditable: true,
                    isFromPrimaryBanks: false,
                    accountId: result,
                    showNoCoordinatorRecordsErrorMessage: false,
                    isAdditionalCoordinators: false,
                    coordinatorUserInputsObj: { ...this.newSperm.coordinatorUserInputsObj },
                    disableAddCoordinatorIcon: !!this.newSperm.coordinatorId
                }];
                this.showToast('Success', 'Sperm bank added successfully', 'success');
                this.handleCancelSperm();
            }
        } catch (error) {
            console.error('Error adding/updating sperm bank:', error);
            this.showToast('Error', `Error adding/updating sperm bank: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleEditSperm(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const sperm = this.sperms[index];
        if (!sperm || !sperm.isEditable) {
            this.showToast('Error', 'This sperm bank cannot be edited.', 'error');
            return;
        }
        this.isEditingSperm = true;
        this.newSperm = { ...sperm };
        this.showSpermForm = true;
        this.showSpermPicker = false;
        this.showAddButton = true;
        this.showPlusButton = false;
        this.selectedSpermBankId = sperm.accountId;
        this.selectedSpermBank = { Id: sperm.accountId, Name: sperm.spermBankName };
    }

    handleDeleteSperm(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const sperm = this.sperms[index];
        if (!sperm) {
            this.showToast('Error', 'Invalid sperm bank selected for deletion.', 'error');
            return;
        }
        this.deleteItemType = 'Sperm Bank';
        this.deleteItemIndex = index;
        this.deleteItemName = sperm.spermBankName;
        this.deleteItemId = sperm.id;
        this.showDeletePopup = true;
    }

    handleCancelSperm() {
        this.showSpermForm = false;
        this.showSpermPicker = false;
        this.isEditingSperm = false;
        this.newSperm = {
            id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '',
            accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
            coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
            disableAddCoordinatorIcon: true
        };
        this.selectedSpermBankId = '';
        this.selectedSpermBank = null;
        this.showAddButton = false;
        this.showPlusButton = false;
    }

    handleSpermFieldChange(event) {
        const field = event.target.dataset.field;
        this.newSperm[field] = event.target.value;
    }

    handleAddClinicClick() {
        this.showClinicPicker = true;
        this.showClinicForm = true;
        this.isEditingClinic = false;
        this.newClinic = {
            id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '',
            accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
            coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
            disableAddCoordinatorIcon: true
        };
        this.selectedClinicId = '';
        this.selectedClinic = null;
        this.showClinicAddButton = false;
        this.showClinicPlusButton = false;
    }

    async handleClinicSelect(event) {
        console.log('Clinic select:', JSON.stringify(event.detail));
        this.selectedClinicId = event.detail.id || '';
        if (this.selectedClinicId) {
            try {
                const result = await fetchSpermBankRecord({ accountId: this.selectedClinicId });
                console.log('Selected clinic details:', JSON.stringify(result));
                if (result) {
                    this.newClinic = {
                        id: result.Id,
                        clinicName: result.Name || '',
                        phone: result.Phone || '',
                        coordinatorName: result.d21_Coordinator_Name__c || '',
                        website: result.Website || '',
                        cityState: result.City__c || '',
                        coordinatorEmail: result.d21_Email__c || '',
                        accountId: result.Id,
                        coordinatorId: '',
                        disableInputs: true,
                        disableAddIcon: true,
                        showNoCoordinatorRecordsErrorMessage: false,
                        isAdditionalCoordinators: false,
                        coordinatorUserInputsObj: {
                            firstName: '',
                            lastName: '',
                            phone: '',
                            coordinatorId: '',
                            parentId: result.Id,
                            fullName: result.d21_Coordinator_Name__c || '',
                            isAllow: false,
                            isCoordinatorFirstNameBlank: false
                        },
                        disableAddCoordinatorIcon: false
                    };
                    this.selectedClinic = result;
                    this.showClinicForm = true;
                    this.showClinicPicker = false;
                    this.showClinicAddButton = true;
                    this.showClinicPlusButton = false;
                } else {
                    this.newClinic = {
                        id: this.selectedClinicId,
                        clinicName: '',
                        phone: '',
                        coordinatorName: '',
                        website: '',
                        cityState: '',
                        coordinatorEmail: '',
                        accountId: this.selectedClinicId,
                        coordinatorId: '',
                        disableInputs: false,
                        disableAddIcon: false,
                        showNoCoordinatorRecordsErrorMessage: false,
                        isAdditionalCoordinators: false,
                        coordinatorUserInputsObj: {
                            firstName: '',
                            lastName: '',
                            phone: '',
                            coordinatorId: '',
                            parentId: this.selectedClinicId,
                            fullName: '',
                            isAllow: false,
                            isCoordinatorFirstNameBlank: false
                        },
                        disableAddCoordinatorIcon: true
                    };
                    this.selectedClinic = null;
                    this.showClinicForm = true;
                    this.showClinicPicker = false;
                    this.showClinicAddButton = true;
                    this.showClinicPlusButton = false;
                }
            } catch (error) {
                console.error('Error fetching clinic:', error);
                this.showToast('Error', `Error fetching clinic details: ${error.body?.message || error.message}`, 'error');
                this.selectedClinicId = '';
                this.selectedClinic = null;
                this.showClinicForm = false;
                this.showClinicAddButton = false;
                this.showClinicPlusButton = false;
            }
        } else {
            this.selectedClinic = null;
            this.showClinicForm = false;
            this.showClinicAddButton = false;
            this.showClinicPlusButton = false;
            this.showToast('Info', 'No clinic selected.', 'info');
        }
    }

    handleNoClinicData(event) {
        console.log('No clinic data:', event.detail);
        this.showToast('Info', event.detail || 'No clinics found.', 'info');
        this.showClinicAddButton = false;
        this.showClinicPlusButton = true;
        this.newClinic = { ...this.newClinic, disableAddIcon: false, showNoCoordinatorRecordsErrorMessage: true, disableAddCoordinatorIcon: false };
    }

    handlePlusClinicClick() {
        this.showClinicForm = true;
        this.showClinicPicker = false;
        this.showClinicAddButton = true;
        this.showClinicPlusButton = false;
        this.newClinic = {
            id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '',
            accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
            coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
            disableAddCoordinatorIcon: true
        };
        this.isEditingClinic = false;
        this.selectedClinicId = '';
        this.selectedClinic = null;
    }

    async handleAddNewClinicClick() {
        if (!this.newClinic.clinicName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            if (this.isEditingClinic) {
                await editClinic({
                    accountId: this.newClinic.id,
                    clinicName: this.newClinic.clinicName,
                    phone: this.newClinic.phone,
                    coordinatorName: this.newClinic.coordinatorName,
                    coordinatorId: this.newClinic.coordinatorId,
                    website: this.newClinic.website,
                    cityState: this.newClinic.cityState,
                    email: this.newClinic.coordinatorEmail
                });
                this.clinics = this.clinics.map(clinic =>
                    clinic.id === this.newClinic.id ? {
                        ...this.newClinic,
                        isEditable: true,
                        coordinatorId: this.newClinic.coordinatorId,
                        coordinatorUserInputsObj: { ...this.newClinic.coordinatorUserInputsObj }
                    } : clinic
                );
                this.showToast('Success', 'Clinic updated successfully', 'success');
                this.handleCancelClinic();
            } else if (this.selectedClinic) {
                await addlookupClinic({ donorId: this.donorId, clinicId: this.selectedClinicId });
                this.clinics = [...this.clinics, {
                    id: this.selectedClinicId,
                    clinicName: this.newClinic.clinicName,
                    phone: this.newClinic.phone || '',
                    coordinatorName: this.newClinic.coordinatorName || '',
                    coordinatorId: this.newClinic.coordinatorId || '',
                    website: this.newClinic.website || '',
                    cityState: this.newClinic.cityState || '',
                    coordinatorEmail: this.newClinic.coordinatorEmail || '',
                    isEditable: false,
                    isFromPrimaryBanks: this.newClinic.disableInputs,
                    accountId: this.selectedClinicId,
                    showNoCoordinatorRecordsErrorMessage: false,
                    isAdditionalCoordinators: false,
                    coordinatorUserInputsObj: { ...this.newClinic.coordinatorUserInputsObj },
                    disableAddCoordinatorIcon: !!this.newClinic.coordinatorId
                }];
                this.showToast('Success', 'Clinic added successfully', 'success');
                this.handleCancelClinic();
            } else {
                const result = await addClinic({
                    donorId: this.donorId,
                    clinicName: this.newClinic.clinicName,
                    phone: this.newClinic.phone,
                    coordinatorName: this.newClinic.coordinatorName,
                    coordinatorId: this.newClinic.coordinatorId,
                    website: this.newClinic.website,
                    cityState: this.newClinic.cityState,
                    email: this.newClinic.coordinatorEmail
                });
                this.clinics = [...this.clinics, {
                    ...this.newClinic,
                    id: result,
                    isEditable: true,
                    isFromPrimaryBanks: false,
                    accountId: result,
                    showNoCoordinatorRecordsErrorMessage: false,
                    isAdditionalCoordinators: false,
                    coordinatorUserInputsObj: { ...this.newClinic.coordinatorUserInputsObj },
                    disableAddCoordinatorIcon: !!this.newClinic.coordinatorId
                }];
                this.showToast('Success', 'Clinic added successfully', 'success');
                this.handleCancelClinic();
            }
        } catch (error) {
            console.error('Error adding/updating clinic:', error);
            this.showToast('Error', `Error adding/updating clinic: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleEditClinic(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const clinic = this.clinics[index];
        if (!clinic || !clinic.isEditable) {
            this.showToast('Error', 'This clinic cannot be edited.', 'error');
            return;
        }
        this.isEditingClinic = true;
        this.newClinic = { ...clinic };
        this.showClinicForm = true;
        this.showClinicPicker = false;
        this.showClinicAddButton = true;
        this.showClinicPlusButton = false;
        this.selectedClinicId = clinic.accountId;
        this.selectedClinic = { Id: clinic.accountId, Name: clinic.clinicName };
    }

    handleDeleteClinic(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const clinic = this.clinics[index];
        if (!clinic) {
            this.showToast('Error', 'Invalid clinic selected for deletion.', 'error');
            return;
        }
        this.deleteItemType = 'Clinic';
        this.deleteItemIndex = index;
        this.deleteItemName = clinic.clinicName;
        this.deleteItemId = clinic.id;
        this.showDeletePopup = true;
    }

    handleCancelClinic() {
        this.showClinicForm = false;
        this.showClinicPicker = false;
        this.isEditingClinic = false;
        this.newClinic = {
            id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '',
            accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
            coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
            disableAddCoordinatorIcon: true
        };
        this.selectedClinicId = '';
        this.selectedClinic = null;
        this.showClinicAddButton = false;
        this.showClinicPlusButton = false;
    }

    handleClinicFieldChange(event) {
        const field = event.target.dataset.field;
        this.newClinic[field] = event.target.value;
    }

handleAddAttorneyClick() {
    this.showAttorneyForm = true;
    this.isEditingAttorney = false;
    this.newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '' };
}

    // async handleAttorneySelect(event) {
    //     console.log('Attorney select:', JSON.stringify(event.detail));
    //     this.selectedAttorneyId = event.detail.id || '';
    //     if (this.selectedAttorneyId) {
    //         try {
    //             const result = await fetchContactRecord({ accountId: this.selectedAttorneyId });
    //             console.log('Selected attorney details:', JSON.stringify(result));
    //             if (result) {
    //                 this.newAttorney = {
    //                     id: result.Id,
    //                     attorneyName: result.Name || '',
    //                     phone: result.Phone || '',
    //                     lawFirm: result.d21_Law_Firm__c || '',
    //                     website: result.Website || '',
    //                     cityState: result.City__c || '',
    //                     email: result.Email || '',
    //                     disableInputs: true
    //                 };
    //                 this.selectedAttorney = result;
    //                 this.showAttorneyForm = true;
    //                 this.showAttorneyPicker = false;
    //                 this.showAttorneyAddButton = true;
    //                 this.showAttorneyPlusButton = false;
    //             } else {
    //                 this.newAttorney = {
    //                     id: this.selectedAttorneyId,
    //                     attorneyName: '',
    //                     phone: '',
    //                     lawFirm: '',
    //                     website: '',
    //                     cityState: '',
    //                     email: '',
    //                     disableInputs: false
    //                 };
    //                 this.selectedAttorney = null;
    //                 this.showAttorneyForm = true;
    //                 this.showAttorneyPicker = false;
    //                 this.showAttorneyAddButton = true;
    //                 this.showAttorneyPlusButton = false;
    //             }
    //         } catch (error) {
    //             console.error('Error fetching attorney:', error);
    //             this.showToast('Error', `Error fetching attorney details: ${error.body?.message || error.message}`, 'error');
    //             this.selectedAttorneyId = '';
    //             this.selectedAttorney = null;
    //             this.showAttorneyForm = false;
    //             this.showAttorneyAddButton = false;
    //             this.showAttorneyPlusButton = false;
    //         }
    //     } else {
    //         this.selectedAttorney = null;
    //         this.showAttorneyForm = false;
    //         this.showAttorneyAddButton = false;
    //         this.showAttorneyPlusButton = false;
    //         this.showToast('Info', 'No attorney selected.', 'info');
    //     }
    // }

    handleNoAttorneyData(event) {
        console.log('No attorney data:', event.detail);
        this.showToast('Info', event.detail || 'No attorneys found.', 'info');
        this.showAttorneyAddButton = false;
        this.showAttorneyPlusButton = true;
    }

    handlePlusAttorneyClick() {
        this.showAttorneyForm = true;
        this.showAttorneyPicker = false;
        this.showAttorneyAddButton = true;
        this.showAttorneyPlusButton = false;
        this.newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '', disableInputs: false };
        this.isEditingAttorney = false;
        this.selectedAttorneyId = '';
        this.selectedAttorney = null;
    }

   async handleAddNewAttorneyClick() {
    if (!this.newAttorney.attorneyName) {
        this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
        return;
    }
    try {
        this.loadSpinner = true;
        if (this.isEditingAttorney) {
            await editAttorney({
                attorneyId: this.newAttorney.id,
                attorneyName: this.newAttorney.attorneyName,
                phone: this.newAttorney.phone,
                lawFirm: this.newAttorney.lawFirm,
                website: this.newAttorney.website,
                cityState: this.newAttorney.cityState,
                email: this.newAttorney.email
            });
            this.attorneys = this.attorneys.map(attorney =>
                attorney.id === this.newAttorney.id ? { ...this.newAttorney, isEditable: true } : attorney
            );
            this.showToast('Success', 'Attorney updated successfully', 'success');
        } else {
            const result = await addAttorney({
                donorId: this.donorId,
                attorneyName: this.newAttorney.attorneyName,
                phone: this.newAttorney.phone,
                lawFirm: this.newAttorney.lawFirm,
                website: this.newAttorney.website,
                cityState: this.newAttorney.cityState,
                email: this.newAttorney.email
            });
            this.attorneys = [...this.attorneys, {
                ...this.newAttorney,
                id: result,
                isEditable: true,
                isFromPrimaryBanks: false
            }];
            this.showToast('Success', 'Attorney added successfully', 'success');
        }
        this.handleCancelAttorney();
    } catch (error) {
        console.error('Error adding/updating attorney:', error);
        this.showToast('Error', `Error adding/updating attorney: ${error.body?.message || error.message}`, 'error');
    } finally {
        this.loadSpinner = false;
    }
}

handleEditAttorney(event) {
    const index = parseInt(event.target.dataset.index, 10);
    const attorney = this.attorneys[index];
    if (!attorney) {
        this.showToast('Error', 'Invalid attorney selected for editing.', 'error');
        return;
    }
    this.isEditingAttorney = true;
    this.newAttorney = { ...attorney };
    this.showAttorneyForm = true;
}

handleDeleteAttorney(event) {
    const index = parseInt(event.target.dataset.index, 10);
    const attorney = this.attorneys[index];
    if (!attorney) {
        this.showToast('Error', 'Invalid attorney selected for deletion.', 'error');
        return;
    }
    this.deleteItemType = 'Attorney';
    this.deleteItemIndex = index;
    this.deleteItemName = attorney.attorneyName;
    this.deleteItemId = attorney.id;
    this.showDeletePopup = true;
}

handleCancelAttorney() {
    this.showAttorneyForm = false;
    this.isEditingAttorney = false;
    this.newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '' };
}

   handleAttorneyFieldChange(event) {
    const field = event.target.dataset.field;
    this.newAttorney[field] = event.target.value;
}

handleAddRecipientClick() {
    this.showRecipientForm = true;
    this.isEditingRecipient = false;
    this.newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '' };
}

   async handleAddNewRecipientClick() {
    if (!this.newRecipient.lastName) {
        this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
        return;
    }
    try {
        this.loadSpinner = true;
        if (this.isEditingRecipient) {
            await editRecipient({
                recipientId: this.newRecipient.id,
                firstName: this.newRecipient.firstName,
                lastName: this.newRecipient.lastName,
                phone: this.newRecipient.phone,
                email: this.newRecipient.email,
                additionalInfo: this.newRecipient.additionalInfo
            });
            this.recipients = this.recipients.map(recipient =>
                recipient.id === this.newRecipient.id ? {
                    ...this.newRecipient,
                    Name: `${this.newRecipient.firstName} ${this.newRecipient.lastName}`.trim(),
                    isEditable: true
                } : recipient
            );
            this.showToast('Success', 'Recipient updated successfully', 'success');
        } else {
            const result = await addRecipient({
                donorId: this.donorId,
                firstName: this.newRecipient.firstName,
                lastName: this.newRecipient.lastName,
                phone: this.newRecipient.phone,
                email: this.newRecipient.email,
                additionalInfo: this.newRecipient.additionalInfo
            });
            this.recipients = [...this.recipients, {
                ...this.newRecipient,
                id: result,
                Name: `${this.newRecipient.firstName} ${this.newRecipient.lastName}`.trim(),
                isEditable: true,
                isFromPrimaryBanks: false
            }];
            this.showToast('Success', 'Recipient added successfully', 'success');
        }
        this.handleCancelRecipient();
    } catch (error) {
        console.error('Error adding/updating recipient:', error);
        this.showToast('Error', `Error adding/updating recipient: ${error.body?.message || error.message}`, 'error');
    } finally {
        this.loadSpinner = false;
    }
}

    handleNoRecipientData(event) {
        console.log('No recipient data:', event.detail);
        this.showToast('Info', event.detail || 'No recipients found.', 'info');
        this.showRecipientAddButton = false;
        this.showRecipientPlusButton = true;
    }

    handlePlusRecipientClick() {
        this.showRecipientForm = true;
        this.showRecipientPicker = false;
        this.showRecipientAddButton = true;
        this.showRecipientPlusButton = false;
        this.newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '', disableInputs: false };
        this.isEditingRecipient = false;
        this.selectedRecipientId = '';
        this.selectedRecipient = null;
    }

    async handleAddNewRecipientClick() {
        if (!this.newRecipient.lastName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            if (this.isEditingRecipient) {
                await editRecipient({
                    recipientId: this.newRecipient.id,
                    firstName: this.newRecipient.firstName,
                    lastName: this.newRecipient.lastName,
                    phone: this.newRecipient.phone,
                    email: this.newRecipient.email,
                    additionalInfo: this.newRecipient.additionalInfo
                });
                this.recipients = this.recipients.map(recipient =>
                    recipient.id === this.newRecipient.id ? {
                        ...this.newRecipient,
                        Name: `${this.newRecipient.firstName} ${this.newRecipient.lastName}`.trim(),
                        isEditable: true
                    } : recipient
                );
                this.showToast('Success', 'Recipient updated successfully', 'success');
                this.handleCancelRecipient();
            } else if (this.selectedRecipient) {
                await addlookupRecipient({ donorId: this.donorId, recipientId: this.selectedRecipientId });
                this.recipients = [...this.recipients, {
                    id: this.selectedRecipientId,
                    firstName: this.newRecipient.firstName || '',
                    lastName: this.newRecipient.lastName || '',
                    Name: `${this.newRecipient.firstName} ${this.newRecipient.lastName}`.trim(),
                    phone: this.newRecipient.phone || '',
                    email: this.newRecipient.email || '',
                    additionalInfo: this.newRecipient.additionalInfo || '',
                    isEditable: false,
                    isFromPrimaryBanks: this.newRecipient.disableInputs
                }];
                this.showToast('Success', 'Recipient added successfully', 'success');
                this.handleCancelRecipient();
            } else {
                const result = await addRecipient({
                    donorId: this.donorId,
                    firstName: this.newRecipient.firstName,
                    lastName: this.newRecipient.lastName,
                    phone: this.newRecipient.phone,
                    email: this.newRecipient.email,
                    additionalInfo: this.newRecipient.additionalInfo
                });
                this.recipients = [...this.recipients, {
                    ...this.newRecipient,
                    id: result,
                    Name: `${this.newRecipient.firstName} ${this.newRecipient.lastName}`.trim(),
                    isEditable: true,
                    isFromPrimaryBanks: false
                }];
                this.showToast('Success', 'Recipient added successfully', 'success');
                this.handleCancelRecipient();
            }
        } catch (error) {
            console.error('Error adding/updating recipient:', error);
            this.showToast('Error', `Error adding/updating recipient: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

handleEditRecipient(event) {
    const index = parseInt(event.target.dataset.index, 10);
    const recipient = this.recipients[index];
    if (!recipient) {
        this.showToast('Error', 'Invalid recipient selected for editing.', 'error');
        return;
    }
    this.isEditingRecipient = true;
    this.newRecipient = { ...recipient };
    this.showRecipientForm = true;
}

handleDeleteRecipient(event) {
    const index = parseInt(event.target.dataset.index, 10);
    const recipient = this.recipients[index];
    if (!recipient) {
        this.showToast('Error', 'Invalid recipient selected for deletion.', 'error');
        return;
    }
    this.deleteItemType = 'Recipient';
    this.deleteItemIndex = index;
    this.deleteItemName = recipient.Name;
    this.deleteItemId = recipient.id;
    this.showDeletePopup = true;
}

handleCancelRecipient() {
    this.showRecipientForm = false;
    this.isEditingRecipient = false;
    this.newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '' };
}

   handleRecipientFieldChange(event) {
    const field = event.target.dataset.field;
    this.newRecipient[field] = event.target.value;
}

    handleConfirmationChange(event) {
        this.isConfirmed = event.target.checked;
    }

    async handleDonorHippaNext() {
        if (!this.isConfirmed) {
            this.showToast('Error', 'Please confirm that the information is accurate.', 'error');
            return;
        }
        if (!this.legalName.firstName || !this.legalName.lastName || !this.dob || !this.address.state || !this.address.city) {
            this.showToast('Error', 'Please fill in all required fields.', 'error');
            return;
        }
        if (this.dobError) {
            this.showToast('Error', this.dobError, 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            await updateDonorName({
                donorId: this.donorId,
                firstName: this.legalName.firstName,
                lastName: this.legalName.lastName,
                dob: this.dob,
                state: this.address.state,
                city: this.address.city,
                street: this.address.street,
                pincode: this.address.pincode,
                additionalInfo: this.address.additionalInfo
            });
            this.showToast('Success', 'Donor information updated successfully', 'success');
            const nextEvent = new CustomEvent('next', { detail: { step: 'hippa', legalName: this.legalName, dob: this.dob, address: this.address } });
            this.dispatchEvent(nextEvent);
        } catch (error) {
            console.error('Error updating donor information:', error);
            this.showToast('Error', `Error updating donor information: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleDonorHippaBack() {
        const backEvent = new CustomEvent('back', { detail: { step: 'hippa' } });
        this.dispatchEvent(backEvent);
    }

    validateDob(dob) {
        if (!dob) return false;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(evt);
    }
}