import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import Component from './rename.svelte';

export class RenameModal extends Modal {
	tagName: string;
	onSubmit: (result: string) => void;
	component: Component;

	constructor(app: App, tagName: string, onSubmit: (result: string) => void) {
		super(app);
		this.tagName = tagName;
		this.onSubmit = onSubmit;

		this.component = new Component({
			target: this.contentEl,
			props: {
				tagName: '',
				onCanceled: () => {
					this.close();
				},
				onOk: (newName) => {
					const res = this.onSubmit?.(newName);
					// 如果返回的是一个promise，那么就等待promise执行完毕后再关闭modal
					// 这样可以在onSubmit中做一些异步操作，比如修改文件
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					if (typeof res === 'object' && typeof res.then === 'function') {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						res.then(() => {
							this.close();
						});
					} else {
						this.close();
					}
				},
			},
		});
	}

	onOpen() {
		this.component.$set({ tagName: this.tagName });
	}

	onClose() {
		this.component.$destroy();
	}
}
