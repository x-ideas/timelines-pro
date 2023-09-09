<script lang="ts">
  import { TagTreeData } from "./types";
  import Title from '../tag-title/tag-title.svelte'
  import { createEventDispatcher } from "svelte";

  export let node: TagTreeData;

  export let open: boolean = false;

  /** 打开/关闭 */
  // export let onToggle: ((open: boolean) => void) | undefined;
  export let onClick: ((node: TagTreeData) => void) | undefined;


  const dispatch = createEventDispatcher();

  let innerOpen: boolean;
  $: {
    innerOpen = open;
  }

  function toggle() {
    innerOpen = !innerOpen;
    dispatch('toggle', {
      open: innerOpen,
    })
  }
</script>



<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<div class="tree-item">
  <div class="tree-item-self is-clickable mod-collapsible" style="margin-left: 0px !important; padding-left: 24px !important;">
    {#if node.children && node.children.length > 0}
      <!-- 用ob的样式 -->
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
      <div role='button' class={`tree-item-icon collapse-icon   ${innerOpen? '': 'is-collapsed'}`} tabindex="-1" on:click={toggle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon right-triangle"><path d="M3 8L12 17L21 8"></path></svg>
      </div>
    {/if}
    <Title onClick={(_node) => {
      onClick?.(_node);
    }} node={node} tag={node.name} count={node.count}></Title>
  </div>


    {#if innerOpen && node.children && node.children.length > 0}
    <div class='tree-item-children'>
      {#each node.children as child}
          <svelte:self node={child} onClick={(_node) => {
            onClick?.(_node)
      }}/>
      {/each}
    </div>

    {/if}
</div>






<style lang='css'>
</style>
