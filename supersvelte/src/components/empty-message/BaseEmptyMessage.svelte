<script lang="ts">
 import EmptyMessage from './EmptyMessage.svelte';
 import Button from '../button/Button.svelte';
 // Demo-only feedback: the original story's onClick was a no-op. Nothing is created and there is no navigation.
 let clicks = $state(0);
</script>
<EmptyMessage>
 <EmptyMessage part="Icon"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
<path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM16.2071 7.79289C16.4609 8.04664 16.5592 8.41691 16.4648 8.76312L14.9648 14.2631C14.8716 14.6047 14.6047 14.8716 14.2631 14.9648L8.76312 16.4648C8.41691 16.5592 8.04664 16.4609 7.79289 16.2071C7.53914 15.9534 7.44081 15.5831 7.53524 15.2369L9.03524 9.73688C9.1284 9.39527 9.39527 9.1284 9.73688 9.03524L15.2369 7.53524C15.5831 7.44081 15.9534 7.53914 16.2071 7.79289ZM10.8144 10.8144L9.92522 14.0748L13.1856 13.1856L14.0748 9.92522L10.8144 10.8144Z" fill="currentColor"/>
</svg></EmptyMessage>
 <EmptyMessage part="Title">Your evaluations will appear here</EmptyMessage>
 <EmptyMessage part="Description">Create an evaluation to assess your model's responses</EmptyMessage>
 <EmptyMessage part="ActionRow"><Button size="lg" onClick={() => clicks++}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="margin-right:-2px">
<path d="M12 3.59998C12.5891 3.59998 13.0666 4.07754 13.0666 4.66664V10.9333H19.3333C19.9224 10.9333 20.4 11.4109 20.4 12C20.4 12.5891 19.9224 13.0666 19.3333 13.0666H13.0666V19.3333C13.0666 19.9224 12.5891 20.4 12 20.4C11.4109 20.4 10.9333 19.9224 10.9333 19.3333V13.0666H4.66664C4.07754 13.0666 3.59998 12.5891 3.59998 12C3.59998 11.4109 4.07754 10.9333 4.66664 10.9333H10.9333V4.66664C10.9333 4.07754 11.4109 3.59998 12 3.59998Z" fill="currentColor"/>
</svg><span>Create</span></Button></EmptyMessage>
</EmptyMessage>
<p class="demo-status" role="status">{clicks ? `Demo: kliknięto Create (${clicks}×), bez tworzenia danych.` : 'Demo: Create nie tworzy danych.'}</p>
<style>.demo-status{margin:14px 0 0;font-size:12px;color:var(--color-text-secondary,#6b6b6b);text-align:center;}</style>
