import { LightningElement, track, api } from 'lwc';
import createSpermDonorRecipients from '@salesforce/apex/PreRegistrationController.createSpermDonorRecipients';
import deleteSpermDonorRecipient from '@salesforce/apex/PreRegistrationController.deleteSpermDonorRecipient';

export default class DonorPreRegIPRecipientDetails extends LightningElement {
    materialOptions = [
        { value: 'Yes', label: 'Yes'}, 
        { value: 'No', label: 'No'}
    ];

    @api contactObj;
    @api userDetails;

    @track recipientObj = {
        'index': 1, 
        "lastName": "", 
        "firstName": "", 
        "relation": "", 
        "email": "", 
        "phone": "", 
        "hasRecipient": "", 
        "doYouWantToLink": "",
        "accountId": "",
        "contactId": "",
        "junctionId": ""
    };

    @track recipientObjCloned = {
        'index': 1, 
        "lastName": "", 
        "firstName": "", 
        "relation": "", 
        "email": "", 
        "phone": "", 
        "hasRecipient": "", 
        "doYouWantToLink": "",
        "accountId": "",
        "contactId": "",
        "junctionId": ""
    };

    @track intendedParent = {
        'contribute': '', 
        'AdditionalCheckbox': ''
    };

    @track recipientsObjectsList = [this.recipientObj];
    @track additionalParentInfo = false;
    @track isLoading = false;
    @track deletingRecipientIndex = null;

    connectedCallback() {
        // Pre-fill form data from contactObj.recipientDetails if available
        if (this.contactObj?.recipientDetails) {
            this.intendedParent = {
                contribute: this.contactObj.recipientDetails.contribute || '',
                AdditionalCheckbox: this.contactObj.recipientDetails.additionalCheckbox || ''
            };
            this.additionalParentInfo = this.contactObj.recipientDetails.hasAdditional === 'Yes';
            if (this.contactObj.recipientDetails.recipients?.length > 0) {
                this.recipientsObjectsList = this.contactObj.recipientDetails.recipients.map((recipient, index) => ({
                    index: index + 1,
                    firstName: recipient.recipient2FirstName || '',
                    lastName: recipient.recipient2LastName || '',
                    relation: recipient.additionalInfo || '',
                    email: recipient.email || '',
                    phone: recipient.phone || '',
                    hasRecipient: recipient.hasRecipient || '',
                    doYouWantToLink: recipient.doYouWantToLink || '',
                    accountId: recipient.accountId || '',
                    contactId: recipient.contactId || '',
                    junctionId: recipient.junctionId || ''
                }));
            }
        }
    }

    get recipientsList() {
        return this.recipientsObjectsList;
    }

    get additionalparent() {
        this.intendedParent['AdditionalCheckbox'] = this.additionalParentInfo;
        return this.additionalParentInfo;
    }

    get showDeleteButton() {
        return this.recipientsObjectsList.length > 1;
    }

    handleIntendedParentChange(event) {
        this.intendedParent['contribute'] = event.target.value;
    }

    handleClick() {
        this.recipientsObjectsList.push({
            ...this.recipientObjCloned, 
            'index': this.recipientsObjectsList.length + 1
        });
        this.reindexRecipients();
    }

    handleDeleteRecipient(event) {
        const indexToDelete = parseInt(event.target.dataset.index);
        const recipientToDelete = this.recipientsObjectsList.find(r => r.index === indexToDelete);
        
        if (!recipientToDelete) {
            this.showError('Recipient not found');
            return;
        }

        if (recipientToDelete.accountId || recipientToDelete.contactId || recipientToDelete.junctionId) {
            this.deleteRecipientFromSalesforce(recipientToDelete, indexToDelete);
        } else {
            this.removeRecipientFromList(indexToDelete);
        }
    }

    deleteRecipientFromSalesforce(recipient, indexToDelete) {
        this.deletingRecipientIndex = indexToDelete;
        
        const deleteData = {
            accountId: recipient.accountId || '',
            contactId: recipient.contactId || '',
            junctionId: recipient.junctionId || ''
        };

        deleteSpermDonorRecipient({ 
            deleteDetails: JSON.stringify(deleteData) 
        })
        .then(result => {
            this.deletingRecipientIndex = null;
            
            if (result && result.success) {
                this.removeRecipientFromList(indexToDelete);
                this.showSuccess('Recipient deleted successfully');
            } else {
                this.showError(result?.message || 'Failed to delete recipient');
            }
        })
        .catch(error => {
            this.deletingRecipientIndex = null;
            console.error('Error deleting recipient:', error);
            this.showError('An error occurred while deleting recipient: ' + (error.body?.message || error.message));
        });
    }

    removeRecipientFromList(indexToDelete) {
        this.recipientsObjectsList = this.recipientsObjectsList.filter(recipient => recipient.index !== indexToDelete);
        this.reindexRecipients();
        
        if (this.recipientsObjectsList.length === 0) {
            this.recipientsObjectsList = [{...this.recipientObjCloned, 'index': 1}];
        }
    }

    reindexRecipients() {
        this.recipientsObjectsList = this.recipientsObjectsList.map((recipient, index) => {
            return { ...recipient, index: index + 1 };
        });
    }

    handleBackClick() {
        this.dispatchEvent(new CustomEvent('back', {
            detail: {
                message: true
            }
        }));
    }

    handleNextClick() {
        alert('111111111')
        // Validate required fields
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;

        try {
            // Prepare data for parent component
            const recipientData = {
                contribute: this.intendedParent['contribute'],
                hasAdditional: this.additionalParentInfo ? 'Yes' : 'No',
                additionalCheckbox: this.intendedParent['AdditionalCheckbox'],
                donorId: this.userDetails?.conid || '',
                recipients: this.prepareRecipientsData()
            };

            console.log('Dispatching recipient data:', JSON.stringify(recipientData));

            // Dispatch event to parent with recipient data
            this.dispatchEvent(new CustomEvent('next', {
                detail: {
                    message: 'Recipient details completed',
                    data: recipientData
                }
            }));

            this.isLoading = false;
        } catch (error) {
            this.isLoading = false;
            console.error('Error in handleNextClick:', error);
            this.showError('An unexpected error occurred: ' + error.message);
        }
    }

    prepareRecipientsData() {
        return this.recipientsObjectsList.map((recipient, index) => {
            return {
                RecipientNumber: (index + 1).toString(),
                recipient2FirstName: recipient.firstName || '',
                recipient2LastName: recipient.lastName || 'Recipient',
                email: recipient.email || '',
                phone: recipient.phone || '',
                additionalInfo: recipient.relation || '',
                hasRecipient: recipient.hasRecipient || '',
                doYouWantToLink: recipient.doYouWantToLink || false,
                accountId: recipient.accountId || '',
                contactId: recipient.contactId || '',
                junctionId: recipient.junctionId || ''
            };
        });
    }

    validateForm() {
        let isValid = true;
        let errorMessage = '';

        if (!this.intendedParent.contribute) {
            errorMessage += 'Please select whether you contributed genetic material.\n';
            isValid = false;
        }

        if (this.additionalParentInfo) {
            for (let i = 0; i < this.recipientsObjectsList.length; i++) {
                const recipient = this.recipientsObjectsList[i];
                
                if (!recipient.firstName) {
                    errorMessage += `Please enter first name for Recipient #${i + 1}.\n`;
                    isValid = false;
                }
                
                if (!recipient.email) {
                    errorMessage += `Please enter email for Recipient #${i + 1}.\n`;
                    isValid = false;
                }
                
                if (recipient.email && !this.isValidEmail(recipient.email)) {
                    errorMessage += `Please enter a valid email for Recipient #${i + 1}.\n`;
                    isValid = false;
                }
            }
        }

        if (!isValid) {
            this.showError(errorMessage);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(message) {
        console.error('Error:', message);
        alert(message);
    }

    showSuccess(message) {
        console.log('Success:', message);
        alert(message);
    }

    handleAdditionalYesCheckBoxChange(event) {
        if (event.target.checked) {
            this.additionalParentInfo = true;
            this.template.querySelector('.noaddparentcheckbox').checked = false;
        }
    }

    handleAdditionalNoCheckBoxChange(event) {
        this.template.querySelector('.yesaddparentcheckbox').checked = false;
        if (event.target.checked) {
            this.additionalParentInfo = false;
        }
    }

    handleRecipientInputChange(event) {
        let eventInfo = event.target;
        const index = parseInt(eventInfo.dataset.index) - 1;
        const fieldName = eventInfo.dataset.name;

        if (fieldName === "doYouWantToLinkYes") {
            if (eventInfo.checked) {
                const noRadio = this.template.querySelector(`[data-name="doYouWantToLinkNo"][data-index="${eventInfo.dataset.index}"]`);
                if (noRadio) noRadio.checked = false;
            }
            this.recipientsObjectsList[index]['doYouWantToLink'] = eventInfo.checked;
        } else if (fieldName === "doYouWantToLinkNo") {
            if (eventInfo.checked) {
                const yesRadio = this.template.querySelector(`[data-name="doYouWantToLinkYes"][data-index="${eventInfo.dataset.index}"]`);
                if (yesRadio) yesRadio.checked = false;
            }
            this.recipientsObjectsList[index]['doYouWantToLink'] = false;
        } else {
            this.recipientsObjectsList[index][fieldName] = eventInfo.value;
        }

        console.log('Updated recipients list:', JSON.stringify(this.recipientsObjectsList));
    }
}