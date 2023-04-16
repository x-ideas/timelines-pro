<script lang="ts">
  import '../../uno.css'
  export let variable: number;
  export let tags: string[] | undefined;
</script>


<div class="number">
  <div class="mb-8">My number is {variable}!</div>
  {#each (tags??[]) as tag}
    <div class="tag-wrapper">{tag}</div>
  {/each}
</div>


<style lang='css'>
  .tag-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 4px;
  }

  .tag-wrapper:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>
