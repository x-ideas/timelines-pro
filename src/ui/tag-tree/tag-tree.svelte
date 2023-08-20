<script lang="ts">
  import TreeNode from './tag-tree-node.svelte';
  import { TagTreeData } from './types';

  export let roots: TagTreeData[] = [];
</script>

<!-- 用ob的样式 -->
<!-- <div class='tree-item tree-item-self'> -->
  {#each roots as root}
    <TreeNode node={root} level={0}/>
  {/each}
<!-- </div> -->


<style lang='css'>
</style>
