import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import CONFETTI from '@salesforce/resourceUrl/confettiLib';
export default class ConfettiCelebration extends LightningElement {
    confettiInitialized = false;

    renderedCallback() {
        if (this.confettiInitialized) return;
        this.confettiInitialized = true;

        loadScript(this, CONFETTI)
            .then(() => {
                this.launchFullscreenConfetti();
            })
            .catch(error => {
                console.error('Error loading confetti library', error);
            });
    }

    launchFullscreenConfetti() {
        const myConfetti = window.confetti.create(null, {
            resize: true,
            useWorker: true
        });

        myConfetti({
            particleCount: 500,
            spread: 200,
            origin: { y: 0.6 }
        });

        setTimeout(() => {
            myConfetti({
                particleCount: 200,
                spread: 120,
                origin: { y: 0.4 }
            });
        }, 800);
    }
}