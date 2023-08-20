<script lang="ts">
  import '../../uno.css'
  export let tag: string = '';
  export let count: number = 0;
</script>


<div class={'text-gray-500 timeline-event-tag-title w-full flex flex-1 justify-between'}>
  <span>{tag} </span>
  <span>{count}</span>
</div>


<style lang='css'>

  .timeline-event-tag-title:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>
