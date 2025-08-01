import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/UtilityClass.searchRecords';
 
export default class D21_DynamicCustomLookup extends LightningElement {
    @api objectApiName; // e.g., 'Account'
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api accountId;
    @api selectedValue;
 
    @api searchKey = '';
    @track records = [];

 
    handleInputChange(event) {
        this.searchKey = event.target.value;
        this.search();
    }
 
    handleFocus() {
        if (this.searchKey) {
            this.search();
        }
    }

    get recordsList(){
        return this.records.length > 0 ? true : false;
    }
 
    search() {
        searchRecords({ searchKey: this.searchKey, objectApiName: this.objectApiName, accountId : this.accountId })
            .then(result => {
                this.records = result;
                if(this.records.length == 0){
                    console.log('>>>')
                    const selectedEvent = new CustomEvent('lookupnodata', {
                        detail: "Records Not available"
                    });
                    this.dispatchEvent(selectedEvent);
                }
                console.log(JSON.stringify(this.records))
            })
            .catch(error => {
                console.error('Search error: ', error);
            });
    }
 
    handleSelect(event) {
        const recordId = event.currentTarget.dataset.id;
        const recordName = event.currentTarget.dataset.name;
 
        this.searchKey = recordName;
        this.records = [];
 
        const selectedEvent = new CustomEvent('lookupselect', {
            detail: { recordId, recordName }
        });
        this.dispatchEvent(selectedEvent);
    }
}