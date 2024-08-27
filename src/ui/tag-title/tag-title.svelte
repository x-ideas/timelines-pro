<script lang="ts">
  // import '../../uno.css'
  import { type TagTreeData } from '../tag-tree/types';
  export let tag: string = '';
  export let count: number = 0;
  export let node: TagTreeData;
  export let onClick: (node: TagTreeData) => void
</script>

 <!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={' text-gray-500 timeline-event-tag-title w-full flex flex-1 justify-between timeline-event-tag-wrapper'} on:click={(event) => {
  onClick(node)
}} role='button' tabindex="-1" data-full-name={node.fullName}>
  <span>{tag} </span>
  <span>{count}</span>
</div>


<style lang='css'>

  .timeline-event-tag-title:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>
