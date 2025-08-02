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
import addlookupClinic from '@salesforce/apex/DonorPreRegHippaController2222.addlookupSpermBank';
import addlookupAttorney from '@salesforce/apex/DonorPreRegHippaController2222.addlookupSpermBank';
import addlookupRecipient from '@salesforce/apex/DonorPreRegHippaController2222.addlookupSpermBank';
import addlookupAgency from '@salesforce/apex/DonorPreRegHippaController2222.addlookupSpermBank';
import fetchContactRecord from '@salesforce/apex/UtilityClass.fetchSpermBankRecord';

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
    @track newAgency = { id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
    @track newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '', disableInputs: false };
    @track newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
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
    @track noAttorneyChecked = false;
    @track noRecipientChecked = false;
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
    @track selectedAttorneyId = '';
    @track selectedAttorney = null;
    @track showRecipientAddButton = false;
    @track showRecipientPlusButton = false;
    @track selectedRecipientId = '';
    @track selectedRecipient = null;
    @track showAgencyAddButton = false;
    @track showAgencyPlusButton = false;
    @track selectedAgencyId = '';
    @track selectedAgency = null;

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

    get addAttorneyClass() {
        return this.noAttorneyChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    }

    get addRecipientClass() {
        return this.noRecipientChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    }

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

   /* connectedCallback() {
        this.donorId = '003QL00000xXfiNYAS';
        this.showagencySection = true;
        this.showSpermBankSection = true;
        this.showclinicSection = true;
        this.showattorneySection = false;
        this.showrecipientSection = true;
        spermDonor({ donorId: this.donorId })
            .then(result => {
                if (result.parentdetails) {
                    this.legalNamesri.firstName = result.parentdetails.fristName || '';
                    this.legalNamesri.lastName = result.parentdetails.lastName || '';
                    this.dob = result.parentdetails.dob || '';
                    this.address.state = result.parentdetails.state || '';
                    this.address.city = result.parentdetails.city || '';
                    this.address.street = result.parentdetails.street || '';
                    this.address.pincode = result.parentdetails.pincode || '';
                    this.address.additionalInfo = result.parentdetails.additionalInfo || '';
                }
                if (result.spermlist) {
                    this.sperms = result.spermlist.map(item => ({
                        id: item.Id,
                        spermBankName: item.Name,
                        spermBankPhone: item.Phone || '',
                        coordinatorName: item.coordinatorName || '',
                        spermBankWebsite: item.website || '',
                        spermBankEmail: item.email || '',
                        pmcNumber: item.pmcNumber || '',
                        isEditable: item.isEditable && !item.pmcNumber
                    }));
                }
                if (result.Agencylist) {
                    this.agencies = result.Agencylist.map(item => ({
                        id: item.Id,
                        agencyName: item.Name,
                        phone: item.Phone || '',
                        coordinatorName: item.coordinatorName || '',
                        website: item.website || '',
                        cityState: item.cityState || '',
                        coordinatorEmail: item.email || '',
                        pmcNumber: item.pmcNumber || '',
                        isEditable: item.isEditable || false
                    }));
                }
                if (result.Cliniclist) {
                    this.clinics = result.Cliniclist.map(item => ({
                        id: item.Id,
                        clinicName: item.Name,
                        phone: item.Phone || '',
                        coordinatorName: item.coordinatorName || '',
                        website: item.website || '',
                        cityState: item.cityState || '',
                        coordinatorEmail: item.email || '',
                        pmcNumber: item.pmcNumber || '',
                        isEditable: item.isEditable || false
                    }));
                }
                if (result.Attorneylist) {
                    this.attorneys = result.Attorneylist.map(item => ({
                        id: item.Id,
                        attorneyName: item.Name,
                        phone: item.Phone || '',
                        lawFirm: item.coordinatorName || '',
                        website: item.website || '',
                        cityState: item.cityState || '',
                        email: item.email || '',
                        isEditable: item.isEditable || false
                    }));
                }
                if (result.Recipientlist) {
                    this.recipients = result.Recipientlist.map(item => ({
                        id: item.Id,
                        firstName: item.fristName,
                        lastName: item.lastName,
                        Name: (item.fristName || '') + ' ' + (item.lastName || ''),
                        phone: item.Phone || '',
                        email: item.email || '',
                        additionalInfo: item.additionalInfo || ''
                    }));
                }
            })
            .catch(error => {
                this.showToast('Error', 'Failed to load donor data: ' + error.body.message, 'error');
            });
    }*/

     connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj || {}));
        this.donorId = this.contactObj.donorId || '003QL00000xXfiNYAS';
        if (this.contactObj.donorType === 'egg') {
            this.showagencySection = true;
            this.showclinicSection = true;
            this.showSpermBankSection = false;
            this.showattorneySection = true;
            this.showrecipientSection = true;
        } else {
            this.showagencySection = false;
            this.showSpermBankSection = true;
            this.showclinicSection = true;
            this.showattorneySection = false;
            this.showrecipientSection = true;
        }

        this.legalNamesri.firstName = this.contactObj.firstName || '';
        this.legalNamesri.lastName = this.contactObj.lastName || '';
        this.legalName.firstName = this.contactObj.firstName || '';
        this.legalName.lastName = this.contactObj.lastName || '';
        this.dob = this.contactObj.dob || '';
        this.address.state = this.contactObj.state || '';
        this.address.city = this.contactObj.city || '';
        this.address.street = this.contactObj.street || '';
        this.address.pincode = this.contactObj.pincode || '';
        this.address.additionalInfo = this.contactObj.additionalInfo || '';

        spermDonor({ donorId: this.donorId })
            .then(result => {
                console.log('spermDonor result:', JSON.stringify(result));
                if (result.parentdetails) {
                    this.legalNamesri.firstName = result.parentdetails.fristName || this.legalNamesri.firstName;
                    this.legalNamesri.lastName = result.parentdetails.lastName || this.legalNamesri.lastName;
                    this.legalName.firstName = result.parentdetails.fristName || this.legalName.firstName;
                    this.legalName.lastName = result.parentdetails.lastName || this.legalName.lastName;
                    this.dob = result.parentdetails.dob || this.dob;
                    this.address.state = result.parentdetails.state || this.address.state;
                    this.address.city = result.parentdetails.city || this.address.city;
                    this.address.street = result.parentdetails.street || this.address.street;
                    this.address.pincode = result.parentdetails.pincode || this.address.pincode;
                    this.address.additionalInfo = result.parentdetails.additionalInfo || this.address.additionalInfo;
                }
                if (result.Agencylist) {
                    this.agencies = result.Agencylist.map(item => ({
                        id: item.Id,
                        agencyName: item.Name,
                        phone: item.Phone || '',
                        coordinatorName: item.coordinatorName || '',
                        website: item.website || '',
                        cityState: item.cityState || '',
                        coordinatorEmail: item.email || '',
                        pmcNumber: item.pmcNumber || '',
                        isEditable: item.isEditable !== false,
                        isFromPrimaryBanks: item.isEditable === false
                    }));
                }
                if (result.spermlist) {
                    this.sperms = result.spermlist.map(item => ({
                        id: item.Id,
                        spermBankName: item.Name,
                        spermBankPhone: item.Phone || '',
                        coordinatorName: item.coordinatorName || '',
                        spermBankWebsite: item.website || '',
                        spermBankEmail: item.email || '',
                        pmcNumber: item.pmcNumber || '',
                        isEditable: item.isEditable !== false,
                        isFromPrimaryBanks: item.isEditable === false
                    }));
                }
                if (result.Cliniclist) {
                    this.clinics = result.Cliniclist.map(item => ({
                        id: item.Id,
                        clinicName: item.Name,
                        phone: item.Phone || '',
                        coordinatorName: item.coordinatorName || '',
                        website: item.website || '',
                        cityState: item.cityState || '',
                        coordinatorEmail: item.email || '',
                        pmcNumber: item.pmcNumber || '',
                        isEditable: item.isEditable !== false,
                        isFromPrimaryBanks: item.isEditable === false
                    }));
                }
                if (result.Attorneylist) {
                    this.attorneys = result.Attorneylist.map(item => ({
                        id: item.Id,
                        attorneyName: item.Name,
                        phone: item.Phone || '',
                        lawFirm: item.lawFirm || item.coordinatorName || '',
                        website: item.website || '',
                        cityState: item.cityState || '',
                        email: item.email || '',
                        isEditable: item.isEditable !== false,
                        isFromPrimaryBanks: item.isEditable === false
                    }));
                }
                if (result.Recipientlist) {
                    this.recipients = result.Recipientlist.map(item => ({
                        id: item.Id,
                        firstName: item.firstName || '',
                        lastName: item.lastName || '',
                        Name: (item.firstName || '') + ' ' + (item.lastName || ''),
                        phone: item.Phone || '',
                        email: item.email || '',
                        additionalInfo: item.additionalInfo || '',
                        isEditable: item.isEditable !== false,
                        isFromPrimaryBanks: item.isEditable === false
                    }));
                }
            })
            .catch(error => {
                console.error('Error loading donor data:', error);
                this.showToast('Error', 'Failed to load donor data: ' + (error.body?.message || error.message), 'error');
            });
    }

    handleAddAgencyClick() {
        this.showAgencyPicker = true;
        this.showAgencyForm = true;
        this.isEditingAgency = false;
        this.newAgency = { id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
        this.selectedAgencyId = '';
        this.selectedAgency = null;
        this.showAgencyAddButton = false;
        this.showAgencyPlusButton = false;
    }

    async handleAgencySelect(event) {
        console.log(JSON.stringify(event.detail));
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
                        disableInputs: true
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
                        disableInputs: false
                    };
                    this.selectedAgency = null;
                    this.showAgencyForm = true;
                    this.showAgencyPicker = false;
                    this.showAgencyAddButton = true;
                    this.showAgencyPlusButton = false;
                }
            } catch (error) {
                console.log('Error fetching agency:', error.stack);
                this.showToast('Error', 'Error fetching agency details: ' + (error.body?.message || error.message), 'error');
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
        console.log('No agency data event received:', event.detail);
        this.showToast('Info', event.detail || 'No agencies found.', 'info');
        this.showAgencyAddButton = false;
        this.showAgencyPlusButton = true;
    }

    handlePlusAgencyClick() {
        this.showAgencyForm = true;
        this.showAgencyPicker = false;
        this.showAgencyAddButton = true;
        this.showAgencyPlusButton = false;
        this.newAgency = { id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
        this.isEditingAgency = false;
        this.selectedAgencyId = '';
        this.selectedAgency = null;
    }

    handleAddNewAgencyClick() {
        if (!this.newAgency.agencyName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        if (this.selectedAgency) {
            addlookupAgency({ donorId: this.donorId, agencyId: this.selectedAgencyId })
                .then(() => {
                    this.agencies = [...this.agencies, {
                        id: this.selectedAgencyId,
                        agencyName: this.newAgency.agencyName,
                        phone: this.newAgency.phone || '',
                        coordinatorName: this.newAgency.coordinatorName || '',
                        website: this.newAgency.website || '',
                        cityState: this.newAgency.cityState || '',
                        coordinatorEmail: this.newAgency.coordinatorEmail || '',
                        isEditable: true
                    }];
                    this.showToast('Success', 'Agency added successfully', 'success');
                    this.selectedAgencyId = '';
                    this.selectedAgency = null;
                    this.showAgencyForm = false;
                    this.showAgencyAddButton = false;
                    this.showAgencyPlusButton = false;
                    this.newAgency = { id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
                })
                .catch(error => {
                    console.log('Error adding agency:', error);
                    this.showToast('Error', 'Error adding agency: ' + (error.body?.message || error.message), 'error');
                });
        } else {
            addAgency({
                donorId: this.donorId,
                agencyName: this.newAgency.agencyName,
                phone: this.newAgency.phone,
                coordinatorName: this.newAgency.coordinatorName,
                website: this.newAgency.website,
                cityState: this.newAgency.cityState,
                email: this.newAgency.coordinatorEmail
            })
                .then(result => {
                    this.agencies = [...this.agencies, { ...this.newAgency, id: result, isEditable: true }];
                    this.showToast('Success', 'Agency added successfully', 'success');
                    this.handleCancelAgency();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding agency: ' + error.body.message, 'error');
                });
        }
    }

    handleEditAgency(event) {
        const index = event.target.dataset.index;
        this.isEditingAgency = true;
        this.newAgency = { ...this.agencies[index] };
        this.showAgencyForm = true;
        this.showAgencyPicker = false;
        this.showAgencyAddButton = true;
        this.showAgencyPlusButton = false;
    }

    handleDeleteAgency(event) {
        const index = event.target.dataset.index;
        this.showDeletePopup = true;
        this.deleteItemType = 'Agency';
        this.deleteItemIndex = index;
        this.deleteItemName = this.agencies[index].agencyName;
        this.deleteItemId = this.agencies[index].id;
    }

    handleAgencyFieldChange(event) {
        const field = event.target.dataset.field;
        this.newAgency = { ...this.newAgency, [field]: event.target.value };
    }

    handleCancelAgency() {
        this.showAgencyForm = false;
        this.showAgencyPicker = false;
        this.newAgency = { id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
        this.isEditingAgency = false;
        this.selectedAgencyId = '';
        this.selectedAgency = null;
        this.showAgencyAddButton = false;
        this.showAgencyPlusButton = false;
    }

    handleSaveAgency() {
        if (!this.newAgency.agencyName) {
            this.showToast('Error', 'Agency Name is required', 'error');
            return;
        }
        if (this.isEditingAgency) {
            editAgency({
                accountId: this.newAgency.id,
                agencyName: this.newAgency.agencyName,
                phone: this.newAgency.phone,
                coordinatorName: this.newAgency.coordinatorName,
                website: this.newAgency.website,
                cityState: this.newAgency.cityState,
                email: this.newAgency.coordinatorEmail
            })
                .then(() => {
                    const updatedAgencies = [...this.agencies];
                    updatedAgencies[this.agencies.findIndex(a => a.id === this.newAgency.id)] = { ...this.newAgency };
                    this.agencies = updatedAgencies;
                    this.showToast('Success', 'Agency updated successfully', 'success');
                    this.handleCancelAgency();
                })
                .catch(error => {
                    this.showToast('Error', 'Error updating agency: ' + error.body.message, 'error');
                });
        } else {
            addAgency({
                donorId: this.donorId,
                agencyName: this.newAgency.agencyName,
                phone: this.newAgency.phone,
                coordinatorName: this.newAgency.coordinatorName,
                website: this.newAgency.website,
                cityState: this.newAgency.cityState,
                email: this.newAgency.coordinatorEmail
            })
                .then(result => {
                    this.agencies = [...this.agencies, { ...this.newAgency, id: result, isEditable: true }];
                    this.showToast('Success', 'Agency added successfully', 'success');
                    this.handleCancelAgency();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding agency: ' + error.body.message, 'error');
                });
        }
    }

    handlePlusIconClick() {
        this.showSpermForm = true;
        this.showSpermPicker = false;
        this.showAddButton = true;
        this.showPlusButton = false;
        this.newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '', disableInputs: false };
        this.isEditingSperm = false;
        this.selectedSpermBankId = '';
        this.searchKey = '';
        this.selectedSpermBank = null;
    }

    handleSpermBankChange(event) {
        this.nameConfirmation = event.target.value;
        this.isYesChecked = this.nameConfirmation === 'Yes';
        this.isNoChecked = this.nameConfirmation === 'No';
        this.isDisabled = this.isYesChecked;
        if (this.isYesChecked) {
            this.legalName = { firstName: this.legalNamesri.firstName, lastName: this.legalNamesri.lastName };
        }
    }

    handleLegalNameChange(event) {
        const field = event.target.name;
        this.legalName = { ...this.legalName, [field]: event.target.value };
        updateDonorName({
            donorId: this.donorId,
            firstName: this.legalName.firstName,
            lastName: this.legalName.lastName,
            dob: this.dob,
            state: this.address.state,
            city: this.address.city,
            street: this.address.street,
            pincode: this.address.pincode,
            additionalInfo: this.address.additionalInfo
        })
            .then(() => {
                this.legalNamesri = { ...this.legalName };
                this.showToast('Success', 'Donor name updated successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'Error updating donor name: ' + error.body.message, 'error');
            });
    }

    handleAddressChange(event) {
        const field = event.target.dataset.field;
        this.address = { ...this.address, [field]: event.target.value };
    }

    handleDobChange(event) {
        const dobValue = event.target.value;
        const today = new Date('2025-08-02T13:59:00+05:30');
        const inputDate = new Date(dobValue);
        const ageDiff = today.getFullYear() - inputDate.getFullYear();
        const monthDiff = today.getMonth() - inputDate.getMonth();
        const dayDiff = today.getDate() - inputDate.getDate();
        const isAdult = ageDiff > 18 || (ageDiff === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));
        if (inputDate > today) {
            this.dobError = 'Date of Birth cannot be in the future.';
            this.dob = '';
        } else if (!isAdult) {
            this.dobError = 'Donor must be at least 18 years old.';
            this.dob = '';
        } else {
            this.dobError = '';
            this.dob = dobValue;
            updateDonorName({
                donorId: this.donorId,
                firstName: this.legalNamesri.firstName,
                lastName: this.legalNamesri.lastName,
                dob: this.dob,
                state: this.address.state,
                city: this.address.city,
                street: this.address.street,
                pincode: this.address.pincode,
                additionalInfo: this.address.additionalInfo
            })
                .then(() => {
                    this.showToast('Success', 'Date of Birth updated successfully', 'success');
                })
                .catch(error => {
                    this.showToast('Error', 'Error updating Date of Birth: ' + error.body.message, 'error');
                });
        }
    }

    handleNoAgencyChange(event) {
        this.noAgencyChecked = event.target.checked;
        if (this.noAgencyChecked) {
            this.agencies = [];
            this.newAgency = { id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
            this.showagencySection = false;
        } else {
            this.showagencySection = true;
        }
    }

    handleNoSpermChange(event) {
        this.noSpermChecked = event.target.checked;
        if (this.noSpermChecked) {
            this.sperms = [];
            this.newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '', disableInputs: false };
            this.showSpermBankSection = false;
        } else {
            this.showSpermBankSection = true;
        }
    }

    handleNoClinicChange(event) {
        this.noClinicChecked = event.target.checked;
        if (this.noClinicChecked) {
            this.clinics = [];
            this.newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
            this.showclinicSection = false;
        } else {
            this.showclinicSection = true;
        }
    }

    handleNoAttorneyChange(event) {
        this.noAttorneyChecked = event.target.checked;
        if (this.noAttorneyChecked) {
            this.attorneys = [];
            this.newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '', disableInputs: false };
            this.showattorneySection = false;
        } else {
            this.showattorneySection = true;
        }
    }

    handleNoRecipientChange(event) {
        this.noRecipientChecked = event.target.checked;
        if (this.noRecipientChecked) {
            this.recipients = [];
            this.newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '', disableInputs: false };
            this.showrecipientSection = false;
        } else {
            this.showrecipientSection = true;
        }
    }

    handleAddSpermClick() {
        this.showSpermPicker = true;
        this.showSpermForm = true;
        this.isEditingSperm = false;
        this.newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '', disableInputs: false };
        this.selectedSpermBankId = '';
        this.searchKey = '';
        this.selectedSpermBank = null;
        this.showAddButton = false;
        this.showPlusButton = false;
    }

    async handleSpermBankSelect(event) {
        console.log(JSON.stringify(event.detail));
        this.selectedSpermBankId = event.detail.id || '';
        this.searchKey = event.detail.Name || '';
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
                        disableInputs: true
                    };
                    this.selectedSpermBank = result;
                    this.showSpermForm = true;
                    this.showSpermPicker = false;
                    this.showAddButton = true;
                    this.showPlusButton = false;
                    this.isEditingSperm = false;
                } else {
                    this.newSperm = {
                        id: this.selectedSpermBankId,
                        spermBankName: this.searchKey || '',
                        spermBankPhone: '',
                        coordinatorName: '',
                        spermBankWebsite: '',
                        spermBankEmail: '',
                        disableInputs: false
                    };
                    this.selectedSpermBank = null;
                    this.showSpermForm = true;
                    this.showSpermPicker = false;
                    this.showAddButton = true;
                    this.showPlusButton = false;
                    this.isEditingSperm = false;
                }
            } catch (error) {
                console.log('Error fetching sperm bank:', error.stack);
                this.showToast('Error', 'Error fetching sperm bank details: ' + (error.body?.message || error.message), 'error');
                this.selectedSpermBankId = '';
                this.searchKey = '';
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
        console.log('No data event received:', event.detail);
        this.showToast('Info', event.detail || 'No sperm banks found.', 'info');
        this.showAddButton = false;
        this.showPlusButton = true;
    }

    handleAddNewSpermBankClick() {
        if (!this.newSperm.spermBankName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        if (this.selectedSpermBank) {
            addlookupSpermBank({ donorId: this.donorId, spermBankId: this.selectedSpermBankId })
                .then(() => {
                    this.sperms = [...this.sperms, {
                        id: this.selectedSpermBankId,
                        spermBankName: this.newSperm.spermBankName,
                        spermBankPhone: this.newSperm.spermBankPhone || '',
                        coordinatorName: this.newSperm.coordinatorName || '',
                        spermBankWebsite: this.newSperm.spermBankWebsite || '',
                        spermBankEmail: this.newSperm.spermBankEmail || '',
                        isEditable: false
                    }];
                    this.showToast('Success', 'Sperm Bank added successfully', 'success');
                    this.selectedSpermBankId = '';
                    this.selectedSpermBank = null;
                    this.searchKey = '';
                    this.showSpermForm = false;
                    this.showAddButton = false;
                    this.showPlusButton = false;
                    this.newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '', disableInputs: false };
                })
                .catch(error => {
                    console.log('Error adding sperm bank:', error);
                    this.showToast('Error', 'Error adding sperm bank: ' + (error.body?.message || error.message), 'error');
                });
        } else {
            addSpermBank({
                donorId: this.donorId,
                spermBankName: this.newSperm.spermBankName,
                phone: this.newSperm.spermBankPhone || '',
                coordinatorName: this.newSperm.coordinatorName || '',
                website: this.newSperm.spermBankWebsite || '',
                email: this.newSperm.spermBankEmail || '',
                accountId: this.newSperm.id || '',
                isEditable: true
            })
                .then(resultId => {
                    this.sperms = [...this.sperms, {
                        id: resultId,
                        spermBankName: this.newSperm.spermBankName,
                        spermBankPhone: this.newSperm.spermBankPhone || '',
                        coordinatorName: this.newSperm.coordinatorName || '',
                        spermBankWebsite: this.newSperm.spermBankWebsite || '',
                        spermBankEmail: this.newSperm.spermBankEmail || '',
                        isEditable: true
                    }];
                    this.showToast('Success', 'Sperm Bank added successfully', 'success');
                    this.selectedSpermBankId = '';
                    this.selectedSpermBank = null;
                    this.searchKey = '';
                    this.showSpermForm = false;
                    this.showAddButton = false;
                    this.showPlusButton = false;
                    this.newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '', disableInputs: false };
                })
                .catch(error => {
                    console.log('Error adding sperm bank:', error);
                    this.showToast('Error', 'Error adding sperm bank: ' + (error.body?.message || error.message), 'error');
                });
        }
    }

    handleEditSperm(event) {
        const index = event.target.dataset.index;
        const sperm = this.sperms[index];
        if (!sperm.isEditable) {
            this.showToast('Error', 'This sperm bank cannot be edited.', 'error');
            return;
        }
        this.isEditingSperm = true;
        this.newSperm = { ...sperm };
        this.showSpermForm = true;
        this.showSpermPicker = false;
        this.showAddButton = true;
        this.showPlusButton = false;
    }

    handleDeleteSperm(event) {
        const index = event.target.dataset.index;
        this.showDeletePopup = true;
        this.deleteItemType = 'Sperm';
        this.deleteItemIndex = index;
        this.deleteItemName = this.sperms[index].spermBankName;
        this.deleteItemId = this.sperms[index].id;
    }

    handleSpermFieldChange(event) {
        const field = event.target.dataset.field;
        this.newSperm = { ...this.newSperm, [field]: event.target.value };
    }

    handleCancelSperm() {
        this.showSpermForm = false;
        this.showSpermPicker = false;
        this.newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '', disableInputs: false };
        this.isEditingSperm = false;
        this.selectedSpermBankId = '';
        this.searchKey = '';
        this.selectedSpermBank = null;
        this.showAddButton = false;
        this.showPlusButton = false;
    }

    handleSaveSperm() {
        if (!this.newSperm.spermBankName) {
            this.showToast('Error', 'Sperm Bank Name is required', 'error');
            return;
        }
        if (this.isEditingSperm) {
            editSpermBank({
                accountId: this.newSperm.id,
                spermBankName: this.newSperm.spermBankName,
                phone: this.newSperm.spermBankPhone,
                coordinatorName: this.newSperm.coordinatorName,
                website: this.newSperm.spermBankWebsite,
                email: this.newSperm.spermBankEmail
            })
                .then(() => {
                    const updatedSperms = [...this.sperms];
                    updatedSperms[this.sperms.findIndex(s => s.id === this.newSperm.id)] = {
                        ...this.newSperm,
                        isEditable: true
                    };
                    this.sperms = updatedSperms;
                    this.showToast('Success', 'Sperm Bank updated successfully', 'success');
                    this.handleCancelSperm();
                })
                .catch(error => {
                    this.showToast('Error', 'Error updating sperm bank: ' + error.body.message, 'error');
                });
        } else {
            addSpermBank({
                donorId: this.donorId,
                spermBankName: this.newSperm.spermBankName,
                phone: this.newSperm.spermBankPhone,
                coordinatorName: this.newSperm.coordinatorName,
                website: this.newSperm.spermBankWebsite,
                email: this.newSperm.spermBankEmail,
                accountId: this.newSperm.id || ''
            })
                .then(result => {
                    this.sperms = [...this.sperms, {
                        ...this.newSperm,
                        id: result,
                        pmcNumber: '',
                        isEditable: true
                    }];
                    this.showToast('Success', 'Sperm Bank added successfully', 'success');
                    this.handleCancelSperm();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding sperm bank: ' + error.body.message, 'error');
                });
        }
    }

    handleAddClinicClick() {
        this.showClinicPicker = true;
        this.showClinicForm = true ;
        this.isEditingClinic = false;
        this.newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
        this.selectedClinicId = '';
        this.selectedClinic = null;
        this.showClinicAddButton = false;
        this.showClinicPlusButton = false;
    }

    async handleClinicSelect(event) {
        console.log(JSON.stringify(event.detail));
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
                        disableInputs: true
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
                        disableInputs: false
                    };
                    this.selectedClinic = null;
                    this.showClinicForm = true;
                    this.showClinicPicker = false;
                    this.showClinicAddButton = true;
                    this.showClinicPlusButton = false;
                }
            } catch (error) {
                console.log('Error fetching clinic:', error.stack);
                this.showToast('Error', 'Error fetching clinic details: ' + (error.body?.message || error.message), 'error');
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
        console.log('No clinic data event received:', event.detail);
        this.showToast('Info', event.detail || 'No clinics found.', 'info');
        this.showClinicAddButton = false;
        this.showClinicPlusButton = true;
    }

    handlePlusClinicClick() {
        this.showClinicForm = true;
        this.showClinicPicker = false;
        this.showClinicAddButton = true;
        this.showClinicPlusButton = false;
        this.newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
        this.isEditingClinic = false;
        this.selectedClinicId = '';
        this.selectedClinic = null;
    }

    handleAddNewClinicClick() {
        if (!this.newClinic.clinicName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        if (this.selectedClinic) {
            addlookupClinic({ donorId: this.donorId, spermBankId: this.selectedClinicId })
                .then(() => {
                    this.clinics = [...this.clinics, {
                        id: this.selectedClinicId,
                        clinicName: this.newClinic.clinicName,
                        phone: this.newClinic.phone || '',
                        coordinatorName: this.newClinic.coordinatorName || '',
                        website: this.newClinic.website || '',
                        cityState: this.newClinic.cityState || '',
                        coordinatorEmail: this.newClinic.coordinatorEmail || ''
                    }];
                    this.showToast('Success', 'Clinic added successfully', 'success');
                    this.selectedClinicId = '';
                    this.selectedClinic = null;
                    this.showClinicForm = false;
                    this.showClinicAddButton = false;
                    this.showClinicPlusButton = false;
                    this.newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
                })
                .catch(error => {
                    console.log('Error adding clinic:', error);
                    this.showToast('Error', 'Error adding clinic: ' + (error.body?.message || error.message), 'error');
                });
        } else {
            addClinic({
                donorId: this.donorId,
                clinicName: this.newClinic.clinicName,
                phone: this.newClinic.phone,
                coordinatorName: this.newClinic.coordinatorName,
                website: this.newClinic.website,
                cityState: this.newClinic.cityState,
                email: this.newClinic.coordinatorEmail
            })
                .then(result => {
                    this.clinics = [...this.clinics, { ...this.newClinic, id: result, isEditable: true }];
                    this.showToast('Success', 'Clinic added successfully', 'success');
                    this.handleCancelClinic();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding clinic: ' + error.body.message, 'error');
                });
        }
    }

    handleEditClinic(event) {
        const index = event.target.dataset.index;
        this.isEditingClinic = true;
        this.newClinic = { ...this.clinics[index] };
        this.showClinicForm = true;
        this.showClinicPicker = false;
        this.showClinicAddButton = true;
        this.showClinicPlusButton = false;
    }

    handleDeleteClinic(event) {
        const index = event.target.dataset.index;
        this.showDeletePopup = true;
        this.deleteItemType = 'Clinic';
        this.deleteItemIndex = index;
        this.deleteItemName = this.clinics[index].clinicName;
        this.deleteItemId = this.clinics[index].id;
    }

    handleClinicFieldChange(event) {
        const field = event.target.dataset.field;
        this.newClinic = { ...this.newClinic, [field]: event.target.value };
    }

    handleCancelClinic() {
        this.showClinicForm = false;
        this.showClinicPicker = false;
        this.newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
        this.isEditingClinic = false;
        this.selectedClinicId = '';
        this.selectedClinic = null;
        this.showClinicAddButton = false;
        this.showClinicPlusButton = false;
    }

    handleAddAttorneyClick() {
        this.showAttorneyPicker = true;
        this.showAttorneyForm = true;
        this.isEditingAttorney = false;
        this.newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '', disableInputs: false };
        this.selectedAttorneyId = '';
        this.selectedAttorney = null;
        this.showAttorneyAddButton = false;
        this.showAttorneyPlusButton = false;
    }

    async handleAttorneySelect(event) {
        console.log(JSON.stringify(event.detail));
        this.selectedAttorneyId = event.detail.id || '';
        if (this.selectedAttorneyId) {
            try {
                const result = await fetchContactRecord({ accountId: this.selectedAttorneyId });
                console.log('Selected attorney details:', JSON.stringify(result));
                if (result) {
                    this.newAttorney = {
                        id: result.Id,
                        attorneyName: result.Name || '',
                        phone: result.Phone || '',
                        lawFirm: result.d21_Coordinator_Name__c || '',
                        website: result.Website || '',
                        cityState: result.City__c || '',
                        email: result.d21_Email__c || '',
                        disableInputs: true
                    };
                    this.selectedAttorney = result;
                    this.showAttorneyForm = true;
                    this.showAttorneyPicker = false;
                    this.showAttorneyAddButton = true;
                    this.showAttorneyPlusButton = false;
                } else {
                    this.newAttorney = {
                        id: this.selectedAttorneyId,
                        attorneyName: '',
                        phone: '',
                        lawFirm: '',
                        website: '',
                        cityState: '',
                        email: '',
                        disableInputs: false
                    };
                    this.selectedAttorney = null;
                    this.showAttorneyForm = true;
                    this.showAttorneyPicker = false;
                    this.showAttorneyAddButton = true;
                    this.showAttorneyPlusButton = false;
                }
            } catch (error) {
                console.log('Error fetching attorney:', error.stack);
                this.showToast('Error', 'Error fetching attorney details: ' + (error.body?.message || error.message), 'error');
                this.selectedAttorneyId = '';
                this.selectedAttorney = null;
                this.showAttorneyForm = false;
                this.showAttorneyAddButton = false;
                this.showAttorneyPlusButton = false;
            }
        } else {
            this.selectedAttorney = null;
            this.showAttorneyForm = false;
            this.showAttorneyAddButton = false;
            this.showAttorneyPlusButton = false;
            this.showToast('Info', 'No attorney selected.', 'info');
        }
    }

    handleNoAttorneyData(event) {
        console.log('No attorney data event received:', event.detail);
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

    handleAddNewAttorneyClick() {
        if (!this.newAttorney.attorneyName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        if (this.selectedAttorney) {
            addlookupAttorney({ donorId: this.donorId, spermBankId: this.selectedAttorneyId })
                .then(() => {
                    this.attorneys = [...this.attorneys, {
                        id: this.selectedAttorneyId,
                        attorneyName: this.newAttorney.attorneyName,
                        phone: this.newAttorney.phone || '',
                        lawFirm: this.newAttorney.lawFirm || '',
                        website: this.newAttorney.website || '',
                        cityState: this.newAttorney.cityState || '',
                        email: this.newAttorney.email || ''
                    }];
                    this.showToast('Success', 'Attorney added successfully', 'success');
                    this.selectedAttorneyId = '';
                    this.selectedAttorney = null;
                    this.showAttorneyForm = false;
                    this.showAttorneyAddButton = false;
                    this.showAttorneyPlusButton = false;
                    this.newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '', disableInputs: false };
                })
                .catch(error => {
                    console.log('Error adding attorney:', error);
                    this.showToast('Error', 'Error adding attorney: ' + (error.body?.message || error.message), 'error');
                });
        } else {
            addAttorney({
                donorId: this.donorId,
                attorneyName: this.newAttorney.attorneyName,
                phone: this.newAttorney.phone,
                lawFirm: this.newAttorney.lawFirm,
                website: this.newAttorney.website,
                cityState: this.newAttorney.cityState,
                email: this.newAttorney.email
            })
                .then(result => {
                    this.attorneys = [...this.attorneys, { ...this.newAttorney, id: result, isEditable: true }];
                    this.showToast('Success', 'Attorney added successfully', 'success');
                    this.handleCancelAttorney();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding attorney: ' + error.body.message, 'error');
                });
        }
    }

    handleEditAttorney(event) {
        const index = event.target.dataset.index;
        this.isEditingAttorney = true;
        this.newAttorney = { ...this.attorneys[index] };
        this.showAttorneyForm = true;
        this.showAttorneyPicker = false;
        this.showAttorneyAddButton = true;
        this.showAttorneyPlusButton = false;
    }

    handleDeleteAttorney(event) {
        const index = event.target.dataset.index;
        this.showDeletePopup = true;
        this.deleteItemType = 'Attorney';
        this.deleteItemIndex = index;
        this.deleteItemName = this.attorneys[index].attorneyName;
        this.deleteItemId = this.attorneys[index].id;
    }

    handleAttorneyFieldChange(event) {
        const field = event.target.dataset.field;
        this.newAttorney = { ...this.newAttorney, [field]: event.target.value };
    }

    handleCancelAttorney() {
        this.showAttorneyForm = false;
        this.showAttorneyPicker = false;
        this.newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '', disableInputs: false };
        this.isEditingAttorney = false;
        this.selectedAttorneyId = '';
        this.selectedAttorney = null;
        this.showAttorneyAddButton = false;
        this.showAttorneyPlusButton = false;
    }

    handleAddRecipientClick() {
        this.showRecipientPicker = true;
        this.showRecipientForm = true;
        this.isEditingRecipient = false;
        this.newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '', disableInputs: false };
        this.selectedRecipientId = '';
        this.selectedRecipient = null;
        this.showRecipientAddButton = false;
        this.showRecipientPlusButton = false;
    }

    async handleRecipientSelect(event) {
        console.log(JSON.stringify(event.detail));
        this.selectedRecipientId = event.detail.id || '';
        if (this.selectedRecipientId) {
            try {
                const result = await fetchContactRecord({ accountId: this.selectedRecipientId });
                console.log('Selected recipient details:', JSON.stringify(result));
                if (result) {
                    this.newRecipient = {
                        id: result.Id,
                        firstName: result.FirstName || '',
                        lastName: result.LastName || '',
                        phone: result.Phone || '',
                        email: result.d21_Email__c || '',
                        additionalInfo: result.d21_Additional_Information__c || '',
                        disableInputs: true
                    };
                    this.selectedRecipient = result;
                    this.showRecipientForm = true;
                    this.showRecipientPicker = false;
                    this.showRecipientAddButton = true;
                    this.showRecipientPlusButton = false;
                } else {
                    this.newRecipient = {
                        id: this.selectedRecipientId,
                        firstName: '',
                        lastName: '',
                        phone: '',
                        email: '',
                        additionalInfo: '',
                        disableInputs: false
                    };
                    this.selectedRecipient = null;
                    this.showRecipientForm = true;
                    this.showRecipientPicker = false;
                    this.showRecipientAddButton = true;
                    this.showRecipientPlusButton = false;
                }
            } catch (error) {
                console.log('Error fetching recipient:', error.stack);
                this.showToast('Error', 'Error fetching recipient details: ' + (error.body?.message || error.message), 'error');
                this.selectedRecipientId = '';
                this.selectedRecipient = null;
                this.showRecipientForm = false;
                this.showRecipientAddButton = false;
                this.showRecipientPlusButton = false;
            }
        } else {
            this.selectedRecipient = null;
            this.showRecipientForm = false;
            this.showRecipientAddButton = false;
            this.showRecipientPlusButton = false;
            this.showToast('Info', 'No recipient selected.', 'info');
        }
    }

    handleNoRecipientData(event) {
        console.log('No recipient data event received:', event.detail);
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

    handleAddNewRecipientClick() {
        if (!this.newRecipient.lastName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        if (this.selectedRecipient) {
            addlookupRecipient({ donorId: this.donorId, spermBankId: this.selectedRecipientId })
                .then(() => {
                    this.recipients = [...this.recipients, {
                        id: this.selectedRecipientId,
                        firstName: this.newRecipient.firstName,
                        lastName: this.newRecipient.lastName,
                        Name: (this.newRecipient.firstName || '') + ' ' + (this.newRecipient.lastName || ''),
                        phone: this.newRecipient.phone || '',
                        email: this.newRecipient.email || '',
                        additionalInfo: this.newRecipient.additionalInfo || ''
                    }];
                    this.showToast('Success', 'Recipient added successfully', 'success');
                    this.selectedRecipientId = '';
                    this.selectedRecipient = null;
                    this.showRecipientForm = false;
                    this.showRecipientAddButton = false;
                    this.showRecipientPlusButton = false;
                    this.newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '', disableInputs: false };
                })
                .catch(error => {
                    console.log('Error adding recipient:', error);
                    this.showToast('Error', 'Error adding recipient: ' + (error.body?.message || error.message), 'error');
                });
        } else {
            addRecipient({
                donorId: this.donorId,
                firstName: this.newRecipient.firstName,
                lastName: this.newRecipient.lastName,
                phone: this.newRecipient.phone,
                email: this.newRecipient.email,
                additionalInfo: this.newRecipient.additionalInfo
            })
                .then(result => {
                    this.recipients = [...this.recipients, {
                        ...this.newRecipient,
                        id: result,
                        Name: (this.newRecipient.firstName || '') + ' ' + (this.newRecipient.lastName || ''),
                        isEditable: true
                    }];
                    this.showToast('Success', 'Recipient added successfully', 'success');
                    this.handleCancelRecipient();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding recipient: ' + error.body.message, 'error');
                });
        }
    }

    handleEditRecipient(event) {
        const index = event.target.dataset.index;
        this.isEditingRecipient = true;
        this.newRecipient = { ...this.recipients[index] };
        this.showRecipientForm = true;
        this.showRecipientPicker = false;
        this.showRecipientAddButton = true;
        this.showRecipientPlusButton = false;
    }

    handleDeleteRecipient(event) {
        const index = event.target.dataset.index;
        this.showDeletePopup = true;
        this.deleteItemType = 'Recipient';
        this.deleteItemIndex = index;
        this.deleteItemName = this.recipients[index].Name;
        this.deleteItemId = this.recipients[index].id;
    }

    handleRecipientFieldChange(event) {
        const field = event.target.dataset.field;
        this.newRecipient = { ...this.newRecipient, [field]: event.target.value };
    }

    handleCancelRecipient() {
        this.showRecipientForm = false;
        this.showRecipientPicker = false;
        this.newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '', disableInputs: false };
        this.isEditingRecipient = false;
        this.selectedRecipientId = '';
        this.selectedRecipient = null;
        this.showRecipientAddButton = false;
        this.showRecipientPlusButton = false;
    }

    handleConfirmationChange(event) {
        this.isConfirmed = event.target.checked;
    }

    handleDeleteYes() {
        if (this.deleteItemType === 'Sperm') {
            deleteSpermBank({ accountId: this.deleteItemId })
                .then(() => {
                    this.sperms = this.sperms.filter((_, index) => index !== parseInt(this.deleteItemIndex));
                    this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
                    this.closeDeletePopup();
                })
                .catch(error => {
                    this.showToast('Error', `Error deleting ${this.deleteItemType}: ${error.body.message}`, 'error');
                    this.closeDeletePopup();
                });
        } else if (this.deleteItemType === 'Agency') {
            deleteAgency({ accountId: this.deleteItemId })
                .then(() => {
                    this.agencies = this.agencies.filter((_, index) => index !== parseInt(this.deleteItemIndex));
                    this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
                    this.closeDeletePopup();
                })
                .catch(error => {
                    this.showToast('Error', `Error deleting ${this.deleteItemType}: ${error.body.message}`, 'error');
                    this.closeDeletePopup();
                });
        } else if (this.deleteItemType === 'Clinic') {
            deleteClinic({ accountId: this.deleteItemId })
                .then(() => {
                    this.clinics = this.clinics.filter((_, index) => index !== parseInt(this.deleteItemIndex));
                    this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
                    this.closeDeletePopup();
                })
                .catch(error => {
                    this.showToast('Error', `Error deleting ${this.deleteItemType}: ${error.body.message}`, 'error');
                    this.closeDeletePopup();
                });
        } else if (this.deleteItemType === 'Attorney') {
            deleteAttorney({ accountId: this.deleteItemId })
                .then(() => {
                    this.attorneys = this.attorneys.filter((_, index) => index !== parseInt(this.deleteItemIndex));
                    this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
                    this.closeDeletePopup();
                })
                .catch(error => {
                    this.showToast('Error', `Error deleting ${this.deleteItemType}: ${error.body.message}`, 'error');
                    this.closeDeletePopup();
                });
        } else if (this.deleteItemType === 'Recipient') {
            deleteRecipient({ accountId: this.deleteItemId })
                .then(() => {
                    this.recipients = this.recipients.filter((_, index) => index !== parseInt(this.deleteItemIndex));
                    this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
                    this.closeDeletePopup();
                })
                .catch(error => {
                    this.showToast('Error', `Error deleting ${this.deleteItemType}: ${error.body.message}`, 'error');
                    this.closeDeletePopup();
                });
        }
    }

    handleDeleteNo() {
        this.closeDeletePopup();
    }

    closeDeletePopup() {
        this.showDeletePopup = false;
        this.deleteItemType = '';
        this.deleteItemIndex = -1;
        this.deleteItemName = '';
        this.deleteItemId = '';
    }

    handleDonorHippaBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    handleDonorHippaNext() {
        if (!this.isConfirmed) {
            this.showToast('Error', 'Please confirm that the information is accurate.', 'error');
            return;
        }
        if (!this.dob || !this.address.state || !this.address.city) {
            this.showToast('Error', 'Please fill in all required fields.', 'error');
            return;
        }
        this.dispatchEvent(new CustomEvent('next', {
            detail: {
                legalName: this.legalNamesri,
                dob: this.dob,
                address: this.address,
                agencies: this.agencies,
                sperms: this.sperms,
                clinics: this.clinics,
                attorneys: this.attorneys,
                recipients: this.recipients
            }
        }));
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}