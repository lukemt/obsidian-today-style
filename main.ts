import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	stylesheet: HTMLStyleElement | null = null;
	today: string | null = null; // example: 2021-01-01

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => this.updateStylesheetIfDateChanged(), 5 * 60 * 1000));

		this.updateStylesheetIfDateChanged();
	}

	onunload() {
		this.detachStylesheet();
	}

	detachStylesheet() {
		if (this.stylesheet) {
			this.stylesheet.remove();
			this.stylesheet = null;
		}
	}
	updateStylesheet(date: string) {
		this.detachStylesheet();
		this.stylesheet = document.createElement('style');
		this.stylesheet.innerHTML = `
			.mod-root .mod-stacked .workspace-tab-header:first-child:not([aria-label="${date}"]) {
				background-color: rgba(255, 0, 38, 0.4) !important;
			}
			.mod-root .mod-stacked .workspace-tab-header:first-child[aria-label="${date}"] {
				background-color: #00ffb30a !important;
			}
			.mod-root .workspace-tab-header[aria-label="${date}"] + .workspace-leaf .HyperMD-header-1 {
    		color: var(--h3-color);
			}
		`;
		document.head.appendChild(this.stylesheet);
	}

	updateStylesheetIfDateChanged() {
		const today = new Date().toISOString().slice(0, 10);
		if (today !== this.today) {
			this.today = today;
			this.updateStylesheet(today);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
