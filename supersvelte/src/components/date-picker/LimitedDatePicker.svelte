<script lang="ts">
 import {DateTime} from 'luxon';import DatePicker from './DatePicker.svelte';
 const today=DateTime.local();const min=today.minus({days:30}).startOf('day');const max=today.plus({days:30}).endOf('day');let value=$state<DateTime|null>(today);
</script>
<DatePicker id="LimitedDatePicker" {value} onChange={(next)=>value=next} size="lg" {min} {max}/>
<p class="value" role="status">{value?.toISODate()??'Brak wybranej daty'}</p>
<style>.value{font-size:12px;color:var(--muted,#888);font-family:Arial,Helvetica,sans-serif;text-align:center;margin-top:16px;}</style>
