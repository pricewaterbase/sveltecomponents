<script lang="ts">
 import {DateTime} from 'luxon';import DatePicker from './DatePicker.svelte';
 let value=$state<DateTime|null>(null);
</script>
<DatePicker id="BaseDatePicker" {value} onChange={(next)=>value=next} size="lg" clearable/>
<p class="value" role="status">{value?.toISODate()??'Brak wybranej daty'}</p>
<style>.value{font-size:12px;color:var(--muted,#888);font-family:Arial,Helvetica,sans-serif;text-align:center;margin-top:16px;}</style>
