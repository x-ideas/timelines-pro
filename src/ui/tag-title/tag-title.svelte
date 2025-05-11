<script lang="ts">
  // import '../../uno.css'
  import { type TagTreeData } from '../tag-tree/types';

  interface Props {
    /** 标签名称 */
    tag: string;
    /** 标签个数统计 */
    count: number;
    /** 节点数据 */
    node: TagTreeData;
    /** 点击事件 */
    onClick?: (node: TagTreeData) => void;
  }
  let { tag, count, node, onClick }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class={' text-gray-500 timeline-event-tag-title w-full flex flex-1 justify-between timeline-event-tag-wrapper'}
  onclick={(_event) => {
    onClick?.(node);
  }}
  role="button"
  tabindex="-1"
  data-full-name={node.fullName}
>
  <span>{tag} </span>
  <span>{count}</span>
</div>

<style lang="css">
  .timeline-event-tag-title:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>
