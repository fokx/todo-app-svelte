<script>
	import { dbDexie } from '$lib/db-dexie.js';
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { SyncStatus } from '$lib/utils.js';

	let {
		todoList = $bindable(),
		user,
		isDeletedListPage = false,
		sync_status = $bindable()
	} = $props();
	let todoListSorted = $derived(todoList ? todoList.toSorted((b, a) => new Date(a.created_at) - new Date(b.created_at)) : []);
	let checked = false;
	let new_text;

	async function deleteTodo(e, index, done) {
		if (done || (!done && window.confirm('This hasn\'t been done yet.\nDo you really want to delete this?'))) {
			sync_status = SyncStatus.syncing;
			dbDexie.todos.filter(t => t.id === index).modify({ deleted: true, synced: false, updated_at: new Date() });
		}

	}


	function updateDone(ev, index) {
		let done = ev.target.checked;
		sync_status = SyncStatus.syncing;
		dbDexie.todos.update(index, { done: done, synced: false, updated_at: new Date() });
	}

	async function editTodo(e, index) {
		await dbDexie.todos.get({ id: index }).then(function(result) {
			new_text = prompt(`Change "${result.text}" to:`, result.text);
			if (new_text !== null && new_text !== '') {
				sync_status = SyncStatus.syncing;
				dbDexie.todos.update(index, { text: new_text, synced: false, updated_at: new Date() });
			}
		});

	}

	export function handleCheckboxChange(e, id) {
		updateDone(e, id);
		if (user) {
			e.target.form.requestSubmit();
		}
	}
</script>

<ul class="todos">
	{#if !todoListSorted || todoListSorted.length === 0}
		<li>---Nothing yet---</li>
	{:else }
		{#each todoListSorted as todo, index (todo.id)}
			<li transition:fade={{  duration: 100}}>
				{#if !isDeletedListPage}
					<form
						method="POST"
						action="?/toggleTodo"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									dbDexie.todos.filter(t => t.id === todo.id).modify({ synced: true, updated_at: new Date() });
									sync_status = SyncStatus.synced;
									await update();
								} else {
									sync_status = SyncStatus.divergent;
								}
								// should not perform update() even if succeed, otherwise the checkbox sometimes flicker
							};
					}}>
						<input
							type="checkbox"
							name="myCheckbox"
							checked={todo.done}
							onchange={(e) => handleCheckboxChange(e, todo.id)}
						/>
						<input type="hidden" name="id" value={todo.id} />
						<input type="hidden" name="prev_done" value={todo.done} />
					</form>
				{/if}

				<span class:checked={todo.done}>{todo.text}</span>
				<!--<input class:checked={todo.done} type="text" name="tmp" value={todo.text}/>-->

				<div class="right-buttons">
					<form method="post" action="?/editTodo" use:enhance={({formData, cancel}) => {
						if (user) {
							formData.set('new_text', new_text);
							return async ({ result, update }) => {
								if (result.type === 'success') {
									dbDexie.todos.filter(t => t.id === todo.id).modify({ synced: true, updated_at: new Date() });
									sync_status = SyncStatus.synced;
									await update();
								} else {
									sync_status = SyncStatus.divergent;
								}
							};
						}
					}}>
						<input type="hidden" name="id" value={todo.id} />
						<button aria-label="edit todo" style="background: url(./edit.svg) no-repeat 50% 50%;"
										class="filter-svg" onclick={(e)=>editTodo(e, todo.id)}></button>
					</form>

					{#if !isDeletedListPage}
						<form method="post" action="?/deleteTodo" use:enhance={({formData, cancel}) => {
							if (user){
								return async ({ result, update }) => {
									if (result.type === 'success') {
										dbDexie.todos.filter(t => t.id === todo.id).modify({ synced: true, updated_at: new Date() });
										sync_status = SyncStatus.synced;
										await update();
								} else {
									sync_status = SyncStatus.divergent;
								}
								};
							}
						}}>
							<input type="hidden" name="id" value={todo.id} />
							<button aria-label="remove todo" style="background: url(./remove.svg) no-repeat 50% 50%;"
											class="filter-svg" onclick={(e)=>deleteTodo(e, todo.id, todo.done)}></button>
						</form>
					{/if}
				</div>
				<br />
			</li>
		{/each}
	{/if}
</ul>
