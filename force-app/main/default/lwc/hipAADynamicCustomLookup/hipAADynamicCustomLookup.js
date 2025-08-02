import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/HipAAUtilityClass.searchSpermBanks';

export default class HipAADynamicCustomLookup extends LightningElement {
    @api objectApiName;
    @api label = 'Search Records';
    @api placeholder = 'Search...';
    @track searchKey = '';
    @track searchResults = [];
    @track isOpen = false;
    @track isLoading = false;
    @track showNoResultsMessage = false;

    handleInputChange(event) {
        this.searchKey = event.target.value;
        this.showNoResultsMessage = false;
        if (this.searchKey.length >= 1) {
            this.isLoading = true;
            this.isOpen = true;
            searchRecords({ objectName: this.objectApiName, searchKey: this.searchKey })
                .then(result => {
                    this.searchResults = result;
                    this.isLoading = false;
                    if (this.searchResults.length === 0) {
                        this.showNoResultsMessage = true;
                        this.dispatchEvent(new CustomEvent('lookupnodata', {
                            detail: 'There is no match record found with these names you can click on + icon'
                        }));
                    } else {
                        this.showNoResultsMessage = false;
                    }
                })
                .catch(error => {
                    this.isLoading = false;
                    this.searchResults = [];
                    this.showNoResultsMessage = true;
                    this.dispatchEvent(new CustomEvent('lookupnodata', {
                        detail: 'There is no match record found with these names you can click on + icon'
                    }));
                    console.error('Error searching records:', error);
                });
        } else {
            this.searchResults = [];
            this.isOpen = false;
            this.showNoResultsMessage = false;
            this.dispatchEvent(new CustomEvent('lookupnodata', {
                detail: 'There is no match record found with these names you can click on + icon'
            }));
        }
    }

    handleInputClick() {
        if (this.searchKey.length >= 2 && this.searchResults.length > 0) {
            this.isOpen = true;
        }
    }

    handleInputBlur() {
        setTimeout(() => {
            this.isOpen = false;
        }, 200);
    }

    handleSelect(event) {
        const recordId = event.currentTarget.dataset.id;
        const recordName = event.currentTarget.dataset.name;
        this.searchKey = recordName;
        this.isOpen = false;
        this.showNoResultsMessage = false;
        this.dispatchEvent(new CustomEvent('lookupselect', {
            detail: { recordId, recordName }
        }));
    }
}