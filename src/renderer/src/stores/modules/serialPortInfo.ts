import { defineStore } from "pinia";

export const useSerialPortInfo = defineStore('serialInfo', {
    state: () => ({
        receive: '',
        send: '',
    }),
    actions: {
        saveReceive(state: string) {
            return this.receive = state;
        },
        saveSend(state: string) {
            return this.send = state;
        }
    }
})