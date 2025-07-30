import { LightningElement, track, api } from 'lwc';
import createSpermDonorRecipients from '@salesforce/apex/PreRegistrationController.createSpermDonorRecipients';
import deleteSpermDonorRecipient from '@salesforce/apex/PreRegistrationController.deleteSpermDonorRecipient';

export default class donorPreRegIPSpermDonorNoCode extends LightningElement {
    @api contactObj;
    @api spermDonorsCount = 1; // Default to 1 donor
    @track spermDonors = [];
    @track isLoading = false;
    @track deletingDonorId = null;

    options = [
        { label: 'Clinic', value: 'Clinic' },
        { label: 'Sperm Bank', value: 'Sperm Bank' }
    ];

    connectedCallback() {
        // Pre-fill spermDonors from contactObj.spermDonorDetails if available
        if (this.contactObj?.spermDonorDetails?.donors?.length > 0) {
    this.spermDonors = this.contactObj.spermDonorDetails.donors.map((donor, index) => ({
        id: donor.id || Date.now() + index,
        donorNumber: index + 1,
        selectedOption: donor.selectedOption || 'Clinic', // Default to 'Clinic'
        isClinicSelected: (donor.selectedOption || 'Clinic') === 'Clinic',
        isSpermBankSelected: (donor.selectedOption || 'Clinic') === 'Sperm Bank',
                embryoProgram: {
                    name: donor.embryoProgram?.name || '',
                    doctorName: donor.embryoProgram?.doctorName || '',
                    website: donor.embryoProgram?.website || '',
                    phone: donor.embryoProgram?.phone || '',
                    cityState: donor.embryoProgram?.cityState || '',
                    coordinatorName: donor.embryoProgram?.coordinatorName || '',
                    coordinatorEmail: donor.embryoProgram?.coordinatorEmail || ''
                },
                clinic: {
                    name: donor.clinic?.name || '',
                    website: donor.clinic?.website || '',
                    phone: donor.clinic?.phone || '',
                    cityState: donor.clinic?.cityState || '',
                    coordinatorName: donor.clinic?.coordinatorName || '',
                    coordinatorEmail: donor.clinic?.coordinatorEmail || ''
                },
                family: {
                    firstName: donor.family?.firstName || '',
                    lastName: donor.family?.lastName || '',
                    email: donor.family?.email || '',
                    phone: donor.family?.phone || '',
                    donorCode: donor.family?.donorCode || '',
                    additionalInfo: donor.family?.additionalInfo || ''
                },
                accountId: donor.accountId || '',
                contactId: donor.contactId || '',
                junctionId: donor.junctionId || ''
            }));
            this._spermDonorsCount = this.spermDonors.length;
        } else {
            this.initializeSpermDonors();
        }
    }

    // Initialize sperm donors based on count
    initializeSpermDonors() {
        this.spermDonors = [];
        for (let i = 0; i < this.spermDonorsCount; i++) {
            this.spermDonors.push({
                id: Date.now() + i,
                donorNumber: i + 1,
                selectedOption: 'Clinic',
                isClinicSelected: true,
                isSpermBankSelected: false,
                embryoProgram: {
                    name: '',
                    doctorName: '',
                    website: '',
                    phone: '',
                    cityState: '',
                    coordinatorName: '',
                    coordinatorEmail: ''
                },
                clinic: {
                    name: '',
                    website: '',
                    phone: '',
                    cityState: '',
                    coordinatorName: '',
                    coordinatorEmail: ''
                },
                family: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    donorCode: '',
                    additionalInfo: ''
                },
                accountId: '',
                contactId: '',
                junctionId: ''
            });
        }
        this._spermDonorsCount = this.spermDonors.length;
    }

    // Watch for changes to spermDonorsCount
    set spermDonorsCount(value) {
        this._spermDonorsCount = value;
        if (this._spermDonorsCount) {
            this.initializeSpermDonors();
        }
    }

    get spermDonorsCount() {
        return this._spermDonorsCount || 1;
    }

    get showDeleteButton() {
        return this.spermDonors.length > 1;
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        const section = event.target.dataset.section;
        const index = Number.parseInt(event.target.dataset.index, 10);
        const name = event.target.name;

        this.spermDonors = this.spermDonors.map((donor, i) => {
            if (i === index) {
                let updatedDonor = { ...donor };

                // Handle combobox selection
                if (name === 'donorSource') {
                    updatedDonor.selectedOption = event.target.value;
                    updatedDonor.isClinicSelected = updatedDonor.selectedOption === 'Clinic';
                    updatedDonor.isSpermBankSelected = updatedDonor.selectedOption === 'Sperm Bank';
                }

                // Update the appropriate section based on the data-section attribute
                if (section && updatedDonor[section]) {
                    updatedDonor[section] = {
                        ...updatedDonor[section],
                        [field]: event.target.value
                    };
                }

                return updatedDonor;
            }
            return donor;
        });
    }

    handleProfileUpload(event) {
        const index = Number.parseInt(event.target.dataset.index, 10);
        const file = event.target.files[0];
        // Handle file upload logic (e.g., store file or send to server)
        console.log(`Profile file for donor ${index + 1}:`, file);
    }

    handlePhotoUpload(event) {
        const index = Number.parseInt(event.target.dataset.index, 10);
        const file = event.target.files[0];
        // Handle file upload logic (e.g., store file or send to server)
        console.log(`Photo file for donor ${index + 1}:`, file);
    }

    handleAdditionalInfoChange(event) {
        const index = Number.parseInt(event.target.dataset.index, 10);
        this.spermDonors = this.spermDonors.map((donor, i) => {
            if (i === index) {
                return {
                    ...donor,
                    family: {
                        ...donor.family,
                        additionalInfo: event.target.value
                    }
                };
            }
            return donor;
        });
    }

    // Method to add a new donor
    @api
    addDonor() {
        const newDonor = {
            id: Date.now(),
            donorNumber: this.spermDonors.length + 1,
            selectedOption: '',
            isClinicSelected: false,
            isSpermBankSelected: false,
            embryoProgram: {
                name: '',
                doctorName: '',
                website: '',
                phone: '',
                cityState: '',
                coordinatorName: '',
                coordinatorEmail: ''
            },
            clinic: {
                name: '',
                website: '',
                phone: '',
                cityState: '',
                coordinatorName: '',
                coordinatorEmail: ''
            },
            family: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                donorCode: '',
                additionalInfo: ''
            },
            accountId: '',
            contactId: '',
            junctionId: ''
        };
        this.spermDonors = [...this.spermDonors, newDonor];
        this._spermDonorsCount = this.spermDonors.length;
    }

    // Method to remove a donor
    @api
    removeDonor(donorId) {
        this.spermDonors = this.spermDonors.filter((donor) => donor.id !== donorId);
        this.spermDonors = this.spermDonors.map((donor, index) => ({
            ...donor,
            donorNumber: index + 1
        }));
        this._spermDonorsCount = this.spermDonors.length;
    }

    handleDeleteDonor(event) {
        const donorId = Number.parseInt(event.target.dataset.id, 10);
        const donorToDelete = this.spermDonors.find(d => d.id === donorId);

        if (!donorToDelete) {
            this.showError('Donor not found');
            return;
        }

        // If donor has existing records in Salesforce, delete them first
        if (donorToDelete.accountId || donorToDelete.contactId || donorToDelete.junctionId) {
            this.deleteDonorFromSalesforce(donorToDelete, donorId);
        } else {
            // Just remove from local array if no Salesforce records exist
            this.removeDonorFromList(donorId);
        }
    }

    deleteDonorFromSalesforce(donor, donorId) {
        this.deletingDonorId = donorId;

        const deleteData = {
            accountId: donor.accountId || '',
            contactId: donor.contactId || '',
            junctionId: donor.junctionId || ''
        };

        deleteSpermDonorRecipient({ 
            deleteDetails: JSON.stringify(deleteData) 
        })
        .then(result => {
            this.deletingDonorId = null;
            
            if (result && result.success) {
                this.removeDonorFromList(donorId);
                this.showSuccess('Donor deleted successfully');
            } else {
                this.showError(result?.message || 'Failed to delete donor');
            }
        })
        .catch(error => {
            this.deletingDonorId = null;
            console.error('Error deleting donor:', error);
            this.showError('An error occurred while deleting donor: ' + (error.body?.message || error.message));
        });
    }

    removeDonorFromList(donorId) {
        this.spermDonors = this.spermDonors.filter(donor => donor.id !== donorId);
        this.spermDonors = this.spermDonors.map((donor, index) => ({
            ...donor,
            donorNumber: index + 1
        }));
        this._spermDonorsCount = this.spermDonors.length;

        if (this.spermDonors.length === 0) {
            this.initializeSpermDonors();
        }
    }

    handleBackClick() {
        this.dispatchEvent(new CustomEvent('back', {
            detail: {
                message: true
            }
        }));
    }

    handleNextClick() {
        // Validate required fields
        let isValid = true;
        this.template.querySelectorAll('lightning-input').forEach((input) => {
            const fieldName = input.dataset.field;
            const section = input.dataset.section;
            const value = input.value;

            // Validate required fields (e.g., clinic name if Clinic is selected)
            if (fieldName === 'name' && section === 'embryoProgram' && !value) {
                const index = Number.parseInt(input.dataset.index, 10);
                const donor = this.spermDonors[index];
                if (donor.isClinicSelected) {
                    input.setCustomValidity('Please enter the clinic name');
                    input.reportValidity();
                    isValid = false;
                }
            } else if (fieldName === 'name' && section === 'clinic' && !value) {
                const index = Number.parseInt(input.dataset.index, 10);
                const donor = this.spermDonors[index];
                if (donor.isSpermBankSelected) {
                    input.setCustomValidity('Please enter the sperm bank name');
                    input.reportValidity();
                    isValid = false;
                }
            } else {
                input.setCustomValidity('');
                input.reportValidity();
            }
        });

        this.template.querySelectorAll('lightning-combobox').forEach((combobox) => {
            const index = Number.parseInt(combobox.dataset.index, 10);
            const donor = this.spermDonors[index];
            if (!donor.selectedOption) {
                combobox.setCustomValidity('Please select how you found the sperm donor');
                combobox.reportValidity();
                isValid = false;
            } else {
                combobox.setCustomValidity('');
                combobox.reportValidity();
            }
        });

        if (!isValid) {
            this.showError('Please fill out all required fields');
            return;
        }

        this.isLoading = true;

        try {
            // Prepare data for Apex
            const spermDonorData = {
                donors: this.spermDonors.map((donor, index) => ({
                    donorNumber: (index + 1).toString(),
                    selectedOption: donor.selectedOption || '',
                    embryoProgram: { ...donor.embryoProgram },
                    clinic: { ...donor.clinic },
                    family: { ...donor.family },
                    accountId: donor.accountId || '',
                    contactId: donor.contactId || '',
                    junctionId: donor.junctionId || ''
                }))
            };

            console.log('Dispatching sperm donor data:', JSON.stringify(spermDonorData));

            // Call Apex to create/save sperm donor data
            createSpermDonorRecipients({
                RecipientDetails: JSON.stringify({ spermDonorDetails: spermDonorData })
            })
            .then(result => {
                this.isLoading = false;
                if (result && result.success) {
                    console.log('Sperm donor data created successfully:', result);
                    this.showSuccess('Sperm donor information saved successfully');

                    // Update spermDonors with Salesforce IDs, if provided
                    if (result.accountMap || result.contactMap || result.junctionMap) {
                        this.spermDonors = this.spermDonors.map((donor, index) => {
                            const donorNumber = (index + 1).toString();
                            return {
                                ...donor,
                                accountId: result.accountMap?.[donorNumber] || donor.accountId || '',
                                contactId: result.contactMap?.[donorNumber] || donor.contactId || '',
                                junctionId: result.junctionMap?.[donorNumber] || donor.junctionId || ''
                            };
                        });
                    }

                    // Dispatch event to parent
                    this.dispatchEvent(new CustomEvent('spermdonorcompleted', {
                        detail: {
                            message: 'Sperm donor details completed',
                            data: spermDonorData
                        }
                    }));
                } else {
                    this.showError(result?.message || 'Failed to save sperm donor information');
                }
            })
            .catch(error => {
                this.isLoading = false;
                console.error('Error saving sperm donor data:', error);
                this.showError('An error occurred while saving sperm donor information: ' + (error.body?.message || error.message));
            });
        } catch (error) {
            this.isLoading = false;
            console.error('Error in handleNextClick:', error);
            this.showError('An unexpected error occurred: ' + error.message);
        }
    }

    showError(message) {
        console.error('Error:', message);
        alert(message);
    }

    showSuccess(message) {
        console.log('Success:', message);
        alert(message);
    }
}