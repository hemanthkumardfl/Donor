import { LightningElement ,track } from 'lwc';

export default class DonorPortalSettings extends LightningElement {

    @track nickname = 'Donor 21';
    @track donorId = 'D-789456';
    @track avatarUrl = 'https://www.lightningdesignsystem.com/assets/images/avatar1.jpg';
    @track permissions = [
        { id: 1, label: 'Dr. Smith (Medical)' },
        { id: 2, label: 'Agency Staff' }
    ];

    handleSaveNickname() {}
    handleCancelNickname() {}
}