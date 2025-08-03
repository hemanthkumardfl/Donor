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
                website: item.website || '',
                cityState: item.cityState || '',
                coordinatorEmail: item.email || '',
                pmcNumber: item.pmcNumber || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false
            })) : [];

            this.sperms = Array.isArray(result.spermlist) ? result.spermlist.map(item => ({
                id: item.Id || `sperm_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                spermBankName: item.Name || '',
                spermBankPhone: item.Phone || '',
                coordinatorName: item.coordinatorName || '',
                spermBankWebsite: item.website || '',
                spermBankEmail: item.email || '',
                pmcNumber: item.pmcNumber || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false
            })) : [];

            this.clinics = Array.isArray(result.Cliniclist) ? result.Cliniclist.map(item => ({
                id: item.Id || `clinic_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                clinicName: item.Name || '',
                phone: item.Phone || '',
                coordinatorName: item.coordinatorName || '',
                website: item.website || '',
                cityState: item.cityState || '',
                coordinatorEmail: item.email || '',
                pmcNumber: item.pmcNumber || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false
            })) : [];

            this.attorneys = Array.isArray(result.Attorneylist) ? result.Attorneylist.map(item => ({
                id: item.Id || `attorney_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                attorneyName: item.Name || '',
                phone: item.Phone || '',
                lawFirm: item.lawFirm || item.coordinatorName || '',
                website: item.website || '',
                cityState: item.cityState || '',
                email: item.email || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false
            })) : [];

            this.recipients = Array.isArray(result.Recipientlist) ? result.Recipientlist.map(item => ({
                id: item.Id || `recipient_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                firstName: item.firstName || '',
                lastName: item.lastName || '',
                Name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
                phone: item.Phone || '',
                email: item.email || '',
                additionalInfo: item.additionalInfo || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false
            })) : [];
        } catch (error) {
            console.error('Error loading donor data:', error);
            this.showToast('Error', `Failed to load donor data: ${error.body?.message || error.message}`, 'error');
        }
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
                    this.agencies = this.agencies.map(agency =>
                        agency.id === this.newAgency.id ? { ...this.newAgency, isEditable: true } : agency
                    );
                    this.showToast('Success', 'Agency updated successfully', 'success');
                    this.handleCancelAgency();
                })
                .catch(error => {
                    console.error('Error updating agency:', error);
                    this.showToast('Error', `Error updating agency: ${error.body?.message || error.message}`, 'error');
                });
        } else if (this.selectedAgency) {
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
                        isEditable: true,
                        isFromPrimaryBanks: this.newAgency.disableInputs
                    }];
                    this.showToast('Success', 'Agency added successfully', 'success');
                    this.handleCancelAgency();
                })
                .catch(error => {
                    console.error('Error adding agency:', error);
                    this.showToast('Error', `Error adding agency: ${error.body?.message || error.message}`, 'error');
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
                    this.agencies = [...this.agencies, { ...this.newAgency, id: result, isEditable: true, isFromPrimaryBanks: false }];
                    this.showToast('Success', 'Agency added successfully', 'success');
                    this.handleCancelAgency();
                })
                .catch(error => {
                    console.error('Error adding agency:', error);
                    this.showToast('Error', `Error adding agency: ${error.body?.message || error.message}`, 'error');
                });
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
    }

    handleDeleteAgency(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const agency = this.agencies[index];
        if (!agency) {
            this.showToast('Error', 'Invalid agency selected for deletion.', 'error');
            return;
        }
        console.log('Preparing to delete agency:', { index, agencyId: agency.id, donorId: this.donorId });
        this.showDeletePopup = true;
        this.deleteItemType = 'Agency';
        this.deleteItemIndex = index;
        this.deleteItemName = agency.agencyName;
        this.deleteItemId = agency.id;
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
        console.log('Sperm bank select:', JSON.stringify(event.detail));
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
                    this.showSpermPicker = true;
                    this.showAddButton = true;
                    this.showPlusButton = true;
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
                console.error('Error fetching sperm bank:', error);
                this.showToast('Error', `Error fetching sperm bank details: ${error.body?.message || error.message}`, 'error');
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
        console.log('No sperm bank data:', event.detail);
        this.showToast('Info', event.detail || 'No sperm banks found.', 'info');
        this.showAddButton = false;
        this.showPlusButton = true;
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

    handleAddNewSpermBankClick() {
        if (!this.newSperm.spermBankName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
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
                    this.sperms = this.sperms.map(sperm =>
                        sperm.id === this.newSperm.id ? { ...this.newSperm, isEditable: true } : sperm
                    );
                    this.showToast('Success', 'Sperm Bank updated successfully', 'success');
                    this.handleCancelSperm();
                })
                .catch(error => {
                    console.error('Error updating sperm bank:', error);
                    this.showToast('Error', `Error updating sperm bank: ${error.body?.message || error.message}`, 'error');
                });
        } else if (this.selectedSpermBank) {
            addlookupSpermBank({ donorId: this.donorId, spermBankId: this.selectedSpermBankId})
                .then(() => {
                    this.sperms = [...this.sperms, {
                        id: this.selectedSpermBankId,
                        spermBankName: this.newSperm.spermBankName,
                        spermBankPhone: this.newSperm.spermBankPhone || '',
                        coordinatorName: this.newSperm.coordinatorName || '',
                        spermBankWebsite: this.newSperm.spermBankWebsite || '',
                        spermBankEmail: this.newSperm.spermBankEmail || '',
                        pmcNumber: '',
                        isEditable: true,
                        isFromPrimaryBanks: this.newSperm.disableInputs
                    }];
                    this.showToast('Success', 'Sperm Bank added successfully', 'success');
                    this.handleCancelSperm();
                })
                .catch(error => {
                    console.error('Error adding sperm bank:', error);
                    this.showToast('Error', `Error adding sperm bank: ${error.body?.message || error.message}`, 'error');
                });
        } else {
            addSpermBank({
                donorId: this.donorId,
                spermBankName: this.newSperm.spermBankName,
                phone: this.newSperm.spermBankPhone,
                coordinatorName: this.newSperm.coordinatorName,
                website: this.newSperm.spermBankWebsite,
                email: this.newSperm.spermBankEmail
            })
                .then(result => {
                    this.sperms = [...this.sperms, {
                        ...this.newSperm,
                        id: result,
                        pmcNumber: '',
                        isEditable: true,
                        isFromPrimaryBanks: false
                    }];
                    this.showToast('Success', 'Sperm Bank added successfully', 'success');
                    this.handleCancelSperm();
                })
                .catch(error => {
                    console.error('Error adding sperm bank:', error);
                    this.showToast('Error', `Error adding sperm bank: ${error.body?.message || error.message}`, 'error');
                });
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
    }

    handleDeleteSperm(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const sperm = this.sperms[index];
        if (!sperm) {
            this.showToast('Error', 'Invalid sperm bank selected for deletion.', 'error');
            return;
        }
        console.log('Preparing to delete sperm bank:', { index, spermBankId: sperm.id, donorId: this.donorId });
        this.showDeletePopup = true;
        this.deleteItemType = 'Sperm';
        this.deleteItemIndex = index;
        this.deleteItemName = sperm.spermBankName;
        this.deleteItemId = sperm.id;
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

    handleAddClinicClick() {
        this.showClinicPicker = true;
        this.showClinicForm = true;
        this.isEditingClinic = false;
        this.newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '', disableInputs: false };
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
        if (this.isEditingClinic) {
            editClinic({
                accountId: this.newClinic.id,
                clinicName: this.newClinic.clinicName,
                phone: this.newClinic.phone,
                coordinatorName: this.newClinic.coordinatorName,
                website: this.newClinic.website,
                cityState: this.newClinic.cityState,
                email: this.newClinic.coordinatorEmail
            })
                .then(() => {
                    this.clinics = this.clinics.map(clinic =>
                        clinic.id === this.newClinic.id ? { ...this.newClinic, isEditable: true } : clinic
                    );
                    this.showToast('Success', 'Clinic updated successfully', 'success');
                    this.handleCancelClinic();
                })
                .catch(error => {
                    console.error('Error updating clinic:', error);
                    this.showToast('Error', `Error updating clinic: ${error.body?.message || error.message}`, 'error');
                });
        } else if (this.selectedClinic) {
            addlookupClinic({ donorId: this.donorId, spermBankId: this.selectedClinicId })
                .then(() => {
                    this.clinics = [...this.clinics, {
                        id: this.selectedClinicId,
                        clinicName: this.newClinic.clinicName,
                        phone: this.newClinic.phone || '',
                        coordinatorName: this.newClinic.coordinatorName || '',
                        website: this.newClinic.website || '',
                        cityState: this.newClinic.cityState || '',
                        coordinatorEmail: this.newClinic.coordinatorEmail || '',
                        isEditable: true,
                        isFromPrimaryBanks: this.newClinic.disableInputs
                    }];
                    this.showToast('Success', 'Clinic added successfully', 'success');
                    this.handleCancelClinic();
                })
                .catch(error => {
                    console.error('Error adding clinic:', error);
                    this.showToast('Error', `Error adding clinic: ${error.body?.message || error.message}`, 'error');
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
                    this.clinics = [...this.clinics, { ...this.newClinic, id: result, isEditable: true, isFromPrimaryBanks: false }];
                    this.showToast('Success', 'Clinic added successfully', 'success');
                    this.handleCancelClinic();
                })
                .catch(error => {
                    console.error('Error adding clinic:', error);
                    this.showToast('Error', `Error adding clinic: ${error.body?.message || error.message}`, 'error');
                });
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
    }

    handleDeleteClinic(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const clinic = this.clinics[index];
        if (!clinic) {
            this.showToast('Error', 'Invalid clinic selected for deletion.', 'error');
            return;
        }
        console.log('Preparing to delete clinic:', { index, clinicId: clinic.id, donorId: this.donorId });
        this.showDeletePopup = true;
        this.deleteItemType = 'Clinic';
        this.deleteItemIndex = index;
        this.deleteItemName = clinic.clinicName;
        this.deleteItemId = clinic.id;
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
        console.log('Attorney select:', JSON.stringify(event.detail));
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
                        lawFirm: result.d21_Law_Firm__c || '',
                        website: result.Website || '',
                        cityState: result.City__c || '',
                        email: result.Email || '',
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
                console.error('Error fetching attorney:', error);
                this.showToast('Error', `Error fetching attorney details: ${error.body?.message || error.message}`, 'error');
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

    handleAddNewAttorneyClick() {
        if (!this.newAttorney.attorneyName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        if (this.isEditingAttorney) {
            editAttorney({
                contactId: this.newAttorney.id,
                attorneyName: this.newAttorney.attorneyName,
                phone: this.newAttorney.phone,
                lawFirm: this.newAttorney.lawFirm,
                website: this.newAttorney.website,
                cityState: this.newAttorney.cityState,
                email: this.newAttorney.email
            })
                .then(() => {
                    this.attorneys = this.attorneys.map(attorney =>
                        attorney.id === this.newAttorney.id ? { ...this.newAttorney, isEditable: true } : attorney
                    );
                    this.showToast('Success', 'Attorney updated successfully', 'success');
                    this.handleCancelAttorney();
                })
                .catch(error => {
                    console.error('Error updating attorney:', error);
                    this.showToast('Error', `Error updating attorney: ${error.body?.message || error.message}`, 'error');
                });
        } else if (this.selectedAttorney) {
            addlookupAttorney({ donorId: this.donorId, spermBankId: this.selectedAttorneyId })
                .then(() => {
                    this.attorneys = [...this.attorneys, {
                        id: this.selectedAttorneyId,
                        attorneyName: this.newAttorney.attorneyName,
                        phone: this.newAttorney.phone || '',
                        lawFirm: this.newAttorney.lawFirm || '',
                        website: this.newAttorney.website || '',
                        cityState: this.newAttorney.cityState || '',
                        email: this.newAttorney.email || '',
                        isEditable: true,
                        isFromPrimaryBanks: this.newAttorney.disableInputs
                    }];
                    this.showToast('Success', 'Attorney added successfully', 'success');
                    this.handleCancelAttorney();
                })
                .catch(error => {
                    console.error('Error adding attorney:', error);
                    this.showToast('Error', `Error adding attorney: ${error.body?.message || error.message}`, 'error');
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
                    this.attorneys = [...this.attorneys, { ...this.newAttorney, id: result, isEditable: true, isFromPrimaryBanks: false }];
                    this.showToast('Success', 'Attorney added successfully', 'success');
                    this.handleCancelAttorney();
                })
                .catch(error => {
                    console.error('Error adding attorney:', error);
                    this.showToast('Error', `Error adding attorney: ${error.body?.message || error.message}`, 'error');
                });
        }
    }

    handleEditAttorney(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const attorney = this.attorneys[index];
        if (!attorney || !attorney.isEditable) {
            this.showToast('Error', 'This attorney cannot be edited.', 'error');
            return;
        }
        this.isEditingAttorney = true;
        this.newAttorney = { ...attorney };
        this.showAttorneyForm = true;
        this.showAttorneyPicker = false;
        this.showAttorneyAddButton = true;
        this.showAttorneyPlusButton = false;
    }

    handleDeleteAttorney(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const attorney = this.attorneys[index];
        if (!attorney) {
            this.showToast('Error', 'Invalid attorney selected for deletion.', 'error');
            return;
        }
        console.log('Preparing to delete attorney:', { index, attorneyId: attorney.id, donorId: this.donorId });
        this.showDeletePopup = true;
        this.deleteItemType = 'Attorney';
        this.deleteItemIndex = index;
        this.deleteItemName = attorney.attorneyName;
        this.deleteItemId = attorney.id;
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
        console.log('Recipient select:', JSON.stringify(event.detail));
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
                        email: result.Email || '',
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
                console.error('Error fetching recipient:', error);
                this.showToast('Error', `Error fetching recipient details: ${error.body?.message || error.message}`, 'error');
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

    handleAddNewRecipientClick() {
        if (!this.newRecipient.lastName) {
            this.showToast('Error', 'Please ensure all required fields are filled.', 'error');
            return;
        }
        if (this.isEditingRecipient) {
            editRecipient({
                contactId: this.newRecipient.id,
                firstName: this.newRecipient.firstName,
                lastName: this.newRecipient.lastName,
                phone: this.newRecipient.phone,
                email: this.newRecipient.email,
                additionalInfo: this.newRecipient.additionalInfo
            })
                .then(() => {
                    this.recipients = this.recipients.map(recipient =>
                        recipient.id === this.newRecipient.id ? {
                            ...this.newRecipient,
                            Name: `${this.newRecipient.firstName || ''} ${this.newRecipient.lastName || ''}`.trim(),
                            isEditable: true
                        } : recipient
                    );
                    this.showToast('Success', 'Recipient updated successfully', 'success');
                    this.handleCancelRecipient();
                })
                .catch(error => {
                    console.error('Error updating recipient:', error);
                    this.showToast('Error', `Error updating recipient: ${error.body?.message || error.message}`, 'error');
                });
        } else if (this.selectedRecipient) {
            addlookupRecipient({ donorId: this.donorId, spermBankId: this.selectedRecipientId })
                .then(() => {
                    this.recipients = [...this.recipients, {
                        id: this.selectedRecipientId,
                        firstName: this.newRecipient.firstName || '',
                        lastName: this.newRecipient.lastName,
                        Name: `${this.newRecipient.firstName || ''} ${this.newRecipient.lastName || ''}`.trim(),
                        phone: this.newRecipient.phone || '',
                        email: this.newRecipient.email || '',
                        additionalInfo: this.newRecipient.additionalInfo || '',
                        isEditable: true,
                        isFromPrimaryBanks: this.newRecipient.disableInputs
                    }];
                    this.showToast('Success', 'Recipient added successfully', 'success');
                    this.handleCancelRecipient();
                })
                .catch(error => {
                    console.error('Error adding recipient:', error);
                    this.showToast('Error', `Error adding recipient: ${error.body?.message || error.message}`, 'error');
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
                        Name: `${this.newRecipient.firstName || ''} ${this.newRecipient.lastName || ''}`.trim(),
                        isEditable: true,
                        isFromPrimaryBanks: false
                    }];
                    this.showToast('Success', 'Recipient added successfully', 'success');
                    this.handleCancelRecipient();
                })
                .catch(error => {
                    console.error('Error adding recipient:', error);
                    this.showToast('Error', `Error adding recipient: ${error.body?.message || error.message}`, 'error');
                });
        }
    }

    handleEditRecipient(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const recipient = this.recipients[index];
        if (!recipient || !recipient.isEditable) {
            this.showToast('Error', 'This recipient cannot be edited.', 'error');
            return;
        }
        this.isEditingRecipient = true;
        this.newRecipient = { ...recipient };
        this.showRecipientForm = true;
        this.showRecipientPicker = false;
        this.showRecipientAddButton = true;
        this.showRecipientPlusButton = false;
    }

    handleDeleteRecipient(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const recipient = this.recipients[index];
        if (!recipient) {
            this.showToast('Error', 'Invalid recipient selected for deletion.', 'error');
            return;
        }
        console.log('Preparing to delete recipient:', { index, recipientId: recipient.id, donorId: this.donorId });
        this.showDeletePopup = true;
        this.deleteItemType = 'Recipient';
        this.deleteItemIndex = index;
        this.deleteItemName = recipient.Name;
        this.deleteItemId = recipient.id;
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

    handleSpermBankChange(event) {
        this.nameConfirmation = event.target.value;
        this.isYesChecked = this.nameConfirmation === 'Yes';
        this.isNoChecked = this.nameConfirmation === 'No';
        this.isDisabled = this.isYesChecked;
        this.legalName = this.isYesChecked ? { ...this.legalNamesri } : { firstName: '', lastName: '' };
    }

    handleLegalNameChange(event) {
        const field = event.target.name;
        this.legalName = { ...this.legalName, [field]: event.target.value };
    }

    handleDobChange(event) {
        this.dob = event.target.value;
        const dobDate = new Date(this.dob);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            age--;
        }
        this.dobError = dobDate > today ? 'Date of birth cannot be in the future.' : age < 18 ? 'You must be at least 18 years old.' : '';
    }

    handleAddressChange(event) {
        const field = event.target.dataset.field;
        this.address = { ...this.address, [field]: event.target.value };
    }

    handleConfirmationChange(event) {
        this.isConfirmed = event.target.checked;
    }

    async handleDeleteYes() {
        const deleteMethods = {
            'Agency': deleteAgency,
            'Sperm': deleteSpermBank,
            'Clinic': deleteClinic,
            'Attorney': deleteAttorney,
            'Recipient': deleteRecipient
        };
        const arrayMap = {
            'Agency': 'agencies',
            'Sperm': 'sperms',
            'Clinic': 'clinics',
            'Attorney': 'attorneys',
            'Recipient': 'recipients'
        };
        const deleteMethod = deleteMethods[this.deleteItemType];
        const arrayName = arrayMap[this.deleteItemType];

        if (!deleteMethod || !this.deleteItemId || !this.donorId) {
            console.error('Invalid deletion parameters:', {
                deleteItemType: this.deleteItemType,
                deleteItemId: this.deleteItemId,
                donorId: this.donorId
            });
            this.showToast('Error', 'Invalid deletion request. Missing required parameters.', 'error');
            this.handleDeleteNo();
            return;
        }

        try {
            console.log(`Calling ${this.deleteItemType} deletion with donorId: ${this.donorId}, recordId: ${this.deleteItemId}`);
            await deleteMethod({ donorId: this.donorId, recordId: this.deleteItemId });
            this[arrayName] = this[arrayName].filter((_, index) => index !== this.deleteItemIndex);
            this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
            this.handleDeleteNo();
        } catch (error) {
            console.error(`Error deleting ${this.deleteItemType}:`, {
                error: error.body?.message || error.message,
                donorId: this.donorId,
                recordId: this.deleteItemId
            });
            this.showToast('Error', `Error deleting ${this.deleteItemType}: ${error.body?.message || error.message}`, 'error');
            this.handleDeleteNo();
        }
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteItemType = '';
        this.deleteItemIndex = -1;
        this.deleteItemName = '';
        this.deleteItemId = '';
    }

    handleDonorHippaBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    async handleDonorHippaNext() {
        if (!this.legalName.firstName || !this.legalName.lastName) {
            this.showToast('Error', 'Please enter both first and last name.', 'error');
            return;
        }
        if (!this.dob) {
            this.showToast('Error', 'Please enter your date of birth.', 'error');
            return;
        }
        if (this.dobError) {
            this.showToast('Error', this.dobError, 'error');
            return;
        }
        if (!this.address.state || !this.address.city) {
            this.showToast('Error', 'Please enter both state and city.', 'error');
            return;
        }
        if (!this.isConfirmed) {
            this.showToast('Error', 'Please confirm that the information is accurate.', 'error');
            return;
        }
        try {
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
            this.dispatchEvent(new CustomEvent('next', { detail: { donorId: this.donorId } }));
        } catch (error) {
            console.error('Error updating donor:', error);
            this.showToast('Error', `Error updating donor information: ${error.body?.message || error.message}`, 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}