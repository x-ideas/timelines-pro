<script lang="ts">
  import '../../uno.css'
  export let tags: string[] | undefined;
  export let onClick: (tag: string) => void;
</script>


<div class="number">
  {#each (tags??[]) as tag}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="timeline-event-tag-wrapper" on:click={() => {
      onClick(tag)
    }}>{tag}</div>
  {/each}
</div>


<style lang='css'>
  .timeline-event-tag-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 4px;
  }

  .timeline-event-tag-wrapper:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>
