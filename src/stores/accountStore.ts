import { defineStore } from 'pinia';
import {ref, computed} from 'vue';
import type { Account, LabelItem } from '@/types/account';


export const useAccountStore = defineStore('accounts', ()=>{
    const accounts = ref<Account[]>([]);

    const loadFromStorage = () => {
        const saved = localStorage.getItem('accounts');
        if (saved){
            accounts.value = JSON.parse(saved);
        }
    };

    const saveToStorage = () => {
        localStorage.setItem('accounts', JSON.stringify(accounts.value));
    };

    const addAccount = (account: Omit<Account, 'id'>) => {
        accounts.value.push({
            ...account,
            id: crypto.randomUUID(),
        });
        saveToStorage();
    }

    const updateAccount = (id: string, account: Omit<Account,'id'>) => {
        const index = accounts.value.findIndex(a=> a.id === id);
        if(index !== -1){
            accounts.value[index] = {...account, id};
            saveToStorage();
        }
    };

    const removeAccount = (id: string) => {
        accounts.value = accounts.value.filter(a => a.id !== id);
        saveToStorage();
    }

    const parseLabels = (labelsInput: string): LabelItem[] => {
        if(!labelsInput.trim()) return[];
        return labelsInput.split(';').map(label => label.trim()).filter(label => label.length > 0).map(label => ({text: label}));
    };

    return {
        accounts, 
        loadFromStorage,
        addAccount,
        updateAccount,
        removeAccount,
        parseLabels,
    }
})