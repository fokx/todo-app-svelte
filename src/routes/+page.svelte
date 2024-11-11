<script>
	import { onMount } from 'svelte';
	import { dbDexie } from '$lib/db-dexie.js';
	import { enhance } from '$app/forms';
	import Todo from '$lib/components/todo-list.svelte';
	import { derived } from 'svelte/store';
	import { liveQuery } from 'dexie';
	import { gen_todo_id, make_enum } from '$lib/utils.js';
	import { browser } from '$app/environment';

	/** @type {import('./$types').PageData} */
	let { data } = $props();
	let user = $derived(data.user);
	let todoListCloud = $derived(data.cloud_posts);
	let newItem = $state('');
	let todoListNotDeletedLocal = $state();
	let todoListNotDeletedUncompletedCountLocal = $state();
	let todoListNotDeletedCountLocal = $state();
	let new_todo_id;
	const SyncStatus = make_enum(['local', 'divergent', 'syncing', 'synced', 'undefined']);

	let todoListLocal = liveQuery(() =>
		dbDexie.todos.orderBy('id').desc().toArray()
	);

	let todo_s_text_local = $derived('TODO' + (todoListNotDeletedCountLocal > 1 ? 's' : ''));
	let count_status_local = $derived((
		(todoListNotDeletedCountLocal > 0 ?
			(todoListNotDeletedUncompletedCountLocal > 0 ?
				`${todoListNotDeletedUncompletedCountLocal} out of ${todoListNotDeletedCountLocal} ${todo_s_text_local} unfinished`
				: (todoListNotDeletedCountLocal === 1 ? 'The only' : 'All') + ` ${todoListNotDeletedCountLocal} ${todo_s_text_local} finished`) : '')
	));

	let sync_status = $state(SyncStatus.undefined);
	todoListLocal.subscribe((todos_local) => {
		todoListNotDeletedLocal = todos_local.filter(t => !t.deleted);
		todoListNotDeletedUncompletedCountLocal = todos_local.filter(t => !t.deleted).filter(t => !t.done).length;
		todoListNotDeletedCountLocal = todos_local.filter(t => !t.deleted).length;
		if (todoListCloud === null || todoListCloud === undefined ||
			todoListCloud.length === 0 || (todos_local.length !== todoListCloud.length)) {
			sync_status = SyncStatus.divergent;
		} else {
			let tmp = todos_local.every((localTodo, index) => {
				const cloudTodo = todoListCloud[index];
				return (
					localTodo.id === cloudTodo.id &&
					localTodo.text === cloudTodo.text &&
					localTodo.done === cloudTodo.done &&
					localTodo.deleted === cloudTodo.deleted
				)
			});
			if (tmp) {
					sync_status = SyncStatus.synced;
			}
		}
		updateSyncStatus();
	});

	function addToListhandleKeydown(e) {
		if (e.target.form.key === 'Enter') {
			if (newItem) {
				addToList(e.target.form);
			}
		}
	}

	async function addToList(form) {
		new_todo_id = gen_todo_id();
		dbDexie.todos.add({
			id: new_todo_id,
			text: newItem,
			done: false,
			deleted: false,
			synced: false,
			created_at: new Date(),
			updated_at: new Date()
		});
	}

	function deleteCompleted(form) {
		if (window.confirm('Do you really want to delete all completed TODOs?')) {
			todoListNotDeletedLocal.forEach(todo => {
				if (todo.done) {
					dbDexie.todos.filter(t => t.id === todo.id).modify({ deleted: true, synced: false, updated_at: new Date() });
				}
			});
		}
	}

	onMount(() => {
		if (!window.indexedDB) {
			alert('This todo app is not unsupported on this browser. \nReason: Indexed DB is not supported!');
		}
		if ('serviceWorker' in navigator) {
			console.log('Service Worker is supported');
			navigator.serviceWorker.addEventListener('message', event => {
				if (event.data.type === 'ONLINE_STATUS') {
					updateOnlineStatus(event.data.online);
				}
				if (event.data.type === 'SYNC_STATUS') {
					updateSyncStatus();
				}
			});
		}
	});

	function updateSyncStatus() {
		if (browser) {
			console.log('updateSyncStatus:', sync_status);
			const ele = document.getElementById('sync-status');
			if (ele) {
				switch (sync_status) {
					case SyncStatus.divergent:
						ele.classList.remove(...Array.from(ele.classList).slice(1));
						ele.textContent = 'Divergent';
						ele.classList.add('divergent');
						break;
					case SyncStatus.syncing:
						ele.classList.remove(...Array.from(ele.classList).slice(1));
						ele.textContent = 'Syncing';
						ele.classList.add('syncing');
						break;
					case SyncStatus.local:
						ele.classList.remove(...Array.from(ele.classList).slice(1));
						ele.textContent = 'Local';
						ele.classList.add('local');
						break;
					case SyncStatus.synced:
						ele.classList.remove(...Array.from(ele.classList).slice(1));
						ele.textContent = 'Synced';
						ele.classList.add('synced');
						break;
					default:
						ele.classList.remove(...Array.from(ele.classList).slice(1));
						ele.textContent = 'Undefined';
						ele.classList.add('undefined');
						break;
				}
			}
		}
	}

	function updateOnlineStatus(isOnline) {
		if (browser) {
			console.log('updateOnlineStatus:', isOnline);
			const statusElement = document.getElementById('online-status');
			if (isOnline) {
				console.log('online');
				if (statusElement) {
					statusElement.textContent = 'Online';
					statusElement.classList.add('online');
					statusElement.classList.remove('offline');
				}
			} else {
				console.log('offline');
				if (statusElement) {
					statusElement.textContent = 'Offline';
					statusElement.classList.add('offline');
					statusElement.classList.remove('online');
				}
			}
		}
	}

	updateOnlineStatus(true);
	updateSyncStatus();

</script>

<style>
    @import '$lib/styles.css';
</style>

<div class="centered">
	<div class="header">
		<h2>{user ? user.username + "'s" : "My"} TODO List</h2>
		<div class="status" id="sync-status"></div>
		<div class="status" id="online-status">Checking online...</div>

	</div>

	<p>{count_status_local}</p>

	<form action="?/createpost" class="input-form" method="post" use:enhance={({ formElement, formData, action, cancel, submitter }) => {
			formData.append('id', new_todo_id);
			return async ({ result, update }) => {
				if (result.type === 'success') {
						dbDexie.todos.filter(t => t.id === new_todo_id).modify({ synced: true, updated_at: new Date() });
						update();
				}
			};
	}}>
		<input bind:value={newItem} name="content" onkeydown={(e) => addToListhandleKeydown(e)}
					 placeholder="new todo item.." required
					 type="text" />
		<button aria-label="Add" disabled={!newItem} onclick={(e) => addToList(e.target.form)}>Add</button>
	</form>

	<br />
	<Todo todoList={todoListNotDeletedLocal} user={user} />

	<div class="footer-buttons">
		<button aria-label="View deleted TODOs" onclick={() => location.href='/deleted'} type="button">View deleted</button>
		<form action="?/deleteAllCompleted" method="post" use:enhance={({formData, cancel}) => {
			return async ({ result, update }) => {
				if (result.type === 'success') {
					todoListNotDeletedLocal.forEach(todo => {
						if (todo.done) {
							dbDexie.todos.filter(t => t.deleted === true).modify({ synced: true , updated_at: new Date()});
						}
					});
					update();
				}
			};
		}}>
			<button aria-label="Remove all completed TODOs"
							disabled={!(todoListNotDeletedCountLocal-todoListNotDeletedUncompletedCountLocal)}
							onclick={(e) => deleteCompleted(e.target.form)}
			>Remove all completed
			</button>
		</form>
	</div>

	{#if user}
		<p>Currently, to view changes to your TODOs on <b>another</b> browser/device, you have to refresh manually.</p>
	{:else}
		<p>⚠️ Your TODOs are stored in your <a
			href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API">browser</a>
			and will get <strong>lost</strong> when you clear browsing data.</p>
		<p>Sign in to store data in the cloud and get synced between browsers / devices.</p>
	{/if}

</div>


