<script setup lang = "ts">
import {ref, onMounted} from 'vue';

import type {  AccountForm } from '@/types/account';
import { useAccountStore } from '@/stores/accountStore';


const accountStore = useAccountStore();


interface NewAccount extends AccountForm {
  id: string;
  labelsError?: string;
  typeError?: string;
  loginError?: string;
  passwordError?: string;
}

const accounts = ref<NewAccount[]>([]);

// date on load
onMounted(() => {
  accountStore.loadFromStorage();
  accounts.value = accountStore.accounts.map(acc => ({
    id: acc.id,
    labelsInput: acc.labels.map(l => l.text).join('; '),
    type: acc.type,
    login: acc.login,
    password: acc.password || '',
    labelsError: undefined,
    typeError: undefined,
    loginError: undefined,
    passwordError: undefined,
  }));

});


const addNewAccount = () => {
  const newAccount: NewAccount = {
    id: crypto.randomUUID(),
    labelsInput: '',
    type: 'Local',
    login: '',
    password: '',
  };
  accounts.value.push(newAccount);
  console.log(accounts.value);
};

// deleting the account
const removeAccount = (id: string) => {
  accounts.value = accounts.value.filter(a => a.id !== id);
  accountStore.removeAccount(id);
};

//validate markers 
const validateLabels = (account: NewAccount) => {
    if (account.labelsInput.length > 50){
        account.labelsError = 'Максимальная длина 50 символов';
        return false;
    }
    account.labelsError = undefined;
    validateAccount(account);
    return true;
}

//validate login 
const validateLogin = (account: NewAccount) => {
    if (!account.login.trim()){
        account.loginError = 'Логин обязателен';
        return false;
    }

    account.loginError = undefined;
    validateAccount(account);
    return true;
}

const validatePassword = (account: NewAccount) => {
    if(account.type === 'Local'){
        if(!account.password.trim()){
            account.passwordError = 'Пароль обязателен';
            return false;
        }
    }
    account.passwordError = undefined;
    validateAccount(account);
    return true;
}

//validation of account in general 
const validateAccount = (account: NewAccount) => {
    const isLabelsValid = validateLabels(account);
    const isLoginValid = validateLogin(account);
    let isPasswordValid = true;

    if(account.type === 'Local'){
        isPasswordValid = validatePassword(account);
    }

    if(isLabelsValid && isLoginValid && isPasswordValid){
        saveAccount(account);
    }
}


const validateData= (account: NewAccount) => {
    let error = false;
    if(account.type === 'LDAP'){
        account.password = '';
    }
    //validate markers 
    if (account.labelsInput.length > 50){
        account.labelsError = 'Максимальная длина 50 символов';
        error = true;
        return false;
    }
    account.labelsError = undefined;

    //validate login 
    if (!account.login.trim()){
        account.loginError = 'Логин обязателен';
        error = true;
        return false;
    }

    account.loginError = undefined;

    //validate password
    if(account.type === 'Local'){
        if(!account.password.trim()){
            account.passwordError = 'Пароль обязателен';
            error = true;
            return false;
        }
    }
    account.passwordError = undefined;

    if(!error)
        saveAccount(account);
}
//save data
const saveAccount = (account: NewAccount) => {
  const labels = accountStore.parseLabels(account.labelsInput);
  const password = account.type === 'Local' ? account.password : null;
  
  const accountData = {
    labels,
    type: account.type,
    login: account.login,
    password,
  };
  
  if (accountStore.accounts.some(a => a.id === account.id)) {
    accountStore.updateAccount(account.id, accountData);
  } else {
    console.log("add");
    accountStore.addAccount(accountData);
  }

}
</script>

<template>
    <h1>Учетные записи</h1>
    <button v-on:click="addNewAccount" class = "btn btn-primary">
        +
    </button>
    <span>
        Для указания нескольких меток для одной пары логин/пароль используйте разделитель:
    </span>

    <div class = "row">
        <div class="col-2">
            <span>Метки</span>
        </div>
        <div class="col-2">
            <span>Тип записи</span>
        </div>
        <div class="col-2">
            <span>Логин</span>
        </div>
        <div class="col-2">
            <span>Пароль</span>
        </div>

    </div>
    <div v-for="(account, index) in accounts" :key="account.id" class = "row pt-3">
        <div class="col-2">
            <input  class="form-control mr-3" v-model="account.labelsInput" maxlength = "50" v-on:blur = "validateData(account)">
            <span v-if="account.labelsError">{{ account.labelsError }}</span>
        </div>
       
        <div class="col-2">
            <select  class="form-control mx-3" v-model="account.type" v-bind:class="{ borderDanger: account.typeError }" v-on:change = "validateData(account)">
                <option value="Local">Локальная</option>
                <option value="LDAP">LDAP</option>
            </select>
            <span v-if="account.typeError">{{ account.typeError }}</span>
        </div>
       
        <div class="col-2">
            <input  class="form-control mx-3" type="text" v-bind:class="{ borderDanger: account.loginError }" v-model="account.login" v-on:blur = "validateData(account)">
            <span v-if="account.loginError">{{ account.loginError }}</span>
        </div>
        <div class="col-2">
            <div v-if="account.type === 'Local'">
                <input  class=" form-control ml-3" type="password" v-bind:class="{ borderDanger: account.passwordError }" v-model="account.password" maxlength = "100" v-on:blur = "validateData(account)">
                <small v-if="account.passwordError">{{ account.passwordError }}</small>
            </div>
        </div>
        
        
        <button v-on:click="removeAccount(account.id)" class = "btn btn-primary col-2">
            Удалить
        </button>
    </div>
</template>

<style scoped>
.borderDanger{
    border: 1px solid #dd4848;
}
</style>