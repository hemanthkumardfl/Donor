import { LightningElement, track, api } from 'lwc';

export default class DonorPreRegIPEggDonor extends LightningElement {
    @api eggDonorsCount = 5;
    @track eggDonors = [];

    options = [
        { label: 'Clinic', value: 'Clinic' },
        { label: 'Donor Agency/Egg Bank', value: 'Donor' },
        { label: 'Attorney', value: 'Attorney' }
    ];

    connectedCallback() {
        this.initializeEggDonors();
    }

    // Initialize egg donors based on count
    initializeEggDonors() {
        this.eggDonors = [];
        for (let i = 0; i < this.eggDonorsCount; i++) {
            this.eggDonors.push({
                id: Date.now() + i + 1,
                donorNumber: i + 1,
                selectedOption: '',
                isClinicSelected: false,
                isDonorSelected: false,
                isAttorneySelected: false,
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
                    attorneyName: '',
                    attorneyEmail: '',
                    attorneyPhone: '',
                    additionalInfo: ''
                }
            });
        }
    }

    // Watch for changes to eggDonorsCount
    set eggDonorsCount(value) {
        this._eggDonorsCount = value;
        if (this._eggDonorsCount) {
            this.initializeEggDonors();
        }
    }

    get eggDonorsCount() {
        return this._eggDonorsCount || 1;
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        const section = event.target.dataset.section;
        const index = Number.parseInt(event.target.dataset.index, 10);
        const name = event.target.name;

        this.eggDonors = this.eggDonors.map((donor, i) => {
            if (i === index) {
                let updatedDonor = { ...donor };

                // Handle combobox selection
                if (name === 'donorSource') {
                    updatedDonor.selectedOption = event.target.value;
                    updatedDonor.isClinicSelected = updatedDonor.selectedOption === 'Clinic';
                    updatedDonor.isDonorSelected = updatedDonor.selectedOption === 'Donor';
                    updatedDonor.isAttorneySelected = updatedDonor.selectedOption === 'Attorney';
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
        this.eggDonors = this.eggDonors.map((donor, i) => {
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
            donorNumber: this.eggDonors.length + 1,
            selectedOption: '',
            isClinicSelected: false,
            isDonorSelected: false,
            isAttorneySelected: false,
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
                attorneyName: '',
                attorneyEmail: '',
                attorneyPhone: '',
                additionalInfo: ''
            }
        };
        this.eggDonors = [...this.eggDonors, newDonor];
        this._eggDonorsCount = this.eggDonors.length;
    }

    // Method to remove a donor
    @api
    removeDonor(donorId) {
        this.eggDonors = this.eggDonors.filter((donor) => donor.id !== donorId);
        this.eggDonors = this.eggDonors.map((donor, index) => ({
            ...donor,
            donorNumber: index + 1
        }));
        this._eggDonorsCount = this.eggDonors.length;
    }

    handleSpermBankInfoBack() {
        this.dispatchEvent(
            new CustomEvent('back', {
                detail: {
                    eggDonors: this.eggDonors
                }
            })
        );
    }

    handleSpermBankInfoNext() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input').forEach((input) => {
            const fieldName = input.dataset.field;
            const section = input.dataset.section;
            const value = input.value;

            // Validate required fields (e.g., clinic name if Clinic is selected)
            if (fieldName === 'name' && section === 'embryoProgram' && !value) {
                const index = Number.parseInt(input.dataset.index, 10);
                const donor = this.eggDonors[index];
                if (donor.isClinicSelected) {
                    input.setCustomValidity('Please enter the clinic name');
                    input.reportValidity();
                    isValid = false;
                }
            } else {
                input.setCustomValidity('');
                input.reportValidity();
            }
        });

        if (isValid) {
            this.dispatchEvent(
                new CustomEvent('next', {
                    detail: {
                        eggDonors: this.eggDonors
                    }
                })
            );
        }
    }
}