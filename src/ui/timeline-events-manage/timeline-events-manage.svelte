<script lang="ts">
  import '../../uno.css'
  // export let tabs: string[];
  export let tags: string[] | undefined;

  export let names: string[] | undefined;

  // 标签个数统计
  export let tagCountMap: Map<string, number> = new Map<string, number>();
  // 名字个数统计
  export let nameCountMap: Map<string, number> = new Map<string, number>();

  export let onTagClick: (tag: string) => void;

  export let onNameClick: (name: string) => void;

</script>


  <div class='timeline-event-head'>EventTags</div>
  {#each (tags??[]) as tag}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="timeline-event-tag-wrapper text-gray-500" on:click={() => {
      onTagClick(tag)
    }}><span class='tag'>{tag}</span>
    <div class='ml-auto'>{tagCountMap.get(tag) ?? 0}</div>
  </div>
  {/each}

  <hr class='mt-2 mb-2' />
  <div class='timeline-event-head'>EventNames</div>
  {#each (names??[]) as name}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="timeline-event-tag-wrapper text-gray-500" on:click={() => {
      onNameClick(name)
    }}><span class='tag'>{name}</span>
    <div class='ml-auto'>{nameCountMap.get(name) ?? 0}</div>
  </div>
  {/each}



<style lang='css'>
  .timeline-event-head {
    font-size: 16px;

  }

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
