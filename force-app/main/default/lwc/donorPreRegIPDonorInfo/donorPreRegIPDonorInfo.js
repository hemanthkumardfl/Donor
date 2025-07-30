import { LightningElement, api, track } from 'lwc';
import createSpermDonorRecipients from '@salesforce/apex/PreRegistrationController.createSpermDonorRecipients';
//import createSpermDonornocode from '@salesforce/apex/PreRegistrationController.createSpermDonornocode';
export default class DonorPreRegIPDonorInfo extends LightningElement {
    @api contactObj = {
        recipientDetails: {}, 
        spermDonorDetails: {},
        embryoDonorDetails: {},
        eggDonorDetails: {}
    };
    
    @track showrecipient = false;
    @track showsperm = false;
    @track showEmbroy = false;
    @track showEgg = false;
    @track isLoading = false;

    connectedCallback() {
        this.showrecipient = true;
    }

    handlerecipientNext(event) {
        alert('11111222111')
        this.isLoading = true;
        const recipientData = event.detail.data || {};

        // Update contactObj with recipient details
        this.contactObj = {
            ...this.contactObj,
            RecipientDetails: { ...recipientData }
        };
        console.log('Updated contactObj with recipient details:', JSON.stringify(this.contactObj));

        // Call Apex to create/save recipient data
        createSpermDonorRecipients({
            RecipientDetails: JSON.stringify(recipientData)
        })
        .then(result => {
            this.isLoading = false;
            alert('55555555');
            if (result && result.success) {
                console.log('Recipient data created successfully:', result);
                this.showSuccess('Recipient information saved successfully');

                // Update contactObj with Salesforce IDs from result, if provided
               /* if (result.accountMap || result.contactMap || result.junctionMap) {
                    this.contactObj.recipientDetails = {
                        ...this.contactObj.recipientDetails,
                        recipients: this.contactObj.recipientDetails.recipients.map((recipient, index) => {
                            const recipientNumber = (index + 1).toString();
                            return {
                                ...recipient,
                                accountId: result.accountMap?.[recipientNumber] || recipient.accountId || '',
                                contactId: result.contactMap?.[recipientNumber] || recipient.contactId || '',
                                junctionId: result.junctionMap?.[recipientNumber] || recipient.junctionId || ''
                            };
                        })
                    };
                }*/
                 alert('11111111');
                // Navigate to sperm donor section
                this.showrecipient = false;
                this.showsperm = true;
            } else {
                this.showError(result?.message || 'Failed to save recipient information');
            }
        })
        .catch(error => {
            this.isLoading = false;
            console.error('Error saving recipient data:', error);
            this.showError('An error occurred while saving recipient information: ' + (error.body?.message || error.message));
        });
    }



    handleCodespermNext(event) {
        this.isLoading = true;
        const spermDonorData = event.detail.data || {};

        // Update contactObj with sperm donor details
        this.contactObj = {
            ...this.contactObj,
            spermDonorDetails: { ...spermDonorData }
        };
        console.log('Updated contactObj with sperm donor details:', JSON.stringify(this.contactObj));

        // Call Apex to create/save sperm donor data
        createSpermDonorRecipients({
            RecipientDetails: JSON.stringify({ spermDonorDetails: spermDonorData })
        })
        .then(result => {
            this.isLoading = false;
            if (result && result.success) {
                console.log('Sperm donor data created successfully:', result);
                this.showSuccess('Sperm donor information saved successfully');

                // Navigate to embryo donor section
                this.showsperm = false;
                this.showEmbroy = true;
            } else {
                this.showError(result?.message || 'Failed to save sperm donor information');
            }
        })
        .catch(error => {
            this.isLoading = false;
            console.error('Error saving sperm donor data:', error);
            this.showError('An error occurred while saving sperm donor information: ' + (error.body?.message || error.message));
        });
    }

    handleembryoNext(event) {
        this.isLoading = true;
        const embryoDonorData = event.detail.data || {};

        // Update contactObj with embryo donor details
        this.contactObj = {
            ...this.contactObj,
            embryoDonorDetails: { ...embryoDonorData }
        };
        console.log('Updated contactObj with embryo donor details:', JSON.stringify(this.contactObj));

        // Call Apex to create/save embryo donor data
        createSpermDonorRecipients({
            RecipientDetails: JSON.stringify({ embryoDonorDetails: embryoDonorData })
        })
        .then(result => {
            this.isLoading = false;
            if (result && result.success) {
                console.log('Embryo donor data created successfully:', result);
                this.showSuccess('Embryo donor information saved successfully');

                // Navigate to egg donor section
                this.showEmbroy = false;
                this.showEgg = true;
            } else {
                this.showError(result?.message || 'Failed to save embryo donor information');
            }
        })
        .catch(error => {
            this.isLoading = false;
            console.error('Error saving embryo donor data:', error);
            this.showError('An error occurred while saving embryo donor information: ' + (error.body?.message || error.message));
        });
    }

    handleeggNext(event) {
        this.isLoading = true;
        const eggDonorData = event.detail.data || {};

        // Update contactObj with egg donor details
        this.contactObj = {
            ...this.contactObj,
            eggDonorDetails: { ...eggDonorData }
        };
        console.log('Updated contactObj with egg donor details:', JSON.stringify(this.contactObj));

        // Call Apex to create/save egg donor data
        createSpermDonorRecipients({
            RecipientDetails: JSON.stringify({ eggDonorDetails: eggDonorData })
        })
        .then(result => {
            this.isLoading = false;
            if (result && result.success) {
                console.log('Egg donor data created successfully:', result);
                this.showSuccess('Egg donor information saved successfully');

                // Complete the flow (no further navigation)
                this.showEgg = false;
            } else {
                this.showError(result?.message || 'Failed to save egg donor information');
            }
        })
        .catch(error => {
            this.isLoading = false;
            console.error('Error saving egg donor data:', error);
            this.showError('An error occurred while saving egg donor information: ' + (error.body?.message || error.message));
        });
    }

    handleCoderecipientBack() {
        this.showrecipient = false;
    }

    handleCodespermBack() {
        this.showsperm = false;
        this.showrecipient = true;
    }

    handleCodeembryoBack() {
        this.showEmbroy = false;
        this.showsperm = true;
    }

    handleeggBack() {
        this.showEgg = false;
        this.showEmbroy = true;
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