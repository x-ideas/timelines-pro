<script lang="ts">
    import { Menu } from 'obsidian';

    export let title: string;

    export let sortA2Z: () => void;
    export let sortZ2A: () => void;
    export let sortCountHigh2Low: () => void;
    export let sortCountLow2High: () => void;

    function showSort(event: MouseEvent) {
      		const menu = new Menu();
		const eventTag = (event.target as HTMLElement)
			?.innerText;

		menu.addItem((item) => {
			item.setTitle(`标签名称(A-Z)`);
			item.onClick(() => {
        sortA2Z()
			});
		});

    menu.addItem((item) => {
      item.setTitle(`标签名称(Z-A)`);
      item.onClick(() => {
        sortZ2A()

      });
    })

    menu.addSeparator()

		menu.addItem((item) => {
			// 搜索
			item.setTitle(`使用频次(从高到低)`);
			item.onClick(() => {
        sortCountHigh2Low()
			});
		});

    menu.addItem((item) => {
      item.setTitle(`使用频次(从低到高)`);
      item.onClick(() => {
        sortCountLow2High();
      });
    })



		// this.app.workspace.trigger(
		// 	'timeline-event-tag-wrapper:contextmenu',
		// 	menu,
		// 	eventTag
		// );
		setTimeout(() => {
			menu.showAtMouseEvent(event);
		}, 0);
    }
</script>


<div class='flex justify-between'>
  <div class="timeline-event-head">{title}</div>
  <div role="button" tabindex="-1" on:click={showSort}>
    <div class="clickable-icon nav-action-button" aria-label="排序"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-sort-asc"><path d="M11 11h4"></path><path d="M11 15h7"></path><path d="M11 19h10"></path><path d="M9 7 6 4 3 7"></path><path d="M6 6v14"></path></svg></div>
  </div>
</div>


<style lang='css'>
  .timeline-event-head {
    font-size: 16px;
  }
</style>
