<script lang="ts">
  export let tagName: string;
  export let onCanceled: () => void | undefined;
  export let onOk: (newName: string) => void | undefined;

  let newName: string = tagName;

  $: isValidInput = newName.trim().length > 0;
</script>

<h3>重命名: "{tagName}"</h3>
<div class="mb-1">
  <input class="rename-input" placeholder="请输入新的标签名字" value={newName} on:change={(event) => {
    newName = event.currentTarget.value;
  }} />
</div>

<div class="flex justify-end">
  <button on:click={onCanceled}>取消</button>
  <button disabled={!isValidInput} on:click={() => {
    console.log('[timeline] rename onOk', newName)
    onOk?.(newName)
  }}>确认</button>
</div>


<style lang="css">
  .rename-input {
    width: 100%;
    height: 30px;
    margin-bottom: 8px;
  }
</style>



