<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="container">
    <v-head><title>{{ $t('ABOUT') }}</title></v-head>

    <p class="text">
      This web app is an <v-link text="open source" :to="gh" /> project that runs on <v-link text="Hades' Star" to="https://hadesstar.com/" /> parsed <v-link text="data" :to="`${gh}/tree/master/parser/raw`" /> owned by Parallel Space Inc.
      <br><br>
      Some game concepts made by Gabriel Björk Stiernström taken from <v-link text="his website" to="https://www.gabrielbjorkstiernstrom.com/#/projects/hades-star" />
      <br><br><br>
      If you have problems or suggestions, you can contact me on the discord <v-link text="userxinos" to="https://discord.com/users/359208482290925568" /> both on the <v-link text="official Hades' Star server" to="https://discord.gg/hadesstar" /> and via direct messages, as well as <v-link text="open an issue" :to="`${gh}/issues/new`" /> on GitHub
    </p>
    <br><br><br>
    <p class="min-text">
      made with ❤️ on GitHub
    </p>
  </div>
</template>

<script setup>
import { Head as VHead } from '@vueuse/head';
import { h } from 'vue';

const gh = 'https://github.com/userXinos/HadesSpace';

function VLink({ text, to }) {
    return h('a', {
        href: to,
        target: '_blank',
    }, text);
}
</script>

<style scoped lang="scss">
.container {
    max-width: 680px;
    margin-top: 5%;
    margin-left: auto;
    margin-right: auto;

    .text {
        font-size: 130%;
        margin: 0 6%;
    }
    .min-text {
        font-size: 80%;
        text-align: center;
    }
}
</style>
