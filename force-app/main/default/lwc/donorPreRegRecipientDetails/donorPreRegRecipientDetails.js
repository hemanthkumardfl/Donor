import { LightningElement, track, api } from 'lwc';
import deleteSpermJunction from '@salesforce/apex/SpermDonorPreRegistrationController.deleteSpermJunction';

export default class RecipientDetails extends LightningElement {
    @track recipients = [
        {
            id: Date.now(),
            RecipientNumber: 1,
            clinicHeading: '',
            recipient2FirstName: '',
            recipient2LastName: '',
            phone: '',
            email: '',
            additionalInfo: '',
            accountId : '',
            junctionId :'',
            contactId : ''
        }
    ];
   // @track showNumberedHeadings = false;
    @track noRecipientChecked = false;
    @track showDeletePopup = false;
    @track deleteIndex = null;
    @track deleteRecipientNumber = null;
    @api recipientUserInfoWithoutSDN;
    @api contactObj;

     connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        if(this.contactObj &&  this.contactObj['recipients'] && this.contactObj['recipients'].length > 0){
            this.recipients = this.contactObj['recipients'].map((bank, index) => {
                return {
                    ...bank,
                    RecipientNumber: index + 1,
                    knowDonorCode : bank.knowDonorCode
                };
            });
             this.noRecipientChecked = this.recipients[0]['noRecipientCheckedDisableInputs'];
            console.log(JSON.stringify(this.recipients));
        }
    }

    get disableAddAnotherRecipient() {
        let clsName = 'textcls addagencycls inputscls';
        if (this.noRecipientChecked) {
            clsName += ' disableAddAnotherClickCls';
        }
        return clsName;
    }

    get checkboxStatus() {
        return this.recipients.length > 1;
        //return true;
    }

    handleNoRecipientChange(event) {
        this.noRecipientChecked = event.target.checked;
        if (this.noRecipientChecked) {
            this.recipients[0] = {
                ...this.recipients[0],
                recipient2FirstName: '',
                recipient2LastName: '',
                phone: '',
                email: '',
                additionalInfo: ''
            };
        }
        this.recipients = [...this.recipients];
    }

    handleInputChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.name;
        this.recipients = this.recipients.map(recipient => 
            recipient.id === this.recipients[index].id
                ? { ...recipient, [field]: event.target.value }
                : recipient
        );
        const input = event.target;
        if (input.validity.valid) {
            input.setCustomValidity('');
            input.reportValidity();
        }
    }

    handleInputBlur(event) {
        const input = event.target;
        const fieldName = input.name;
        const value = input.value;
        const fieldsMap = new Map([
            //['recipient2FirstName', 'Please enter Recipient 2 first name'],
            ['recipient2LastName', 'Please enter Recipient 2 last name'],
            // ['phone', 'Please enter phone number'],
            // ['email', 'Please enter email'],
            // ['additionalInfo', 'Please enter additional information']
        ]);

        if (fieldsMap.has(fieldName)) {
            if (value === '' && !this.noRecipientChecked) {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        }
    }

    handleAddAnotherClick() {
       // this.showNumberedHeadings = true;
        this.noRecipientChecked = false;
        this.recipients.push({
            id: Date.now(),
            RecipientNumber: this.recipients.length + 1,
            clinicHeading: '',
            recipient2FirstName: '',
            recipient2LastName: '',
            phone: '',
            email: '',
            additionalInfo: ''
        });
        this.recipients = this.recipients.map((recipient, i) => ({
            ...recipient,
            RecipientNumber: i + 1,
            clinicHeading: ''
        }));
    }

    handleDeleteConfirm(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const recipient = this.recipients.find(recipient => recipient.id === this.recipients[index].id);
        this.deleteIndex = index;
        this.deleteRecipientNumber = recipient ? recipient.RecipientNumber : null;
        this.showDeletePopup = true;
    }

    get  showNumberedHeadings(){
        let result = false;
        if(this.recipients.length > 1){
            result = true;
        }
        return result;
    }

    async handleDeleteYes() {
        const index = this.deleteIndex;
        if(this.recipients[index].accountId){
            let resultData = await deleteSpermJunction({ spermbankId: this.recipients[index].junctionId }); 
            alert('Delete Recipient >>> ' + JSON.stringify(resultData));
            
        }
        this.recipients = this.recipients.filter((_, i) => i !== index);
        this.recipients = this.recipients.map((recipient, i) => ({
            ...recipient,
            RecipientNumber: i + 1,
            clinicHeading: this.recipients.length === 1 ? 'Recipient Details' : ''
        }));
        //this.showNumberedHeadings = this.recipients.length > 1;
        if (this.recipients.length === 1) {
            this.noRecipientChecked = false;
        }
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteRecipientNumber = null;
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteRecipientNumber = null;
    }

    handleRecipientDetailsNext() {
     try{
    
       this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
       console.log('this.contactObj>>>>>>>>>>>>>>>'+JSON.stringify(this.contactObj));
        if (this.noRecipientChecked) {
            this.recipients[0]['noRecipientChecked'] = true;
            this.contactObj['recipients'] = this.recipients;
            console.log(JSON.stringify(this.contactObj));
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }
        
        let isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(input => {
            const fieldName = input.name;
            const value = input.value;
            const fieldsMap = new Map([
                //['recipient2FirstName', 'Please enter Recipient 2 first name'],
                ['recipient2LastName', 'Please enter Recipient 2 last name'],
                // ['phone', 'Please enter phone number'],
                // ['email', 'Please enter email'],
                // ['additionalInfo', 'Please enter additional information']
            ]);

            if (fieldsMap.has(fieldName)) {
                if (value === '' && !this.noRecipientChecked) {
                    input.setCustomValidity(fieldsMap.get(fieldName));
                    input.reportValidity();
                    isValid = false;
                } else {
                    input.setCustomValidity('');
                    input.reportValidity();
                }
            }
        });

         if (isValid) {
            
                this.recipients[0]['noRecipientChecked'] = this.noRecipientChecked;
                this.recipients[0]['noRecipientCheckedDisableInputs'] = this.noRecipientChecked;
                this.contactObj['recipients'] = this.recipients
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj}));
         }
          }catch(e){
            console.log('error >>')
            console.log(e.message)
            console.log(e.stack)
        }
    }

    handleRecipientDetailsBack() {
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }
}