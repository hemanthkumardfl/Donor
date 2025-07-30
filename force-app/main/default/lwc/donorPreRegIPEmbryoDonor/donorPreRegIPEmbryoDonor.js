import { LightningElement, track, api } from 'lwc';

export default class DonorPreRegIPEmbryoDonor extends LightningElement {
  @api embryoDonorsCount = 5; // This can be set from parent component
  @track embryoDonors = [];

  connectedCallback() {
    this.initializeEmbryoDonors();
  }

  // Initialize embryo donors based on count
  initializeEmbryoDonors() {
    this.embryoDonors = [];
    for (let i = 0; i < this.embryoDonorsCount; i++) {
      this.embryoDonors.push({
        id: Date.now() + i + 1,
        donorNumber: i + 1,
        embryoProgram: {
          name: '',
          website: '',
          phone: '',
          cityState: '',
          coordinatorName: '',
          coordinatorEmail: '',
        },
        clinic: {
          name: '',
          website: '',
          phone: '',
          cityState: '',
          coordinatorName: '',
          coordinatorEmail: '',
        },
        family: {
          firstName: '',
          lastName: '',
          additionalFirstName: '',
          additionalLastName: '',
          email: '',
          phone: '',
        },
      });
    }
  }

  // Watch for changes to embryoDonorsCount
  set embryoDonorsCount(value) {
    this._embryoDonorsCount = value;
    if (this._embryoDonorsCount) {
      this.initializeEmbryoDonors();
    }
  }

  get embryoDonorsCount() {
    return this._embryoDonorsCount || 5;
  }

  handleChange(event) {
    const field = event.target.dataset.field;
    const section = event.target.dataset.section;
    const index = Number.parseInt(event.target.dataset.index, 10);

    // Update the specific donor's section based on index and data-section
    this.embryoDonors = this.embryoDonors.map((donor, i) => {
      if (i === index) {
        return {
          ...donor,
          [section]: {
            ...donor[section],
            [field]: event.target.value,
          },
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
      donorNumber: this.embryoDonors.length + 1,
      embryoProgram: {
        name: '',
        website: '',
        phone: '',
        cityState: '',
        coordinatorName: '',
        coordinatorEmail: '',
      },
      clinic: {
        name: '',
        website: '',
        phone: '',
        cityState: '',
        coordinatorName: '',
        coordinatorEmail: '',
      },
      family: {
        firstName: '',
        lastName: '',
        additionalFirstName: '',
        additionalLastName: '',
        email: '',
        phone: '',
      },
    };
    this.embryoDonors = [...this.embryoDonors, newDonor];
    this._embryoDonorsCount = this.embryoDonors.length;
  }

  // Method to remove a donor
  @api
  removeDonor(donorId) {
    this.embryoDonors = this.embryoDonors.filter((donor) => donor.id !== donorId);
    // Update donor numbers after removal
    this.embryoDonors = this.embryoDonors.map((donor, index) => ({
      ...donor,
      donorNumber: index + 1,
    }));
    this._embryoDonorsCount = this.embryoDonors.length;
  }

  handleSpermBankInfoBack() {
    this.dispatchEvent(
      new CustomEvent('back', {
        detail: {
          embryoDonors: this.embryoDonors,
        },
      })
    );
  }

  handleSpermBankInfoNext() {
    // Basic validation for required fields
    let isValid = true;
    this.template.querySelectorAll('lightning-input').forEach((input) => {
      const fieldName = input.dataset.field;
      const section = input.dataset.section;
      const value = input.value;

      // Validate required fields (e.g., embryoProgram.name)
      if (fieldName === 'name' && section === 'embryoProgram' && !value) {
        input.setCustomValidity('Please enter the name of the embryo program');
        input.reportValidity();
        isValid = false;
      } else {
        input.setCustomValidity('');
        input.reportValidity();
      }
    });

    if (isValid) {
      this.dispatchEvent(
        new CustomEvent('next', {
          detail: {
            embryoDonors: this.embryoDonors,
          },
        })
      );
    }
  }
}