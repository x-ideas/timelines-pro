<script lang="ts">
  import { type TagTreeData } from './types';
  import Title from '../tag-title/tag-title.svelte';
  import Self from './tag-tree-node.svelte';

  interface Props {
    /** 节点数据 */
    node: TagTreeData;
    /** 是否打开 */
    open?: boolean;
    /** 点击事件 */
    onClick?: (node: TagTreeData) => void;
    /** 展开/关闭切换的回调事件 */
    onChange?: (open: boolean) => void;
  }
  let { node, open, onClick, onChange }: Props = $props();

  // const dispatch = createEventDispatcher();

  let innerOpen = $derived(open);

  function toggle() {
    innerOpen = !innerOpen;
    onChange?.(innerOpen);
    // dispatch('toggle', {
    //   open: innerOpen,
    // });
  }
</script>

<div class="tree-item">
  <div
    class="tree-item-self is-clickable mod-collapsible"
    style="margin-left: 0px !important; padding-left: 24px !important;"
  >
    {#if node.children && node.children.length > 0}
      <!-- 用ob的样式 -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        role="button"
        class={`tree-item-icon collapse-icon   ${innerOpen ? '' : 'is-collapsed'}`}
        tabindex="-1"
        onclick={toggle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="svg-icon right-triangle"><path d="M3 8L12 17L21 8"></path></svg
        >
      </div>
    {/if}
    <Title
      onClick={(_node) => {
        onClick?.(_node);
      }}
      {node}
      tag={node.name}
      count={node.count}
    ></Title>
  </div>

  {#if innerOpen && node.children && node.children.length > 0}
    <div class="tree-item-children">
      {#each node.children as child (child.id)}
        <Self
          node={child}
          onClick={(_node: TagTreeData) => {
            onClick?.(_node);
          }}
        />
      {/each}
    </div>
  {/if}
</div>

<style lang="css">
</style>
