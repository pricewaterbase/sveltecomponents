<script lang="ts">
 import {DateTime} from 'luxon';import DatePicker from './DatePicker.svelte';
 let value=$state<DateTime|null>(DateTime.local());
</script>
<DatePicker id="DisabledDatePicker" {value} onChange={(next)=>value=next} disabled/>
<p class="value" role="status">{value?.toISODate()??'Brak wybranej daty'}</p>
<style>.value{font-size:12px;color:var(--muted,#888);font-family:Arial,Helvetica,sans-serif;text-align:center;margin-top:16px;}</style>
