<script lang="ts">
  import TreeNode from './tag-tree-node.svelte';
  import { type TagTreeData } from './types';

  interface Props {
    roots?: TagTreeData[];
    onClick?: (node: TagTreeData) => void;
  }

  let { roots = [], onClick }: Props = $props();

  console.log('roots', roots);
</script>

<!-- 用ob的样式 -->
<!-- <div class='tree-item tree-item-self'> -->
{#each roots as root (root.id)}
  <TreeNode
    node={root}
    onClick={(node) => {
      onClick?.(node);
    }}
  />
{/each}

<!-- </div> -->

<style lang="css">
</style>
