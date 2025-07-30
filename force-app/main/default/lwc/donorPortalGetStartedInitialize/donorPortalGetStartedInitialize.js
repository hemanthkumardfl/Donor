import { LightningElement } from 'lwc';

export default class DonorPortalGetStartedInitialize extends LightningElement {

    steps = [
        { id: 'createFamilyTree', title: 'Create Family Tree', duration: '2 minutes', credits: '30', buttonLabel: 'Start', buttonVariant: 'brand', disabled: false, index: 1 },
        { id: 'addFamilyTraits', title: 'Add Family Traits', duration: '10 minutes', credits: '20', buttonLabel: 'Next', buttonVariant: 'neutral', disabled: true, index: 2 },
        { id: 'familyHealthQuestionnaire', title: 'Family Health Questionnaire', duration: '15 minutes', credits: '30', buttonLabel: 'Next', buttonVariant: 'neutral', disabled: true, index: 3 },
        { id: 'additionalHealth', title: 'Additional Health Questions', duration: '20 minutes', credits: '30', buttonLabel: 'Next', buttonVariant: 'neutral', disabled: true, index: 4 },
        { id: 'personalHealth', title: 'Personal Health', duration: '20 minutes', credits: '30', buttonLabel: 'Next', buttonVariant: 'neutral', disabled: true, index: 5 },
        { id: 'discoverMemory', title: 'Discover Memory Box & Memory Exchange', duration: '2 minutes', credits: '5', buttonLabel: 'Next', buttonVariant: 'neutral', disabled: true, index: 6 },
        { id: 'donorStorageVault', title: 'Discover Storage Vault', duration: '5 minutes', credits: '5', buttonLabel: 'Next', buttonVariant: 'neutral', disabled: true, index: 7 }
    ];

    handleStepClick(event) {
        const stepId = event.target.dataset.id;
        console.log('Clicked:', stepId);
        // Logic to update progress or navigate
    }
}