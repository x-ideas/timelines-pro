import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import type { ITimelineEventItemSource } from '../../type';
import Component from './create-timeline-event-modal.svelte';
import { mount, unmount } from 'svelte';

type OnOkFunc = (info: ITimelineEventItemSource) => void;

export class CreateTimelineEventModal extends Modal {
	_onOk: OnOkFunc;

	component: ReturnType<typeof Component> | undefined;

	constructor(app: App, onOk: OnOkFunc) {
		super(app);
		this._onOk = onOk;

		this.component = mount(Component, {
			target: this.contentEl,
			props: {
				onOk: (info) => {
					this._onOk(info);
					this.close();
				},
				onCancel: () => {
					this.close();
				},
			},
		});
	}

	close(): void {
		if (this.component) {
			unmount(this.component);
		}
		super.close();
	}
}
