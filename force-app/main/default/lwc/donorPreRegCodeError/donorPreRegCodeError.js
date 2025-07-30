import { LightningElement, track, api } from 'lwc';

export default class DonorPreRegCodeError extends LightningElement {

    @api contactObj;
    @track noMatchCode = []

    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        for (let i in this.contactObj.noMatchCodesList) {
            let codeObj = this.contactObj.noMatchCodesList[i].split("-");
            this.noMatchCode.push({ key: codeObj[0], value: codeObj[1], code: this.contactObj.noMatchCodesList[i], discard: false, newCode: { one: '', two: '', three: '', four: '', five: '', six: '' } });
        }
    }

    handleCodeErrorBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    handleCodeErrorNext() {
        const reEnteredCodes = [];
        const reEnteredCodesMap = [];
        for (let item of this.noMatchCode) {
            const values = Object.values(item.newCode);
            const code = values.join('');
            if (values.every(val => val && val.trim() !== '') && !item.discard) {
                reEnteredCodes.push(`${item.key}-${code}`);
                reEnteredCodesMap.push({ oldCode: item.key + '-' + item.value, newCode: `${item.key}-${code}` });
            }
        }
        this.contactObj['newCodeList'] = reEnteredCodes;
        this.contactObj['oldAndNewCodeMap'] = reEnteredCodesMap;
        console.log('this.contactObj Error Code >>> '+JSON.stringify(this.contactObj));
        this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
    }

    handleInputChange(event) {
        const index = parseInt(event.target.dataset.id);
        const pos = parseInt(event.target.dataset.index);
        const value = event.target.value;
        if (this.noMatchCode[index]) {
            let codeObj = this.noMatchCode[index].newCode;
            const fieldNames = ['one', 'two', 'three', 'four', 'five', 'six'];
            codeObj[fieldNames[pos]] = value;
            this.noMatchCode = [...this.noMatchCode];
            if (value && pos < 5) {
                const nextInput = this.template.querySelector(`input[data-id="${index}"][data-index="${pos + 1}"]`);
                if (nextInput) nextInput.focus();
            }
        }
    }

    handleKeyDown(event) {
        const index = parseInt(event.target.dataset.id);
        const pos = parseInt(event.target.dataset.index);
        const value = event.target.value;
        if (event.key === 'Backspace' && !value && pos > 0) {
            const prevInput = this.template.querySelector(`input[data-id="${index}"][data-index="${pos - 1}"]`);
            if (prevInput) prevInput.focus();
        }
    }

    handleCheckbox(event) {
        let index = event.target.dataset.index;
        this.noMatchCode[index].discard = event.target.checked;
        this.contactObj['bypassStep'] = event.target.checked; //added this line only to bypass
    }

}