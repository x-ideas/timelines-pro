<script lang="ts">
  interface Props {
    /** 标签名称 */
    tagName: string;
    /** 取消事件 */
    onCanceled?: () => void;
    /** 确认事件 */
    onOk?: (newName: string) => void;
  }

  let { tagName, onCanceled, onOk }: Props = $props();
  // export let tagName: string;
  // export let onCanceled: () => void | undefined;
  // export let onOk: (newName: string) => void | undefined;

  let newName: string = $derived(tagName);
  let isValidInput = $derived(newName.trim().length > 0);

  export function updateProps(props: Partial<Props>) {
    if (Object.prototype.hasOwnProperty.call(props, 'tagName')) {
      tagName = props.tagName ?? '';
    }
    if (Object.prototype.hasOwnProperty.call(props, 'onCanceled')) {
      onCanceled = props.onCanceled;
    }
    if (Object.prototype.hasOwnProperty.call(props, 'onOk')) {
      onOk = props.onOk;
    }
  }
</script>

<h3>rename: "{tagName}"</h3>
<div class="mb-1">
  <input
    class="rename-input"
    placeholder="please input new name"
    value={newName}
    onchange={(event) => {
      newName = event.currentTarget.value;
    }}
  />
</div>

<div class="flex justify-end">
  <button onclick={onCanceled}>cancel</button>
  <button
    disabled={!isValidInput}
    onclick={() => {
      console.log('[timeline] rename onOk', newName);
      onOk?.(newName);
    }}>ok</button
  >
</div>

<style lang="css">
  .rename-input {
    width: 100%;
    height: 30px;
    margin-bottom: 8px;
  }
</style>
