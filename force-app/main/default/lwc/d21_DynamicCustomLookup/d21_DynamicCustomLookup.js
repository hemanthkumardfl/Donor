import { LightningElement, api } from 'lwc';
import fetchRecords from '@salesforce/apex/UtilityClass.fetchRecords';
/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 500;

export default class D21_DynamicCustomLookup extends LightningElement {
    @api helpText = "custom search lookup";
    @api label = "Parent Account";
    @api required;
    @api selectedIconName = "standard:account";
    @api objectLabel = "Account";
    @api lookupPlaceholder;
    @api isDisabled;
    @api recordTypeName;

    recordsList = [];
    selectedRecordName;

    @api objectApiName = "Account";
    @api fieldApiName = "Name";
    @api otherFieldApiName = "Industry";
    @api searchString = "";
    @api selectedRecordId = "";
    @api parentRecordId;
    @api parentFieldApiName;

    preventClosingOfSerachPanel = false;

    get methodInput() {
        return {
            objectApiName: this.objectApiName,
            fieldApiName: this.fieldApiName,
            otherFieldApiName: this.otherFieldApiName,
            searchString: this.searchString,
            selectedRecordId: this.selectedRecordId,
            parentRecordId: this.parentRecordId,
            parentFieldApiName: this.parentFieldApiName
        };
    }

    get showRecentRecords() {
        if (!this.recordsList) {
            return false;
        }
        return this.recordsList.length > 0;
    }

    @api
    set selectedCoordinatorRecordName(value) {
        console.log('recordIdUpdateValueFromParent >>>' + JSON.stringify(value))
        let recordIdUpdateValueFromParent = value.coordinatorId;
        if (recordIdUpdateValueFromParent && value.isAllow == true) {
            this.selectedRecordId = recordIdUpdateValueFromParent;
            this.fetchSobjectRecords(true);
        }
    }
    get selectedCoordinatorRecordName(){
        return this.selectedRecordId;
    }



    @api
    set selectedRecordIdChange(value) {
        console.log('>>>' + JSON.stringify(value))
         console.log(JSON.stringify(value))
        if (value) {
            this.selectedRecordId = value;
            this.fetchSobjectRecords(true);
        }
    }

    get selectedRecordIdChange() {
        return this.selectedRecordId;
    }

    //getting the default selected record
    connectedCallback() {
        if (this.selectedRecordId) {
            this.fetchSobjectRecords(true);
        }
    }

    //call the apex method
    fetchSobjectRecords(loadEvent) {
        fetchRecords({
            inputWrapper: this.methodInput, recordTypeName : this.recordTypeName
        }).then(result => {
            if (loadEvent && result) {
                this.selectedRecordName = result[0].mainField;
            } else if (result) {
                this.recordsList = JSON.parse(JSON.stringify(result));
            } else {
                this.recordsList = [];
            }
            console.log('!!(this.recordsList.length > 0 || this.selectedRecordName) >>> '+!!(this.recordsList.length > 0 || this.selectedRecordName));
            const selectedEvent = new CustomEvent('lookupdata', {
                detail: !!(this.recordsList.length > 0 || this.selectedRecordName)
            });
            this.dispatchEvent(selectedEvent);
        }).catch(error => {
            console.log(error);
        })
    }

    get isValueSelected() {
        return this.selectedRecordId;
    }

    //handler for calling apex when user change the value in lookup
    handleChange(event) {
        this.searchString = event.target.value;
        this.fetchSobjectRecords(false);
    }

    //handler for clicking outside the selection panel
    handleBlur() {
        this.recordsList = [];
        this.preventClosingOfSerachPanel = false;
    }

    //handle the click inside the search panel to prevent it getting closed
    handleDivClick() {
        this.preventClosingOfSerachPanel = true;
    }

    //handler for deselection of the selected item
    handleCommit() {
        this.selectedRecordId = "";
        this.selectedRecordName = "";
    }

    //handler for selection of records from lookup result list
    handleSelect(event) {
        let selectedRecord = {
            mainField: event.currentTarget.dataset.mainfield,
            subField: event.currentTarget.dataset.subfield,
            id: event.currentTarget.dataset.id
        };
        this.selectedRecordId = selectedRecord.id;
        this.selectedRecordName = selectedRecord.mainField;
        this.recordsList = [];
        // Creates the event
        const selectedEvent = new CustomEvent('valueselected', {
            detail: selectedRecord
        });
        //dispatching the custom event
        this.dispatchEvent(selectedEvent);
    }

    //to close the search panel when clicked outside of search input
    handleInputBlur(event) {
        // Debouncing this method: Do not actually invoke the Apex call as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        window.clearTimeout(this.delayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            if (!this.preventClosingOfSerachPanel) {
                this.recordsList = [];
            }
            this.preventClosingOfSerachPanel = false;
        }, DELAY);
    }

}