<script lang="ts">
  export let tagName: string;
  export let onCanceled: () => void | undefined;
  export let onOk: (newName: string) => void | undefined;

  let newName: string = tagName;

  $: isValidInput = newName.trim().length > 0;
</script>

<h3>rename: "{tagName}"</h3>
<div class="mb-1">
  <input class="rename-input" placeholder="please input new name" value={newName} on:change={(event) => {
    newName = event.currentTarget.value;
  }} />
</div>

<div class="flex justify-end">
  <button on:click={onCanceled}>cancel</button>
  <button disabled={!isValidInput} on:click={() => {
    console.log('[timeline] rename onOk', newName)
    onOk?.(newName)
  }}>ok</button>
</div>


<style lang="css">
  .rename-input {
    width: 100%;
    height: 30px;
    margin-bottom: 8px;
  }
</style>



