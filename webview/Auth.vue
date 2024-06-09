<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useEvents } from '../../../../webview/composables/useEvents';
import { AuthEvents } from '../shared/authEvents';
import '../translate/index'; // Import translations
import { useTranslate } from '@Shared/translate';

const { t } = useTranslate('en');

const events = useEvents();
const isInvalid = ref(false);

function init() {
    events.on(AuthEvents.fromServer.invalidLogin, () => {
        isInvalid.value = true;
    });

    events.on(AuthEvents.fromServer.invalidRegister, () => {
        isInvalid.value = true;
    });
}

onMounted(init)
</script>

<template>
    <div class="flex items-center justify-center w-screen h-screen overflow-hidden text-neutral-950">
        <div class="flex items-center justify-center w-screen h-screen overflow-hidden text-neutral-950">
            <div class="bg-neutral-50 p-12 rounded-lg shadow-lg w-1/2">
                <div class="flex flex-row gap-6">
                    <div class="flex flex-col w-1/4">
                        <span class="text-red-800" v-if="isInvalid">{{ t('auth.loading.failed') }}</span>
                        <span class="text-blue-800" v-else>{{ t('auth.loading.discord') }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
