<script lang="ts">
  import '../../uno.css'
  // export let tabs: string[];
  export let tags: string[] | undefined;

  // 标签个数统计
  export let tagCountMap: Map<string, number> = new Map<string, number>();
  export let onClick: (tag: string) => void;

  // let currentTab: string = tabs[0];
</script>




  {#each (tags??[]) as tag}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="timeline-event-tag-wrapper text-gray-500" on:click={() => {
      onClick(tag)
    }}><span class='tag'>{tag}</span>
    <div class='ml-auto'>{tagCountMap.get(tag) ?? 0}</div>
  </div>
  {/each}



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
