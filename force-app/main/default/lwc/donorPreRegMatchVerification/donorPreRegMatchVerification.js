import { LightningElement, track, api } from 'lwc';
export default class DonorPreRegMatchVerification extends LightningElement {

    @api contactObj;
    @track showCopySuccess = false;
    @track donorId = '';
    connectedCallback() {
        this.donorId = this.contactObj.DonorCodeSpecial || '';
      /*  this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        console.log(JSON.stringify(this.contactObj));*/
    }

    handleMatchVerificationBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    handleMatchVerificationNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }
async handleCopyDonorId() {
        try {
            await navigator.clipboard.writeText(this.donorId);
            this.showCopySuccess = true;

            // Hide success message after 2 seconds
            setTimeout(() => {
                this.showCopySuccess = false;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy donor ID:', error);
            // Fallback for older browsers
            this.fallbackCopyTextToClipboard(this.donorId);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showCopySuccess = true;
                setTimeout(() => {
                    this.showCopySuccess = false;
                }, 2000);
            } else {
                console.error('Fallback: Copying text command was unsuccessful');
            }
        } catch (err) {
            console.error('Fallback: Unable to copy', err);
        }

        document.body.removeChild(textArea);
    }
}